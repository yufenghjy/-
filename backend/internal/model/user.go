package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID           uint   `gorm:"primaryKey"`
	Username     string `gorm:"uniqueIndex;not null;type:varchar(191)"` // 学号/工号
	Name         string `gorm:"not null"`             // 姓名
	PasswordHash string `gorm:"not null"`             // 密码哈希
	Role         string `gorm:"not null"`             // student, teacher, admin
	Email        string `gorm:"default:null"`         // 邮箱
	CreatedAt    time.Time
	UpdatedAt    time.Time
	DeletedAt    gorm.DeletedAt `gorm:"index"` // 软删除
}
