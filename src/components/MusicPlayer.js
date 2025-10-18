import React, { useState, useEffect, useRef } from 'react';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const hasInteracted = useRef(false);

  useEffect(() => {
    const audio = document.getElementById('backgroundMusic');
    
    // 자동 재생 시도
    const tryAutoPlay = () => {
      if (audio) {
        audio.play()
          .then(() => {
            setIsPlaying(true);
            setShowPrompt(false);
            hasInteracted.current = true;
          })
          .catch(e => {
            console.log('자동 재생이 차단되었습니다. 사용자 클릭을 기다립니다.');
            setIsPlaying(false);
            setShowPrompt(true);
          });
      }
    };

    // 페이지 로드 시 자동 재생 시도
    tryAutoPlay();

    // 사용자의 첫 번째 클릭/터치 시 재생
    const handleFirstInteraction = () => {
      if (!hasInteracted.current && audio) {
        audio.play()
          .then(() => {
            setIsPlaying(true);
            setShowPrompt(false);
            hasInteracted.current = true;
          })
          .catch(e => console.log('재생 실패:', e));
      }
    };

    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  const toggleMusic = () => {
    const audio = document.getElementById('backgroundMusic');
    if (audio) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play()
          .then(() => {
            setIsPlaying(true);
            setShowPrompt(false);
          })
          .catch(e => {
            console.log('재생 실패:', e);
          });
      }
    }
  };

  return (
    <>
      <audio id="backgroundMusic" loop>
        <source src="/assets/audio/flower.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {showPrompt && (
        <div className="music-prompt">
          <p>🎵 배경음악이 준비되어 있습니다. 화면을 클릭하면 재생됩니다.</p>
        </div>
      )}

      <div className="music-control">
        <button className="music-btn" onClick={toggleMusic} title={isPlaying ? '음악 끄기' : '음악 켜기'}>
          <i className={`fas ${isPlaying ? 'fa-volume-up' : 'fa-volume-mute'}`}></i>
        </button>
      </div>
    </>
  );
};

export default MusicPlayer;