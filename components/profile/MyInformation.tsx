"use client"

import type React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "next-i18next"

type UserInformation = {
    fullName: string
    email: string
    phone: string
    address: string
    memberSince: string
}

export const MyInformation: React.FC = () => {
    const { t } = useTranslation()
    const [isEditing, setIsEditing] = useState(false)

    // Sample user data
    const userData: UserInformation = {
        fullName: "John Doe",
        email: "john.doe@example.com",
        phone: "+1 (555) 123-4567",
        address: "123 Main Street, Apt 4B, New York, NY 10001",
        memberSince: "January 15, 2023",
    }

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<UserInformation>({
        defaultValues: userData,
    })

    const onSubmit = (data: UserInformation) => {
        console.log("Form submitted with data:", data)
        setIsEditing(false)
    }

    const handleCancel = () => {
        reset(userData)
        setIsEditing(false)
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme">
                {t("profile.myInformation.title", "My Information")}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-greytheme dark:text-textdarktheme mb-1">
                                {t("profile.myInformation.fullName", "Full Name")}
                            </label>
                            <input
                                type="text"
                                {...register("fullName", {
                                    required: t("myInformation.fullNameRequired", "Full name is required"),
                                    minLength: { value: 2, message: t("profile.myInformation.fullNameMinLength", "Name must be at least 2 characters") },
                                })}
                                readOnly={!isEditing}
                                className={`w-full p-3 border ${errors.fullName ? "border-redtheme" : "border-softgreytheme dark:border-darkthemeitems"} 
                                    rounded-lg bg-whitetheme dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme
                                    ${!isEditing ? "cursor-default" : ""}
                                    ${isEditing ? "focus:border-greentheme focus:ring-1 focus:ring-greentheme outline-none" : ""}`}
                            />
                            {errors.fullName && <p className="mt-1 text-sm text-redtheme">{errors.fullName.message}</p>}
                        </div>

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
                                    required: t("profile.myInformation.phoneRequired", "Phone number is required"),
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
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-greytheme dark:text-textdarktheme mb-1">
                                {t("profile.myInformation.address", "Address")}
                            </label>
                            <textarea
                                {...register("address", {
                                    required: t("profile.myInformation.addressRequired", "Address is required"),
                                    minLength: { value: 10, message: t("profile.myInformation.addressMinLength", "Please enter a complete address") },
                                })}
                                readOnly={!isEditing}
                                className={`w-full p-3 border ${errors.address ? "border-redtheme" : "border-softgreytheme dark:border-darkthemeitems"} 
                                    rounded-lg bg-whitetheme dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme resize-none h-32
                                    ${!isEditing ? "cursor-default" : ""}
                                    ${isEditing ? "focus:border-greentheme focus:ring-1 focus:ring-greentheme outline-none" : ""}`}
                            />
                            {errors.address && <p className="mt-1 text-sm text-redtheme">{errors.address.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-greytheme dark:text-textdarktheme mb-1">
                                {t("profile.myInformation.memberSince", "Member Since")}
                            </label>
                            <input
                                type="text"
                                {...register("memberSince")}
                                readOnly={true}
                                className="w-full p-3 border border-softgreytheme dark:border-darkthemeitems 
                                    rounded-lg bg-softgreytheme dark:bg-darkthemeitems text-blacktheme dark:text-textdarktheme cursor-default"
                            />
                        </div>
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
                                className="px-6 py-3 bg-greentheme text-whitetheme rounded-lg hover:bg-opacity-90 transition-colors duration-200"
                            >
                                {t("profile.myInformation.saveButton", "Save Changes")}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-3 bg-softgreytheme dark:bg-darkthemeitems text-blacktheme dark:text-textdarktheme rounded-lg hover:bg-opacity-90 transition-colors duration-200"
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
