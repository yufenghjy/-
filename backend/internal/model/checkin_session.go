package models

import (
	"time"

	"gorm.io/gorm"
)

type CheckinSession struct {
	ID          uint      `gorm:"primaryKey"`
	SessionCode string    `gorm:"uniqueIndex;not null;type:varchar(191)"` // 会话码
	CourseID    uint      `gorm:"not null"`                               // 课程ID
	TeacherID   uint      `gorm:"not null"`                               // 教师ID
	StartTime   time.Time `gorm:"not null"`                               // 开始时间
	Duration    int       `gorm:"not null;default:10"`                    // 持续时间(分钟)
	Status      string    `gorm:"not null;default:active"`                // 状态: active, ended
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   gorm.DeletedAt `gorm:"index"` // 软删除
}
