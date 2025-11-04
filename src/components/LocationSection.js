import React, { useEffect, useRef, useState, useCallback } from "react";
import useScrollAnimation from "../hooks/useScrollAnimation";

const LocationSection = () => {
  const mapElement = useRef(null);
  const [locationRef, locationVisible] = useScrollAnimation({ threshold: 0.2 });
  const [mapRef, mapVisible] = useScrollAnimation({ threshold: 0.2 });
  const [showRouteMap, setShowRouteMap] = useState(false);
  const mapInitialized = useRef(false);

  useEffect(() => {
    if (!mapElement.current || mapInitialized.current) return;

    // Naver Maps API가 로드될 때까지 대기
    const initMap = () => {
      if (!window.naver || !window.naver.maps) {
        // Naver Maps API not loaded yet, retrying...
        // 다시 시도
        setTimeout(initMap, 1000);
        return;
      }

      // 중복 초기화 방지
      if (mapInitialized.current) return;
      mapInitialized.current = true;

      // 세인트 메리엘 정확한 좌표 (강남역 인근)
      const location = new window.naver.maps.LatLng(37.496105, 127.033005);

      const mapOptions = {
        center: location,
        zoom: 17,
        draggable: false, // 드래그 잠금
        pinchZoom: false, // 핀치 줌 잠금 (모바일)
        scrollWheel: false, // 마우스 휠 줌 잠금
        keyboardShortcuts: false, // 키보드 단축키 잠금
        disableDoubleTapZoom: true, // 더블탭 줌 잠금
        disableDoubleClickZoom: true, // 더블클릭 줌 잠금
        disableTwoFingerTapZoom: true, // 두 손가락 탭 줌 잠금
        zoomControl: true, // 줌 컨트롤 버튼만 허용
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
      // Naver Maps initialized successfully
    };

    // API 로딩 완료 이벤트 리스너
    const handleNaverMapsLoaded = () => {
      // Naver Maps API loaded event received
      setTimeout(initMap, 100); // 약간의 지연 후 초기화
    };

    // 이미 로드되어 있다면 즉시 초기화
    if (window.naver && window.naver.maps) {
      initMap();
    } else {
      // API 로딩 완료 이벤트 대기
      window.addEventListener("naverMapsLoaded", handleNaverMapsLoaded);
      // 폴백으로 주기적 확인
      initMap();
    }

    return () => {
      window.removeEventListener("naverMapsLoaded", handleNaverMapsLoaded);
    };
  }, []);

  const handleNavigation = useCallback((type) => {
    const placeName = "세인트 메리엘";
    const address = "서울 강남구 논현로79길 72";
    const lat = "37.496105";
    const lng = "127.033005";

    let url = "";

    switch (type) {
      case "naver":
        // 네이버 지도 - 장소 검색 및 길찾기
        url = `https://map.naver.com/p/search/${encodeURIComponent(
          placeName + " " + address
        )}`;
        break;
      case "kakao":
        // 카카오맵 - 목적지 설정 (길찾기)
        url = `https://map.kakao.com/link/to/${encodeURIComponent(
          placeName
        )},${lat},${lng}`;
        break;
      case "tmap":
        // 티맵 - 목적지 설정 (앱 우선, 웹 폴백)
        const tmapAppUrl = `tmap://route?goalname=${encodeURIComponent(
          placeName
        )}&goalx=${lng}&goaly=${lat}`;
        const tmapWebUrl = `https://tmap.life/route/car?goalname=${encodeURIComponent(
          placeName
        )}&goalx=${lng}&goaly=${lat}`;

        // 모바일에서 앱 실행 시도
        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
          window.location.href = tmapAppUrl;
          // 앱이 없을 경우 웹으로 폴백
          setTimeout(() => {
            window.open(tmapWebUrl, "_blank");
          }, 1500);
          return;
        } else {
          url = tmapWebUrl;
        }
        break;
      default:
        return;
    }

    window.open(url, "_blank");
  }, []);

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
          id="map"
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
            <i className="fas fa-route"></i>
            <span>카카오맵</span>
          </button>
          <button
            className="nav-link tmap"
            onClick={() => handleNavigation("tmap")}
          >
            <i className="fas fa-car"></i>
            <span>티맵</span>
          </button>
        </div>

        {/* 약도 보기 버튼 */}
        <div className="route-map-section">
          <button
            className="route-map-btn"
            onClick={() => setShowRouteMap(!showRouteMap)}
          >
            <i className="fas fa-map"></i>
            <span>{showRouteMap ? "약도 닫기" : "약도 보기"}</span>
          </button>

          {/* 약도 이미지 */}
          {showRouteMap && (
            <div className="route-map-container fade-in">
              <div className="route-map-image">
                <picture>
                  <source
                    type="image/webp"
                    srcSet="/assets/images/route-map.webp"
                  />
                  <img
                    src="/assets/images/route-map.jpg"
                    alt="세인트 메리엘 약도 - 강남역에서 오시는 길 안내"
                    style={{ width: "100%", height: "auto" }}
                  />
                </picture>
              </div>
            </div>
          )}
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
            <p className="transport-desc">서울 강남구 논현로 79길 72</p>
            <p className="transport-desc">올림피아센터 빌딩</p>
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
