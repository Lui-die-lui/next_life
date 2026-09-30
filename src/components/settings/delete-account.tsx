"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { deleteAccount } from "@/server/actions/account";

/**
 * Account deletion: the user retypes their email to confirm (checked again
 * on the server), then everything is removed and they land on the landing
 * page signed out.
 */
export function DeleteAccount({ email }: { email: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const matches = typed.trim().toLowerCase() === email.trim().toLowerCase();

  if (!open) {
    return (
      <Button variant="danger" className="self-end" onClick={() => setOpen(true)}>
        계정 탈퇴하기
      </Button>
    );
  }

  return (
    <form
      className="flex flex-col gap-4 rounded-[20px] border border-(--color-danger)/40 bg-(--color-danger-soft)/60 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!matches) return;
        setError(null);
        startTransition(async () => {
          try {
            await deleteAccount(typed);
            router.replace("/");
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "탈퇴를 처리하지 못했습니다.");
          }
        });
      }}
    >
      <p className="text-base font-semibold text-(--color-danger)">정말 탈퇴할까요? 되돌릴 수 없어요.</p>
      <ul className="list-disc space-y-1 pl-5 text-[15px] text-(--color-text)">
        <li>경험, 도전, 연결 카드, 실험, 체크리스트, 보고서가 모두 삭제돼요.</li>
        <li>예약된 알림 메일도 함께 취소돼요.</li>
        <li>필요하면 먼저 위에서 내 데이터를 내보내 두세요.</li>
      </ul>
      <label htmlFor="confirm-email" className="text-[15px] font-semibold">
        확인을 위해 계정 이메일 <span className="font-mono">{email}</span>을 입력해 주세요.
      </label>
      <Input
        id="confirm-email"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        autoComplete="off"
        placeholder={email}
        className="max-w-md"
      />
      {error && (
        <p role="alert" className="text-[15px] text-(--color-danger)">
          {error}
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="submit"
          disabled={!matches || pending}
          className="bg-(--color-danger) text-white hover:bg-[#842f2f]"
        >
          {pending ? "삭제 중..." : "모든 기록을 삭제하고 탈퇴"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={() => {
            setOpen(false);
            setTyped("");
            setError(null);
          }}
        >
          취소
        </Button>
      </div>
    </form>
  );
}
