import React from 'react';
import useScrollAnimation from '../hooks/useScrollAnimation';

const HeroSection = () => {
  const [heroRef, heroVisible] = useScrollAnimation({ threshold: 0.2 });
  const [imageRef, imageVisible] = useScrollAnimation({ threshold: 0.3 });

  return (
    <header className="main-header">
      <div className="hero-section">
        <div 
          ref={heroRef}
          className={`hero-content animate-fade ${heroVisible ? 'visible' : ''}`}
        >
          <div className="wedding-date">2025년 12월 13일 토요일</div>
          <div className="couple-names">
            <span className="groom-name">민석</span>
            <span className="heart">♥</span>
            <span className="bride-name">수진</span>
          </div>
          <div className="wedding-time">오후 3시</div>
          <div className="wedding-venue">세인트 메리엘</div>
        </div>
        <div 
          ref={imageRef}
          className={`hero-image animate-scale ${imageVisible ? 'visible' : ''}`}
        >
          <img src="/assets/images/couple-main.jpg" alt="신랑신부 사진" id="mainPhoto" />
        </div>
      </div>
    </header>
  );
};

export default HeroSection;