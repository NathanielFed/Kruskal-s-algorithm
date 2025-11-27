import * as React from "react";

type Variant = "default" | "outline" | "ghost";

const base =
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  default: "bg-blue-600 text-white hover:bg-blue-500 px-3 py-1",
  outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 px-3 py-1",
  ghost: "bg-transparent hover:bg-gray-100 text-gray-900 px-3 py-1"
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${className ?? ""}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";