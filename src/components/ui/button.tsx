import { Slot } from "@radix-ui/react-slot";
import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "icon";
};

export function Button({
  asChild,
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8bd450]/70 disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
          "border-[#8bd450]/60 bg-[#8bd450] text-[#10130e] hover:bg-[#a0e767]",
        variant === "secondary" &&
          "border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1]",
        variant === "ghost" && "border-transparent bg-transparent text-zinc-300 hover:bg-white/[0.06] hover:text-white",
        variant === "danger" && "border-red-400/30 bg-red-500/15 text-red-100 hover:bg-red-500/25",
        size === "sm" && "h-8 px-3 text-xs",
        size === "md" && "h-10 px-4 text-sm",
        size === "icon" && "h-9 w-9",
        className,
      )}
      {...props}
    />
  );
}
