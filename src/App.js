import React, { useState, useEffect, lazy, Suspense } from "react";
import "./style.css";

// 중요 컴포넌트 - 즉시 로드
import IntroScreen from "./components/IntroScreen";
import MusicPlayer from "./components/MusicPlayer";
import HeroSection from "./components/HeroSection";

// 지연 로딩 - 스크롤 시 필요한 컴포넌트
const InvitationSection = lazy(() => import("./components/InvitationSection"));
const DateSection = lazy(() => import("./components/DateSection"));
const GallerySection = lazy(() => import("./components/GallerySection"));
const LocationSection = lazy(() => import("./components/LocationSection"));
const GuestbookSection = lazy(() => import("./components/GuestbookSection"));
const AccountSection = lazy(() => import("./components/AccountSection"));
const LoveQuoteSection = lazy(() => import("./components/LoveQuoteSection"));
const ShareSection = lazy(() => import("./components/ShareSection"));
const Footer = lazy(() => import("./components/Footer"));

// 로딩 fallback 컴포넌트
const SectionLoader = () => (
  <div
    style={{
      minHeight: "100px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        width: "40px",
        height: "40px",
        border: "3px solid #f3f3f3",
        borderTop: "3px solid #D4A5A5",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }}
    ></div>
  </div>
);

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!showIntro) {
      setIsLoaded(true);
    }
  }, [showIntro]);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  if (showIntro) {
    return <IntroScreen onComplete={handleIntroComplete} />;
  }

  return (
    <div className={`App ${isLoaded ? "fade-in" : ""}`}>
      {/* 눈 내리는 효과 레이어 */}
      <div className="snow-container">
        <div className="snow-layer snow-layer-1"></div>
        <div className="snow-layer snow-layer-2"></div>
        <div className="snow-layer snow-layer-3"></div>
      </div>

      <MusicPlayer />
      <HeroSection />

      <Suspense fallback={<SectionLoader />}>
        <InvitationSection />
        <DateSection />
        <GallerySection />
        <LocationSection />
        <GuestbookSection />
        <AccountSection />
        <LoveQuoteSection />
        <ShareSection />
        <Footer />
      </Suspense>
    </div>
  );
}

export default App;
