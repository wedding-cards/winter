import React from "react";

const HeroSection = () => {
  return (
    <header className="main-header">
      <div className="hero-section">
        <div className="hero-content">
          <div className="wedding-date">2025년 12월 13일 토요일</div>
          <div className="couple-names">
            <span className="groom-name">민석</span>
            <span className="heart">♥</span>
            <span className="bride-name">수진</span>
          </div>
          <div className="wedding-time">오후 3시</div>
          <div className="wedding-venue">세인트 메리엘</div>
        </div>
        <div className="hero-image">
          <picture>
            <source
              type="image/webp"
              srcSet="/assets/images/couple-main.webp"
            />
            <img
              src="/assets/images/couple-main.jpg"
              alt="신랑 민석과 신부 수진의 웨딩 사진 - 행복한 미소를 짓고 있는 두 사람"
              id="mainPhoto"
              width="280"
              height="350"
              fetchpriority="high"
            />
          </picture>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
