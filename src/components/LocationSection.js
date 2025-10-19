import React, { useEffect, useRef } from "react";
import useScrollAnimation from "../hooks/useScrollAnimation";

const LocationSection = () => {
  const mapElement = useRef(null);
  const [locationRef, locationVisible] = useScrollAnimation({ threshold: 0.2 });
  const [mapRef, mapVisible] = useScrollAnimation({ threshold: 0.2 });

  useEffect(() => {
    if (!mapElement.current) return;

    // Naver Maps API가 로드될 때까지 대기
    const initMap = () => {
      if (!window.naver || !window.naver.maps) {
        // 로드되지 않았다면 수동으로 로드 시도
        if (typeof window.loadNaverMaps === "function") {
          window.loadNaverMaps();
        }
        // 다시 시도
        setTimeout(initMap, 500);
        return;
      }

      // 세인트 메리엘 정확한 좌표 (강남역 인근)
      const location = new window.naver.maps.LatLng(37.496105, 127.033005);

      const mapOptions = {
        center: location,
        zoom: 17,
        zoomControl: true,
        zoomControlOptions: {
          position: window.naver.maps.Position.TOP_RIGHT,
        },
      };

      const map = new window.naver.maps.Map(mapElement.current, mapOptions);

      const marker = new window.naver.maps.Marker({
        position: location,
        map: map,
        title: "세인트 메리엘",
      });

      const infoWindow = new window.naver.maps.InfoWindow({
        content: `
          <div style="padding: 12px 15px; font-size: 14px; font-family: 'Noto Sans KR', sans-serif;">
            <strong style="font-size: 15px; color: #8B1538;">세인트 메리엘</strong><br/>
            <span style="font-size: 12px; color: #666; margin-top: 4px; display: block;">서울 강남구 논현로79길 72</span>
            <span style="font-size: 11px; color: #999;">B1F, 1F, 2F</span>
          </div>
        `,
      });

      window.naver.maps.Event.addListener(marker, "click", () => {
        if (infoWindow.getMap()) {
          infoWindow.close();
        } else {
          infoWindow.open(map, marker);
        }
      });

      // 초기에 정보창 표시
      infoWindow.open(map, marker);
    };

    initMap();
  }, []);

  const handleNavigation = (type) => {
    const address = "서울 강남구 논현로79길 72 세인트 메리엘";
    const placeName = "세인트 메리엘";

    let url = "";

    switch (type) {
      case "naver":
        url = `https://map.naver.com/v5/search/${encodeURIComponent(address)}`;
        break;
      case "kakao":
        url = `https://map.kakao.com/?q=${encodeURIComponent(address)}`;
        break;
      case "tmap":
        url = `https://tmap.life/route?goalname=${encodeURIComponent(
          placeName
        )}&goalx=127.0363793&goaly=37.5028461`;
        break;
      default:
        return;
    }

    window.open(url, "_blank");
  };

  return (
    <section className="location-section">
      <div className="container">
        <p className="section-subtitle">LOCATION</p>
        <h2 className="section-title">오시는 길</h2>

        {/* 개선된 위치 정보 - 한 줄 정렬 */}
        <div
          ref={locationRef}
          className={`location-info-improved animate-on-scroll ${
            locationVisible ? "visible" : ""
          }`}
        >
          <h3>세인트 메리엘</h3>
          <div className="location-details-row">
            <span className="address">서울 강남구 논현로 79길 72</span>
          </div>
          <p className="location-floor-info">전화: 02-538-3300</p>
        </div>

        {/* 지도 - 네이버 지도 */}
        <div
          ref={(el) => {
            mapElement.current = el;
            mapRef.current = el;
          }}
          className={`map-container animate-scale ${
            mapVisible ? "visible" : ""
          }`}
        ></div>

        {/* 내비게이션 링크 - 지도 바로 아래 */}
        <div className="navigation-links">
          <button
            className="nav-link naver"
            onClick={() => handleNavigation("naver")}
          >
            <i className="fas fa-map-marker-alt"></i>
            <span>네이버지도</span>
          </button>
          <button
            className="nav-link kakao"
            onClick={() => handleNavigation("kakao")}
          >
            <i className="fas fa-car"></i>
            <span>카카오내비</span>
          </button>
          <button
            className="nav-link tmap"
            onClick={() => handleNavigation("tmap")}
          >
            <i className="fas fa-route"></i>
            <span>티맵</span>
          </button>
        </div>

        {/* 교통편 안내 */}
        <div className="transport-info-clean">
          <div className="transport-item-clean">
            <div className="transport-icon">
              <i className="fas fa-subway"></i>
            </div>
            <h4 className="transport-title">지하철</h4>
            <p className="transport-desc">2호선 강남역 1번 출구 (도보 10분)</p>
            <p className="transport-desc">
              신분당선 강남역 4번 출구 (도보 6분)
            </p>
          </div>

          <div className="transport-item-clean">
            <div className="transport-icon">
              <i className="fas fa-bus"></i>
            </div>
            <h4 className="transport-title">버스</h4>
            <p className="transport-desc">
              강남역 1번출구, 역삼세무서 정류장 하차
            </p>
            <p className="transport-numbers">
              간선: 140, 146, 341, 360, 400, 402, 420, 440, 441, 452, 470, 541,
              740, 741
            </p>
            <p className="transport-numbers">
              지선: 9404, 9408, M4403, M4434, M5438, M6427, M6439, M7412
            </p>
          </div>

          <div className="transport-item-clean">
            <div className="transport-icon">
              <i className="fas fa-car"></i>
            </div>
            <h4 className="transport-title">자가용</h4>
            <p className="transport-desc">
              서울 강남구 논현로79길 72 (역삼동 828-10)
            </p>
            <p className="transport-desc">우편번호: 06239</p>
            <p className="transport-desc">
              건물 내 주차 가능 (발렛 서비스 제공)
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
