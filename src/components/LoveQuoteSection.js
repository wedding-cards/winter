import React from 'react';
import useScrollAnimation from '../hooks/useScrollAnimation';

const LoveQuoteSection = () => {
  const [sectionRef, sectionVisible] = useScrollAnimation({ threshold: 0.2 });

  return (
    <section className="love-quote-section">
      <div className="container">
        <div 
          ref={sectionRef}
          className={`love-quote-content animate-on-scroll ${sectionVisible ? 'visible' : ''}`}
        >
          <div className="love-quote-image">
            <img 
              src="/snap.jpeg" 
              alt="민석과 수진의 자연스러운 일상 스냅 사진 - 서로를 바라보며 미소 짓는 모습" 
              loading="lazy"
            />
          </div>
          <div className="love-quote-text">
            <p className="quote-main">
              "사랑은 서로를 바라보는 것이 아니라<br/>
              같은 방향을 바라보는 것이다"
            </p>
            <p className="quote-author">- 생텍쥐페리 -</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoveQuoteSection;
