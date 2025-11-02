import React, { useState, useEffect, useCallback } from "react";
import {
  addGuestbookMessage,
  getGuestbookMessages,
  validateMessage,
} from "../firebase/guestbook";
import useScrollAnimation from "../hooks/useScrollAnimation";

const GuestbookSection = () => {
  const [sectionRef, sectionVisible] = useScrollAnimation({ threshold: 0.2 });

  const [guestMessages, setGuestMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({
    name: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  // 메시지 로드 함수 (Firebase만 사용)
  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      // Firebase에서 메시지 조회
      const result = await getGuestbookMessages();
      if (result.success && result.messages.length > 0) {
        setGuestMessages(result.messages);
      } else {
        // 데이터가 없거나 조회 실패 시 빈 배열
        setGuestMessages([]);
      }
    } catch (error) {
      // 에러 발생 시 빈 배열
      setGuestMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const addGuestMessage = useCallback(async () => {
    // 입력 검증
    const validation = validateMessage(newMessage.name, newMessage.message);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setTimeout(() => setErrors([]), 5000);
      return;
    }

    setIsSaving(true);
    setErrors([]);
    setSuccessMessage("");

    try {
      // Firebase에 저장
      const result = await addGuestbookMessage(newMessage);

      if (result.success) {
        // Firebase 저장 성공
        setSuccessMessage("메시지가 성공적으로 등록되었습니다! 💕");
        setNewMessage({ name: "", message: "" });

        // 메시지 목록 새로고침
        await loadMessages();

        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        // Firebase 저장 실패
        setErrors(["메시지 저장에 실패했습니다. 다시 시도해주세요."]);
        setTimeout(() => setErrors([]), 5000);
      }
    } catch (error) {
      // 에러 발생
      setErrors(["메시지 저장에 실패했습니다. 다시 시도해주세요."]);
      setTimeout(() => setErrors([]), 5000);
    } finally {
      setIsSaving(false);
    }
  }, [newMessage, loadMessages]);

  const handleInputChange = useCallback((field, value) => {
    setNewMessage((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  return (
    <section className="guestbook-section">
      <div className="container">
        <p className="section-subtitle">GUESTBOOK</p>
        <h2 className="section-title">방명록</h2>
        <div
          ref={sectionRef}
          className={`guestbook-form animate-on-scroll ${
            sectionVisible ? "visible" : ""
          }`}
        >
          {/* 에러 메시지 표시 */}
          {errors.length > 0 && (
            <div className="message-error">
              {errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}

          {/* 성공 메시지 표시 */}
          {successMessage && (
            <div className="message-success">
              <p>{successMessage}</p>
            </div>
          )}

          <textarea
            value={newMessage.message}
            onChange={(e) => handleInputChange("message", e.target.value)}
            placeholder="축하의 메시지를 남겨주세요 (200자 이내)"
            maxLength="200"
            disabled={isSaving}
          />
          <input
            type="text"
            value={newMessage.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="이름 (20자 이내)"
            maxLength="20"
            disabled={isSaving}
          />
          <button
            onClick={addGuestMessage}
            disabled={
              isSaving || !newMessage.name.trim() || !newMessage.message.trim()
            }
          >
            {isSaving ? "저장 중..." : "메시지 남기기"}
          </button>
        </div>

        <div className="guestbook-messages">
          {isLoading ? (
            <div className="loading-message">
              <p>메시지를 불러오는 중...</p>
            </div>
          ) : guestMessages.length > 0 ? (
            guestMessages.map((msg) => (
              <div key={msg.id} className="guest-message fade-in">
                <div className="message-header">
                  <span className="message-author">{msg.name}</span>
                  <span className="message-date">{msg.date}</span>
                </div>
                <div className="message-content">{msg.message}</div>
              </div>
            ))
          ) : (
            <div className="no-messages">
              <p>
                아직 등록된 메시지가 없습니다. 첫 번째 축하 메시지를 남겨보세요!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default GuestbookSection;
