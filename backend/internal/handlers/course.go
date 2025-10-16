package handlers

import (
	model "backend/internal/model"
	"backend/internal/services"
	"backend/pkg/database"
	"backend/pkg/response"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CourseHandler struct {
	service services.CourseService
}

// GetCourses 获取所有课程
func GetCourses(c *gin.Context) {
	var courses []model.Course
	result := database.DB.Preload("Teacher").Find(&courses)
	if result.Error != nil {
		response.Error(c, http.StatusInternalServerError, "获取课程列表失败")
		return
	}

	// 转换数据，添加教师姓名字段
	type courseResponse struct {
		ID         uint   `json:"ID"`
		CourseCode string `json:"CourseCode"`
		Name       string `json:"Name"`
		TeacherID  uint   `json:"TeacherID"`
		Teacher    string `json:"Teacher"` // 添加教师姓名字段
		Credit     int    `json:"Credit"`
		Semester   string `json:"Semester"`
		CreatedAt  string `json:"CreatedAt"`
		UpdatedAt  string `json:"UpdatedAt"`
	}

	var responseCourses []courseResponse
	for _, course := range courses {
		// 处理教师信息可能为空的情况
		teacherName := ""
		if course.Teacher.ID != 0 {
			teacherName = course.Teacher.Name
		}
		
		responseCourses = append(responseCourses, courseResponse{
			ID:         course.ID,
			CourseCode: course.CourseCode,
			Name:       course.Name,
			TeacherID:  course.TeacherID,
			Teacher:    teacherName, // 从关联的Teacher中获取教师姓名
			Credit:     course.Credit,
			Semester:   course.Semester,
			CreatedAt:  course.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			UpdatedAt:  course.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		})
	}

	response.Success(c, responseCourses)
}

// GetCourseByID 根据ID获取课程详情
func GetCourseByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "参数错误")
		return
	}

	var course model.Course
	result := database.DB.Preload("Teacher").First(&course, id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			response.Error(c, http.StatusNotFound, "课程不存在")
			return
		}
		response.Error(c, http.StatusInternalServerError, "查询课程失败")
		return
	}

	// 转换数据，添加教师姓名字段
	type courseResponse struct {
		ID         uint   `json:"ID"`
		CourseCode string `json:"CourseCode"`
		Name       string `json:"Name"`
		TeacherID  uint   `json:"TeacherID"`
		Teacher    string `json:"Teacher"` // 添加教师姓名字段
		Credit     int    `json:"Credit"`
		Semester   string `json:"Semester"`
		CreatedAt  string `json:"CreatedAt"`
		UpdatedAt  string `json:"UpdatedAt"`
	}

	responseData := courseResponse{
		ID:         course.ID,
		CourseCode: course.CourseCode,
		Name:       course.Name,
		TeacherID:  course.TeacherID,
		Teacher:    course.Teacher.Name, // 从关联的Teacher中获取教师姓名
		Credit:     course.Credit,
		Semester:   course.Semester,
		CreatedAt:  course.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:  course.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	response.Success(c, responseData)
}

// GetMyCourses 获取当前用户（教师）的课程
func GetMyCourses(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "用户未登录")
		return
	}

	var courses []model.Course
	result := database.DB.Preload("Teacher").Where("teacher_id = ?", userID).Find(&courses)
	if result.Error != nil {
		response.Error(c, http.StatusInternalServerError, "获取我的课程失败")
		return
	}

	// 转换数据，添加教师姓名字段
	type courseResponse struct {
		ID         uint   `json:"ID"`
		CourseCode string `json:"CourseCode"`
		Name       string `json:"Name"`
		TeacherID  uint   `json:"TeacherID"`
		Teacher    string `json:"Teacher"` // 添加教师姓名字段
		Credit     int    `json:"Credit"`
		Semester   string `json:"Semester"`
		CreatedAt  string `json:"CreatedAt"`
		UpdatedAt  string `json:"UpdatedAt"`
	}

	var responseCourses []courseResponse
	for _, course := range courses {
		// 处理教师信息可能为空的情况
		teacherName := ""
		if course.Teacher.ID != 0 {
			teacherName = course.Teacher.Name
		}
		
		responseCourses = append(responseCourses, courseResponse{
			ID:         course.ID,
			CourseCode: course.CourseCode,
			Name:       course.Name,
			TeacherID:  course.TeacherID,
			Teacher:    teacherName, // 从关联的Teacher中获取教师姓名
			Credit:     course.Credit,
			Semester:   course.Semester,
			CreatedAt:  course.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			UpdatedAt:  course.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		})
	}

	response.Success(c, responseCourses)
}

