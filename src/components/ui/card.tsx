import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Card(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-white/[0.08] bg-[#151712] shadow-[0_1px_0_rgba(255,255,255,0.04)]",
        className,
      )}
      {...props}
    />
  );
});

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardHeader(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn("border-b border-white/[0.06] px-4 py-3", className)} {...props} />;
});

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(function CardTitle(
  { className, ...props },
  ref,
) {
  return <h2 ref={ref} className={cn("text-sm font-semibold text-zinc-100", className)} {...props} />;
});

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardContent(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn("p-4", className)} {...props} />;
});
