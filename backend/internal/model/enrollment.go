package models

import (
	"time"

	"gorm.io/gorm"
)

type Enrollment struct {
	ID         uint      `gorm:"primaryKey"`
	StudentID  uint      `gorm:"not null"` // 学生ID
	CourseID   uint      `gorm:"not null"` // 课程ID
	EnrollTime time.Time `gorm:"not null"` // 选课时间
	CreatedAt  time.Time
	UpdatedAt  time.Time
	DeletedAt  gorm.DeletedAt `gorm:"index"` // 软删除
	// MySQL 唯一索引
	UniqueStudentCourse string `gorm:"uniqueIndex:idx_student_course;type:varchar(191)"` // 防止重复选课
}
