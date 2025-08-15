// lib/storage.js

/** =========================
 * 내부 유틸(로컬스토리지 안전 처리)
 * ========================= */
const USER_KEY = "fitspot_user";
const COMMENT_PREFIX = "fitspot_comments:";

const memoryStore = new Map(); // SSR/테스트 대비 인메모리 스토어

const hasWindow = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

function readJSON(key, fallback) {
  try {
    const raw = hasWindow() ? window.localStorage.getItem(key) : memoryStore.get(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    const raw = JSON.stringify(value);
    if (hasWindow()) window.localStorage.setItem(key, raw);
    else memoryStore.set(key, raw);
  } catch (err) {
    // 저장 실패(대부분 용량 초과) 원인 확인용
    console.warn(`[storage] write failed for ${key}:`, err?.name || err, err?.message || "");
  }
}

function removeItem(key) {
  try {
    if (hasWindow()) window.localStorage.removeItem(key);
    else memoryStore.delete(key);
  } catch {}
}

const asArray = (v) => (Array.isArray(v) ? v : []);

// ❗오타 수정: 닫는 괄호/백틱 보강
const genId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** =========================
 * 상수
 * ========================= */
export const PERSONAL_COLOR_OPTIONS = ["봄 웜", "여름 쿨", "가을 웜", "겨울 쿨"];

// 기본 프로필 형태
const USER_DEFAULT = { nickname: "게스트", email: "", personalColor: "" };

/** 내부: 유저 객체 정규화 + name → nickname 마이그레이션 */
function normalizeUser(u) {
  if (!u || typeof u !== "object") return { ...USER_DEFAULT, __migrated: false };

  // 과거 스키마(name) 호환
  const nickname = (u.nickname ?? u.name ?? USER_DEFAULT.nickname) || USER_DEFAULT.nickname;
  const email = u.email ?? USER_DEFAULT.email;
  const personalColor = u.personalColor ?? USER_DEFAULT.personalColor;

  // 문자열 안전 트림
  const norm = {
    nickname: String(nickname || "").trim() || USER_DEFAULT.nickname,
    email: String(email || "").trim(),
    personalColor: String(personalColor || "").trim(),
  };

  // name만 있고 nickname이 없었으면 마이그레이션 대상
  const migrated = !!(u.name && !u.nickname);

  return { ...norm, __migrated: migrated };
}

/** =========================
 * 유저 관련
 * ========================= */
export function getUser() {
  const raw = readJSON(USER_KEY, null);
  if (!raw) return null;
  const norm = normalizeUser(raw);

  // 필요 시 즉시 마이그레이션 반영 저장
  if (norm.__migrated) {
    const { __migrated, ...toSave } = norm;
    writeJSON(USER_KEY, toSave);
    return toSave;
  }
  const { __migrated, ...clean } = norm;
  return clean;
}

export function getUserSafe() {
  const raw = readJSON(USER_KEY, {}) || {};
  const norm = normalizeUser(raw);
  if (norm.__migrated) {
    const { __migrated, ...toSave } = norm;
    writeJSON(USER_KEY, toSave);
    return toSave;
  }
  const { __migrated, ...clean } = norm;
  return { ...USER_DEFAULT, ...clean };
}

/** 부분 업데이트(닉네임/이메일/퍼스널컬러) */
export function updateUser(partial = {}) {
  const current = getUserSafe();

  // 과거 name 필드로 들어와도 닉네임으로 매핑
  const next = {
    nickname:
      (partial.nickname ?? partial.name ?? current.nickname ?? USER_DEFAULT.nickname) ||
      USER_DEFAULT.nickname,
    email: partial.email ?? current.email ?? USER_DEFAULT.email,
    personalColor: partial.personalColor ?? current.personalColor ?? USER_DEFAULT.personalColor,
  };

  // 문자열 정리
  next.nickname = String(next.nickname || "").trim() || USER_DEFAULT.nickname;
  next.email = String(next.email || "").trim();
  next.personalColor = String(next.personalColor || "").trim();

  writeJSON(USER_KEY, next);
  return next;
}

/** 이전 코드 호환용: saveUser → updateUser 별칭 */
export function saveUser(patch) {
  return updateUser(patch);
}

export function setUserPersonalColor(label) {
  return updateUser({ personalColor: label });
}

export function clearUser() {
  removeItem(USER_KEY);
}

/** =========================
 * 댓글(아이템별 로컬 저장)
 * ========================= */
const commentsKey = (itemId) => `${COMMENT_PREFIX}${String(itemId)}`;

export function getComments(itemId) {
  return asArray(readJSON(commentsKey(itemId), []));
}

export function addComment(itemId, content) {
  const list = getComments(itemId);
  const entry = { id: genId(), content, createdAt: new Date().toISOString() };
  const next = [...list, entry];
  writeJSON(commentsKey(itemId), next);
  return next;
}

export function deleteCommentById(itemId, commentId) {
  const list = getComments(itemId);
  const next = list.filter((c) => c.id !== commentId);
  writeJSON(commentsKey(itemId), next);
  return next;
}

/** =========================
 * 옷장(wardrobe)
 * ========================= */
const WARDROBE_KEY = "fitspot_wardrobe";

export function getWardrobe() {
  return asArray(readJSON(WARDROBE_KEY, []));
}

export function upsertWardrobe(item) {
  const list = getWardrobe();
  const id = item.id ?? genId();

  // likes 기본값 보장
  const nextItem = { id, likes: 0, ...item };
  if (typeof nextItem.likes !== "number") nextItem.likes = 0;

  const idx = list.findIndex((x) => x.id === id);
  let next;
  if (idx >= 0) {
    next = [...list];
    next[idx] = nextItem;
  } else {
    next = [...list, nextItem];
  }

  writeJSON(WARDROBE_KEY, next);
  return next;
}

export function deleteWardrobe(id) {
  const next = getWardrobe().filter((x) => x.id !== id);
  writeJSON(WARDROBE_KEY, next);
  return next;
}
