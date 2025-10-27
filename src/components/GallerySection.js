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

const GallerySection = () => {
  const [galleryRef, galleryVisible] = useScrollAnimation({ threshold: 0.1 });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [preloadedImages, setPreloadedImages] = useState(new Set());

  // 표시할 이미지 메모이제이션
  const displayedImages = useMemo(
    () =>
      showMore
        ? GALLERY_IMAGES
        : GALLERY_IMAGES.slice(0, INITIAL_DISPLAY_COUNT),
    [showMore]
  );

  // 이미지 미리 로드 함수
  const preloadImage = useCallback(
    (src) => {
      if (preloadedImages.has(src)) return;

      const img = new Image();
      const webpSrc = src.replace(".jpg", ".webp");

      // WebP 지원 여부에 따라 로드
      img.src = webpSrc;
      img.onerror = () => {
        img.src = src; // WebP 실패시 JPG 로드
      };

      setPreloadedImages((prev) => new Set([...prev, src]));
    },
    [preloadedImages]
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

  const goToImage = useCallback((index) => {
    setCurrentImageIndex(index);
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

  // 터치 스와이프 (모바일)
  const onTouchStart = useCallback((e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const onTouchMove = useCallback((e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const onTouchEnd = useCallback(
    (e) => {
      if (!touchStart || !touchEnd) return;

      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > MIN_SWIPE_DISTANCE;
      const isRightSwipe = distance < -MIN_SWIPE_DISTANCE;

      if (isLeftSwipe || isRightSwipe) {
        e.preventDefault();
        if (isLeftSwipe) {
          changeImage(1);
        } else if (isRightSwipe) {
          changeImage(-1);
        }
      }
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
    <section className="gallery-section">
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
            const webpSrc = src.replace(".jpg", ".webp");
            return (
              <div
                key={index}
                className="gallery-item"
                onClick={() => openModal(index)}
              >
                <picture>
                  <source type="image/webp" srcSet={webpSrc} />
                  <img
                    src={src}
                    alt={`민석과 수진의 웨딩 사진 ${
                      index + 1
                    } - 결혼식 스냅 사진`}
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
                <div className="gallery-overlay">
                  <i className="fas fa-search-plus"></i>
                </div>
              </div>
            );
          })}
        </div>

        {/* 더보기 버튼 */}
        {GALLERY_IMAGES.length > INITIAL_DISPLAY_COUNT && (
          <div className="gallery-more-wrapper">
            <button
              className="gallery-more-btn"
              onClick={(e) => {
                e.preventDefault();
                setShowMore(!showMore);
              }}
            >
              {showMore ? (
                <>
                  접기 <i className="fas fa-chevron-up"></i>
                </>
              ) : (
                <>
                  더보기 <i className="fas fa-chevron-down"></i>
                </>
              )}
            </button>
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
              <picture>
                <source
                  type="image/webp"
                  srcSet={GALLERY_IMAGES[currentImageIndex].replace(
                    ".jpg",
                    ".webp"
                  )}
                />
                <img
                  className="modal-main-image"
                  src={GALLERY_IMAGES[currentImageIndex]}
                  alt="확대된 웨딩 사진"
                  loading="eager"
                  fetchPriority="high"
                />
              </picture>
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

            {/* 하단 썸네일 네비게이션 */}
            <div className="thumbnail-nav" onClick={(e) => e.stopPropagation()}>
              <div className="thumbnail-container">
                {GALLERY_IMAGES.map((src, index) => {
                  // 현재 이미지 기준 앞뒤 5개는 즉시 로드, 나머지는 lazy loading
                  const isNearCurrent =
                    Math.abs(index - currentImageIndex) <= 5 ||
                    // 순환 구조 고려 (처음과 끝)
                    Math.abs(index - currentImageIndex) >=
                      GALLERY_IMAGES.length - 5;

                  return (
                    <div
                      key={index}
                      className={`thumbnail-item ${
                        index === currentImageIndex ? "active" : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        goToImage(index);
                      }}
                      data-index={index}
                    >
                      <picture>
                        <source
                          type="image/webp"
                          srcSet={src.replace(".jpg", ".webp")}
                        />
                        <img
                          src={src}
                          alt={`썸네일 ${index + 1}`}
                          loading={isNearCurrent ? "eager" : "lazy"}
                          decoding="async"
                        />
                      </picture>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GallerySection;
