import React from "react";
import useScrollAnimation from "../hooks/useScrollAnimation";

const InvitationSection = () => {
  const [sectionRef, sectionVisible] = useScrollAnimation({ threshold: 0.2 });

  return (
    <section className="invitation-section">
      <div className="container">
        <p className="section-subtitle">INVITATION</p>
        <h2 className="section-title">초대합니다</h2>
        <div
          ref={sectionRef}
          className={`invitation-text animate-on-scroll ${
            sectionVisible ? "visible" : ""
          }`}
        >
          <p>서로가 마주 보며 다져온 사랑을</p>
          <p>이제 함께 한 곳을 바라보며 걸어갈 수 있는</p>
          <p>큰 사랑으로 키우고자 합니다.</p>
          <br />
          <p>저희 두 사람이 사랑의 이름으로</p>
          <p>지켜나갈 수 있게</p>
          <p>앞날을 축복해 주시면 감사하겠습니다.</p>
        </div>

        <div className="parents-cards">
          {/* 신랑측 카드 */}
          <div className="parent-card">
            <div className="parent-badge groom-badge">신랑</div>
            <div className="parent-content">
              <div className="parent-names">
                <span className="parent-name">부 김용기</span>
                <span className="parent-separator">·</span>
                <span className="parent-name">모 박길순</span>
              </div>
              <div className="child-info">
                <span className="child-relation">의 아들</span>
                <strong className="child-name">김민석</strong>
              </div>
            </div>
          </div>

          {/* 신부측 카드 */}
          <div className="parent-card">
            <div className="parent-badge bride-badge">신부</div>
            <div className="parent-content">
              <div className="parent-names">
                <span className="parent-name">
                  부 강형수
                  <span className="deceased-mark">🌸</span>
                </span>
                <span className="parent-separator">·</span>
                <span className="parent-name">모 김애정</span>
              </div>
              <div className="child-info">
                <span className="child-relation">의 딸</span>
                <strong className="child-name">강수진</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InvitationSection;
