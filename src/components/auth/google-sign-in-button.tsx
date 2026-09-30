"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function GoogleSignInButton({
  callbackURL = "/home",
  className,
  variant = "primary",
  children = "구글로 시작하기",
}: {
  callbackURL?: string;
  className?: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  children?: React.ReactNode;
}) {
  const [pending, setPending] = useState(false);

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          await authClient.signIn.social({ provider: "google", callbackURL });
        } finally {
          setPending(false);
        }
      }}
    >
      {pending ? "이동 중..." : children}
    </Button>
  );
}
