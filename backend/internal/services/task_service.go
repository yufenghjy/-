package services

import (
	model "backend/internal/model"
	"backend/pkg/database"
	"log"
	"time"

	"gorm.io/gorm"
)

// 定时任务服务
type TaskService struct{}

// NewTaskService 创建新的定时任务服务实例
func NewTaskService() *TaskService {
	return &TaskService{}
}

// AutoEndExpiredSessions 自动结束过期的签到会话
func (ts *TaskService) AutoEndExpiredSessions() {
	// 查找所有活跃的签到会话
	var sessions []model.CheckinSession
	if err := database.DB.Where("status = ?", "active").Find(&sessions).Error; err != nil {
		log.Printf("查询签到会话失败: %v", err)
		return
	}

	now := time.Now()
	for _, session := range sessions {
		// 计算会话结束时间
		endTime := session.StartTime.Add(time.Duration(session.Duration) * time.Minute)

		// 如果当前时间已经超过结束时间，则结束该会话
		if now.After(endTime) {
			if err := ts.endSession(session.ID); err != nil {
				log.Printf("结束会话 %d 失败: %v", session.ID, err)
			} else {
				log.Printf("自动结束过期会话: %s", session.SessionCode)
			}
		}
	}
}

// endSession 结束指定ID的会话
func (ts *TaskService) endSession(sessionID uint) error {
	return database.DB.Transaction(func(tx *gorm.DB) error {
		var session model.CheckinSession
		if err := tx.Where("id = ? AND status = ?", sessionID, "active").First(&session).Error; err != nil {
			return err
		}

		// 更新会话状态为已结束
		if err := tx.Model(&session).Update("status", "ended").Error; err != nil {
			return err
		}

		return nil
	})
}

// StartTaskScheduler 启动定时任务调度器
func (ts *TaskService) StartTaskScheduler() {
	// 每分钟检查一次过期的签到会话
	ticker := time.NewTicker(1 * time.Minute)
	go func() {
		for {
			select {
			case <-ticker.C:
				ts.AutoEndExpiredSessions()
			}
		}
	}()
	log.Println("定时任务调度器已启动，每分钟检查过期签到会话")
}
