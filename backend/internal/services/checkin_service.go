package services

import (
	models "backend/internal/model"
	"backend/pkg/database"
	"errors"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CreateCheckinSession 创建签到会话
func CreateCheckinSession(teacherID, courseID uint, duration int) (string, error) {
	// 生成唯一会话码，例如: S20251014123456
	sessionCode := "S" + time.Now().Format("20060102") + fmt.Sprintf("%06d", time.Now().Unix()%1000000)

	session := models.CheckinSession{
		SessionCode: sessionCode,
		CourseID:    courseID,
		TeacherID:   teacherID,
		StartTime:   time.Now(),
		Duration:    duration,
		Status:      "active",
	}

	if err := database.DB.Create(&session).Error; err != nil {
		return "", errors.New("创建会话失败: " + err.Error())
	}

	return sessionCode, nil
}

// ProcessStudentCheckin 处理学生签到
func ProcessStudentCheckin(sessionCode string, studentID uint) error {
	var session models.CheckinSession

	// 查找活跃的会话
	if err := database.DB.Where("session_code = ? AND status = ?", sessionCode, "active").First(&session).Error; err != nil {
		return errors.New("签到不存在或已结束")
	}

	// 检查是否过期
	now := time.Now()
	endTime := session.StartTime.Add(time.Duration(session.Duration) * time.Minute)
	if now.After(endTime) {
		// 会话已过期，更新状态
		database.DB.Model(&session).Update("status", "ended")
		return errors.New("签到已过期")
	}

	// 检查学生是否选修了该课程
	var enrollment models.Enrollment
	if err := database.DB.Where("student_id = ? AND course_id = ?", studentID, session.CourseID).First(&enrollment).Error; err != nil {
		return errors.New("您未选修该课程")
	}

	// 准备签到记录
	record := models.CheckinRecord{
		SessionID:            session.ID,
		StudentID:            studentID,
		CourseID:             session.CourseID,
		CheckinTime:          time.Now(), // 添加这一行来设置正确的签到时间
		Status:               "present",  // 默认为出勤
		UniqueSessionStudent: fmt.Sprintf("%d-%d", session.ID, studentID),
	}

	// 使用事务确保原子性
	return database.DB.Transaction(func(tx *gorm.DB) error {
		// 尝试创建记录，利用唯一索引防止重复
		if err := tx.Create(&record).Error; err != nil {
			if isUniqueConstraintError(err) {
				return errors.New("您已签到，请勿重复操作")
			}
			return err // 其他数据库错误
		}
		return nil
	})
}

// GetSessionDisplayInfo 获取会话展示信息
func GetSessionDisplayInfo(sessionCode string) (courseName, teacherName string, startTime time.Time, err error) {
	var session models.CheckinSession

	// 预加载关联的课程和教师信息
	if err := database.DB.Preload("Course").Preload("Teacher").Where("session_code = ?", sessionCode).First(&session).Error; err != nil {
		return "", "", time.Time{}, err
	}

	// 检查会话是否已结束
	if session.Status == "ended" {
		return "", "", time.Time{}, errors.New("会话已结束")
	}

	return session.Course.Name, session.Teacher.Name, session.StartTime, nil
}

// GetCheckinRecordsBySession 获取某次签到的记录
func GetCheckinRecordsBySession(sessionID uint) ([]gin.H, error) {
	var records []models.CheckinRecord
	var result []gin.H

	if err := database.DB.Where("session_id = ?", sessionID).Preload("Student").Find(&records).Error; err != nil {
		return nil, err
	}

	for _, r := range records {
		result = append(result, gin.H{
			"student_id": r.StudentID,
			// "student_name": r.Student.Name, // 假设预加载了 Student
			"checkin_time": r.CheckinTime.Format("2006-01-02 15:04:05"),
			"status":       r.Status,
		})
	}

	return result, nil
}

// EndCheckinSession 结束签到会话
func EndCheckinSession(sessionID uint) error {
	var session models.CheckinSession
	
	// 查找会话
	if err := database.DB.Where("id = ?", sessionID).First(&session).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("签到会话不存在")
		}
		return errors.New("查询签到会话失败: " + err.Error())
	}
	
	// 检查会话状态
	if session.Status == "ended" {
		return errors.New("签到会话已结束")
	}
	
	// 更新会话状态为已结束
	if err := database.DB.Model(&session).Update("status", "ended").Error; err != nil {
		return errors.New("结束签到会话失败: " + err.Error())
	}
	
	return nil
}

// ManualEndCheckinSession 手动结束签到会话（教师强制结束）
func ManualEndCheckinSession(sessionID uint, teacherID uint) error {
	var session models.CheckinSession
	
	// 查找会话并验证教师权限
	if err := database.DB.Where("id = ? AND teacher_id = ?", sessionID, teacherID).First(&session).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("签到会话不存在或您无权限操作此会话")
		}
		return errors.New("查询签到会话失败: " + err.Error())
	}
	
	// 检查会话状态
	if session.Status == "ended" {
		return errors.New("签到会话已结束")
	}
	
	// 更新会话状态为已结束
	if err := database.DB.Model(&session).Updates(map[string]interface{}{
		"status": "ended",
		"duration": int(time.Since(session.StartTime).Minutes()), // 更新实际持续时间
	}).Error; err != nil {
		return errors.New("手动结束签到会话失败: " + err.Error())
	}
	
	return nil
}

// isUniqueConstraintError 判断是否为 MySQL 唯一约束错误
func isUniqueConstraintError(err error) bool {
	if err != nil {
		errStr := err.Error()
		// MySQL 唯一约束错误通常包含 "1062" 和 "Duplicate entry"
		return (errStr != "" && len(errStr) > 10 && errStr[0:10] == "Error 1062")
	}
	return false
}