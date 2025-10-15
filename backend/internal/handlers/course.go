package handlers

import (
	model "backend/internal/model"
	"backend/internal/services"
	"backend/pkg/database"
	"backend/pkg/response"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CourseHandler struct {
	service services.CourseService
}

// GetCourses 获取所有课程
func GetCourses(c *gin.Context) {
	var courses []model.Course
	result := database.DB.Find(&courses)
	if result.Error != nil {
		response.Error(c, http.StatusInternalServerError, "获取课程列表失败")
		return
	}
	response.Success(c, courses)
}

// GetCourseByID 根据ID获取课程详情
func GetCourseByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "参数错误")
		return
	}

	var course model.Course
	result := database.DB.First(&course, id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			response.Error(c, http.StatusNotFound, "课程不存在")
			return
		}
		response.Error(c, http.StatusInternalServerError, "查询课程失败")
		return
	}

	response.Success(c, course)
}

// GetMyCourses 获取当前用户（教师）的课程
func GetMyCourses(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "用户未登录")
		return
	}

	var courses []model.Course
	result := database.DB.Where("teacher_id = ?", userID).Find(&courses)
	if result.Error != nil {
		response.Error(c, http.StatusInternalServerError, "获取我的课程失败")
		return
	}

	response.Success(c, courses)
}