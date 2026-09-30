import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";

const links = [
  { href: "/home", label: "홈" },
  { href: "/experiences", label: "지금까지의 나" },
  { href: "/challenges", label: "다음 생" },
  { href: "/prompt", label: "프롬프트" },
  { href: "/settings", label: "설정" },
];

export function Nav() {
  return (
    <header className="border-b border-(--color-border) bg-(--color-surface)">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="font-bold tracking-tight text-(--color-text)">
          다음 생
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-1.5 text-(--color-text-muted) hover:bg-(--color-surface-muted) hover:text-(--color-text)"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <SignOutButton />
      </div>
    </header>
  );
}
