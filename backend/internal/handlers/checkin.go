package handlers

import (
	"backend/internal/services"
	"backend/pkg/database"
	"backend/pkg/response"
	"encoding/base64"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/skip2/go-qrcode"
	models "backend/internal/model"
)

// StartCheckin 教师发起签到
func StartCheckin(c *gin.Context) {
	var req struct {
		CourseID uint `json:"course_id" binding:"required"`
		Duration int  `json:"duration" binding:"required,min=1,max=60"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "参数错误: "+err.Error())
		return
	}

	teacherIDFloat, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "未授权")
		return
	}
	var teacherID uint
	switch v := teacherIDFloat.(type) {
	case float64:
		teacherID = uint(v)
	case uint:
		teacherID = v
	default:
		response.Error(c, http.StatusInternalServerError, "无效的用户ID类型")
		return
	}

	sessionCode, err := services.CreateCheckinSession(teacherID, req.CourseID, req.Duration)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	checkinURL := "localhost:5500/backend/static/index.html?session=" + sessionCode
	// 生成二维码
	qrCode, err := qrcode.New(checkinURL, qrcode.Medium)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "生成二维码失败: "+err.Error())
		return
	}
	// 转换为 Base64
	pngData, err := qrCode.PNG(256)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "二维码编码失败: "+err.Error())
		return
	}
	qrCodeBase64 := base64.StdEncoding.EncodeToString(pngData)
	response.Success(c, gin.H{
		"session_code": sessionCode,
		"checkin_url":  checkinURL,
		"qr_code":      qrCodeBase64,
		"message":      "签到已发起",
	})
}

// StudentCheckin 学生扫码签到
func StudentCheckin(c *gin.Context) {
	var req struct {
		SessionCode string `form:"session_code" json:"session_code" binding:"required"`
		StudentID   uint   `form:"student_id" json:"student_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("绑定失败: %v", err)
		response.Error(c, http.StatusBadRequest, "学号或会话码缺失")
		return
	}

	err := services.ProcessStudentCheckin(req.SessionCode, req.StudentID)
	if err != nil {
		// 使用 200 状态码返回业务错误，便于前端处理
		response.Error(c, http.StatusOK, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"msg":     "签到成功",
	})
}

// GetSessionInfo 获取会话信息（供H5页面显示）
func GetSessionInfo(c *gin.Context) {
	sessionCode := c.Param("code")
	courseName, teacherName, startTime, err := services.GetSessionDisplayInfo(sessionCode)
	if err != nil {
		response.Error(c, http.StatusNotFound, "会话不存在或已结束")
		return
	}

	response.Success(c, gin.H{
		"course_name":  courseName,
		"teacher_name": teacherName,
		"start_time":   startTime.Format("2006-01-02 15:04:05"),
		"session_code": sessionCode,
	})
}

// GetCheckinRecords 获取某次签到的记录（教师端）
func GetCheckinRecords(c *gin.Context) {
	sessionIDStr := c.Param("session_id")
	sessionID, err := strconv.ParseUint(sessionIDStr, 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "无效的会话ID")
		return
	}

	records, err := services.GetCheckinRecordsBySession(uint(sessionID))
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "获取记录失败")
		return
	}

	response.Success(c, records)
}

// GetCheckinSessions 获取所有签到会话列表
func GetCheckinSessions(c *gin.Context) {
	var sessions []models.CheckinSession
	result := database.DB.Find(&sessions)
	if result.Error != nil {
		response.Error(c, http.StatusInternalServerError, "获取签到会话列表失败")
		return
	}
	
	// 转换为前端需要的格式
	sessionList := make([]gin.H, 0)
	for _, session := range sessions {
		sessionList = append(sessionList, gin.H{
			"id":          session.ID,
			"sessionCode": session.SessionCode,
			"courseName":  session.Course.Name,
			"teacher":     session.Teacher.Name,
			"startTime":   session.StartTime.Format("2006-01-02 15:04:05"),
			"duration":    session.Duration,
			"status":      session.Status,
		})
	}
	
	response.Success(c, sessionList)
}

// EndCheckinSession 结束签到会话
func EndCheckinSession(c *gin.Context) {
	sessionIDStr := c.Param("session_id")
	sessionID, err := strconv.ParseUint(sessionIDStr, 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "无效的会话ID")
		return
	}

	err = services.EndCheckinSession(uint(sessionID))
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, gin.H{"message": "签到会话已结束"})
}