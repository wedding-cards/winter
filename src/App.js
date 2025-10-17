import React, { useState, useEffect } from 'react';
import './style.css';

// 컴포넌트들
import MusicPlayer from './components/MusicPlayer';
import HeroSection from './components/HeroSection';
import InvitationSection from './components/InvitationSection';
import DateSection from './components/DateSection';
import GallerySection from './components/GallerySection';
import LocationSection from './components/LocationSection';
import GuestbookSection from './components/GuestbookSection';
import AccountSection from './components/AccountSection';
import LoveQuoteSection from './components/LoveQuoteSection';
import Footer from './components/Footer';

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={`App ${isLoaded ? 'fade-in' : ''}`}>
      {/* 눈 내리는 효과 레이어 */}
      <div className="snow-container">
        <div className="snow-layer snow-layer-1"></div>
        <div className="snow-layer snow-layer-2"></div>
        <div className="snow-layer snow-layer-3"></div>
      </div>
      
      <MusicPlayer />
      <HeroSection />
      <InvitationSection />
      <DateSection />
      <GallerySection />
      <LocationSection />
      <GuestbookSection />
      <AccountSection />
      <LoveQuoteSection />
      <Footer />
    </div>
  );
}

export default App;
