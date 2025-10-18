import React, { useState } from 'react';
import useScrollAnimation from '../hooks/useScrollAnimation';

const AccountSection = () => {
  const [sectionRef, sectionVisible] = useScrollAnimation({ threshold: 0.2 });
  const [groomExpanded, setGroomExpanded] = useState(false);
  const [brideExpanded, setBrideExpanded] = useState(false);
  
  const copyAccount = (accountNumber) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(accountNumber).then(() => {
        alert('계좌번호가 복사되었습니다.');
      }).catch(() => {
        fallbackCopyAccount(accountNumber);
      });
    } else {
      fallbackCopyAccount(accountNumber);
    }
  };

  const fallbackCopyAccount = (accountNumber) => {
    const textArea = document.createElement('textarea');
    textArea.value = accountNumber;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      alert('계좌번호가 복사되었습니다.');
    } catch (err) {
      alert('복사에 실패했습니다. 수동으로 복사해주세요.');
    }
    
    document.body.removeChild(textArea);
  };

  return (
    <section className="account-section">
      <div className="container">
        <h2 className="section-title">ACCOUNT</h2>
        <p className="account-description">
          참석이 어려워 직접 축하를 전하지 못하는<br/>
          분들을 위해 계좌번호를 기재하였습니다.<br/>
          전해주시는 마음 감사히 받겠습니다.
        </p>
        
        <div 
          ref={sectionRef}
          className={`account-info-improved animate-on-scroll ${sectionVisible ? 'visible' : ''}`}
        >
          {/* 신랑측 계좌 */}
          <div className="account-accordion">
            <div 
              className="account-accordion-header"
              onClick={() => setGroomExpanded(!groomExpanded)}
            >
              <h4>신랑측</h4>
              <i className={`fas fa-chevron-${groomExpanded ? 'up' : 'down'} accordion-icon`}></i>
            </div>
            <div className={`account-accordion-content ${groomExpanded ? 'expanded' : ''}`}>
              <div className="account-person">
                <div className="account-row">
                  <span className="account-label">신랑</span>
                  <span className="account-name">김민석</span>
                </div>
                <div className="account-row">
                  <span className="account-number">우리 1234567890</span>
                  <button 
                    className="copy-icon-btn" 
                    onClick={(e) => {
                      e.stopPropagation();
                      copyAccount('1234567890');
                    }}
                    title="계좌번호 복사"
                  >
                    <i className="far fa-copy"></i>
                  </button>
                </div>
              </div>
              
              <div className="account-person">
                <div className="account-row">
                  <span className="account-label">아버지</span>
                  <span className="account-name">김민석</span>
                </div>
                <div className="account-row">
                  <span className="account-number">국민 22292000222</span>
                  <button 
                    className="copy-icon-btn" 
                    onClick={(e) => {
                      e.stopPropagation();
                      copyAccount('22292000222');
                    }}
                    title="계좌번호 복사"
                  >
                    <i className="far fa-copy"></i>
                  </button>
                </div>
              </div>
              
              <div className="account-person">
                <div className="account-row">
                  <span className="account-label">어머니</span>
                  <span className="account-name">김민석</span>
                </div>
                <div className="account-row">
                  <span className="account-number">기업 30303029222</span>
                  <button 
                    className="copy-icon-btn" 
                    onClick={(e) => {
                      e.stopPropagation();
                      copyAccount('30303029222');
                    }}
                    title="계좌번호 복사"
                  >
                    <i className="far fa-copy"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 신부측 계좌 */}
          <div className="account-accordion">
            <div 
              className="account-accordion-header"
              onClick={() => setBrideExpanded(!brideExpanded)}
            >
              <h4>신부측</h4>
              <i className={`fas fa-chevron-${brideExpanded ? 'up' : 'down'} accordion-icon`}></i>
            </div>
            <div className={`account-accordion-content ${brideExpanded ? 'expanded' : ''}`}>
              <div className="account-person">
                <div className="account-row">
                  <span className="account-label">신부</span>
                  <span className="account-name">강수진</span>
                </div>
                <div className="account-row">
                  <span className="account-number">카카오 3333031697843</span>
                  <button 
                    className="copy-icon-btn" 
                    onClick={(e) => {
                      e.stopPropagation();
                      copyAccount('3333031697843');
                    }}
                    title="계좌번호 복사"
                  >
                    <i className="far fa-copy"></i>
                  </button>
                </div>
              </div>
              
              <div className="account-person">
                <div className="account-row">
                  <span className="account-label">아버지</span>
                  <span className="account-name">강수진</span>
                </div>
                <div className="account-row">
                  <span className="account-number">신한 998877665544</span>
                  <button 
                    className="copy-icon-btn" 
                    onClick={(e) => {
                      e.stopPropagation();
                      copyAccount('998877665544');
                    }}
                    title="계좌번호 복사"
                  >
                    <i className="far fa-copy"></i>
                  </button>
                </div>
              </div>
              
              <div className="account-person">
                <div className="account-row">
                  <span className="account-label">어머니</span>
                  <span className="account-name">강수진</span>
                </div>
                <div className="account-row">
                  <span className="account-number">농협 1029384756</span>
                  <button 
                    className="copy-icon-btn" 
                    onClick={(e) => {
                      e.stopPropagation();
                      copyAccount('1029384756');
                    }}
                    title="계좌번호 복사"
                  >
                    <i className="far fa-copy"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AccountSection;