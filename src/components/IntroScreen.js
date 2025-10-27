import React, { useState, useEffect, useMemo, useCallback } from "react";

const IntroScreen = ({ onComplete }) => {
  const [currentText, setCurrentText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const fullText = useMemo(() => "민석 ♥ 수진 결혼식에 초대합니다", []);

  const handleComplete = useCallback(() => {
    setIsComplete(true);
    setTimeout(() => {
      onComplete();
    }, 1000);
  }, [onComplete]);

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setCurrentText((prev) => fullText.substring(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setTimeout(handleComplete, 2000);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [fullText, handleComplete]);

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

export default React.memo(IntroScreen);
