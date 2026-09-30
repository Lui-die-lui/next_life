import Image from "next/image";

/** Brand mark for the top-left of every header. The source is public/logo.png (cropped, transparent). */
export function Logo({ className = "h-6 sm:h-7" }: { className?: string }) {
  return <Image src="/logo.png" alt="NextLife 다음 생" width={800} height={188} priority className={`w-auto ${className}`} />;
}
