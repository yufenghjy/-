package services

import (
	model "backend/internal/model"
	"backend/pkg/database"
	"backend/pkg/utils"
	"errors"

	"gorm.io/gorm"
)

type UserService struct{}

// 获取所有用户
func (s *UserService) GetAllUsers() ([]model.User, error) {
	var users []model.User
	err := database.DB.Find(&users).Error
	return users, err
}

// 根据ID获取用户
func (s *UserService) GetUserByID(id uint) (*model.User, error) {
	var user model.User
	err := database.DB.First(&user, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("用户不存在")
		}
		return nil, err
	}
	return &user, nil
}

// 创建用户
func (s *UserService) CreateUser(username, name, password, role, email string) (*model.User, error) {
	// 检查用户名是否已存在
	var existingUser model.User
	if err := database.DB.Where("username = ?", username).First(&existingUser).Error; err == nil {
		return nil, errors.New("用户名已存在")
	}

	// 密码哈希
	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return nil, errors.New("密码加密失败")
	}

	user := model.User{
		Username:     username,
		Name:         name,
		PasswordHash: hashedPassword,
		Role:         role,
		Email:        email,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		return nil, err
	}

	// 清除密码哈希值，不返回给前端
	user.PasswordHash = ""
	return &user, nil
}

// 更新用户
func (s *UserService) UpdateUser(id uint, name, role, email string) (*model.User, error) {
	user, err := s.GetUserByID(id)
	if err != nil {
		return nil, err
	}

	user.Name = name
	user.Role = role
	user.Email = email

	if err := database.DB.Save(&user).Error; err != nil {
		return nil, err
	}

	// 清除密码哈希值，不返回给前端
	user.PasswordHash = ""
	return user, nil
}

// 删除用户
func (s *UserService) DeleteUser(id uint) error {
	user, err := s.GetUserByID(id)
	if err != nil {
		return err
	}

	// 不允许删除管理员用户
	if user.Role == "admin" {
		return errors.New("不允许删除管理员用户")
	}

	return database.DB.Delete(&user).Error
}

// 更新用户密码
func (s *UserService) UpdatePassword(id uint, newPassword string) error {
	user, err := s.GetUserByID(id)
	if err != nil {
		return err
	}

	hashedPassword, err := utils.HashPassword(newPassword)
	if err != nil {
		return errors.New("密码加密失败")
	}

	user.PasswordHash = hashedPassword
	return database.DB.Save(&user).Error
}
