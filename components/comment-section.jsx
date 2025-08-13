"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { getComments, addComment, deleteCommentById } from "@/lib/storage";

export default function CommentSection({ itemId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    setComments(getComments(itemId));
  }, [itemId]);

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
    <div className="mt-3 border-t pt-3">
      <div className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="댓글을 입력하세요"
          className="flex-1"
        />
        <Button onClick={onAdd}>등록</Button>
      </div>

      <ul className="mt-3 space-y-2">
        {comments.map((c) => (
          <li
            key={c.id}
            className="flex items-start justify-between rounded-md bg-muted/30 p-2"
          >
            <div className="text-sm whitespace-pre-wrap">{c.content}</div>
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
    </div>
  );
}
