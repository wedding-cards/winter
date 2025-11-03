import React, { useState, useEffect, useCallback, useMemo } from "react";
import useScrollAnimation from "../hooks/useScrollAnimation";
import { GALLERY_IMAGES } from "../utils/galleryImages";

const MIN_SWIPE_DISTANCE = 50;

// WebP 지원 여부 체크 (한 번만 실행)
let webpSupported = null;
const checkWebPSupport = () => {
  if (webpSupported !== null) return webpSupported;

  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const dataURL = canvas.toDataURL("image/webp");
    webpSupported = dataURL.indexOf("data:image/webp") === 0;
  } catch (err) {
    webpSupported = false;
  }

  return webpSupported;
};

const GallerySection = ({
  preloadedImages: preloadedFromIntro = new Set(),
}) => {
  const [galleryRef, galleryVisible] = useScrollAnimation({ threshold: 0.1 });

  // WebP 지원 여부를 컴포넌트 마운트 시 한 번만 체크
  const [isWebPSupported] = useState(() => checkWebPSupport());

  // 최적화된 이미지 소스 반환 함수
  const getOptimizedImageSrc = useCallback(
    (src) => {
      return isWebPSupported ? src.replace(".jpg", ".webp") : src;
    },
    [isWebPSupported]
  );

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [preloadedImages, setPreloadedImages] = useState(new Set());
  const [isReady, setIsReady] = useState(false); // 하이드레이션 완료 상태
  const [loadedImages, setLoadedImages] = useState(preloadedFromIntro); // IntroScreen에서 프리로딩된 이미지들로 초기화
  const [isModalOpening, setIsModalOpening] = useState(false); // 모달 열리는 중 상태
  const [isLoadingMore, setIsLoadingMore] = useState(false); // 더보기 로딩 상태
  const [isExpandingGallery, setIsExpandingGallery] = useState(false); // 갤러리 확장 중 상태

  // 하이드레이션 완료 후 상태 설정
  useEffect(() => {
    // 하이드레이션 상태 설정 최적화
    const readyTimer = setTimeout(() => {
      setIsReady(true);
    }, 100); // 딜레이 단축

    // IntroScreen에서 프리로딩된 이미지들을 loadedImages에 병합
    if (preloadedFromIntro?.size > 0) {
      setLoadedImages((prev) => new Set([...prev, ...preloadedFromIntro]));
    }

    // 메모리 정리 함수 등록
    const cleanup = () => {
      // 사용하지 않는 이미지 객체들 정리
      if (window.gc && typeof window.gc === "function") {
        window.gc();
      }
    };

    // 새로고침 방지 이벤트 핸들러
    const preventRefresh = (e) => {
      // 모바일에서 당겨서 새로고침 방지
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }

      // 페이지 상단에서 스크롤 당기기 방지
      if (window.scrollY === 0 && e.touches && e.touches.length === 1) {
        const touch = e.touches[0];
        const startY = touch.clientY;

        const handleTouchMove = (moveEvent) => {
          const currentY = moveEvent.touches[0].clientY;
          if (currentY > startY && window.scrollY === 0) {
            moveEvent.preventDefault();
          }
        };

        const handleTouchEnd = () => {
          document.removeEventListener("touchmove", handleTouchMove, {
            passive: false,
          });
          document.removeEventListener("touchend", handleTouchEnd);
        };

        document.addEventListener("touchmove", handleTouchMove, {
          passive: false,
        });
        document.addEventListener("touchend", handleTouchEnd);
      }
    };

    // 메모리 누수 방지
    const preventMemoryLeak = () => {
      // 타이머 정리
      const timers = window.setTimeout(() => {}, 0);
      for (let i = 0; i < timers; i++) {
        window.clearTimeout(i);
      }
    };

    // 이벤트 리스너 등록
    document.addEventListener("touchstart", preventRefresh, { passive: false });
    window.addEventListener("beforeunload", cleanup);
    window.addEventListener("pagehide", cleanup);
    window.addEventListener("unload", preventMemoryLeak);

    return () => {
      clearTimeout(readyTimer);
      document.removeEventListener("touchstart", preventRefresh);
      window.removeEventListener("beforeunload", cleanup);
      window.removeEventListener("pagehide", cleanup);
      window.removeEventListener("unload", preventMemoryLeak);
    };
  }, [preloadedFromIntro]);

  // 이미지 로드 완료 핸들러
  const handleImageLoad = useCallback((index) => {
    setLoadedImages((prev) => new Set([...prev, index]));
  }, []);

  // 배치 이미지 로딩 함수 (페이지네이션용)
  const preloadBatchImages = useCallback(
    async (imageSources, startIndex) => {
      const BATCH_SIZE = 3;

      for (let i = 0; i < imageSources.length; i += BATCH_SIZE) {
        const batch = imageSources.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map((src, idx) => {
          const actualIndex = startIndex + i + idx;

          return new Promise((resolve) => {
            const img = new Image();
            const optimizedSrc = getOptimizedImageSrc(src);

            const handleSuccess = () => {
              handleImageLoad(actualIndex);
              resolve(actualIndex);
            };

            const handleError = () => {
              // WebP 실패 시 JPG로 폴백 (WebP 지원 브라우저에서만)
              if (optimizedSrc.includes(".webp")) {
                const fallbackImg = new Image();
                fallbackImg.onload = handleSuccess;
                fallbackImg.onerror = () => resolve(actualIndex);
                fallbackImg.src = src; // 원본 JPG
              } else {
                resolve(actualIndex); // JPG도 실패하면 그냥 진행
              }
            };

            img.onload = handleSuccess;
            img.onerror = handleError;
            img.src = optimizedSrc;
          });
        });

        try {
          await Promise.race([
            Promise.all(batchPromises),
            new Promise((resolve) => setTimeout(resolve, 1500)), // 배치당 1.5초 제한 (더 짧게)
          ]);

          // 배치 간 짧은 대기 (메모리 정리 시간)
          await new Promise((resolve) => setTimeout(resolve, 50));
        } catch (error) {
          console.warn("Batch loading failed:", error);
          break; // 에러 시 중단
        }
      }
    },
    [handleImageLoad, getOptimizedImageSrc]
  );

  // 페이지네이션 설정
  const IMAGES_PER_PAGE = 6;
  const totalPages = Math.ceil(GALLERY_IMAGES.length / IMAGES_PER_PAGE);

  // 표시할 이미지 메모이제이션 - 페이지네이션 방식
  const displayedImages = useMemo(() => {
    const startIndex = 0;
    const endIndex = currentPage * IMAGES_PER_PAGE;
    return GALLERY_IMAGES.slice(startIndex, endIndex);
  }, [currentPage]);

  // 다음 페이지 이미지들을 미리 로드하는 함수
  const preloadImage = useCallback(
    (src) => {
      if (preloadedImages.has(src)) return;

      const img = new Image();
      const optimizedSrc = getOptimizedImageSrc(src);

      img.onload = () => {
        setPreloadedImages((prev) => new Set([...prev, src]));
      };

      img.onerror = () => {
        // WebP 실패 시 JPG로 폴백
        if (optimizedSrc.includes(".webp")) {
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            setPreloadedImages((prev) => new Set([...prev, src]));
          };
          fallbackImg.onerror = () => {
            // JPG도 실패하면 그냥 추가 (에러 상태로)
            setPreloadedImages((prev) => new Set([...prev, src]));
          };
          fallbackImg.src = src;
        } else {
          setPreloadedImages((prev) => new Set([...prev, src]));
        }
      };

      img.src = optimizedSrc;
    },
    [preloadedImages, getOptimizedImageSrc]
  );

  // 현재 이미지와 인접 이미지 미리 로드
  useEffect(() => {
    if (!modalOpen) return;

    const indicesToPreload = [
      currentImageIndex,
      (currentImageIndex + 1) % GALLERY_IMAGES.length, // 다음
      (currentImageIndex - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length, // 이전
    ];

    indicesToPreload.forEach((index) => {
      preloadImage(GALLERY_IMAGES[index]);
    });
  }, [modalOpen, currentImageIndex, preloadImage]);

  const openModal = useCallback(
    (index) => {
      // 하이드레이션 전이나 이미 모달이 열려있으면 무시
      if (!isReady || modalOpen || isModalOpening) {
        return false;
      }

      // 이미지가 아직 로드되지 않은 경우 처리
      if (!loadedImages.has(index)) {
        return false;
      }

      // 메모리 부족 방지를 위한 간단한 체크
      if (
        performance.memory &&
        performance.memory.usedJSHeapSize > 50 * 1024 * 1024
      ) {
        console.warn("Memory usage high, skipping modal open");
        return false;
      }

      setIsModalOpening(true);
      setCurrentImageIndex(index);
      setModalOpen(true);
      document.body.style.overflow = "hidden";

      // 모달 열림 상태 즉시 해제 (불필요한 딜레이 제거)
      setIsModalOpening(false);
    },
    [isReady, loadedImages, isModalOpening, modalOpen]
  );

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

  // 키보드 네비게이션
  useEffect(() => {
    if (!modalOpen) return;

    const handleKeyPress = (e) => {
      if (e.key === "ArrowLeft") {
        changeImage(-1);
      } else if (e.key === "ArrowRight") {
        changeImage(1);
      } else if (e.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [modalOpen, changeImage, closeModal]);

  // 터치 스와이프 (모바일) - 메모리 최적화
  const onTouchStart = useCallback((e) => {
    // 페이지 새로고침 방지
    if (e.touches.length > 1) {
      e.preventDefault();
      return;
    }

    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const onTouchMove = useCallback(
    (e) => {
      // 과도한 이벤트 방지
      if (!touchStart) return;

      const currentTouch = e.targetTouches[0].clientX;
      setTouchEnd(currentTouch);

      // 수직 스크롤 방지 (모달에서만)
      if (modalOpen) {
        e.preventDefault();
      }
    },
    [touchStart, modalOpen]
  );

  const onTouchEnd = useCallback(
    (e) => {
      if (!touchStart || !touchEnd) return;

      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > MIN_SWIPE_DISTANCE;
      const isRightSwipe = distance < -MIN_SWIPE_DISTANCE;

      if (isLeftSwipe || isRightSwipe) {
        e.preventDefault();
        e.stopPropagation();

        // 디바운싱으로 중복 실행 방지
        requestAnimationFrame(() => {
          if (isLeftSwipe) {
            changeImage(1);
          } else if (isRightSwipe) {
            changeImage(-1);
          }
        });
      }

      // 터치 상태 초기화
      setTouchStart(null);
      setTouchEnd(null);
    },
    [touchStart, touchEnd, changeImage]
  );

  // 썸네일 자동 스크롤 - 현재 이미지로 이동
  useEffect(() => {
    if (!modalOpen) return;

    // 약간의 딜레이를 주어 DOM이 완전히 렌더링된 후 실행
    const timer = setTimeout(() => {
      const thumbnailContainer = document.querySelector(".thumbnail-container");
      const activeThumbnail = document.querySelector(".thumbnail-item.active");

      if (thumbnailContainer && activeThumbnail) {
        activeThumbnail.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [currentImageIndex, modalOpen]);

  return (
    <section
      className={`gallery-section ${isExpandingGallery ? "expanding" : ""}`}
      data-ready={isReady ? "true" : "false"}
    >
      <div className="container">
        <div className="gallery-header">
          <p className="section-subtitle">GALLERY</p>
          <h2 className="section-title">사진첩</h2>
        </div>

        <div
          ref={galleryRef}
          className={`gallery-grid animate-on-scroll ${
            galleryVisible ? "visible" : ""
          }`}
        >
          {displayedImages.map((src, index) => {
            const optimizedSrc = getOptimizedImageSrc(src);
            return (
              <div
                key={index}
                className={`gallery-item ${
                  !isReady || !loadedImages.has(index) || isExpandingGallery
                    ? "not-ready"
                    : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openModal(index);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openModal(index);
                  }
                }}
                style={{ touchAction: "manipulation" }} // 더블탭 줌 방지
              >
                <img
                  src={optimizedSrc}
                  alt={`민석과 수진의 웨딩 사진 ${
                    index + 1
                  } - 결혼식 스냅 사진`}
                  loading={index < IMAGES_PER_PAGE ? "eager" : "lazy"}
                  decoding="async"
                  onLoad={() => handleImageLoad(index)}
                  onError={(e) => {
                    // WebP 실패 시 JPG로 폴백 (한 번만)
                    if (
                      e.target.src.includes(".webp") &&
                      !e.target.dataset.fallbackTried
                    ) {
                      e.target.dataset.fallbackTried = "true";
                      e.target.src = src;
                    }
                  }}
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    objectFit: "cover",
                  }}
                />
                <div className="gallery-overlay">
                  <i className="fas fa-search-plus"></i>
                </div>
              </div>
            );
          })}
        </div>

        {/* 페이지네이션 버튼 */}
        {currentPage < totalPages && (
          <div className="gallery-pagination-wrapper">
            <button
              type="button"
              className="gallery-load-more-btn"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (isLoadingMore || isExpandingGallery) return;

                setIsLoadingMore(true);
                setIsExpandingGallery(true);

                try {
                  // 다음 페이지 이미지들을 미리 로드
                  const nextPageStart = currentPage * IMAGES_PER_PAGE;
                  const nextPageEnd = Math.min(
                    nextPageStart + IMAGES_PER_PAGE,
                    GALLERY_IMAGES.length
                  );
                  const nextPageImages = GALLERY_IMAGES.slice(
                    nextPageStart,
                    nextPageEnd
                  );

                  // 메모리 체크
                  if (
                    performance.memory &&
                    performance.memory.usedJSHeapSize > 40 * 1024 * 1024
                  ) {
                    console.warn("Memory usage high, loading images gradually");
                    setCurrentPage((prev) => prev + 1);
                  } else {
                    // 배치 로딩
                    await preloadBatchImages(nextPageImages, nextPageStart);
                    setCurrentPage((prev) => prev + 1);
                  }
                } catch (error) {
                  console.error("Error loading next page:", error);
                  // 에러 발생 시에도 페이지 증가
                  setCurrentPage((prev) => prev + 1);
                } finally {
                  setIsLoadingMore(false);
                  setIsExpandingGallery(false);
                }
              }}
              disabled={isLoadingMore || isExpandingGallery}
              style={{ touchAction: "manipulation" }}
            >
              {isLoadingMore || isExpandingGallery ? (
                <>
                  로딩중... <i className="fas fa-spinner fa-spin"></i>
                </>
              ) : (
                <>
                  더보기 (
                  {Math.min(
                    IMAGES_PER_PAGE,
                    GALLERY_IMAGES.length - currentPage * IMAGES_PER_PAGE
                  )}
                  장)
                  <i className="fas fa-chevron-down"></i>
                </>
              )}
            </button>
            <div className="gallery-progress">
              {displayedImages.length} / {GALLERY_IMAGES.length}
            </div>
          </div>
        )}

        {/* 갤러리 모달 */}
        {modalOpen && (
          <div className="gallery-modal" onClick={closeModal}>
            <span
              className="close-modal"
              onClick={(e) => {
                e.preventDefault();
                closeModal();
              }}
            >
              <i className="fas fa-times"></i>
            </span>

            <div
              className="modal-content-wrapper"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <img
                className="modal-main-image"
                src={getOptimizedImageSrc(GALLERY_IMAGES[currentImageIndex])}
                alt="확대된 웨딩 사진"
                loading="eager"
                fetchPriority="high"
                onError={(e) => {
                  // 모달 이미지 폴백 처리
                  if (
                    e.target.src.includes(".webp") &&
                    !e.target.dataset.fallbackTried
                  ) {
                    e.target.dataset.fallbackTried = "true";
                    e.target.src = GALLERY_IMAGES[currentImageIndex];
                  }
                }}
              />
            </div>

            {/* 좌우 네비게이션 버튼 */}
            <button
              className="modal-nav-btn prev-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                changeImage(-1);
              }}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button
              className="modal-nav-btn next-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                changeImage(1);
              }}
            >
              <i className="fas fa-chevron-right"></i>
            </button>

            {/* 하단 이미지 카운터 */}
            <div className="image-counter-only">
              {currentImageIndex + 1} / {GALLERY_IMAGES.length}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GallerySection;
