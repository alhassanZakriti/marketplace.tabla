"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useRouter } from "next/navigation"
import { LogIn, Home, AlertTriangle } from "lucide-react"
import { useAuth } from "../auth/AuthProvider"
import { dataProvider, type User } from "@/lib/dataProvider"

type UserInformation = {
    first_name: string
    last_name: string
    email: string
    phone: string
    username: string
}

export const MyInformation: React.FC = () => {
    const { t } = useTranslation()
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [userData, setUserData] = useState<User | null>(null)
    const { user: authUser, isAuthenticated, loading: authLoading } = useAuth()

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<UserInformation>()

    // Fetch user profile data
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!authUser) return
            
            try {
                setLoading(true)
                setError(null)
                const profile = await dataProvider.auth.getProfile()
                setUserData(profile)
                
                // Set form values
                setValue("first_name", profile.first_name || "")
                setValue("last_name", profile.last_name || "")
                setValue("email", profile.email || "")
                setValue("phone", profile.phone || "")
                setValue("username", profile.username || "")
                
            } catch (err) {
                console.error("Failed to fetch user profile:", err)
                setError("Failed to load user profile. Please try again.")
            } finally {
                setLoading(false)
            }
        }

        fetchUserProfile()
    }, [authUser, setValue])

    const onSubmit = async (data: UserInformation) => {
        try {
            setSaving(true)
            setError(null)
            
            const updatedUser = await dataProvider.auth.updateProfile({
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                phone: data.phone,
                username: data.username,
            })
            
            setUserData(updatedUser)
            setIsEditing(false)
            
            // Show success message (you could add a toast notification here)
            console.log("Profile updated successfully:", updatedUser)
            
        } catch (err) {
            console.error("Failed to update profile:", err)
            setError("Failed to update profile. Please try again.")
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        if (userData) {
            setValue("first_name", userData.first_name || "")
            setValue("last_name", userData.last_name || "")
            setValue("email", userData.email || "")
            setValue("phone", userData.phone || "")
            setValue("username", userData.username || "")
        }
        setIsEditing(false)
        setError(null)
    }

    // Authentication guard - show this if user is not authenticated
    if (!authLoading && !isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md mx-auto p-8 bg-white dark:bg-darkthemeitems rounded-xl shadow-lg border border-softgreytheme dark:border-gray-600">
                    <div className="w-16 h-16 mx-auto mb-6 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    
                    <h2 className="text-xl font-bold text-blacktheme dark:text-textdarktheme mb-3">
                        {t("profile.authRequired.title", "Authentication Required")}
                    </h2>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                        {t("profile.authRequired.message", "You need to be signed in to view and edit your profile information. Please sign in to continue or return to the home page.")}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => router.push('/')}
                            className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-softgreytheme dark:border-gray-600 text-blacktheme dark:text-textdarktheme font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            {t("profile.authRequired.goHome", "Go Home")}
                        </button>
                        
                        <button
                            onClick={() => {
                                // You can implement your sign-in logic here
                                // For now, we'll redirect to home and let the AuthPopup handle it
                                router.push('/?showAuth=true')
                            }}
                            className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-greentheme hover:bg-greentheme/80 text-white font-medium rounded-lg transition-colors duration-200"
                        >
                            <LogIn className="w-4 h-4 mr-2" />
                            {t("profile.authRequired.signIn", "Sign In")}
                        </button>
                    </div>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                        {t("profile.authRequired.note", "Your session may have expired. Please sign in again to continue.")}
                    </p>
                </div>
            </div>
        )
    }

    if (authLoading || loading) {
        return (
            <div className="space-y-6">
                <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme">
                    {t("profile.myInformation.title", "My Information")}
                </h2>
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-greentheme"></div>
                </div>
            </div>
        )
    }

    if (error && !userData) {
        return (
            <div className="space-y-6">
                <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme">
                    {t("profile.myInformation.title", "My Information")}
                </h2>
                <div className="text-center py-8">
                    <p className="text-redtheme mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-greentheme text-white rounded-lg hover:bg-opacity-90"
                    >
                        {t("common.retry", "Try Again")}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme">
                {t("profile.myInformation.title", "My Information")}
            </h2>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-700 dark:text-red-400">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-greytheme dark:text-textdarktheme mb-1">
                                {t("profile.myInformation.firstName", "First Name")}
                            </label>
                            <input
                                type="text"
                                {...register("first_name", {
                                    required: t("profile.myInformation.firstNameRequired", "First name is required"),
                                    minLength: { value: 2, message: t("profile.myInformation.firstNameMinLength", "Name must be at least 2 characters") },
                                })}
                                readOnly={!isEditing}
                                className={`w-full p-3 border ${errors.first_name ? "border-redtheme" : "border-softgreytheme dark:border-darkthemeitems"} 
                                    rounded-lg bg-whitetheme dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme
                                    ${!isEditing ? "cursor-default" : ""}
                                    ${isEditing ? "focus:border-greentheme focus:ring-1 focus:ring-greentheme outline-none" : ""}`}
                            />
                            {errors.first_name && <p className="mt-1 text-sm text-redtheme">{errors.first_name.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-greytheme dark:text-textdarktheme mb-1">
                                {t("profile.myInformation.lastName", "Last Name")}
                            </label>
                            <input
                                type="text"
                                {...register("last_name", {
                                    required: t("profile.myInformation.lastNameRequired", "Last name is required"),
                                    minLength: { value: 2, message: t("profile.myInformation.lastNameMinLength", "Name must be at least 2 characters") },
                                })}
                                readOnly={!isEditing}
                                className={`w-full p-3 border ${errors.last_name ? "border-redtheme" : "border-softgreytheme dark:border-darkthemeitems"} 
                                    rounded-lg bg-whitetheme dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme
                                    ${!isEditing ? "cursor-default" : ""}
                                    ${isEditing ? "focus:border-greentheme focus:ring-1 focus:ring-greentheme outline-none" : ""}`}
                            />
                            {errors.last_name && <p className="mt-1 text-sm text-redtheme">{errors.last_name.message}</p>}
                        </div>

                        {/* <div>
                            <label className="block text-sm font-medium text-greytheme dark:text-textdarktheme mb-1">
                                {t("profile.myInformation.username", "Username")}
                            </label>
                            <input
                                type="text"
                                {...register("username", {
                                    required: t("profile.myInformation.usernameRequired", "Username is required"),
                                    minLength: { value: 3, message: t("profile.myInformation.usernameMinLength", "Username must be at least 3 characters") },
                                })}
                                readOnly={!isEditing}
                                className={`w-full p-3 border ${errors.username ? "border-redtheme" : "border-softgreytheme dark:border-darkthemeitems"} 
                                    rounded-lg bg-whitetheme dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme
                                    ${!isEditing ? "cursor-default" : ""}
                                    ${isEditing ? "focus:border-greentheme focus:ring-1 focus:ring-greentheme outline-none" : ""}`}
                            />
                            {errors.username && <p className="mt-1 text-sm text-redtheme">{errors.username.message}</p>}
                        </div> */}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-greytheme dark:text-textdarktheme mb-1">
                                {t("profile.myInformation.email", "Email Address")}
                            </label>
                            <input
                                type="email"
                                {...register("email", {
                                    required: t("profile.myInformation.emailRequired", "Email is required"),
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: t("profile.myInformation.emailInvalid", "Invalid email address"),
                                    },
                                })}
                                readOnly={!isEditing}
                                className={`w-full p-3 border ${errors.email ? "border-redtheme" : "border-softgreytheme dark:border-darkthemeitems"} 
                                    rounded-lg bg-whitetheme dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme
                                    ${!isEditing ? "cursor-default" : ""}
                                    ${isEditing ? "focus:border-greentheme focus:ring-1 focus:ring-greentheme outline-none" : ""}`}
                            />
                            {errors.email && <p className="mt-1 text-sm text-redtheme">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-greytheme dark:text-textdarktheme mb-1">
                                {t("profile.myInformation.phone", "Phone Number")}
                            </label>
                            <input
                                type="tel"
                                {...register("phone", {
                                    pattern: {
                                        value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,3}[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,4}$/,
                                        message: t("profile.myInformation.phoneInvalid", "Invalid phone number format"),
                                    },
                                })}
                                readOnly={!isEditing}
                                className={`w-full p-3 border ${errors.phone ? "border-redtheme" : "border-softgreytheme dark:border-darkthemeitems"} 
                                    rounded-lg bg-whitetheme dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme
                                    ${!isEditing ? "cursor-default" : ""}
                                    ${isEditing ? "focus:border-greentheme focus:ring-1 focus:ring-greentheme outline-none" : ""}`}
                            />
                            {errors.phone && <p className="mt-1 text-sm text-redtheme">{errors.phone.message}</p>}
                        </div>
{/* 
                        <div>
                            <label className="block text-sm font-medium text-greytheme dark:text-textdarktheme mb-1">
                                {t("profile.myInformation.joinedDate", "Member Since")}
                            </label>
                            <input
                                type="text"
                                value={userData?.id ? new Date().toLocaleDateString() : ""}
                                readOnly={true}
                                className="w-full p-3 border border-softgreytheme dark:border-darkthemeitems 
                                    rounded-lg bg-softgreytheme dark:bg-darkthemeitems text-blacktheme dark:text-textdarktheme cursor-default"
                            />
                        </div> */}
                    </div>
                </div>

                <div className="pt-6 flex gap-3">
                    {!isEditing ? (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="px-6 py-3 bg-greentheme text-whitetheme rounded-lg hover:bg-opacity-90 transition-colors duration-200"
                        >
                            {t("profile.myInformation.editButton", "Edit Information")}
                        </button>
                    ) : (
                        <>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-3 bg-greentheme text-whitetheme rounded-lg hover:bg-opacity-90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {saving && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                )}
                                {t("profile.myInformation.saveButton", "Save Changes")}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={saving}
                                className="px-6 py-3 bg-softgreytheme dark:bg-darkthemeitems text-blacktheme dark:text-textdarktheme rounded-lg hover:bg-opacity-90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {t("profile.myInformation.cancelButton", "Cancel")}
                            </button>
                        </>
                    )}
                </div>
            </form>
        </div>
    )
}
