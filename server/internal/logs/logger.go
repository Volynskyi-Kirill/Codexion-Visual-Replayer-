package logs

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// Logger handles writing logs to different files
type Logger struct {
	logsDir string
	mu      sync.Mutex
	files   map[string]*os.File
}

// NewLogger creates a new Logger instance
func NewLogger(logsDir string) (*Logger, error) {
	// Create logs directory if it doesn't exist
	if err := os.MkdirAll(logsDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create logs directory: %w", err)
	}

	return &Logger{
		logsDir: logsDir,
		files:   make(map[string]*os.File),
	}, nil
}

// LogConnection logs a connection event
func (l *Logger) LogConnection(event *ConnectionLog) error {
	l.mu.Lock()
	defer l.mu.Unlock()

	return l.writeLog("connections.jsonl", event)
}

// LogError logs an error event
func (l *Logger) LogError(event *ErrorLog) error {
	l.mu.Lock()
	defer l.mu.Unlock()

	return l.writeLog("errors.jsonl", event)
}

// LogMetrics logs performance metrics
func (l *Logger) LogMetrics(event *MetricsLog) error {
	l.mu.Lock()
	defer l.mu.Unlock()

	return l.writeLog("metrics.jsonl", event)
}

// LogIPAccess logs IP access for statistics
func (l *Logger) LogIPAccess(ip string, success bool, duration time.Duration) error {
	l.mu.Lock()
	defer l.mu.Unlock()

	entry := map[string]interface{}{
		"timestamp": time.Now().UTC(),
		"ip":        ip,
		"success":   success,
		"duration":  duration.Milliseconds(),
	}

	return l.writeLog("ip_access.jsonl", entry)
}

// writeLog writes a log entry to the specified file
func (l *Logger) writeLog(filename string, data interface{}) error {
	filePath := filepath.Join(l.logsDir, filename)

	file, err := os.OpenFile(filePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return fmt.Errorf("failed to open log file %s: %w", filename, err)
	}
	defer file.Close()

	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to marshal log data: %w", err)
	}

	// Write JSON followed by newline (JSONL format)
	if _, err := file.Write(append(jsonData, '\n')); err != nil {
		return fmt.Errorf("failed to write to log file %s: %w", filename, err)
	}

	return nil
}

// Close closes all open file handles
func (l *Logger) Close() error {
	l.mu.Lock()
	defer l.mu.Unlock()

	var lastErr error
	for _, file := range l.files {
		if err := file.Close(); err != nil {
			lastErr = err
		}
	}
	return lastErr
}

// GetLogsDir returns the logs directory path
func (l *Logger) GetLogsDir() string {
	return l.logsDir
}
