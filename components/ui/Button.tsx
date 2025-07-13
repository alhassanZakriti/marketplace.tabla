"use client"

import type React from "react"
import { cn } from "../../lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "soft" | "outline"
  size?: "sm" | "md" | "lg"
  children: React.ReactNode
}

export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  const baseClasses =
    "font-semibold cursor-pointer rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"

  const variantClasses = {
    primary: "bg-greentheme text-whitetheme hover:opacity-90 focus:ring-greentheme",
    secondary: "bg-softgreytheme text-blacktheme hover:opacity-90 focus:ring-greytheme",
    soft: "bg-softgreentheme text-greentheme hover:opacity-90 focus:ring-greentheme",
    outline: "border-2 border-greentheme text-greentheme hover:bg-softgreentheme focus:ring-greentheme",
  }

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  }

  return (
    <button className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)} {...props}>
      {children}
    </button>
  )
}
