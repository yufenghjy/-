package models

import (
	"time"

	"gorm.io/gorm"
)

type CheckinRecord struct {
	ID          uint      `gorm:"primaryKey"`
	SessionID   uint      `gorm:"not null"`                 // 会话ID
	StudentID   uint      `gorm:"not null"`                 // 学生ID
	Student     User      `gorm:"foreignKey:StudentID"`     // 关联学生
	CourseID    uint      `gorm:"not null"`                 // 课程ID (冗余字段，方便查询)
	CheckinTime time.Time `gorm:"not null"`                 // 签到时间
	Status      string    `gorm:"not null;default:present"` // 状态: present, late, absent
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   gorm.DeletedAt `gorm:"index"` // 软删除
	// MySQL 唯一索引
	UniqueSessionStudent string `gorm:"uniqueIndex:idx_session_student;type:varchar(191)"` // 防止重复签到
}