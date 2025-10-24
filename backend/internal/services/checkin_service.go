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

	// 检查是否过期
	now := time.Now()
	endTime := session.StartTime.Add(time.Duration(session.Duration) * time.Minute)
	if now.After(endTime) {
		// 会话已过期，更新状态
		database.DB.Model(&session).Update("status", "ended")
		return "", "", time.Time{}, errors.New("会话已结束")
	}

	return session.Course.Name, session.Teacher.Name, session.StartTime, nil
}

// GetCheckinRecordsBySession 获取某次签到的记录
func GetCheckinRecordsBySession(sessionID uint) ([]gin.H, error) {
	var session models.CheckinSession
	
	// 首先获取签到会话信息，以获取课程ID
	if err := database.DB.Preload("Course").Where("id = ?", sessionID).First(&session).Error; err != nil {
		return nil, err
	}
	
	// 获取该课程的所有选课记录
	var enrollments []models.Enrollment
	if err := database.DB.Preload("Student").Where("course_id = ?", session.CourseID).Find(&enrollments).Error; err != nil {
		return nil, err
	}
	
	// 获取该会话的所有签到记录
	var records []models.CheckinRecord
	if err := database.DB.Preload("Student").Where("session_id = ?", sessionID).Find(&records).Error; err != nil {
		return nil, err
	}
	
	// 创建一个map来快速查找签到记录
	recordMap := make(map[uint]models.CheckinRecord)
	for _, record := range records {
		recordMap[record.StudentID] = record
	}
	
	// 构建结果，包含所有选课学生，无论是否签到
	var result []gin.H
	for _, enrollment := range enrollments {
		if record, exists := recordMap[enrollment.StudentID]; exists {
			// 学生已签到
			result = append(result, gin.H{
				"student_id":   record.StudentID,
				"student_name": record.Student.Name,
				"checkin_time": record.CheckinTime.Format("2006-01-02 15:04:05"),
				"status":       record.Status,
			})
		} else {
			// 学生未签到
			result = append(result, gin.H{
				"student_id":   enrollment.StudentID,
				"student_name": enrollment.Student.Name,
				"checkin_time": nil,
				"status":       "absent", // 未签到的学生标记为缺席
			})
		}
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

// ManualCheckin 手动补签功能
func ManualCheckin(sessionID uint, studentID uint, status string) error {
	// 验证状态值
	if status != "present" && status != "late" && status != "absent" {
		return errors.New("无效的状态值")
	}

	// 获取会话信息
	var session models.CheckinSession
	if err := database.DB.Where("id = ?", sessionID).First(&session).Error; err != nil {
		return errors.New("签到会话不存在")
	}

	// 检查学生是否选修了该课程
	var enrollment models.Enrollment
	if err := database.DB.Where("student_id = ? AND course_id = ?", studentID, session.CourseID).First(&enrollment).Error; err != nil {
		return errors.New("该学生未选修此课程")
	}

	// 准备签到记录
	record := models.CheckinRecord{
		SessionID:            session.ID,
		StudentID:            studentID,
		CourseID:             session.CourseID,
		CheckinTime:          time.Now(),
		Status:               status,
		UniqueSessionStudent: fmt.Sprintf("%d-%d", session.ID, studentID),
	}

	// 使用事务确保原子性
	return database.DB.Transaction(func(tx *gorm.DB) error {
		// 尝试创建记录，如果已存在则更新
		if err := tx.Where("session_id = ? AND student_id = ?", session.ID, studentID).First(&record).Error; err != nil {
			// 记录不存在，创建新记录
			if errors.Is(err, gorm.ErrRecordNotFound) {
				if err := tx.Create(&record).Error; err != nil {
					return errors.New("补签失败: " + err.Error())
				}
				return nil
			}
			return err
		} else {
			// 记录已存在，更新状态和签到时间
			updates := map[string]interface{}{
				"status":       status,
				"checkin_time": time.Now(),
			}
			if err := tx.Model(&record).Updates(updates).Error; err != nil {
				return errors.New("更新签到记录失败: " + err.Error())
			}
			return nil
		}
	})
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