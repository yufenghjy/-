package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBType     string
	JWTSecret  string
	ServerPort string
}

var Cfg *Config

func LoadConfig() {
	if err := godotenv.Load(".env"); err != nil {
		log.Println("未找到 .env 文件，使用环境变量")
	}

	Cfg = &Config{
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "3306"),
		DBUser:     getEnv("DB_USER", "root"),
		DBPassword: getEnv("DB_PASSWORD", ""),
		DBName:     getEnv("DB_NAME", "attendance_db"),
		DBType:     getEnv("DB_TYPE", "mysql"),
		JWTSecret:  getEnv("JWT_SECRET", "secret"),
		ServerPort: getEnv("SERVER_PORT", "8080"),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

// DB_DSN 生成 MySQL DSN
func (c *Config) DB_DSN() string {
	return c.DBUser + ":" + c.DBPassword + "@tcp(" + c.DBHost + ":" + c.DBPort + ")/" + c.DBName + "?charset=utf8mb4&parseTime=True&loc=Local"
}
