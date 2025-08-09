"use client"

export function readLS(key, fallback) {
  try {
    const v = window.localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch {
    return fallback
  }
}

export function writeLS(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

// User helpers
export function getUser() {
  return readLS("fitspot_user", null)
}

export function setUserPersonalColor(season) {
  const user = readLS("fitspot_user", { id: "guest-1", name: "게스트", personalColor: "" })
  user.personalColor = season
  writeLS("fitspot_user", user)
  return user
}

// Wardrobe helpers (restored)
export function getWardrobe() {
  return readLS("fitspot_wardrobe", [])
}

export function upsertWardrobe(item) {
  const list = readLS("fitspot_wardrobe", [])
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "w-" + Date.now() + "-" + Math.random()
  const newItem = {
    ...item,
    id,
    likes: Math.floor(Math.random() * 50),
  }
  list.push(newItem)
  writeLS("fitspot_wardrobe", list)
  return list
}
