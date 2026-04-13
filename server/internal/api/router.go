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
	corsConfig.AllowHeaders = []string{"Content-Type", "X-Admin-Token"}
	r.Use(cors.New(corsConfig))

	// Health check endpoint for Docker
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// WebSocket endpoint
	r.GET("/api/ws/simulate", api.HandleWS)

	// Analytics endpoints (protected)
	analytics := r.Group("/api/analytics")
	analytics.Use(AdminAuthMiddleware(cfg.Server.AdminToken))
	{
		logHandler := NewLogHandler(reader)
		analytics.GET("/weekly", logHandler.GetWeeklyStats)
		analytics.GET("/daily", logHandler.GetDailyStats)
		analytics.GET("/ip/:ip", logHandler.GetIPStats)
	}

	// Public health check for analytics reader
	logHandler := NewLogHandler(reader)
	r.GET("/api/health", logHandler.HealthCheck)

	return r
}