// CreateCourse 创建课程
func CreateCourse(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "用户未登录")
		return
	}

	// 修改结构体定义，支持接收大驼峰命名的字段
	var req struct {
		CourseCode string `json:"CourseCode" binding:"required"`
		Name       string `json:"Name" binding:"required"`
		TeacherID  uint   `json:"TeacherID"` // 添加TeacherID字段
		Credit     int    `json:"Credit" binding:"required,min=1"`
		Semester   string `json:"Semester" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "参数错误: "+err.Error())
		return
	}

	// 检查课程代码是否已存在
	var existingCourse model.Course
	if err := database.DB.Where("course_code = ?", req.CourseCode).First(&existingCourse).Error; err == nil {
		response.Error(c, http.StatusBadRequest, "课程代码已存在")
		return
	}

	// 如果没有提供教师ID，则使用当前用户ID
	teacherID := req.TeacherID
	if teacherID == 0 {
		teacherID = userID.(uint)
	}

	// 创建课程对象
	course := model.Course{
		CourseCode: req.CourseCode,
		Name:       req.Name,
		TeacherID:  teacherID,
		Credit:     req.Credit,
		Semester:   req.Semester,
	}

	// 保存到数据库
	result := database.DB.Create(&course)
	if result.Error != nil {
		// 检查是否是唯一性约束错误
		if strings.Contains(result.Error.Error(), "Duplicate entry") {
			response.Error(c, http.StatusBadRequest, "课程代码已存在")
			return
		}
		response.Error(c, http.StatusInternalServerError, "创建课程失败: "+result.Error.Error())
		return
	}

	response.Success(c, course)
}

// UpdateCourse 更新课程
func UpdateCourse(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "参数错误")
		return
	}

	// 修改结构体定义，支持接收大驼峰命名的字段
	var req struct {
		CourseCode string `json:"CourseCode"`
		Name       string `json:"Name"`
		TeacherID  uint   `json:"TeacherID"` // 添加TeacherID字段
		Credit     int    `json:"Credit"`
		Semester   string `json:"Semester"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "参数错误: "+err.Error())
		return
	}

	// 查找课程
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

	// 只更新提供的字段，避免更新created_at等时间字段
	updates := map[string]interface{}{}
	if req.CourseCode != "" {
		updates["course_code"] = req.CourseCode
	}
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.TeacherID != 0 {
		updates["teacher_id"] = req.TeacherID
	}
	if req.Credit != 0 {
		updates["credit"] = req.Credit
	}
	if req.Semester != "" {
		updates["semester"] = req.Semester
	}
	updates["updated_at"] = time.Now()

	// 更新课程信息
	result = database.DB.Model(&course).Updates(updates)
	if result.Error != nil {
		// 检查是否是唯一性约束错误
		if strings.Contains(result.Error.Error(), "Duplicate entry") {
			response.Error(c, http.StatusBadRequest, "课程代码已存在")
			return
		}
		response.Error(c, http.StatusInternalServerError, "更新课程失败: "+result.Error.Error())
		return
	}

	response.Success(c, course)
}

// DeleteCourse 删除课程
func DeleteCourse(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "无效的课程ID")
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

	// 删除课程
	result = database.DB.Delete(&course)
	if result.Error != nil {
		response.Error(c, http.StatusInternalServerError, "删除课程失败: "+result.Error.Error())
		return
	}

	response.Success(c, gin.H{"message": "课程删除成功"})
}
