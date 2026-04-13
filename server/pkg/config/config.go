package config

import (
	"os"
)

type Config struct {
	Server ServerConfig
}

type ServerConfig struct {
	Port         string
	ClientHost   string
	CodexionPath string
}

func Load() *Config {
	return &Config{
		Server: ServerConfig{
			Port:         getEnv("PORT", "3000"),
			ClientHost:   getEnv("CLIENT_HOST", "http://localhost:5173"),
			CodexionPath: getEnv("CODEXION_PATH", "./codexion"),
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
