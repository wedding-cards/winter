import React, { useState, useEffect, useCallback, useMemo } from "react";
import useScrollAnimation from "../hooks/useScrollAnimation";

// 웨딩 사진들 - 컴포넌트 외부로 이동하여 매 렌더링마다 재생성 방지
const GALLERY_IMAGES = [
  "/assets/images/gallery/1.jpg",
  "/assets/images/gallery/2.jpg",
  "/assets/images/gallery/3.jpg",
  "/assets/images/gallery/4.jpg",
  "/assets/images/gallery/5.jpg",
  "/assets/images/gallery/6.jpg",
  "/assets/images/gallery/7.jpg",
  "/assets/images/gallery/8.jpg",
  "/assets/images/gallery/9.jpg",
  "/assets/images/gallery/10.jpg",
  "/assets/images/gallery/11.jpg",
  "/assets/images/gallery/12.jpg",
  "/assets/images/gallery/13.jpg",
  "/assets/images/gallery/14.jpg",
  "/assets/images/gallery/15.jpg",
  "/assets/images/gallery/16.jpg",
  "/assets/images/gallery/17.jpg",
  "/assets/images/gallery/18.jpg",
  "/assets/images/gallery/19.jpg",
];

const INITIAL_DISPLAY_COUNT = 6;
const MIN_SWIPE_DISTANCE = 50;

// WebP 지원 여부 확인
const supportsWebP = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
};

// 이미지 소스 최적화 함수
const getOptimizedImageSrc = (src, size = "thumbnail") => {
  const isWebPSupported = supportsWebP();
  const extension = isWebPSupported ? ".webp" : ".jpg";

  if (size === "thumbnail") {
    return src.replace(".jpg", `_thumb${extension}`);
  }

  return isWebPSupported ? src.replace(".jpg", ".webp") : src;
};

// 이미지 프리로딩 함수
const preloadImages = (imageSources, onProgress) => {
  const promises = imageSources.map((src, index) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        onProgress && onProgress(index + 1, imageSources.length);
        resolve(src);
      };
      img.onerror = () => {
        // WebP 실패시 JPG로 재시도
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          onProgress && onProgress(index + 1, imageSources.length);
          resolve(src);
        };
        fallbackImg.onerror = () => resolve(src);
        fallbackImg.src = src.replace(".webp", ".jpg");
      };
      img.src = getOptimizedImageSrc(src);
    });
  });

  return Promise.all(promises);
};

// 최적화된 이미지 컴포넌트
const OptimizedImage = ({ src, alt, onClick, className, loading = "lazy" }) => {
  const [imageSrc, setImageSrc] = useState(
    getOptimizedImageSrc(src, "thumbnail")
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      // WebP 실패시 원본 JPG로 폴백
      setImageSrc(src);
    }
  };

  return (
    <div className={`image-container ${className} ${isLoaded ? "loaded" : ""}`}>
      <img
        src={imageSrc}
        alt={alt}
        onClick={onClick}
        onLoad={handleLoad}
        onError={handleError}
        loading={loading}
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
        }}
      />
      {!isLoaded && (
        <div className="image-placeholder">
          <div className="placeholder-shimmer"></div>
        </div>
      )}
    </div>
  );
};

