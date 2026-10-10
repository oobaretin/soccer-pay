import Image from "next/image";
import Link from "next/link";

type Variant = "header" | "footer";

const wordmarkClass: Record<Variant, { fb: string; sal: string }> = {
  header: {
    fb: "text-emerald-400",
    sal: "text-zinc-100",
  },
  footer: {
    fb: "text-emerald-400",
    sal: "text-zinc-100",
  },
};

export function SiteLogo({
  variant = "header",
  className = "",
}: {
  variant?: Variant;
  className?: string;
}) {
  const colors = wordmarkClass[variant];

  return (
    <Link
      href="/"
      className={`inline-flex min-h-11 items-center gap-2.5 ${className}`}
    >
      <Image
        src="/logo/fb-salaries-icon.svg"
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 shrink-0"
        priority={variant === "header"}
      />
      <span className="font-sora text-lg font-extrabold tracking-tight">
        <span className={colors.fb}>FB</span>{" "}
        <span className={colors.sal}>Salaries</span>
      </span>
    </Link>
  );
}
