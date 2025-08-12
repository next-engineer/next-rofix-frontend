"use client";

/* =========================
 * LocalStorage helpers
 * ========================= */
export function readLS(key, fallback = null) {
  try {
    if (typeof window === "undefined") return fallback;
    const v = window.localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLS(key, value) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function removeLS(key) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  } catch {}
}

/* =========================
 * ID generator (중복 방지)
 * ========================= */
function genId(prefix = "id") {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {}
  const rnd = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now()}-${rnd}`;
}

/* =========================
 * User helpers (IP 자동생성/자동로그인 없음)
 * ========================= */
const USER_KEY = "fitspot_user";

/** 저장된 사용자만 읽기 (없으면 null) */
export function getUser() {
  return readLS(USER_KEY, null);
}

/** 명시적으로 가입/수정할 때만 저장 */
export function setUser(user) {
  if (!user || typeof user !== "object") return;
  // 권장 형태: { id, email, nickname, personalColor }
  if (!user.id) user.id = genId("u");
  writeLS(USER_KEY, user);
}

/** 퍼스널컬러만 수정 (사용자 없으면 아무것도 안 함) */
export function setUserPersonalColor(season) {
  const user = readLS(USER_KEY, null);
  if (!user) return null; // ✅ 자동 생성하지 않음
  user.personalColor = String(season ?? "");
  writeLS(USER_KEY, user);
  return user;
}

/** 간단 이메일 회원가입/덮어쓰기 (필요 시 커스텀) */
export function signUpWithEmail(email, extras = {}) {
  const base = readLS(USER_KEY, null);
  const user = {
    id: base?.id ?? genId("u"),
    email: String(email || "").trim(),
    nickname: extras.nickname ?? (String(email || "").split("@")[0] || "사용자"),
    personalColor: extras.personalColor ?? base?.personalColor ?? "",
  };
  writeLS(USER_KEY, user);
  return user;
}

/** 로그아웃 */
export function logoutUser() {
  removeLS(USER_KEY);
}

/* =========================
 * Wardrobe helpers
 * ========================= */
const WARDROBE_KEY = "fitspot_wardrobe";

export function getWardrobe() {
  return readLS(WARDROBE_KEY, []);
}

export function upsertWardrobe(item) {
  const list = readLS(WARDROBE_KEY, []);
  const id = item?.id ?? genId("w");
  const idx = list.findIndex((it) => it.id === id);

  if (idx >= 0) {
    // 업데이트 시 기존 likes 유지
    list[idx] = { ...list[idx], ...item, id };
  } else {
    // 신규는 likes 기본값 0
    list.push({ likes: 0, ...item, id });
  }

  writeLS(WARDROBE_KEY, list);
  return list;
}

export function deleteWardrobe(id) {
  const list = readLS(WARDROBE_KEY, []);
  const next = list.filter((it) => it.id !== id);
  writeLS(WARDROBE_KEY, next);
  return next;
}

/* =========================
 * Comments (코디검색용)
 * ========================= */
const COMMENTS_KEY = "search_comments_v1";

function _loadCommentsAll() {
  return readLS(COMMENTS_KEY, {});
}
function _saveCommentsAll(map) {
  writeLS(COMMENTS_KEY, map);
}

// 문자열 코멘트 구버전도 치유
function normalizeComments(list) {
  const out = [];
  const seen = new Set();
  for (const raw of list) {
    const obj =
      typeof raw === "string"
        ? { id: genId("c"), content: raw, createdAt: new Date().toISOString() }
        : { ...raw };

    obj.content = String(obj.content ?? "").trim();
    if (!obj.content) continue;

    let id = obj.id;
    if (!id || seen.has(String(id))) id = genId("c");
    obj.id = id;

    seen.add(String(id));
    out.push(obj);
  }
  return out;
}

/** itemId별 코멘트 목록(읽으며 자동 치유) */
export function getComments(itemId) {
  const all = _loadCommentsAll();
  const raw = all[itemId] || [];
  const fixed = normalizeComments(raw);

  if (
    fixed.length !== raw.length ||
    fixed.some((v, i) => String(v.id) !== String(raw[i]?.id))
  ) {
    all[itemId] = fixed;
    _saveCommentsAll(all);
  }
  return fixed;
}

/** 코멘트 추가 */
export function addComment(itemId, content) {
  const text = String(content || "").trim();
  if (!text) return getComments(itemId);

  const all = _loadCommentsAll();
  const current = normalizeComments(all[itemId] || []);
  const newItem = {
    id: genId("c"),
    content: text,
    createdAt: new Date().toISOString(),
  };
  const next = [newItem, ...current];
  all[itemId] = next;
  _saveCommentsAll(all);
  return next;
}

/** 코멘트 삭제 */
export function deleteCommentById(itemId, commentId) {
  const all = _loadCommentsAll();
  const current = normalizeComments(all[itemId] || []);
  const next = current.filter((c) => String(c.id) !== String(commentId));
  all[itemId] = next;
  _saveCommentsAll(all);
  return next;
}
