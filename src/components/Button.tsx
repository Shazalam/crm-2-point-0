"use client";
import React, { forwardRef } from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  variant?: "primary" | "secondary" | "success" | "danger" | "outline" | "ghost";
  fullWidth?: boolean;
  size?: "lg" | "md" | "sm";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      label,
      iconLeft,
      iconRight,
      loading = false,
      variant = "primary",
      fullWidth = true,
      size = "md",
      className = "",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      "flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2";
    const sizes = {
      sm: "py-2 px-4 text-sm",
      md: "py-3 px-6 text-base",
      lg: "py-4 px-8 text-lg",
    };
    const variants = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300 disabled:bg-blue-300",
      secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-300 disabled:bg-gray-400",
      success: "bg-green-500 text-white hover:bg-green-600 focus:ring-green-300 disabled:bg-green-300",
      danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-300 disabled:bg-red-300",
      outline: "border border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gray-200 disabled:opacity-60",
      ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-200 disabled:opacity-60",
    };
    return (
      <button
        type={props.type || "button"}
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          base,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className,
          loading && "opacity-70 cursor-not-allowed"
        )}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" /> <span>Loading...</span>
          </>
        ) : (
          <>
            {iconLeft && <span>{iconLeft}</span>}
            {label || children}
            {iconRight && <span>{iconRight}</span>}
          </>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
export default Button;
