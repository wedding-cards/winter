import React, { useState, useEffect, useMemo, useCallback } from "react";
import { preloadImages, getPreloadPriorities } from "../utils/galleryImages";

const IntroScreen = ({ onComplete }) => {
  const [currentText, setCurrentText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [isPreloading, setIsPreloading] = useState(true);
  const [preloadedIndices, setPreloadedIndices] = useState(new Set());
  const [showTyping, setShowTyping] = useState(false); // 타이핑 애니메이션 표시 여부

  const fullText = useMemo(() => "민석 ♥ 수진 결혼식에 초대합니다", []);

  const handleComplete = useCallback(() => {
    setIsComplete(true);
    setTimeout(() => {
      onComplete(preloadedIndices);
    }, 1000);
  }, [onComplete, preloadedIndices]);

  // 이미지 프리로딩 시작
  useEffect(() => {
    const startPreloading = async () => {
      const priorities = getPreloadPriorities();

      try {
        // 높은 우선순위 이미지들 먼저 로드
        console.log("🖼️ Starting high priority image preload...");
        await preloadImages(priorities.high, (loaded, total, index) => {
          const progress = Math.round((loaded / total) * 50); // 50%까지
          setPreloadProgress(progress);
          // 로드된 이미지 인덱스 저장
          setPreloadedIndices((prev) => new Set([...prev, index]));
        });

        // 낮은 우선순위 이미지들 백그라운드에서 로드
        console.log("🖼️ Starting low priority image preload...");
        await preloadImages(priorities.low, (loaded, total, index) => {
          const progress = 50 + Math.round((loaded / total) * 50); // 50%~100%
          setPreloadProgress(progress);
          // 로드된 이미지 인덱스 저장 (높은 우선순위 이미지 개수만큼 오프셋 추가)
          const actualIndex = index + priorities.high.length;
          setPreloadedIndices((prev) => new Set([...prev, actualIndex]));
        });

        console.log("🎉 All gallery images preloaded!");
        setIsPreloading(false);

        // 프리로딩 완료 후 1초 대기하고 타이핑 애니메이션 시작
        setTimeout(() => {
          setShowTyping(true);
        }, 1000);
      } catch (error) {
        console.error("Image preloading failed:", error);
        setIsPreloading(false);
        // 에러 시에도 타이핑 애니메이션 시작
        setTimeout(() => {
          setShowTyping(true);
        }, 1000);
      }
    };

    startPreloading();
  }, []);

  // 타이핑 애니메이션 - 프리로딩 완료 후에만 시작
  useEffect(() => {
    if (!showTyping) return;

    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setCurrentText((prev) => fullText.substring(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        // 타이핑 완료 후 2초 대기하고 메인 페이지로 이동
        setTimeout(() => {
          handleComplete();
        }, 2000);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [fullText, handleComplete, showTyping]);

  return (
    <div className={`intro-screen ${isComplete ? "fade-out" : ""}`}>
      <div className="intro-content">
        {/* 프리로딩 단계 */}
        {isPreloading && (
          <div className="preload-stage">
            <div className="preload-progress">
              <div className="preload-bar">
                <div
                  className="preload-fill"
                  style={{ width: `${preloadProgress}%` }}
                ></div>
              </div>
              <div className="preload-text">
                결혼식 준비중... {preloadProgress}%
              </div>
            </div>
          </div>
        )}

        {/* 타이핑 애니메이션 단계 */}
        {showTyping && (
          <div className="intro-text">
            {currentText}
            <span className="cursor">|</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(IntroScreen);
