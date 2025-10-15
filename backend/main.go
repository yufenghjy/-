package main

import (
	"backend/config"
	"backend/internal/handlers"
	"backend/internal/middleware"
	models "backend/internal/model"
	"backend/pkg/database"
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// 加载配置
	config.LoadConfig()

	// 连接数据库
	if err := database.ConnectDB(); err != nil {
		log.Fatal("数据库连接失败:", err)
	}

	// 自动迁移表结构
	database.DB.AutoMigrate(
		&models.User{},
		&models.Course{},
		&models.Enrollment{},
		&models.CheckinSession{},
		&models.CheckinRecord{},
	)

	// 设置 Gin 模式
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	// 跨域配置
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:5500")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// 静态文件服务：H5签到页面
	r.StaticFile("/checkin", "./static/checkin.html")

	// API 路由组
	api := r.Group("/api")
	{
		// 公共路由（无需登录）
		api.POST("/login", handlers.Login)
		api.GET("/session/:code", handlers.GetSessionInfo)
		api.POST("/checkin", handlers.StudentCheckin)
		// 受保护路由（需JWT认证）
		protected := api.Use(middleware.JWTAuth())
		{
			protected.POST("/start-checkin", handlers.StartCheckin)
			// protected.POST("/checkin", handlers.StudentCheckin)
			//protected.GET("/courses", handlers.GetMyCourses)
			// protected.GET("/session/:code", handlers.GetSessionInfo)
			protected.GET("/records/:session_id", handlers.GetCheckinRecords)
		}
	}

	port := config.Cfg.ServerPort
	fmt.Printf("服务启动在 :%s\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("服务器启动失败:", err)
	}
}
