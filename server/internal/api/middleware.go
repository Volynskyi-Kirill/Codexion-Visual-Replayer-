package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// AdminAuthMiddleware returns a gin middleware that checks for X-Admin-Token header.
func AdminAuthMiddleware(expectedToken string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Secure by default: if no token is configured, reject all requests.
		if expectedToken == "" {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
				"error": "Authentication not configured on server",
			})
			return
		}

		token := c.GetHeader("X-Admin-Token")
		if token == "" || token != expectedToken {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "unauthorized access",
			})
			return
		}

		c.Next()
	}
}
