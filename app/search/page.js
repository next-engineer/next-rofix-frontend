"use client"

import Header from "@/components/header"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle } from "lucide-react"

const demoFeed = [
  {
    id: "p1",
    user: "mina",
    caption: "여름엔 화이트 셔츠와 데님이 최고!",
    image: "/images/outfit-hot.png",
    likes: 12,
    comments: ["시원해보여요!", "깔끔해요"],
  },
  {
    id: "p2",
    user: "june",
    caption: "비 오는 날엔 바람막이와 부츠로!",
    image: "/images/outfit-rainy.png",
    likes: 7,
    comments: ["실용적이네요", "멋져요"],
  },
  {
    id: "p3",
    user: "ari",
    caption: "오피스에 딱! 블라우스에 슬랙스 조합",
    image: "/images/outfit-office.png",
    likes: 20,
    comments: ["단정해요", "팔레트 최고"],
  },
]

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [feed, setFeed] = useState(demoFeed)
  const [newComment, setNewComment] = useState({})

  const filtered = feed.filter(
    (p) => p.user.toLowerCase().includes(query.toLowerCase()) || p.caption.toLowerCase().includes(query.toLowerCase()),
  )

  const like = (id) => {
    setFeed((prev) => prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)))
  }

  const addComment = (id) => {
    const text = (newComment[id] || "").trim()
    if (!text) return
    setFeed((prev) => prev.map((p) => (p.id === id ? { ...p, comments: [...p.comments, text] } : p)))
    setNewComment((prev) => ({ ...prev, [id]: "" }))
  }

  return (
    <main className="min-h-screen bg-[#F2F2F2] dark:bg-neutral-900">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-bold text-black dark:text-white mb-6">코디 검색</h2>

        <div className="mb-6">
          <Input
            placeholder="코디, 사용자, 계절 키워드로 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-white dark:bg-neutral-800"
          />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => (
            <Card key={post.id} className="bg-white dark:bg-neutral-800 border-black/10 dark:border-white/10">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">@{post.user}</CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-300">{post.caption}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full h-52 rounded-md overflow-hidden border border-black/5 dark:border-white/10 bg-white/70 dark:bg-neutral-700">
                  <img src={post.image || "/placeholder.svg"} alt="코디 이미지" className="w-full h-52 object-cover" />
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <Button variant="outline" onClick={() => like(post.id)} className="h-9">
                    <Heart className="h-4 w-4 mr-1 text-[#0B64FE]" />
                    좋아요 {post.likes}
                  </Button>
                </div>

                <div className="mt-3">
                  <div className="text-sm text-neutral-600 dark:text-neutral-300 mb-2">
                    댓글 ({post.comments.length})
                  </div>
                  <ul className="space-y-1 text-sm text-black dark:text-white">
                    {post.comments.map((c, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <MessageCircle className="h-4 w-4 text-[#0B64FE] mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 flex gap-2">
                    <Input
                      placeholder="댓글 달기..."
                      value={newComment[post.id] || ""}
                      onChange={(e) => setNewComment((prev) => ({ ...prev, [post.id]: e.target.value }))}
                      className="bg-white dark:bg-neutral-800"
                    />
                    <Button onClick={() => addComment(post.id)} className="h-9">
                      등록
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
