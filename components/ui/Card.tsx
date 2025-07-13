"use client"

import type React from "react"
import { cn } from "../../lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "light" | "dark"
  children: React.ReactNode
}

export function Card({ variant = "light", className, children, ...props }: CardProps) {
  const baseClasses = "rounded-lg shadow-md border transition-colors"

  const variantClasses = {
    light: "bg-whitetheme text-blacktheme border-softgreytheme",
    dark: "bg-darkthemeitems text-textdarktheme border-subblack",
  }

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)} {...props}>
      {children}
    </div>
  )
}
