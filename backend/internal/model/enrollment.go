package models

import (
	"time"

	"gorm.io/gorm"
)

type Enrollment struct {
	ID         uint      `gorm:"primaryKey"`
	StudentID  uint      `gorm:"not null"` // 学生ID
	Student    User      `gorm:"foreignKey:StudentID"` // 关联学生
	CourseID   uint      `gorm:"not null"` // 课程ID
	Course     Course    `gorm:"foreignKey:CourseID"` // 关联课程
	EnrollTime time.Time `gorm:"not null"` // 选课时间
	CreatedAt  time.Time
	UpdatedAt  time.Time
	DeletedAt  gorm.DeletedAt `gorm:"index"` // 软删除
	// MySQL 唯一索引
	UniqueStudentCourse string `gorm:"uniqueIndex:idx_student_course;type:varchar(191)"` // 防止重复选课
}