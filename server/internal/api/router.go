package api

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/kvolynsk/codexion-visualizer/server/internal/logs"
	"github.com/kvolynsk/codexion-visualizer/server/pkg/config"
)

type API struct {
	cfg    *config.Config
	logger *logs.Logger
	reader *logs.Reader
}

func NewRouter(cfg *config.Config, logger *logs.Logger, reader *logs.Reader) *gin.Engine {
	r := gin.Default()

	api := &API{
		cfg:    cfg,
		logger: logger,
		reader: reader,
	}

	// CORS configuration
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{cfg.Server.ClientHost}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Content-Type"}
	r.Use(cors.New(corsConfig))

	// WebSocket endpoint
	r.GET("/api/ws/simulate", api.HandleWS)

	// Analytics endpoints
	logHandler := NewLogHandler(reader)
	r.GET("/api/analytics/weekly", logHandler.GetWeeklyStats)
	r.GET("/api/analytics/daily", logHandler.GetDailyStats)
	r.GET("/api/analytics/ip/:ip", logHandler.GetIPStats)
	r.GET("/api/health", logHandler.HealthCheck)

	return r
}
