import { useEffect, useRef, useState, useMemo } from "react";

const useScrollAnimation = (options = {}) => {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // options 객체를 메모이제이션하여 무한 재생성 방지
  const observerOptions = useMemo(
    () => ({
      threshold: options.threshold || 0.1,
      rootMargin: options.rootMargin || "0px",
    }),
    [options.threshold, options.rootMargin]
  );

  useEffect(() => {
    const currentElement = elementRef.current;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        // 한 번 나타나면 observer 해제 (재실행 방지)
        if (currentElement) {
          observer.unobserve(currentElement);
        }
      }
    }, observerOptions);

    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [observerOptions]);

  return [elementRef, isVisible];
};

export default useScrollAnimation;
