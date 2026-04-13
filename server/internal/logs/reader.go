package logs

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"time"
)

// Reader handles reading and analyzing logs
type Reader struct {
	logsDir string
}

// NewReader creates a new Reader instance
func NewReader(logsDir string) *Reader {
	return &Reader{
		logsDir: logsDir,
	}
}

// GetWeeklyStatistics returns aggregated statistics for the last 7 days
func (r *Reader) GetWeeklyStatistics() (*WeeklyStatistics, error) {
	ipStats := make(map[string]*IPStatisticsEntry)
	dailyStats := make(map[string]*DailyBreakdownItem)
	countryCounters := make(map[string]int)

	totalConnections := 0
	totalErrors := 0

	sevenDaysAgo := time.Now().UTC().AddDate(0, 0, -7)

	// Read connection logs
	connections, err := r.readConnectionLogs(sevenDaysAgo)
	if err == nil {
		for _, conn := range connections {
			totalConnections++
			date := conn.Timestamp.Format("2006-01-02")

			// Initialize daily breakdown if not exists
			if _, exists := dailyStats[date]; !exists {
				dailyStats[date] = &DailyBreakdownItem{
					Date:        date,
					Connections: 0,
					Errors:      0,
				}
			}
			dailyStats[date].Connections++

			// Track IP statistics
			if _, exists := ipStats[conn.ClientIP]; !exists {
				ipStats[conn.ClientIP] = &IPStatisticsEntry{
					IP:        conn.ClientIP,
					FirstSeen: conn.Timestamp,
				}
			}
			ipStats[conn.ClientIP].LastSeen = conn.Timestamp
			ipStats[conn.ClientIP].TotalRequests++
		}
	}

	// Read error logs
	errors, err := r.readErrorLogs(sevenDaysAgo)
	if err == nil {
		totalErrors = len(errors)
		for _, errLog := range errors {
			date := errLog.Timestamp.Format("2006-01-02")

			if _, exists := dailyStats[date]; !exists {
				dailyStats[date] = &DailyBreakdownItem{
					Date:        date,
					Connections: 0,
					Errors:      0,
				}
			}
			dailyStats[date].Errors++

			if _, exists := ipStats[errLog.ClientIP]; !exists {
				ipStats[errLog.ClientIP] = &IPStatisticsEntry{
					IP:        errLog.ClientIP,
					FirstSeen: errLog.Timestamp,
				}
			}
			ipStats[errLog.ClientIP].ErrorCount++
		}
	}

	// Calculate success rates for IPs and daily stats
	successfulRequests := 0
	for _, stat := range ipStats {
		stat.SuccessCount = stat.TotalRequests - stat.ErrorCount
		if stat.SuccessCount > 0 {
			successfulRequests++
		}
	}

	for _, daily := range dailyStats {
		total := daily.Connections
		if total > 0 {
			daily.SuccessRate = float64(total-daily.Errors) / float64(total) * 100
		}
		daily.UniqueIPs = r.countUniqueIPsForDate(daily.Date, ipStats)
	}

	// Sort IPs by total requests and get top 10
	topIPs := r.sortIPsByRequests(ipStats, 10)

	// Build weekly statistics
	successRate := 0.0
	if totalConnections > 0 {
		successRate = float64(totalConnections-totalErrors) / float64(totalConnections) * 100
	}

	stats := &WeeklyStatistics{
		Period:              fmt.Sprintf("Last 7 days from %s", time.Now().UTC().Format("2006-01-02")),
		TotalConnections:    totalConnections,
		TotalErrors:         totalErrors,
		SuccessRate:         successRate,
		UniqueIPs:           len(ipStats),
		TopIPs:              topIPs,
		DailyBreakdown:      dailyStats,
		CountryDistribution: countryCounters,
	}

	return stats, nil
}

// GetDailyStatistics returns statistics for a specific day
func (r *Reader) GetDailyStatistics(date string) (*WeeklyStatistics, error) {
	targetDate, err := time.Parse("2006-01-02", date)
	if err != nil {
		return nil, fmt.Errorf("invalid date format, use YYYY-MM-DD: %w", err)
	}

	ipStats := make(map[string]*IPStatisticsEntry)
	countryCounters := make(map[string]int)
	totalConnections := 0
	totalErrors := 0

	// Read connection logs for this day
	connections, err := r.readConnectionLogs(targetDate)
	if err == nil {
		for _, conn := range connections {
			if conn.Timestamp.Format("2006-01-02") != date {
				continue
			}
			totalConnections++

			if _, exists := ipStats[conn.ClientIP]; !exists {
				ipStats[conn.ClientIP] = &IPStatisticsEntry{
					IP:        conn.ClientIP,
					FirstSeen: conn.Timestamp,
				}
			}
			ipStats[conn.ClientIP].LastSeen = conn.Timestamp
			ipStats[conn.ClientIP].TotalRequests++
		}
	}

	// Read error logs for this day
	errors, err := r.readErrorLogs(targetDate)
	if err == nil {
		for _, errLog := range errors {
			if errLog.Timestamp.Format("2006-01-02") != date {
				continue
			}
			totalErrors++

			if _, exists := ipStats[errLog.ClientIP]; !exists {
				ipStats[errLog.ClientIP] = &IPStatisticsEntry{
					IP:        errLog.ClientIP,
					FirstSeen: errLog.Timestamp,
				}
			}
			ipStats[errLog.ClientIP].ErrorCount++
		}
	}

	// Calculate success count for IPs
	for _, stat := range ipStats {
		stat.SuccessCount = stat.TotalRequests - stat.ErrorCount
	}

	topIPs := r.sortIPsByRequests(ipStats, 10)

	successRate := 0.0
	if totalConnections > 0 {
		successRate = float64(totalConnections-totalErrors) / float64(totalConnections) * 100
	}

	return &WeeklyStatistics{
		Period:           date,
		TotalConnections: totalConnections,
		TotalErrors:      totalErrors,
		SuccessRate:      successRate,
		UniqueIPs:        len(ipStats),
		TopIPs:           topIPs,
		DailyBreakdown: map[string]*DailyBreakdownItem{
			date: {
				Date:        date,
				Connections: totalConnections,
				Errors:      totalErrors,
				SuccessRate: successRate,
				UniqueIPs:   len(ipStats),
			},
		},
		CountryDistribution: countryCounters,
	}, nil
}