const GallerySection = () => {
  const [galleryRef, galleryVisible] = useScrollAnimation({ threshold: 0.1 });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isPreloading, setIsPreloading] = useState(false);

  // 표시할 이미지 메모이제이션
  const displayedImages = useMemo(
    () =>
      showMore
        ? GALLERY_IMAGES
        : GALLERY_IMAGES.slice(0, INITIAL_DISPLAY_COUNT),
    [showMore]
  );

  // "더 보기" 클릭시 추가 이미지 프리로딩
  const handleShowMore = useCallback(async () => {
    if (!showMore) {
      setIsPreloading(true);
      const additionalImages = GALLERY_IMAGES.slice(INITIAL_DISPLAY_COUNT);

      try {
        await preloadImages(additionalImages, (loaded, total) => {
          setLoadingProgress((loaded / total) * 100);
        });
      } catch (error) {
        // 일부 이미지 프리로딩 실패 - continue silently
      }

      setIsPreloading(false);
      setShowMore(true);
    } else {
      setShowMore(false);
    }
  }, [showMore]);

  const openModal = useCallback((index) => {
    setCurrentImageIndex(index);
    setModalOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    document.body.style.overflow = "unset";
  }, []);

  const changeImage = useCallback((direction) => {
    setCurrentImageIndex((prevIndex) => {
      let newIndex = prevIndex + direction;
      if (newIndex >= GALLERY_IMAGES.length) {
        newIndex = 0;
      } else if (newIndex < 0) {
        newIndex = GALLERY_IMAGES.length - 1;
      }
      return newIndex;
    });
  }, []);

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!modalOpen) return;

      switch (e.key) {
        case "Escape":
          closeModal();
          break;
        case "ArrowLeft":
          changeImage(-1);
          break;
        case "ArrowRight":
          changeImage(1);
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen, closeModal, changeImage]);

  // 터치 이벤트 처리
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > MIN_SWIPE_DISTANCE;
    const isRightSwipe = distance < -MIN_SWIPE_DISTANCE;

    if (isLeftSwipe) {
      changeImage(1);
    } else if (isRightSwipe) {
      changeImage(-1);
    }
  }, [touchStart, touchEnd, changeImage]);

  return (
    <section className="gallery-section" ref={galleryRef}>
      <div className={`gallery-container ${galleryVisible ? "animate" : ""}`}>
        <h2 className="gallery-title">우리의 소중한 순간들</h2>
        <p className="gallery-subtitle">함께 걸어온 아름다운 시간들</p>

        <div className="gallery-grid">
          {displayedImages.map((image, index) => (
            <OptimizedImage
              key={index}
              src={image}
              alt={`웨딩 사진 ${index + 1}`}
              onClick={() => openModal(index)}
              className="gallery-item"
            />
          ))}
        </div>

        {/* 더 보기/접기 버튼 */}
        <div className="gallery-actions">
          <button
            className={`show-more-btn ${isPreloading ? "loading" : ""}`}
            onClick={handleShowMore}
            disabled={isPreloading}
          >
            {isPreloading ? (
              <>
                <span className="loading-spinner"></span>
                로딩 중... ({Math.round(loadingProgress)}%)
              </>
            ) : showMore ? (
              "사진 접기"
            ) : (
              `더 많은 사진 보기 (+${
                GALLERY_IMAGES.length - INITIAL_DISPLAY_COUNT
              })`
            )}
          </button>
        </div>
      </div>

      {/* 이미지 모달 */}
      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={closeModal}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ×
            </button>

            <div className="modal-image-container">
              <OptimizedImage
                src={GALLERY_IMAGES[currentImageIndex]}
                alt={`웨딩 사진 ${currentImageIndex + 1}`}
                className="modal-image"
                loading="eager"
              />
            </div>

            <button
              className="modal-nav modal-prev"
              onClick={(e) => {
                e.stopPropagation();
                changeImage(-1);
              }}
            >
              ‹
            </button>
            <button
              className="modal-nav modal-next"
              onClick={(e) => {
                e.stopPropagation();
                changeImage(1);
              }}
            >
              ›
            </button>

            <div className="modal-counter">
              {currentImageIndex + 1} / {GALLERY_IMAGES.length}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .gallery-section {
          padding: 80px 0;
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
        }

        .gallery-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease-out;
        }

        .gallery-container.animate {
          opacity: 1;
          transform: translateY(0);
        }

        .gallery-title {
          font-size: 2.5rem;
          color: #2c3e50;
          text-align: center;
          margin-bottom: 10px;
          font-family: "Nanum Myeongjo", serif;
          font-weight: 700;
        }

        .gallery-subtitle {
          font-size: 1.1rem;
          color: #7f8c8d;
          text-align: center;
          margin-bottom: 50px;
          font-weight: 400;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .image-container {
          position: relative;
          aspect-ratio: 1;
          border-radius: 15px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #f0f0f0;
        }

        .image-container:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
        }

        .image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: all 0.3s ease;
        }

        .image-container:hover img {
          transform: scale(1.05);
        }

        .image-placeholder {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
          );
          background-size: 200% 100%;
        }

        .placeholder-shimmer {
          width: 100%;
          height: 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .gallery-actions {
          text-align: center;
        }

        .show-more-btn {
          background: linear-gradient(135deg, #d4a5a5 0%, #c89da1 100%);
          color: white;
          border: none;
          padding: 15px 40px;
          border-radius: 30px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          min-width: 200px;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(212, 165, 165, 0.3);
        }

        .show-more-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #c89da1 0%, #b8919a 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(212, 165, 165, 0.4);
        }

        .show-more-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* 모달 스타일 */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-content {
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-image-container {
          position: relative;
          max-width: 100%;
          max-height: 100%;
        }

        .modal-image {
          max-width: 100%;
          max-height: 90vh;
          object-fit: contain;
          border-radius: 10px;
        }

        .modal-close {
          position: absolute;
          top: -50px;
          right: 0;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-size: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s ease;
        }

        .modal-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .modal-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          font-size: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .modal-nav:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-50%) scale(1.1);
        }

        .modal-prev {
          left: -70px;
        }

        .modal-next {
          right: -70px;
        }

        .modal-counter {
          position: absolute;
          bottom: -50px;
          left: 50%;
          transform: translateX(-50%);
          color: white;
          font-size: 14px;
          background: rgba(0, 0, 0, 0.5);
          padding: 8px 16px;
          border-radius: 20px;
        }

        /* 반응형 디자인 */
        @media (max-width: 768px) {
          .gallery-title {
            font-size: 2rem;
          }

          .gallery-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }

          .modal-nav {
            width: 40px;
            height: 40px;
            font-size: 20px;
          }

          .modal-prev {
            left: -50px;
          }

          .modal-next {
            right: -50px;
          }

          .modal-close {
            top: -40px;
            width: 35px;
            height: 35px;
            font-size: 20px;
          }
        }

        @media (max-width: 480px) {
          .gallery-grid {
            grid-template-columns: 1fr;
          }

          .modal-nav {
            position: absolute;
            bottom: 20px;
          }

          .modal-prev {
            left: 20px;
            bottom: 20px;
            top: auto;
            transform: none;
          }

          .modal-next {
            right: 20px;
            bottom: 20px;
            top: auto;
            transform: none;
          }

          .modal-counter {
            bottom: 80px;
          }
        }
      `}</style>
    </section>
  );
};

export default GallerySection;
