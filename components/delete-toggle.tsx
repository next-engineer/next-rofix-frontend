"use client"
import { useState } from "react"

export default function DeleteToggle({
  onConfirm,
  size = "sm",
  label = "삭제"
}: {
  onConfirm: () => void
  size?: "sm" | "md"
  label?: string
}) {
  const [checked, setChecked] = useState(false)

  const handleChange = async () => {
    const next = !checked
    setChecked(next)
    if (next) {
      if (confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
        onConfirm()
      } else {
        setChecked(false)
      }
    }
  }

  const cls =
    size === "sm"
      ? "w-10 h-5"
      : "w-12 h-6"

  return (
    <label className="inline-flex cursor-pointer items-center gap-2">
      <span className="text-xs">{label}</span>
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={handleChange} />
      <div className={`relative ${cls} rounded-full bg-neutral-300 peer-checked:bg-red-500 transition`}>
        <div className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white peer-checked:translate-x-5 transition" />
      </div>
    </label>
  )
}
