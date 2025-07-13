"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { X, Eye, EyeOff, Mail, Lock, User, AlertCircle } from "lucide-react"

type AuthMode = "login" | "signup"

interface AuthFormData {
  name?: string
  email: string
  password: string
  confirmPassword?: string
}

interface AuthPopupProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (data: AuthFormData) => void
  authMode?: AuthMode
}

export default function AuthPopup({ isOpen, onClose, onSuccess, authMode }: AuthPopupProps) {
  const [mode, setMode] = useState<AuthMode>(authMode || "login")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<AuthFormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  // Reset form when mode changes
  useEffect(() => {
    reset()
  }, [mode, reset])

  // Close popup when escape key is pressed
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      // Prevent scrolling when popup is open
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login")
  }

  const onSubmit = async (data: AuthFormData) => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (onSuccess) {
        onSuccess(data)
      }

      // Close popup on success
      onClose()
    } catch (error) {
      console.error("Authentication error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const password = watch("password")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-blacktheme/20 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Popup */}
      <div
        className="relative w-full max-w-md lt-sm:bottom-0 lt-sm:fixed lt-sm:rounded-b-none lt-sm:h-[80vh] lt-sm:overflow-y-auto rounded-2xl bg-white dark:bg-bgdarktheme2 shadow-xl p-6 md:p-8 overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-darkthemeitems transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-blacktheme dark:text-textdarktheme">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {mode === "login"
              ? "Sign in to access your account and reservations"
              : "Join us to make restaurant reservations easier"}
          </p>
        </div>

        {/* Social login buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 dark:border-darkthemeitems rounded-lg hover:bg-gray-50 dark:hover:bg-darkthemeitems/50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"
              />
            </svg>
            <span className="text-sm font-medium">Facebook</span>
          </button>

          <button
            type="button"
            className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 dark:border-darkthemeitems rounded-lg hover:bg-gray-50 dark:hover:bg-darkthemeitems/50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"
              />
            </svg>
            <span className="text-sm font-medium">Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-px flex-1 bg-gray-200 dark:bg-darkthemeitems"></div>
          <span className="text-sm text-gray-500 dark:text-gray-400">or continue with email</span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-darkthemeitems"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name field (signup only) */}
          {mode === "signup" && (
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  id="name"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    errors.name ? "border-redtheme" : "border-gray-300 dark:border-darkthemeitems"
                  } bg-white dark:bg-bgdarktheme text-blacktheme dark:text-textdarktheme focus:ring-2 focus:ring-greentheme focus:border-transparent`}
                  placeholder="Full Name"
                  {...register("name", {
                    required: "Name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters",
                    },
                  })}
                />
              </div>
              {errors.name && (
                <div className="mt-1 flex items-center text-sm text-redtheme">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.name.message}
                </div>
              )}
            </div>
          )}

          {/* Email field */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <Mail size={18} />
              </div>
              <input
                type="email"
                id="email"
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                  errors.email ? "border-redtheme" : "border-gray-300 dark:border-darkthemeitems"
                } bg-white dark:bg-bgdarktheme text-blacktheme dark:text-textdarktheme focus:ring-2 focus:ring-greentheme focus:border-transparent`}
                placeholder="Email Address"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
            </div>
            {errors.email && (
              <div className="mt-1 flex items-center text-sm text-redtheme">
                <AlertCircle size={14} className="mr-1" />
                {errors.email.message}
              </div>
            )}
          </div>

          {/* Password field */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className={`w-full pl-10 pr-12 py-3 rounded-lg border ${
                  errors.password ? "border-redtheme" : "border-gray-300 dark:border-darkthemeitems"
                } bg-white dark:bg-bgdarktheme text-blacktheme dark:text-textdarktheme focus:ring-2 focus:ring-greentheme focus:border-transparent`}
                placeholder="Password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <div className="mt-1 flex items-center text-sm text-redtheme">
                <AlertCircle size={14} className="mr-1" />
                {errors.password.message}
              </div>
            )}
          </div>

          {/* Confirm Password field (signup only) */}
          {mode === "signup" && (
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Lock size={18} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border ${
                    errors.confirmPassword ? "border-redtheme" : "border-gray-300 dark:border-darkthemeitems"
                  } bg-white dark:bg-bgdarktheme text-blacktheme dark:text-textdarktheme focus:ring-2 focus:ring-greentheme focus:border-transparent`}
                  placeholder="Confirm Password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) => value === password || "Passwords do not match",
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="mt-1 flex items-center text-sm text-redtheme">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.confirmPassword.message}
                </div>
              )}
            </div>
          )}

          {/* Forgot password (login only) */}
          {mode === "login" && (
            <div className="flex justify-end">
              <button type="button" className="text-sm text-greentheme hover:underline">
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-greentheme text-white rounded-lg hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-greentheme focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : mode === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Toggle mode */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}
            <button type="button" onClick={toggleMode} className="ml-1 text-greentheme hover:underline font-medium">
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>

        {/* Terms and privacy */}
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          By continuing, you agree to our{" "}
          <a href="/terms-conditions" className="text-greentheme hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy-policy" className="text-greentheme hover:underline">
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </div>
  )
}
