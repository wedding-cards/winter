import React, { useState, useEffect } from 'react';
import useScrollAnimation from '../hooks/useScrollAnimation';

const GuestbookSection = () => {
  const [sectionRef, sectionVisible] = useScrollAnimation({ threshold: 0.2 });
  
  const [guestMessages, setGuestMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({
    name: '',
    message: '',
    password: ''
  });

  useEffect(() => {
    // 로컬 스토리지에서 기존 메시지 로드
    const saved = localStorage.getItem('wedding-guestbook');
    if (saved) {
      setGuestMessages(JSON.parse(saved));
    } else {
      // 샘플 방명록 메시지
      const sampleMessages = [
        {
          name: "최원정",
          message: "너무 아름다운 커플이에요~ 평생 행복하세요! 🎉",
          date: "2025-10-14",
          id: Date.now() - 300000
        },
        {
          name: "임경민",
          message: "민석아 결혼 축하한다! 행복한 가정 만들어 나가길 응원할게 👏",
          date: "2025-10-17",
          id: Date.now() - 300000
        }
      ];
      setGuestMessages(sampleMessages);
      localStorage.setItem('wedding-guestbook', JSON.stringify(sampleMessages));
    }
  }, []);

  const addGuestMessage = () => {
    if (!newMessage.name || !newMessage.message || !newMessage.password) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    if (newMessage.message.length > 200) {
      alert('메시지는 200자 이내로 입력해주세요.');
      return;
    }

    const messageToAdd = {
      ...newMessage,
      date: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }),
      id: Date.now()
    };

    const updatedMessages = [messageToAdd, ...guestMessages];
    setGuestMessages(updatedMessages);
    localStorage.setItem('wedding-guestbook', JSON.stringify(updatedMessages));

    // 입력 필드 초기화
    setNewMessage({ name: '', message: '', password: '' });
    alert('축하 메시지가 등록되었습니다!');
  };

  const handleInputChange = (field, value) => {
    setNewMessage(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <section className="guestbook-section">
      <div className="container">
        <h2 className="section-title">GUESTBOOK</h2>
        <div 
          ref={sectionRef}
          className={`guestbook-form animate-on-scroll ${sectionVisible ? 'visible' : ''}`}
        >
          <textarea
            value={newMessage.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            placeholder="축하의 메시지를 남겨주세요"
          />
          <input
            type="text"
            value={newMessage.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="이름"
          />
          <input
            type="password"
            value={newMessage.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="비밀번호"
          />
          <button onClick={addGuestMessage}>메시지 남기기</button>
        </div>
        
        <div className="guestbook-messages">
          {guestMessages.map(msg => (
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