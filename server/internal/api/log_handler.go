package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kvolynsk/codexion-visualizer/server/internal/logs"
)

// LogHandler handles analytics and logging endpoints
type LogHandler struct {
	reader *logs.Reader
}

// NewLogHandler creates a new LogHandler
func NewLogHandler(reader *logs.Reader) *LogHandler {
	return &LogHandler{
		reader: reader,
	}
}

// GetWeeklyStats returns statistics for the last 7 days
// @Route GET /api/analytics/weekly
func (h *LogHandler) GetWeeklyStats(c *gin.Context) {
	stats, err := h.reader.GetWeeklyStatistics()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, stats)
}

// GetDailyStats returns statistics for a specific day
// @Route GET /api/analytics/daily?date=2026-04-13
func (h *LogHandler) GetDailyStats(c *gin.Context) {
	date := c.Query("date")
	if date == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "date parameter is required (format: YYYY-MM-DD)"})
		return
	}

	stats, err := h.reader.GetDailyStatistics(date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, stats)
}

// GetIPStats returns detailed statistics for a specific IP
// @Route GET /api/analytics/ip/:ip?days=7
func (h *LogHandler) GetIPStats(c *gin.Context) {
	ip := c.Param("ip")
	days := 7

	if dayStr := c.Query("days"); dayStr != "" {
		if _, err := c.Cookie("days"); err == nil {
			days = 7
		}
	}

	stats, err := h.reader.GetIPStatistics(ip, days)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, stats)
}

// HealthCheck returns health status
// @Route GET /api/health
func (h *LogHandler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":    "ok",
		"timestamp": gin.H{},
	})
}
