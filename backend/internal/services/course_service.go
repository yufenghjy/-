package services

import (
	model "backend/internal/model"
	"backend/pkg/database"
)

type CourseService struct{}

// GetCourses 获取所有课程
func (cs *CourseService) GetCourses() ([]model.Course, error) {
	var courses []model.Course
	result := database.DB.Find(&courses)
	return courses, result.Error
}

// GetCourseByID 根据ID获取课程
func (cs *CourseService) GetCourseByID(id uint) (*model.Course, error) {
	var course model.Course
	result := database.DB.First(&course, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &course, nil
}

// GetCoursesByTeacherID 根据教师ID获取课程
func (cs *CourseService) GetCoursesByTeacherID(teacherID uint) ([]model.Course, error) {
	var courses []model.Course
	result := database.DB.Where("teacher_id = ?", teacherID).Find(&courses)
	return courses, result.Error
}
