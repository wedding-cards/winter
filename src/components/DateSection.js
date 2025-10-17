import React, { useState, useEffect } from 'react';
import useScrollAnimation from '../hooks/useScrollAnimation';

const DateSection = () => {
  const [calendarRef, calendarVisible] = useScrollAnimation({ threshold: 0.2 });
  const [countdownRef, countdownVisible] = useScrollAnimation({ threshold: 0.2 });
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false
  });

  useEffect(() => {
    // 결혼식 날짜 설정 (2025년 12월 13일 15:00)
    const weddingDate = new Date('2025-12-13T15:00:00').getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = weddingDate - now;

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds, isPast: false });
      } else {
        // 결혼식이 지난 경우
        const pastDistance = Math.abs(distance);
        const days = Math.floor(pastDistance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((pastDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((pastDistance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((pastDistance % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds, isPast: true });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="date-section">
      <div className="container">
        <h2 className="section-title">DATE & TIME</h2>
        
        {/* 캘린더 */}
        <div 
          ref={calendarRef}
          className={`calendar animate-on-scroll ${calendarVisible ? 'visible' : ''}`}
        >
          <div className="calendar-header">
            <h3>2025년 12월</h3>
          </div>
          <div className="calendar-grid">
            <div className="calendar-day header">일</div>
            <div className="calendar-day header">월</div>
            <div className="calendar-day header">화</div>
            <div className="calendar-day header">수</div>
            <div className="calendar-day header">목</div>
            <div className="calendar-day header">금</div>
            <div className="calendar-day header">토</div>
            {/* 12월 1일은 월요일이므로 앞에 빈 칸 1개 */}
            <div className="calendar-day empty"></div>
            <div className="calendar-day">1</div>
            <div className="calendar-day">2</div>
            <div className="calendar-day">3</div>
            <div className="calendar-day">4</div>
            <div className="calendar-day">5</div>
            <div className="calendar-day">6</div>
            <div className="calendar-day">7</div>
            <div className="calendar-day">8</div>
            <div className="calendar-day">9</div>
            <div className="calendar-day">10</div>
            <div className="calendar-day">11</div>
            <div className="calendar-day">12</div>
            <div className="calendar-day wedding-day">13</div>
            <div className="calendar-day">14</div>
            <div className="calendar-day">15</div>
            <div className="calendar-day">16</div>
            <div className="calendar-day">17</div>
            <div className="calendar-day">18</div>
            <div className="calendar-day">19</div>
            <div className="calendar-day">20</div>
            <div className="calendar-day">21</div>
            <div className="calendar-day">22</div>
            <div className="calendar-day">23</div>
            <div className="calendar-day">24</div>
            <div className="calendar-day">25</div>
            <div className="calendar-day">26</div>
            <div className="calendar-day">27</div>
            <div className="calendar-day">28</div>
            <div className="calendar-day">29</div>
            <div className="calendar-day">30</div>
            <div className="calendar-day">31</div>
          </div>
        </div>

        {/* 깔끔한 카운트다운 - 한 줄 배치 */}
        <div 
          ref={countdownRef}
          className={`countdown-clean animate-scale ${countdownVisible ? 'visible' : ''}`}
        >
          <div className="countdown-single-row">
            <div className="countdown-group">
              <span className="countdown-label-inline">DAYS</span>
              <span className="countdown-number-inline">{String(timeLeft.days).padStart(2, '0')}</span>
            </div>
            <span className="countdown-colon">:</span>
            <div className="countdown-group">
              <span className="countdown-label-inline">HOUR</span>
              <span className="countdown-number-inline">{String(timeLeft.hours).padStart(2, '0')}</span>
            </div>
            <span className="countdown-colon">:</span>
            <div className="countdown-group">
              <span className="countdown-label-inline">MIN</span>
              <span className="countdown-number-inline">{String(timeLeft.minutes).padStart(2, '0')}</span>
            </div>
            <span className="countdown-colon">:</span>
            <div className="countdown-group">
              <span className="countdown-label-inline">SEC</span>
              <span className="countdown-number-inline">{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
          </div>
          <p className="countdown-message">
            민석 <span className="heart-emoji">♥</span> 예은 결혼식이 {timeLeft.days}일 {timeLeft.isPast ? '지났습니다' : '남았습니다'}.
          </p>
        </div>
      </div>
    </section>
  );
};

export default DateSection;