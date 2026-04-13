package main

import (
	"fmt"
	"log"
	"os"

	"github.com/kvolynsk/codexion-visualizer/server/internal/api"
	"github.com/kvolynsk/codexion-visualizer/server/internal/logs"
	"github.com/kvolynsk/codexion-visualizer/server/pkg/config"
)

func main() {
	cfg := config.Load()

	// Initialize logger
	logsDir := os.Getenv("LOGS_DIR")
	if logsDir == "" {
		logsDir = "./logs"
	}

	logger, err := logs.NewLogger(logsDir)
	if err != nil {
		log.Fatalf("Failed to initialize logger: %v", err)
	}
	defer logger.Close()

	reader := logs.NewReader(logsDir)

	router := api.NewRouter(cfg, logger, reader)

	addr := fmt.Sprintf(":%s", cfg.Server.Port)
	log.Printf("Starting server on %s...", addr)
	if err := router.Run(addr); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