// GetIPStatistics returns detailed statistics for a specific IP
func (r *Reader) GetIPStatistics(ip string, days int) (map[string]interface{}, error) {
	startDate := time.Now().UTC().AddDate(0, 0, -days)
	dailyStats := make(map[string]*DailyBreakdownItem)
	totalRequests := 0
	totalErrors := 0

	// Read connection logs
	connections, err := r.readConnectionLogs(startDate)
	if err == nil {
		for _, conn := range connections {
			if conn.ClientIP != ip {
				continue
			}
			totalRequests++
			date := conn.Timestamp.Format("2006-01-02")

			if _, exists := dailyStats[date]; !exists {
				dailyStats[date] = &DailyBreakdownItem{
					Date:        date,
					Connections: 0,
					Errors:      0,
				}
			}
			dailyStats[date].Connections++
		}
	}

	// Read error logs
	errors, err := r.readErrorLogs(startDate)
	if err == nil {
		for _, errLog := range errors {
			if errLog.ClientIP != ip {
				continue
			}
			totalErrors++
			date := errLog.Timestamp.Format("2006-01-02")

			if _, exists := dailyStats[date]; !exists {
				dailyStats[date] = &DailyBreakdownItem{
					Date:        date,
					Connections: 0,
					Errors:      0,
				}
			}
			dailyStats[date].Errors++
		}
	}

	return map[string]interface{}{
		"ip":              ip,
		"total_requests":  totalRequests,
		"total_errors":    totalErrors,
		"success_count":   totalRequests - totalErrors,
		"period_days":     days,
		"daily_breakdown": dailyStats,
	}, nil
}

// Helper functions

func (r *Reader) readConnectionLogs(sinceTime time.Time) ([]ConnectionLog, error) {
	return r.readJSONLFile(filepath.Join(r.logsDir, "connections.jsonl"), func(data []byte) (interface{}, error) {
		var log ConnectionLog
		err := json.Unmarshal(data, &log)
		if err != nil {
			return nil, err
		}
		if log.Timestamp.After(sinceTime) {
			return log, nil
		}
		return nil, nil
	}).([]ConnectionLog), nil
}

func (r *Reader) readErrorLogs(sinceTime time.Time) ([]ErrorLog, error) {
	return r.readJSONLFile(filepath.Join(r.logsDir, "errors.jsonl"), func(data []byte) (interface{}, error) {
		var log ErrorLog
		err := json.Unmarshal(data, &log)
		if err != nil {
			return nil, err
		}
		if log.Timestamp.After(sinceTime) {
			return log, nil
		}
		return nil, nil
	}).([]ErrorLog), nil
}

func (r *Reader) readJSONLFile(filePath string, parser func([]byte) (interface{}, error)) interface{} {
	file, err := os.Open(filePath)
	if err != nil {
		return nil
	}
	defer file.Close()

	var results interface{}
	scanner := bufio.NewScanner(file)

	for scanner.Scan() {
		if item, err := parser(scanner.Bytes()); err == nil && item != nil {
			results = append(results.([]interface{}), item)
		}
	}

	return results
}

func (r *Reader) sortIPsByRequests(ipStats map[string]*IPStatisticsEntry, limit int) []IPStatisticsEntry {
	entries := make([]IPStatisticsEntry, 0, len(ipStats))
	for _, stat := range ipStats {
		entries = append(entries, *stat)
	}

	sort.Slice(entries, func(i, j int) bool {
		return entries[i].TotalRequests > entries[j].TotalRequests
	})

	if len(entries) > limit {
		entries = entries[:limit]
	}

	return entries
}

func (r *Reader) countUniqueIPsForDate(date string, ipStats map[string]*IPStatisticsEntry) int {
	count := 0
	for _, stat := range ipStats {
		if stat.FirstSeen.Format("2006-01-02") == date {
			count++
		}
	}
	return count
}
