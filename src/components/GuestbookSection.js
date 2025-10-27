import React, { useState, useEffect } from "react";
import useScrollAnimation from "../hooks/useScrollAnimation";

const GuestbookSection = () => {
  const [sectionRef, sectionVisible] = useScrollAnimation({ threshold: 0.2 });

  const [guestMessages, setGuestMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({
    name: "",
    message: "",
  });

  useEffect(() => {
    // 고유한 ID 생성 함수
    const generateUniqueId = () => {
      return Date.now() + Math.random().toString(36).substr(2, 9);
    };

    // ID 중복 확인 및 수정 함수
    const ensureUniqueIds = (messages) => {
      const seenIds = new Set();
      return messages.map((msg) => {
        if (seenIds.has(msg.id) || !msg.id) {
          // 중복되거나 없는 ID를 새로운 고유 ID로 교체
          msg.id = generateUniqueId();
        }
        seenIds.add(msg.id);
        return msg;
      });
    };

    // 로컬 스토리지에서 기존 메시지 로드
    const saved = localStorage.getItem("wedding-guestbook");
    if (saved) {
      try {
        const parsedMessages = JSON.parse(saved);
        const messagesWithUniqueIds = ensureUniqueIds(parsedMessages);
        setGuestMessages(messagesWithUniqueIds);
        // 수정된 데이터를 다시 저장
        localStorage.setItem(
          "wedding-guestbook",
          JSON.stringify(messagesWithUniqueIds)
        );
      } catch (error) {
        console.error("Failed to parse guestbook data:", error);
        // 파싱 실패 시 기본 메시지로 초기화
        initializeDefaultMessages();
      }
    } else {
      initializeDefaultMessages();
    }

    function initializeDefaultMessages() {
      // 샘플 방명록 메시지
      const sampleMessages = [
        {
          name: "최원정",
          message: "너무 아름다운 커플이에요~ 평생 행복하세요! 🎉",
          date: "2025-10-14",
          id: generateUniqueId(),
        },
        {
          name: "임경민",
          message:
            "민석아 결혼 축하한다! 행복한 가정 만들어 나가길 응원할게 👏",
          date: "2025-10-17",
          id: generateUniqueId(),
        },
      ];
      setGuestMessages(sampleMessages);
      localStorage.setItem("wedding-guestbook", JSON.stringify(sampleMessages));
    }
  }, []);

  const addGuestMessage = () => {
    if (!newMessage.name || !newMessage.message) {
      alert("이름과 메시지를 입력해주세요.");
      return;
    }

    if (newMessage.message.length > 200) {
      alert("메시지는 200자 이내로 입력해주세요.");
      return;
    }

    const messageToAdd = {
      ...newMessage,
      date: new Date().toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
      id: Date.now() + Math.random().toString(36).substr(2, 9),
    };

    const updatedMessages = [messageToAdd, ...guestMessages];
    setGuestMessages(updatedMessages);
    localStorage.setItem("wedding-guestbook", JSON.stringify(updatedMessages));

    // 입력 필드 초기화
    setNewMessage({ name: "", message: "" });
    alert("축하 메시지가 등록되었습니다!");
  };

  const handleInputChange = (field, value) => {
    setNewMessage((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
          <textarea
            value={newMessage.message}
            onChange={(e) => handleInputChange("message", e.target.value)}
            placeholder="축하의 메시지를 남겨주세요"
          />
          <input
            type="text"
            value={newMessage.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="이름"
          />
          <button onClick={addGuestMessage}>메시지 남기기</button>
        </div>

        <div className="guestbook-messages">
          {guestMessages.map((msg) => (
            <div key={msg.id} className="guest-message fade-in">
              <div className="message-header">
                <span className="message-author">{msg.name}</span>
                <span className="message-date">{msg.date}</span>
              </div>
              <div className="message-content">{msg.message}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GuestbookSection;
