"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Eye, EyeOff, Mail, Lock, User, Building } from "lucide-react"
import { dataProvider, type LoginCredentials, type RegisterData } from "../../lib/dataProvider"

interface AuthPopupProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (data: any) => void
  defaultTab?: "login" | "register" | "forgot"
}

export default function AuthPopup({ isOpen, onClose, onSuccess, defaultTab = "login" }: AuthPopupProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register" | "forgot">(defaultTab)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Login form state
  const [loginForm, setLoginForm] = useState<LoginCredentials>({
    username: "",
    email: "",
    password: "",
    restaurant_id: 0,
  })

  // Register form state
  const [registerForm, setRegisterForm] = useState<RegisterData >({
    username: "",
    email: "",
    password1: "",
    password2: "",
    first_name: "",
    last_name: "",
    phone: "",
    restaurant_id: 0,
  })

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState("")

  // Reset form states when tab changes
  useEffect(() => {
    setError(null)
    setSuccess(null)
    setShowPassword(false)
    setShowConfirmPassword(false)
  }, [activeTab])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await dataProvider.auth.login(loginForm)
      setSuccess("Login successful!")
      onSuccess(response)
      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate passwords match
    if (registerForm.password1 !== registerForm.password2) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    // Validate password strength
    if (registerForm.password1.length < 8) {
      setError("Password must be at least 8 characters long")
      setLoading(false)
      return
    }

    try {
      const response = await dataProvider.auth.register(registerForm)
      setSuccess("Registration successful! Please log in.")
      setActiveTab("login")
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await dataProvider.auth.forgotPassword(forgotEmail)
      setSuccess("Password reset email sent! Check your inbox.")
    } catch (err: any) {
      setError(err.message || "Failed to send reset email. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-blacktheme/20 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-whitetheme dark:bg-darkthemeitems rounded-xl shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-softgreytheme dark:border-subblack">
          <h2 className="text-xl font-bold text-blacktheme dark:text-textdarktheme">
            {activeTab === "login" && "Welcome Back"}
            {activeTab === "register" && "Create Account"}
            {activeTab === "forgot" && "Reset Password"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-softgreytheme dark:hover:bg-bgdarktheme2 transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-greytheme dark:text-textdarktheme/70" />
          </button>
        </div>

        {/* Tabs */}
        {activeTab !== "forgot" && (
          <div className="flex border-b border-softgreytheme dark:border-subblack">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === "login"
                  ? "text-greentheme border-b-2 border-greentheme bg-softgreentheme dark:bg-greentheme/20"
                  : "text-greytheme dark:text-textdarktheme/70 hover:text-blacktheme dark:hover:text-textdarktheme"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === "register"
                  ? "text-greentheme border-b-2 border-greentheme bg-softgreentheme dark:bg-greentheme/20"
                  : "text-greytheme dark:text-textdarktheme/70 hover:text-blacktheme dark:hover:text-textdarktheme"
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-softredtheme dark:bg-redtheme/20 border border-redtheme/20 dark:border-redtheme/40 rounded-lg">
              <p className="text-redtheme text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-softgreentheme dark:bg-greentheme/20 border border-greentheme/20 dark:border-greentheme/40 rounded-lg">
              <p className="text-greentheme text-sm">{success}</p>
            </div>
          )}

          {/* Login Form */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* <div>
                <label className="block text-sm font-medium text-blacktheme dark:text-textdarktheme mb-1">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-greytheme dark:text-textdarktheme/70" />
                  <input
                    type="text"
                    required
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-softgreytheme dark:border-subblack rounded-lg bg-whitetheme dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme placeholder:text-greytheme dark:placeholder:text-textdarktheme/50 focus:border-greentheme focus:ring-2 focus:ring-softgreentheme outline-none transition-colors"
                    placeholder="Enter your username"
                  />
                </div>
              </div> */}

              <div>
                <label className="block text-sm font-medium text-blacktheme dark:text-textdarktheme mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-greytheme dark:text-textdarktheme/70" />
                  <input
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-softgreytheme dark:border-subblack rounded-lg bg-whitetheme dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme placeholder:text-greytheme dark:placeholder:text-textdarktheme/50 focus:border-greentheme focus:ring-2 focus:ring-softgreentheme outline-none transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blacktheme dark:text-textdarktheme mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-greytheme dark:text-textdarktheme/70" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 border border-softgreytheme dark:border-subblack rounded-lg bg-whitetheme dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme placeholder:text-greytheme dark:placeholder:text-textdarktheme/50 focus:border-greentheme focus:ring-2 focus:ring-softgreentheme outline-none transition-colors"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-greytheme dark:text-textdarktheme/70 hover:text-blacktheme dark:hover:text-textdarktheme transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>


              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab("forgot")}
                  className="text-sm text-greentheme hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          )}

          {/* Register Form */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blacktheme dark:text-textdarktheme mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={registerForm.first_name}
                    onChange={(e) => setRegisterForm({ ...registerForm, first_name: e.target.value })}
                    className="w-full px-3 py-3 border border-softgreytheme dark:border-subblack rounded-lg bg-whitetheme dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme placeholder:text-greytheme dark:placeholder:text-textdarktheme/50 focus:border-greentheme focus:ring-2 focus:ring-softgreentheme outline-none transition-colors"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blacktheme dark:text-textdarktheme mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={registerForm.last_name}
                    onChange={(e) => setRegisterForm({ ...registerForm, last_name: e.target.value })}
                    className="w-full px-3 py-3 border border-softgreytheme dark:border-subblack rounded-lg bg-whitetheme dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme placeholder:text-greytheme dark:placeholder:text-textdarktheme/50 focus:border-greentheme focus:ring-2 focus:ring-softgreentheme outline-none transition-colors"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blacktheme dark:text-textdarktheme mb-1">
                  Username *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-greytheme dark:text-textdarktheme/70" />
                  <input
                    type="text"
                    required
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-softgreytheme dark:border-subblack rounded-lg bg-whitetheme dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme placeholder:text-greytheme dark:placeholder:text-textdarktheme/50 focus:border-greentheme focus:ring-2 focus:ring-softgreentheme outline-none transition-colors"
                    placeholder="Choose a username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blacktheme dark:text-textdarktheme mb-1">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-greytheme dark:text-textdarktheme/70" />
                  <input
                    type="email"
                    required
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-softgreytheme dark:border-subblack rounded-lg bg-whitetheme dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme placeholder:text-greytheme dark:placeholder:text-textdarktheme/50 focus:border-greentheme focus:ring-2 focus:ring-softgreentheme outline-none transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blacktheme dark:text-textdarktheme mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-greytheme dark:text-textdarktheme/70" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={registerForm.password1}
                    onChange={(e) => setRegisterForm({ ...registerForm, password1: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 border border-softgreytheme dark:border-subblack rounded-lg bg-whitetheme dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme placeholder:text-greytheme dark:placeholder:text-textdarktheme/50 focus:border-greentheme focus:ring-2 focus:ring-softgreentheme outline-none transition-colors"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-greytheme dark:text-textdarktheme/70 hover:text-blacktheme dark:hover:text-textdarktheme transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blacktheme dark:text-textdarktheme mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-greytheme dark:text-textdarktheme/70" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={registerForm.password2}
                    onChange={(e) => setRegisterForm({ ...registerForm, password2: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 border border-softgreytheme dark:border-subblack rounded-lg bg-whitetheme dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme placeholder:text-greytheme dark:placeholder:text-textdarktheme/50 focus:border-greentheme focus:ring-2 focus:ring-softgreentheme outline-none transition-colors"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-greytheme dark:text-textdarktheme/70 hover:text-blacktheme dark:hover:text-textdarktheme transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
          {activeTab === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-sm text-greytheme dark:text-textdarktheme/70 mb-4">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <div>
                <label className="block text-sm font-medium text-blacktheme dark:text-textdarktheme mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-greytheme dark:text-textdarktheme/70" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-softgreytheme dark:border-subblack rounded-lg bg-whitetheme dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme placeholder:text-greytheme dark:placeholder:text-textdarktheme/50 focus:border-greentheme focus:ring-2 focus:ring-softgreentheme outline-none transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className="w-full text-sm text-greentheme hover:underline"
              >
                Back to Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
