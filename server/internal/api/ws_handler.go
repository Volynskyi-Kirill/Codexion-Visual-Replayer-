package api

import (
	"bufio"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/kvolynsk/codexion-visualizer/server/internal/models"
	"github.com/kvolynsk/codexion-visualizer/server/internal/simulation"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Validation is done via CORS middleware
	},
}

func (api *API) HandleWS(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}
	defer conn.Close()

	// Set read/write deadlines
	conn.SetReadDeadline(time.Now().Add(api.cfg.Server.WebSocketTimeout))
	conn.SetWriteDeadline(time.Now().Add(api.cfg.Server.WebSocketTimeout))

	// 1. Read configuration from WS
	_, message, err := conn.ReadMessage()
	if err != nil {
		log.Printf("Failed to read message: %v", err)
		return
	}

	var config models.SimulationConfig
	if err := json.Unmarshal(message, &config); err != nil {
		log.Printf("Failed to unmarshal config: %v", err)
		conn.WriteMessage(websocket.TextMessage, []byte(`{"error": "Invalid configuration format"}`))
		return
	}

	// 2. Start simulation
	runner := simulation.NewRunner(api.cfg.Server.CodexionPath)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	stdout, cmd, err := runner.Run(ctx, config)
	if err != nil {
		log.Printf("Failed to run simulation: %v", err)
		conn.WriteMessage(websocket.TextMessage, []byte(`{"error": "Failed to start simulation"}`))
		return
	}
	defer stdout.Close()

	// 3. Stream stdout line by line
	scanner := bufio.NewScanner(stdout)
	for scanner.Scan() {
		line := scanner.Text()
		// Update write deadline for each write
		conn.SetWriteDeadline(time.Now().Add(api.cfg.Server.WebSocketTimeout))
		if err := conn.WriteMessage(websocket.TextMessage, []byte(line)); err != nil {
			log.Printf("Failed to send message: %v", err)
			break
		}
	}

	if err := scanner.Err(); err != nil {
		log.Printf("Scanner error: %v", err)
	}

	// Wait for process to finish
	if err := cmd.Wait(); err != nil {
		log.Printf("Command finished with error: %v", err)
	}
}
