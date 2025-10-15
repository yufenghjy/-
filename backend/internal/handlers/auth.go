package handlers

import (
	models "backend/internal/model"
	"backend/pkg/database"
	"backend/pkg/response"
	"backend/pkg/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func Login(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "用户名或密码不能为空")
		return
	}

	var user models.User
	if err := database.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		response.Error(c, http.StatusUnauthorized, "用户名或密码错误")
		return
	}

	if !utils.CheckPasswordHash(req.Password, user.PasswordHash) {
		response.Error(c, http.StatusUnauthorized, "用户名或密码错误")
		return
	}

	token, err := utils.GenerateJWT(user.ID, user.Role)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "生成 Token 失败")
		return
	}

	response.Success(c, gin.H{
		"token": token,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"name":     user.Name,
			"role":     user.Role,
		},
	})
}
