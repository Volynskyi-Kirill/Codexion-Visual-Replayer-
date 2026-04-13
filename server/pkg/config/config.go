package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	Server ServerConfig
}

type ServerConfig struct {
	Port             string
	ClientHost       string
	CodexionPath     string
	WebSocketTimeout time.Duration
}

func Load() *Config {
	wsTimeout := time.Duration(getEnvInt("WS_TIMEOUT_SECONDS", 60)) * time.Second
	if wsTimeout == 0 {
		wsTimeout = 60 * time.Second
	}

	return &Config{
		Server: ServerConfig{
			Port:             getEnv("PORT", "3000"),
			ClientHost:       getEnv("CLIENT_HOST", "http://localhost:5173"),
			CodexionPath:     getEnv("CODEXION_PATH", "./codexion"),
			WebSocketTimeout: wsTimeout,
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}
