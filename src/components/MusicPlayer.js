import React, { useState } from 'react';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleMusic = () => {
    const audio = document.getElementById('backgroundMusic');
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(e => {
          console.log('자동 재생이 차단되었습니다. 사용자 상호작용이 필요합니다.');
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <>
      <audio id="backgroundMusic" loop>
        <source src="/assets/audio/maktub-start.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      <div className="music-control">
        <button className="music-btn" onClick={toggleMusic}>
          <i className={`fas ${isPlaying ? 'fa-volume-up' : 'fa-volume-mute'}`}></i>
        </button>
      </div>
    </>
  );
};

export default MusicPlayer;