import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "green" | "amber" | "cyan" | "red" | "neutral";
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        tone === "green" && "border-[#8bd450]/25 bg-[#8bd450]/10 text-[#b9f38b]",
        tone === "amber" && "border-[#f7bf4f]/25 bg-[#f7bf4f]/10 text-[#ffd98a]",
        tone === "cyan" && "border-[#6ad6dd]/25 bg-[#6ad6dd]/10 text-[#9beaf0]",
        tone === "red" && "border-[#f26d6d]/25 bg-[#f26d6d]/10 text-[#ffabab]",
        tone === "neutral" && "border-white/10 bg-white/[0.05] text-zinc-300",
        className,
      )}
      {...props}
    />
  );
}
