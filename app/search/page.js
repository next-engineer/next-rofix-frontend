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
import { Heart, MessageCircle, Search as SearchIcon, Trash2, Loader2 } from "lucide-react";
import { getComments, addComment, deleteCommentById } from "@/lib/storage";
import { searchCodies, handleApiError } from "@/lib/cody-search";

// 고정 카테고리 배열
const categories = [
  { value: "all", label: "전체" },
  { value: "spring", label: "봄" },
  { value: "summer", label: "여름" },
  { value: "autumn", label: "가을" },
  { value: "winter", label: "겨울" },
];

/* ===================== 데모 피드 ===================== */
const demoFeed = [
  {
    id: "p1",
    user: "mina",
    caption: "여름에 화이트 셔츠 와 데님이 최고!",
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
  const [category, setCategory] = useState("");     // ""는 placeholder 유지용
  const [order, setOrder] = useState("latest");     // latest | likes
  const [query, setQuery] = useState("");

  // 백엔드 연동 상태
  const [codies, setCodies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const doSearch = async () => {
    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const searchParams = {
        searchText: query.trim(),
        searchScope: "both", // 제목과 설명 모두 검색
        weather: category && category !== "all" ? category : "",
        sortBy: order === "likes" ? "likes" : "latest"
      };

      const results = await searchCodies(searchParams);
      setCodies(results);

      if (results.length === 0) {
        setError("검색 조건에 맞는 코디가 없습니다.");
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('검색 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // 엔터키로 검색
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      doSearch();
    }
  };

  // 좋아요 기능 (로컬 상태만 업데이트 - 실제 백엔드 API 필요시 추가)
  const like = (codyId) => {
    setCodies((prev) =>
      prev.map((cody) =>
        cody.codyId === codyId
          ? { ...cody, likeCount: cody.likeCount + 1 }
          : cody
      )
    );
  };

  return (
    <main className="min-h-screen bg-[#F2F2F2] dark:bg-neutral-900">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
          코디 검색
        </h2>

        {/* 상단 컨트롤 바 */}
        <div className="mb-6 flex items-center gap-2">
          <Select value={category || undefined} onValueChange={setCategory}>
            <SelectTrigger className="w-36 bg-white dark:bg-neutral-800">
              <SelectValue placeholder="카테고리" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="검색할 텍스트를 입력해 주세요."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            className="bg-white dark:bg-neutral-800 flex-1"
            disabled={loading}
          />

          <Select value={order} onValueChange={setOrder}>
            <SelectTrigger className="w-32 bg-white dark:bg-neutral-800">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">최신순</SelectItem>
              <SelectItem value="likes">가나다순</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={doSearch} className="h-9 px-3" disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <SearchIcon className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* 로딩 상태 */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#0B64FE]" />
            <span className="ml-2 text-neutral-600 dark:text-neutral-300">
              검색 중...
            </span>
          </div>
        )}

        {/* 검색 결과 없음 */}
        {!loading && hasSearched && codies.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-neutral-600 dark:text-neutral-300">
              검색 조건에 맞는 코디가 없습니다.
            </p>
          </div>
        )}

        {/* 검색 안내 */}
        {!loading && !hasSearched && (
          <div className="text-center py-12">
            <p className="text-neutral-600 dark:text-neutral-300">
              키워드를 입력하고 검색해보세요.
            </p>
          </div>
        )}

        {/* 결과 카드 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {codies.map((cody) => (
            <Card
              key={cody.codyId}
              className="bg-white dark:bg-neutral-800 border-black/10 dark:border-white/10"
            >
              <CardHeader>
                <CardTitle className="text-black dark:text-white">
                  {cody.title}
                </CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-300">
                  {cody.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* 코디 이미지 또는 포함된 옷들 이미지 */}
                <div className="w-full h-52 rounded-md overflow-hidden border border-black/5 dark:border-white/10 bg-white/70 dark:bg-neutral-700">
                  {cody.clothings && cody.clothings.length > 0 ? (
                    <div className="grid grid-cols-2 gap-1 h-full p-2">
                      {cody.clothings.slice(0, 4).map((clothing, idx) => (
                        <div key={clothing.clothingId || idx} className="relative">
                          <img
                            src={clothing.imageUrl || "/placeholder.svg"}
                            alt={clothing.title || "옷"}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-neutral-400">
                      이미지 없음
                    </div>
                  )}
                </div>

                {/* 포함된 옷들 정보 */}
                {cody.clothings && cody.clothings.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                      포함된 아이템 ({cody.clothings.length}개)
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {cody.clothings.slice(0, 3).map((clothing, idx) => (
                        <span
                          key={clothing.clothingId || idx}
                          className="text-xs bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded"
                        >
                          {clothing.title}
                        </span>
                      ))}
                      {cody.clothings.length > 3 && (
                        <span className="text-xs text-neutral-500">
                          +{cody.clothings.length - 3}개
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-3 flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => like(cody.codyId)}
                    className="h-9"
                  >
                    <Heart className="h-4 w-4 mr-1 text-[#0B64FE]" />
                    좋아요 {cody.likeCount || 0}
                  </Button>
                  <span className="text-xs text-neutral-500">
                    댓글 {cody.commentCount || 0}개
                  </span>
                </div>

                {/* 댓글 섹션 */}
                <CommentSection itemId={`cody-${cody.codyId}`} seed={[]} />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}