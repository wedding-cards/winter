import React, { useState } from "react";
import useScrollAnimation from "../hooks/useScrollAnimation";

const WreathSection = () => {
  const [sectionRef, sectionVisible] = useScrollAnimation({ threshold: 0.2 });
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleWreathClick = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleSendWreath = () => {
    const wreathUrl =
      "http://agent.maruw.co.kr/mobile/product?shop=need__it&idx=99768&goods_div_idx=1&menu=none&callback_url=https://salondeletter.com/api/w/maruw/99768";
    window.location.href = wreathUrl;
  };

  return (
    <>
      <section className="wreath-section">
        <div className="container">
          <div
            ref={sectionRef}
            className={`wreath-content animate-on-scroll ${
              sectionVisible ? "visible" : ""
            }`}
          >
            <p className="section-subtitle">WREATH</p>
            <h2 className="section-title">축하화환 보내기</h2>
            <p className="wreath-description">축하의 마음을 담아 전해보세요</p>

            <div className="wreath-card" onClick={handleWreathClick}>
              <div className="wreath-image-container">
                <img
                  src="/assets/images/wreath.png"
                  alt="축하화환"
                  className="wreath-image"
                />
              </div>
              <div className="wreath-text">
                <h3>축하화환 보내기</h3>
                <p>축하의 마음을 담아 전해보세요.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 팝업 모달 */}
      {isPopupOpen && (
        <div className="wreath-popup-overlay" onClick={handleClosePopup}>
          <div className="wreath-popup" onClick={(e) => e.stopPropagation()}>
            <button
              className="wreath-popup-close"
              onClick={handleClosePopup}
              aria-label="팝업 닫기"
            >
              ✕
            </button>

            <div className="wreath-popup-content">
              <h3 className="wreath-popup-title">축하화환 보내기</h3>

              <div className="wreath-popup-image">
                <img
                  src="/assets/images/wreath.png"
                  alt="축하화환"
                  className="popup-wreath-image"
                />
              </div>

              <div className="wreath-popup-details">
                <p>예식일시에 맞춰 웨딩홀로 배송됩니다.</p>
                <p>간편하게 축하의 마음을 전해보세요.</p>
              </div>

              <div className="wreath-popup-info">
                <div className="info-item">
                  <span className="info-icon">📅</span>
                  <span>2025년 12월 13일 토요일 오후 3시</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">📍</span>
                  <span>서울 강남구 논현로79길 72</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">🏢</span>
                  <span>세인트 메리엘 세인트홀</span>
                </div>
              </div>

              <button className="wreath-send-btn" onClick={handleSendWreath}>
                축하화환 보내기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(WreathSection);
