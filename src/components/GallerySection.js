import React, { useState, useEffect, useCallback } from "react";
import useScrollAnimation from "../hooks/useScrollAnimation";

const GallerySection = () => {
  const [galleryRef, galleryVisible] = useScrollAnimation({ threshold: 0.1 });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // 웨딩 사진들
  const galleryImages = [
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

  const initialDisplayCount = 6; // 처음에 보여줄 이미지 개수
  const displayedImages = showMore
    ? galleryImages
    : galleryImages.slice(0, initialDisplayCount);

  const openModal = (index) => {
    setCurrentImageIndex(index);
    setModalOpen(true);
    document.body.style.overflow = "hidden"; // 스크롤 방지
  };

  const closeModal = useCallback(() => {
    setModalOpen(false);
    document.body.style.overflow = "unset";
  }, []);

  const changeImage = useCallback(
    (direction) => {
      setCurrentImageIndex((prevIndex) => {
        let newIndex = prevIndex + direction;
        if (newIndex >= galleryImages.length) {
          newIndex = 0;
        } else if (newIndex < 0) {
          newIndex = galleryImages.length - 1;
        }
        return newIndex;
      });
    },
    [galleryImages.length]
  );

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  // 키보드 네비게이션
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!modalOpen) return;

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
  }, [modalOpen, currentImageIndex, changeImage, closeModal]);

  // 터치 스와이프 (모바일)
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = (e) => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      e.preventDefault();
      if (isLeftSwipe) {
        changeImage(1);
      } else if (isRightSwipe) {
        changeImage(-1);
      }
    }
  };

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
        {galleryImages.length > initialDisplayCount && (
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
                  srcSet={galleryImages[currentImageIndex].replace(
                    ".jpg",
                    ".webp"
                  )}
                />
                <img
                  className="modal-main-image"
                  src={galleryImages[currentImageIndex]}
                  alt="확대된 웨딩 사진"
                />
              </picture>
            </div>

            {/* 페이지네이션 도트 */}
            <div className="pagination-dots">
              {galleryImages.map((_, index) => (
                <span
                  key={index}
                  className={`dot ${
                    index === currentImageIndex ? "active" : ""
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    goToImage(index);
                  }}
                ></span>
              ))}
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
                {galleryImages.map((src, index) => (
                  <div
                    key={index}
                    className={`thumbnail-item ${
                      index === currentImageIndex ? "active" : ""
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      goToImage(index);
                    }}
                  >
                    <picture>
                      <source
                        type="image/webp"
                        srcSet={src.replace(".jpg", ".webp")}
                      />
                      <img src={src} alt={`썸네일 ${index + 1}`} />
                    </picture>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GallerySection;
