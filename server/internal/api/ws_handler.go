package api

import (
	"bufio"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/kvolynsk/codexion-visualizer/server/internal/logs"
	"github.com/kvolynsk/codexion-visualizer/server/internal/models"
	"github.com/kvolynsk/codexion-visualizer/server/internal/simulation"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Validation is done via CORS middleware
	},
}

func (api *API) HandleWS(c *gin.Context) {
	sessionID := uuid.New().String()
	clientIP := c.ClientIP()
	startTime := time.Now()

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("[%s] Failed to upgrade connection: %v", sessionID, err)
		if api.logger != nil {
			api.logger.LogError(&logs.ErrorLog{
				Timestamp:   time.Now().UTC(),
				SessionID:   sessionID,
				ClientIP:    clientIP,
				Stage:       "connection_upgrade",
				ErrorType:   "UpgradeError",
				Message:     err.Error(),
				Recoverable: false,
			})
		}
		return
	}
	defer conn.Close()

	// Log connection established
	if api.logger != nil {
		api.logger.LogConnection(&logs.ConnectionLog{
			Timestamp: time.Now().UTC(),
			SessionID: sessionID,
			ClientIP:  clientIP,
			Event:     "connected",
		})
	}

	// Set read/write deadlines
	conn.SetReadDeadline(time.Now().Add(api.cfg.Server.WebSocketTimeout))
	conn.SetWriteDeadline(time.Now().Add(api.cfg.Server.WebSocketTimeout))

	// 1. Read configuration from WS
	_, message, err := conn.ReadMessage()
	if err != nil {
		log.Printf("[%s] Failed to read message: %v", sessionID, err)
		if api.logger != nil {
			api.logger.LogError(&logs.ErrorLog{
				Timestamp:   time.Now().UTC(),
				SessionID:   sessionID,
				ClientIP:    clientIP,
				Stage:       "read_config",
				ErrorType:   "ReadError",
				Message:     err.Error(),
				Recoverable: false,
			})
		}
		return
	}

	var simConfig models.SimulationConfig
	if err := json.Unmarshal(message, &simConfig); err != nil {
		log.Printf("[%s] Failed to unmarshal config: %v", sessionID, err)
		if api.logger != nil {
			api.logger.LogError(&logs.ErrorLog{
				Timestamp:   time.Now().UTC(),
				SessionID:   sessionID,
				ClientIP:    clientIP,
				Stage:       "unmarshal_config",
				ErrorType:   "InvalidConfig",
				Message:     err.Error(),
				Recoverable: true,
			})
		}
		conn.WriteMessage(websocket.TextMessage, []byte(`{"error": "Invalid configuration format"}`))
		return
	}

	// 2. Start simulation
	runner := simulation.NewRunner(api.cfg.Server.CodexionPath)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	stdout, cmd, err := runner.Run(ctx, simConfig)
	if err != nil {
		log.Printf("[%s] Failed to run simulation: %v", sessionID, err)
		if api.logger != nil {
			api.logger.LogError(&logs.ErrorLog{
				Timestamp:   time.Now().UTC(),
				SessionID:   sessionID,
				ClientIP:    clientIP,
				Stage:       "process_start",
				ErrorType:   "ProcessError",
				Message:     err.Error(),
				Recoverable: false,
			})
		}
		conn.WriteMessage(websocket.TextMessage, []byte(`{"error": "Failed to start simulation"}`))
		return
	}
	defer stdout.Close()

	// 3. Stream stdout line by line
	linesStreamed := 0
	var messageLatencies []time.Duration
	scanner := bufio.NewScanner(stdout)

	for scanner.Scan() {
		line := scanner.Text()
		linesStreamed++

		// Update write deadline for each write
		conn.SetWriteDeadline(time.Now().Add(api.cfg.Server.WebSocketTimeout))

		msgStart := time.Now()
		if err := conn.WriteMessage(websocket.TextMessage, []byte(line)); err != nil {
			log.Printf("[%s] Failed to send message: %v", sessionID, err)
			if api.logger != nil {
				api.logger.LogError(&logs.ErrorLog{
					Timestamp:   time.Now().UTC(),
					SessionID:   sessionID,
					ClientIP:    clientIP,
					Stage:       "send_message",
					ErrorType:   "SendError",
					Message:     err.Error(),
					Recoverable: false,
				})
			}
			break
		}
		messageLatencies = append(messageLatencies, time.Since(msgStart))
	}

	if err := scanner.Err(); err != nil {
		log.Printf("[%s] Scanner error: %v", sessionID, err)
		if api.logger != nil {
			api.logger.LogError(&logs.ErrorLog{
				Timestamp:   time.Now().UTC(),
				SessionID:   sessionID,
				ClientIP:    clientIP,
				Stage:       "scan_output",
				ErrorType:   "ScanError",
				Message:     err.Error(),
				Recoverable: false,
			})
		}
	}

	// Wait for process to finish
	exitCode := int32(0)
	success := true
	if err := cmd.Wait(); err != nil {
		exitCode = 1
		success = false
		log.Printf("[%s] Command finished with error: %v", sessionID, err)
	}

	// Calculate metrics
	duration := time.Since(startTime)
	avgLatency := 0.0
	if len(messageLatencies) > 0 {
		totalLatency := time.Duration(0)
		for _, lat := range messageLatencies {
			totalLatency += lat
		}
		avgLatency = float64(totalLatency.Milliseconds()) / float64(len(messageLatencies))
	}

	linesPerSec := 0.0
	if duration.Seconds() > 0 {
		linesPerSec = float64(linesStreamed) / duration.Seconds()
	}

	// Log metrics
	if api.logger != nil {
		api.logger.LogMetrics(&logs.MetricsLog{
			Timestamp:           time.Now().UTC(),
			SessionID:           sessionID,
			ClientIP:            clientIP,
			ProcessDurationMS:   duration.Milliseconds(),
			LinesStreamed:       linesStreamed,
			AvgMessageLatencyMS: avgLatency,
			LinesPerSecond:      linesPerSec,
			ExitCode:            exitCode,
			Success:             success,
		})

		// Log IP access
		api.logger.LogIPAccess(clientIP, success, duration)
	}

	// Log disconnection
	if api.logger != nil {
		reason := "normal"
		if !success {
			reason = "error"
		}
		api.logger.LogConnection(&logs.ConnectionLog{
			Timestamp:        time.Now().UTC(),
			SessionID:        sessionID,
			ClientIP:         clientIP,
			Event:            "disconnected",
			DurationSeconds:  duration.Seconds(),
			DisconnectReason: reason,
		})
	}
}
