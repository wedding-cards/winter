import React from "react";
import useScrollAnimation from "../hooks/useScrollAnimation";

const ShareSection = () => {
  const [sectionRef, sectionVisible] = useScrollAnimation({ threshold: 0.2 });

  const shareUrl = window.location.href;
  const shareTitle = "민석 ❤️ 수진 결혼식 초대장";
  const shareDescription =
    "따뜻한 겨울날, 두 사람이 하나 되는 소중한 순간에 여러분을 초대합니다 💒";

  // 카카오톡 공유하기
  const shareKakao = () => {
    if (window.Kakao && window.Kakao.isInitialized()) {
      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: shareTitle,
          description: shareDescription,
          imageUrl: `${window.location.origin}/kakao.jpg`,
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
        buttons: [
          {
            title: "초대장 보기",
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
        ],
      });
    } else {
      alert(
        "카카오톡 공유 기능을 사용할 수 없습니다.\nKakao SDK를 확인해주세요."
      );
    }
  };

  return (
    <section className="share-section">
      <div className="container">
        <div
          ref={sectionRef}
          className={`share-content animate-on-scroll ${
            sectionVisible ? "visible" : ""
          }`}
        >
          <h2 className="share-title">초대장 공유하기</h2>
          <p className="share-description">
            소중한 분들에게 저희 결혼 소식을 전해주세요
          </p>

          <button
            className="share-copy-btn kakao-share"
            onClick={shareKakao}
            aria-label="카카오톡으로 공유하기"
          >
            <i className="fas fa-comment"></i>
            <span>카카오톡 공유하기</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default ShareSection;
