import React, { useState, useEffect, useMemo, useCallback } from "react";
import { preloadImages, getPreloadPriorities } from "../utils/galleryImages";

const IntroScreen = ({ onComplete }) => {
  const [currentText, setCurrentText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [isPreloading, setIsPreloading] = useState(true);
  const [preloadedIndices, setPreloadedIndices] = useState(new Set());

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
        preloadImages(priorities.low, (loaded, total, index) => {
          const progress = 50 + Math.round((loaded / total) * 50); // 50%~100%
          setPreloadProgress(progress);
          // 로드된 이미지 인덱스 저장 (높은 우선순위 이미지 개수만큼 오프셋 추가)
          const actualIndex = index + priorities.high.length;
          setPreloadedIndices((prev) => new Set([...prev, actualIndex]));
        }).then(() => {
          console.log("🎉 All gallery images preloaded!");
          setIsPreloading(false);
        });
      } catch (error) {
        console.error("Image preloading failed:", error);
        setIsPreloading(false);
      }
    };

    startPreloading();
  }, []);

  // 타이핑 애니메이션
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setCurrentText((prev) => fullText.substring(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        // 높은 우선순위 이미지 로딩이 완료되거나 최소 시간이 지나면 완료
        setTimeout(() => {
          if (!isPreloading || preloadProgress >= 50) {
            handleComplete();
          } else {
            // 프리로딩이 끝날 때까지 조금 더 기다림
            const waitTimer = setInterval(() => {
              if (!isPreloading || preloadProgress >= 50) {
                clearInterval(waitTimer);
                handleComplete();
              }
            }, 200);
          }
        }, 1500); // 최소 1.5초는 대기
      }
    }, 100);

    return () => clearInterval(timer);
  }, [fullText, handleComplete, isPreloading, preloadProgress]);

  return (
    <div className={`intro-screen ${isComplete ? "fade-out" : ""}`}>
      <div className="intro-content">
        <div className="intro-text">
          {currentText}
          <span className="cursor">|</span>
        </div>

        {/* 프리로딩 진행률 표시 (선택적) */}
        {isPreloading && preloadProgress > 0 && (
          <div className="preload-progress">
            <div className="preload-bar">
              <div
                className="preload-fill"
                style={{ width: `${preloadProgress}%` }}
              ></div>
            </div>
            <div className="preload-text">
              이미지 준비중... {preloadProgress}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(IntroScreen);
