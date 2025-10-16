package handlers

import (
	models "backend/internal/model"
	"backend/pkg/database"
	"backend/pkg/response"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetEnrollments 获取所有选课记录
func GetEnrollments(c *gin.Context) {
	var enrollments []models.Enrollment

	// 预加载学生和课程信息
	if err := database.DB.Preload("Student").Preload("Course").Find(&enrollments).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "获取选课记录失败: "+err.Error())
		return
	}

	// 构造返回数据
	type enrollmentResponse struct {
		ID          uint      `json:"id"`
		StudentID   uint      `json:"studentId"`
		StudentName string    `json:"studentName"`
		CourseID    uint      `json:"courseId"`
		CourseName  string    `json:"courseName"`
		EnrollTime  time.Time `json:"enrollTime"`
	}

	var result []enrollmentResponse
	for _, enrollment := range enrollments {
		result = append(result, enrollmentResponse{
			ID:          enrollment.ID,
			StudentID:   enrollment.StudentID,
			StudentName: enrollment.Student.Name,
			CourseID:    enrollment.CourseID,
			CourseName:  enrollment.Course.Name,
			EnrollTime:  enrollment.EnrollTime,
		})
	}

	response.Success(c, result)
}

// CreateEnrollment 添加选课记录
func CreateEnrollment(c *gin.Context) {
	var req struct {
		StudentID uint `json:"studentId" binding:"required"`
		CourseID  uint `json:"courseId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "参数错误: "+err.Error())
		return
	}

	// 检查学生和课程是否存在
	var student models.User
	if err := database.DB.Where("id = ? AND role = ?", req.StudentID, "student").First(&student).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			response.Error(c, http.StatusBadRequest, "学生不存在")
			return
		}
		response.Error(c, http.StatusInternalServerError, "查询学生失败")
		return
	}

	var course models.Course
	if err := database.DB.First(&course, req.CourseID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			response.Error(c, http.StatusBadRequest, "课程不存在")
			return
		}
		response.Error(c, http.StatusInternalServerError, "查询课程失败")
		return
	}

	// 检查是否已经选过这门课
	var existingEnrollment models.Enrollment
	if err := database.DB.Where("student_id = ? AND course_id = ?", req.StudentID, req.CourseID).First(&existingEnrollment).Error; err != nil {
		if err != gorm.ErrRecordNotFound {
			response.Error(c, http.StatusInternalServerError, "查询选课记录失败")
			return
		}
		// 如果没有找到记录，继续创建
	} else {
		// 如果找到了记录，说明已经选过这门课
		response.Error(c, http.StatusBadRequest, "该学生已经选修了这门课程")
		return
	}

	// 创建选课记录
	enrollment := models.Enrollment{
		StudentID:  req.StudentID,
		CourseID:   req.CourseID,
		EnrollTime: time.Now(),
	}

	if err := database.DB.Create(&enrollment).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "创建选课记录失败: "+err.Error())
		return
	}

	// 返回创建成功的记录（包含关联信息）
	var newEnrollment models.Enrollment
	if err := database.DB.Preload("Student").Preload("Course").First(&newEnrollment, enrollment.ID).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "查询新创建的选课记录失败: "+err.Error())
		return
	}

	response.Success(c, gin.H{
		"id":          newEnrollment.ID,
		"studentId":   newEnrollment.StudentID,
		"studentName": newEnrollment.Student.Name,
		"courseId":    newEnrollment.CourseID,
		"courseName":  newEnrollment.Course.Name,
		"enrollTime":  newEnrollment.EnrollTime,
	})
}

// DeleteEnrollment 删除选课记录
func DeleteEnrollment(c *gin.Context) {
	id := c.Param("id")

	var enrollment models.Enrollment
	if err := database.DB.Preload("Student").Preload("Course").First(&enrollment, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			response.Error(c, http.StatusNotFound, "选课记录不存在")
			return
		}
		response.Error(c, http.StatusInternalServerError, "查询选课记录失败: "+err.Error())
		return
	}

	// 删除选课记录
	if err := database.DB.Delete(&enrollment).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "删除选课记录失败: "+err.Error())
		return
	}

	response.Success(c, gin.H{
		"id":          enrollment.ID,
		"studentId":   enrollment.StudentID,
		"studentName": enrollment.Student.Name,
		"courseId":    enrollment.CourseID,
		"courseName":  enrollment.Course.Name,
		"enrollTime":  enrollment.EnrollTime,
		"message":     "退课成功",
	})
}