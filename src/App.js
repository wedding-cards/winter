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
import Footer from './components/Footer';

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={`App ${isLoaded ? 'fade-in' : ''}`}>
      <MusicPlayer />
      <HeroSection />
      <InvitationSection />
      <DateSection />
      <GallerySection />
      <LocationSection />
      <GuestbookSection />
      <AccountSection />
      <Footer />
    </div>
  );
}

export default App;
