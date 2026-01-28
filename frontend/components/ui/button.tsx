import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = {
  base: "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  primary:
    "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-emerald-700",
  outline: "border border-emerald-200 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50",
  ghost: "text-zinc-700 hover:bg-zinc-100",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants.base, buttonVariants[variant], className)}
      {...props}
    />
  )
);

Button.displayName = "Button";

export { Button };
