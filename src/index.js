import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Register Service Worker for caching and offline support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log(
          "Service Worker registered successfully:",
          registration.scope
        );

        // 업데이트 감지 및 사용자 동의형 업데이트
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              // 새 버전이 설치됨 + 기존 컨트롤러가 있는 경우 (=업데이트)
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // 자동 새로고침 대신 사용자에게 알림
                console.log(
                  "새 버전이 사용 가능합니다. 페이지를 새로고침하면 적용됩니다."
                );
                // 필요시 여기에 토스트 알림이나 업데이트 버튼 추가 가능
                // showUpdateAvailableNotification();
              }
            });
          }
        });
      })
      .catch((error) => {
        console.log("Service Worker registration failed:", error);
      });
  });
}
