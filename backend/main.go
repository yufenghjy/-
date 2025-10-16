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
		// 支持多个来源
		origin := c.Request.Header.Get("Origin")
		allowedOrigins := map[string]bool{
			"http://localhost:3000": true,
			"http://localhost:5500": true,
			"http://127.0.0.1:3000": true,
		}

		if allowedOrigins[origin] {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		}

		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
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
			// 签到相关接口
			protected.POST("/start-checkin", handlers.StartCheckin)
			protected.GET("/courses", handlers.GetMyCourses)
			protected.GET("/courses/:id", handlers.GetCourseByID)
			protected.POST("/courses/add", handlers.CreateCourse)
			protected.GET("/records/:session_id", handlers.GetCheckinRecords)
			protected.GET("/checkin-sessions", handlers.GetCheckinSessions)
			protected.PUT("/end-checkin/:session_id", handlers.EndCheckinSession)
			protected.PUT("/manual-end-checkin/:session_id", handlers.ManualEndCheckinSession)

			// 用户管理接口 (需登录即可访问)
			adminOnly := api.Group("/")
			adminOnly.Use(middleware.JWTAuth())
			{
				adminOnly.GET("/users", handlers.GetUsers)
				adminOnly.POST("/users", handlers.CreateUser)
				adminOnly.GET("/users/:id", handlers.GetUser)
				adminOnly.PUT("/users/:id", handlers.UpdateUser)
				adminOnly.DELETE("/users/:id", handlers.DeleteUser)
				adminOnly.PUT("/users/:id/password", handlers.ResetUserPassword)
			}
		}
	}

	port := config.Cfg.ServerPort
	fmt.Printf("服务启动在 :%s\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("服务器启动失败:", err)
	}
}
