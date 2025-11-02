// Firebase 설정 파일
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // 실제 프로젝트에서는 환경변수 사용 권장
  apiKey: "AIzaSyCZ8TAdCp-uneiq0yYon8uU7QMbwLrZG9E",
  authDomain: "todo-49bca.firebaseapp.com",
  projectId: "todo-49bca",
  storageBucket: "todo-49bca.firebasestorage.app",
  messagingSenderId: "847104597131",
  appId: "1:847104597131:web:5133e694ad4db238e9c88e",
  measurementId: "G-7P4114LW0D",
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firestore 데이터베이스 인스턴스
export const db = getFirestore(app);

export default app;
