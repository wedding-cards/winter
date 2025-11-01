// 갤러리 이미지 목록 - 여러 컴포넌트에서 공유
export const GALLERY_IMAGES = [
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

export const INITIAL_DISPLAY_COUNT = 6;

// 이미지 프리로딩 유틸리티
export const preloadImages = (imagePaths, onProgress) => {
  return new Promise((resolve) => {
    let loadedCount = 0;
    const totalImages = imagePaths.length;
    const loadedImages = new Set();

    if (totalImages === 0) {
      resolve(loadedImages);
      return;
    }

    imagePaths.forEach((src, index) => {
      const img = new Image();
      const webpSrc = src.replace(".jpg", ".webp");

      const handleLoad = () => {
        loadedCount++;
        loadedImages.add(index);

        if (onProgress) {
          onProgress(loadedCount, totalImages, index);
        }

        if (loadedCount === totalImages) {
          resolve(loadedImages);
        }
      };

      const handleError = () => {
        // WebP 실패시 JPG로 재시도
        if (img.src.includes(".webp")) {
          img.src = src;
        } else {
          // JPG도 실패하면 로드된 것으로 간주
          handleLoad();
        }
      };

      img.onload = handleLoad;
      img.onerror = handleError;

      // WebP 먼저 시도
      img.src = webpSrc;
    });
  });
};

// 우선순위별 이미지 프리로딩
export const getPreloadPriorities = () => {
  return {
    // 첫 화면에 보일 이미지들 (우선순위 높음)
    high: GALLERY_IMAGES.slice(0, INITIAL_DISPLAY_COUNT),
    // 나머지 이미지들 (우선순위 낮음)
    low: GALLERY_IMAGES.slice(INITIAL_DISPLAY_COUNT),
  };
};
