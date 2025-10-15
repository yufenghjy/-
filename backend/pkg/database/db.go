package database

import (
	"backend/config"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectDB() error {
	dsn := config.Cfg.DB_DSN()

	// 配置 GORM 日志级别
	newLogger := logger.Default
	if gin.Mode() == gin.DebugMode {
		newLogger = logger.Default.LogMode(logger.Info)
	}

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: newLogger,
	})
	if err != nil {
		return err
	}

	DB = db
	return nil
}
