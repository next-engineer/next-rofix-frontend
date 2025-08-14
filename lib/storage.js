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
  } catch {}
}

function removeItem(key) {
  try {
    if (hasWindow()) window.localStorage.removeItem(key);
    else memoryStore.delete(key);
  } catch {}
}

const asArray = (v) => (Array.isArray(v) ? v : []);
const genId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** =========================
 * 상수
 * ========================= */
export const PERSONAL_COLOR_OPTIONS = ["봄 웜", "여름 쿨", "가을 웜", "겨울 쿨"];

/** =========================
 * 유저 관련
 * ========================= */
export function getUser() {
  return readJSON(USER_KEY, null);
}

export function getUserSafe() {
  return readJSON(USER_KEY, {}) || {};
}

export function updateUser(partial) {
  const current = getUserSafe();
  const next = { ...current, ...partial };
  writeJSON(USER_KEY, next);
  return next;
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
  const nextItem = { id, ...item };

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
