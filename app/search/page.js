"use client";

import Header from "@/components/header";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Search as SearchIcon, Trash2 } from "lucide-react";
import { getComments, addComment, deleteCommentById } from "@/lib/storage";

/* ===================== 데모 피드 ===================== */
const demoFeed = [
  {
    id: "p1",
    user: "mina",
    caption: "여름엔 화이트 셔츠와 데님이 최고!",
    image: "/images/outfit-hot.png",
    category: "여름",
    likes: 12,
    comments: ["시원해보여요!", "깔끔해요"],
  },
  {
    id: "p2",
    user: "june",
    caption: "비 오는 날엔 바람막이와 부츠로!",
    image: "/images/outfit-rainy.png",
    category: "비",
    likes: 7,
    comments: ["실용적이네요", "멋져요"],
  },
  {
    id: "p3",
    user: "ari",
    caption: "오피스에 딱! 블라우스에 슬랙스 조합",
    image: "/images/outfit-office.png",
    category: "오피스",
    likes: 20,
    comments: ["단정해요", "팔레트 최고"],
  },
];

/* ========= 댓글 섹션 (로컬스토리지: 등록/삭제/표시) ========= */
function CommentSection({ itemId, seed = [] }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  // 첫 로드시 로컬스토리지에서 불러오고, 비어있으면 seed로 초기화
  useEffect(() => {
    const loaded = getComments(itemId);
    if (loaded.length === 0 && seed.length > 0) {
      // 원래 순서 유지 위해 앞에서부터 추가
      seed.forEach((s) => addComment(itemId, s));
      setComments(getComments(itemId));
    } else {
      setComments(loaded);
    }
  }, [itemId, seed]);

  const onAdd = () => {
    const body = text.trim();
    if (!body) return;
    const updated = addComment(itemId, body);
    setComments(updated);
    setText("");
  };

  const onDelete = (cid) => {
    if (!confirm("이 댓글을 삭제할까요?")) return;
    const updated = deleteCommentById(itemId, cid);
    setComments(updated);
  };

  return (
    <div className="mt-3">
      <div className="text-sm text-neutral-600 dark:text-neutral-300 mb-2">
        댓글 ({comments.length})
      </div>

      <ul className="space-y-2">
        {comments.map((c) => (
          <li
            key={c.id}
            className="flex items-start justify-between rounded-md bg-muted/30 p-2"
          >
            <div className="flex items-start gap-2">
              <MessageCircle className="h-4 w-4 text-[#0B64FE] mt-0.5" />
              <span className="text-sm">{c.content}</span>
            </div>
            <button
              onClick={() => onDelete(c.id)}
              className="ml-3 inline-flex items-center justify-center rounded-md border px-2 py-1 text-xs hover:bg-white"
              title="삭제"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </li>
        ))}
        {comments.length === 0 && (
          <li className="text-xs text-muted-foreground">첫 댓글을 남겨보세요.</li>
        )}
      </ul>

      <div className="mt-2 flex gap-2">
        <Input
          placeholder="댓글 달기..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAdd()}
          className="bg-white dark:bg-neutral-800"
        />
        <Button onClick={onAdd} className="h-9">
          등록
        </Button>
      </div>
    </div>
  );
}

/* ===================== 메인 페이지 ===================== */
export default function SearchPage() {
  // 컨트롤 상태
  const [category, setCategory] = useState("");   // ''는 placeholder 유지용
  const [order, setOrder] = useState("latest");   // latest | likes
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");

  // 피드(정렬 위해 초기 인덱스 보관)
  const [feed, setFeed] = useState(
    demoFeed.map((p, idx) => ({ ...p, _idx: idx }))
  );

  const filtered = feed
    .filter((p) => {
      const q = (appliedQuery || query).toLowerCase();
      const matchText =
        p.user.toLowerCase().includes(q) || p.caption.toLowerCase().includes(q);
      const matchCategory =
        !category || category === "all" || p.category === category;
      return matchText && matchCategory;
    })
    .sort((a, b) => {
      if (order === "likes") return b.likes - a.likes;
      return b._idx - a._idx; // 최신순: 초기 인덱스 역순
    });

  const like = (id) => {
    setFeed((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  const doSearch = () => setAppliedQuery(query);

  return (
    <main className="min-h-screen bg-[#F2F2F2] dark:bg-neutral-900">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
          코디 검색
        </h2>

        {/* 상단 컨트롤 바 */}
        <div className="mb-3 flex items-center gap-2">
          {/* Radix Select는 빈 문자열 value가 불가 → undefined로 제어 */}
          <Select value={category || undefined} onValueChange={setCategory}>
            <SelectTrigger className="w-36 bg-white dark:bg-neutral-800">
              <SelectValue placeholder="카테고리" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="여름">여름</SelectItem>
              <SelectItem value="비">비</SelectItem>
              <SelectItem value="오피스">오피스</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="코디, 사용자, 계절 키워드로 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
            className="bg-white dark:bg-neutral-800 flex-1"
          />

          <Select value={order} onValueChange={setOrder}>
            <SelectTrigger className="w-32 bg-white dark:bg-neutral-800">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">최신순</SelectItem>
              <SelectItem value="likes">좋아요순</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={doSearch} className="h-9 px-3">
            <SearchIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* 결과 카드 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => (
            <Card
              key={post.id}
              className="bg-white dark:bg-neutral-800 border-black/10 dark:border-white/10"
            >
              <CardHeader>
                <CardTitle className="text-black dark:text-white">
                  @{post.user}
                </CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-300">
                  {post.caption}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full h-52 rounded-md overflow-hidden border border-black/5 dark:border-white/10 bg-white/70 dark:bg-neutral-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt="코디 이미지"
                    className="w-full h-52 object-cover"
                  />
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <Button variant="outline" onClick={() => like(post.id)} className="h-9">
                    <Heart className="h-4 w-4 mr-1 text-[#0B64FE]" />
                    좋아요 {post.likes}
                  </Button>
                </div>

                {/* 댓글(저장/삭제) 섹션 */}
                <CommentSection itemId={post.id} seed={post.comments} />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
