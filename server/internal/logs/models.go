package logs

import "time"

// ConnectionLog represents a WebSocket connection event
type ConnectionLog struct {
	Timestamp        time.Time `json:"timestamp"`
	SessionID        string    `json:"session_id"`
	ClientIP         string    `json:"client_ip"`
	Event            string    `json:"event"` // "connected", "disconnected"
	DurationSeconds  float64   `json:"duration_seconds,omitempty"`
	DisconnectReason string    `json:"disconnect_reason,omitempty"`
}

// ErrorLog represents an error event
type ErrorLog struct {
	Timestamp   time.Time `json:"timestamp"`
	SessionID   string    `json:"session_id"`
	ClientIP    string    `json:"client_ip"`
	Stage       string    `json:"stage"` // "unmarshal_config", "process_start", "send_message", etc.
	ErrorType   string    `json:"error_type"`
	Message     string    `json:"message"`
	Recoverable bool      `json:"recoverable"`
}

// MetricsLog represents performance metrics
type MetricsLog struct {
	Timestamp           time.Time `json:"timestamp"`
	SessionID           string    `json:"session_id"`
	ClientIP            string    `json:"client_ip"`
	ProcessDurationMS   int64     `json:"process_duration_ms"`
	LinesStreamed       int       `json:"lines_streamed"`
	AvgMessageLatencyMS float64   `json:"avg_message_latency_ms"`
	LinesPerSecond      float64   `json:"lines_per_second"`
	ExitCode            int32     `json:"exit_code"`
	Success             bool      `json:"success"`
}

// IPStatisticsEntry represents statistics for a single IP
type IPStatisticsEntry struct {
	IP            string    `json:"ip"`
	Country       string    `json:"country,omitempty"`
	FirstSeen     time.Time `json:"first_seen"`
	LastSeen      time.Time `json:"last_seen"`
	TotalRequests int       `json:"total_requests"`
	SuccessCount  int       `json:"success_count"`
	ErrorCount    int       `json:"error_count"`
}

// DailyIPStatistics represents IP statistics for a specific day
type DailyIPStatistics struct {
	Date  string
	Stats map[string]*IPStatisticsEntry // key: IP address
}

// WeeklyStatistics represents aggregated statistics
type WeeklyStatistics struct {
	Period              string                         `json:"period"`
	TotalConnections    int                            `json:"total_connections"`
	TotalErrors         int                            `json:"total_errors"`
	SuccessRate         float64                        `json:"success_rate"`
	UniqueIPs           int                            `json:"unique_ips"`
	TopIPs              []IPStatisticsEntry            `json:"top_ips"`
	DailyBreakdown      map[string]*DailyBreakdownItem `json:"daily_breakdown"`
	CountryDistribution map[string]int                 `json:"country_distribution"`
}

// DailyBreakdownItem represents daily statistics
type DailyBreakdownItem struct {
	Date        string  `json:"date"`
	Connections int     `json:"connections"`
	Errors      int     `json:"errors"`
	SuccessRate float64 `json:"success_rate"`
	UniqueIPs   int     `json:"unique_ips"`
}

// RequestMetadata holds metadata for tracking requests
type RequestMetadata struct {
	SessionID        string
	ClientIP         string
	StartTime        time.Time
	EndTime          time.Time
	LinesStreamed    int
	MessageLatencies []time.Duration
	ExitCode         int
	Success          bool
	ErrorMessage     string
}
