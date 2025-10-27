import React, { useState, useEffect } from "react";

const IntroScreen = ({ onComplete }) => {
  const [currentText, setCurrentText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const fullText = "민석 ♥ 수진 결혼식에 초대합니다";

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setCurrentText(fullText.substring(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        // 텍스트 완성 후 2초 대기 후 페이드아웃
        setTimeout(() => {
          setIsComplete(true);
          // 페이드아웃 애니메이션 후 메인 화면으로
          setTimeout(() => {
            onComplete();
          }, 1000);
        }, 2000);
      }
    }, 100); // 각 글자당 100ms 간격

    return () => clearInterval(timer);
  }, [fullText, onComplete]);

  return (
    <div className={`intro-screen ${isComplete ? "fade-out" : ""}`}>
      <div className="intro-content">
        <div className="intro-text">
          {currentText}
          <span className="cursor">|</span>
        </div>
      </div>
    </div>
  );
};

export default IntroScreen;
