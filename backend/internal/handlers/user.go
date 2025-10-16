package handlers

import (
	"backend/internal/services"
	"backend/pkg/response"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

var userService = &services.UserService{}

// 获取所有用户
func GetUsers(c *gin.Context) {
	users, err := userService.GetAllUsers()
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "获取用户列表失败")
		return
	}

	// 清除密码哈希值，不返回给前端
	for i := range users {
		users[i].PasswordHash = ""
	}

	response.Success(c, users)
}

// 获取所有学生
func GetStudents(c *gin.Context) {
	students, err := userService.GetStudents()
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "获取学生列表失败")
		return
	}

	// 清除密码哈希值，不返回给前端
	for i := range students {
		students[i].PasswordHash = ""
	}

	response.Success(c, students)
}

// 获取所有教师
func GetTeachers(c *gin.Context) {
	teachers, err := userService.GetTeachers()
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "获取教师列表失败")
		return
	}

	// 清除密码哈希值，不返回给前端
	for i := range teachers {
		teachers[i].PasswordHash = ""
	}

	response.Success(c, teachers)
}

// 创建用户
func CreateUser(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Name     string `json:"name" binding:"required"`
		Password string `json:"password" binding:"required,min=6"`
		Role     string `json:"role" binding:"required,oneof=admin teacher student"`
		Email    string `json:"email" binding:"required,email"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "请求参数错误: "+err.Error())
		return
	}

	user, err := userService.CreateUser(req.Username, req.Name, req.Password, req.Role, req.Email)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, user)
}

// 更新用户
func UpdateUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "无效的用户ID")
		return
	}

	var req struct {
		Name  string `json:"name" binding:"required"`
		Role  string `json:"role" binding:"required,oneof=admin teacher student"`
		Email string `json:"email" binding:"required,email"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "请求参数错误: "+err.Error())
		return
	}

	user, err := userService.UpdateUser(uint(id), req.Name, req.Role, req.Email)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, user)
}

// 删除用户
func DeleteUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "无效的用户ID")
		return
	}

	if err := userService.DeleteUser(uint(id)); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, gin.H{"message": "用户删除成功"})
}

// 获取单个用户信息
func GetUser(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "无效的用户ID")
		return
	}

	user, err := userService.GetUserByID(uint(id))
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	// 清除密码哈希值，不返回给前端
	user.PasswordHash = ""
	response.Success(c, user)
}

// 重置用户密码
func ResetUserPassword(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "无效的用户ID")
		return
	}

	var req struct {
		Password string `json:"password" binding:"required,min=6"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "请求参数错误: "+err.Error())
		return
	}

	err = userService.UpdatePassword(uint(id), req.Password)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, gin.H{"message": "密码重置成功"})
}