// 방명록 데이터베이스 유틸리티
import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

const GUESTBOOK_COLLECTION = "guestbook";

// 메시지 추가
export const addGuestbookMessage = async (messageData) => {
  try {
    const docRef = await addDoc(collection(db, GUESTBOOK_COLLECTION), {
      name: messageData.name.trim(),
      message: messageData.message.trim(),
      timestamp: serverTimestamp(),
      date: new Date().toLocaleDateString("ko-KR"),
      // 스팸 방지를 위한 기본 검증
      approved: true, // 추후 관리자 승인 기능 추가 가능
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("방명록 메시지 저장 실패:", error);
    return { success: false, error: error.message };
  }
};

// 메시지 조회
export const getGuestbookMessages = async (limitCount = 50) => {
  try {
    const q = query(
      collection(db, GUESTBOOK_COLLECTION),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const messages = snapshot.docs.map((doc) => {
      const data = doc.data();

      // timestamp 안전하게 변환
      let displayDate = new Date().toLocaleDateString("ko-KR");

      if (data.date && typeof data.date === "string") {
        displayDate = data.date;
      } else if (data.timestamp) {
        try {
          if (
            data.timestamp.toDate &&
            typeof data.timestamp.toDate === "function"
          ) {
            displayDate = data.timestamp.toDate().toLocaleDateString("ko-KR");
          } else if (data.timestamp.seconds) {
            // seconds가 있는 경우 직접 Date 생성
            displayDate = new Date(
              data.timestamp.seconds * 1000
            ).toLocaleDateString("ko-KR");
          }
        } catch (error) {
          displayDate = new Date().toLocaleDateString("ko-KR");
        }
      }

      return {
        id: doc.id,
        name: String(data.name || "익명"),
        message: String(data.message || ""),
        date: displayDate,
        approved: Boolean(data.approved !== false), // 기본값 true
      };
    });

    return { success: true, messages };
  } catch (error) {
    console.error("방명록 메시지 조회 실패:", error);
    return { success: false, error: error.message, messages: [] };
  }
};

// 메시지 검증 함수
export const validateMessage = (name, message) => {
  const errors = [];

  if (!name || name.trim().length < 1) {
    errors.push("이름을 입력해주세요.");
  }

  if (name && name.trim().length > 20) {
    errors.push("이름은 20자 이내로 입력해주세요.");
  }

  if (!message || message.trim().length < 1) {
    errors.push("메시지를 입력해주세요.");
  }

  if (message && message.trim().length > 200) {
    errors.push("메시지는 200자 이내로 입력해주세요.");
  }

  // 기본적인 스팸 검증
  const spamPatterns = [
    /http[s]?:\/\//i, // URL 포함
    /\b(광고|홍보|마케팅|판매)\b/i, // 스팸 키워드
  ];

  if (spamPatterns.some((pattern) => pattern.test(message))) {
    errors.push("부적절한 내용이 포함되어 있습니다.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
