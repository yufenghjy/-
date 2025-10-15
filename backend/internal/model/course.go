package models

import (
	"time"

	"gorm.io/gorm"
)

type Course struct {
	ID         uint   `gorm:"primaryKey"`
	CourseCode string `gorm:"uniqueIndex;not null;type:varchar(191)"` // 课程编号
	Name       string `gorm:"not null"`             // 课程名称
	TeacherID  uint   `gorm:"not null"`             // 教师ID
	Credit     int    `gorm:"default:0"`            // 学分
	Semester   string `gorm:"default:null"`         // 学期
	CreatedAt  time.Time
	UpdatedAt  time.Time
	DeletedAt  gorm.DeletedAt `gorm:"index"` // 软删除
}
