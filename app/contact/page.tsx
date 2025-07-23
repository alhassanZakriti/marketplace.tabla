"use client"
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

type FormData = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const subjects = [
  "General Inquiry",
  "Reservation Issue",
  "Feedback",
  "Partnership",
  "Technical Support",
];

export default function ContactPage() {

    const { t } = useTranslation();

    useEffect(() => {
        document.title = "Contact Us - Tabla | Taste Morocco's Best"
      }, [])
    
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Log form data (replace with your actual API call)
      console.log("Form submitted:", data);
      
      // Reset form and show success message
      reset();
      setIsSubmitted(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (err) {
      setError("An error occurred while submitting the form. Please try again.");
      console.error("Form submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
        <div className="w-full max-w-3xl  mx-auto p-6 bg-white dark:bg-bgdarktheme2 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-textdarktheme mb-2">{t("contact.title")}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t("contact.description")}
            </p>

            {isSubmitted ? (
                <div className="bg-softgreentheme dark:bg-greentheme/20 text-greentheme p-4 rounded-md mb-6">
                <div className="flex items-center">
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span className="font-medium">Thank you for your message!</span>
                </div>
                <p className="mt-2 text-sm">We've received your inquiry and will respond shortly.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                    <div className="bg-softredtheme dark:bg-redtheme/20 text-redtheme p-4 rounded-md">
                    <div className="flex items-center">
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <span className="font-medium">{error}</span>
                    </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name Field */}
                    <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-textdarktheme mb-1">
                        {t("contact.form.name")} <span className="text-redtheme">*</span>
                    </label>
                    <input
                        id="name"
                        type="text"
                        className={`w-full p-3 border ${
                        errors.name ? "border-redtheme" : "border-gray-300 dark:border-darkthemeitems"
                        } rounded-lg focus:ring-2 focus:ring-greentheme focus:outline-none dark:bg-darkthemeitems dark:text-textdarktheme`}
                        placeholder={t("contact.placeholders.name", "Enter your name")}
                        {...register("name", { required: "Name is required" })}
                        aria-invalid={errors.name ? "true" : "false"}
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-redtheme">{errors.name.message}</p>
                    )}
                    </div>

                    {/* Email Field */}
                    <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-textdarktheme mb-1">
                        {t("contact.form.email")} <span className="text-redtheme">*</span>
                    </label>
                    <input
                        id="email"
                        type="email"
                        className={`w-full p-3 border ${
                        errors.email ? "border-redtheme" : "border-gray-300 dark:border-darkthemeitems"
                        } rounded-lg focus:ring-2 focus:ring-greentheme focus:outline-none dark:bg-darkthemeitems dark:text-textdarktheme`}
                        placeholder={t("contact.placeholders.email", "Enter your email")}
                        {...register("email", {
                        required: "Email is required",
                        pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                        },
                        })}
                        aria-invalid={errors.email ? "true" : "false"}
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-redtheme">{errors.email.message}</p>
                    )}
                    </div>

                    {/* Phone Field (Optional) */}
                    <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-textdarktheme mb-1">
                        {t("contact.form.phone")} <span className="text-gray-500 dark:text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                        id="phone"
                        type="tel"
                        className="w-full p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg focus:ring-2 focus:ring-greentheme focus:outline-none dark:bg-darkthemeitems dark:text-textdarktheme"
                        placeholder={t("contact.placeholders.phone", "+1 (123) 456-7890")}
                        {...register("phone")}
                    />
                    </div>

                    {/* Subject Field */}
                    <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-textdarktheme mb-1">
                        {t("contact.form.subject")} <span className="text-redtheme">*</span>
                    </label>
                    <select
                        id="subject"
                        className={`w-full p-3 border ${
                        errors.subject ? "border-redtheme" : "border-gray-300 dark:border-darkthemeitems"
                        } rounded-lg focus:ring-2 focus:ring-greentheme focus:outline-none dark:bg-darkthemeitems dark:text-textdarktheme`}
                        {...register("subject", { required: "Please select a subject" })}
                        aria-invalid={errors.subject ? "true" : "false"}
                    >
                        <option value="">{t("contact.placeholders.subject", "Select a subject")}</option>
                        {subjects.map((subject) => (
                        <option key={subject} value={subject}>
                            {subject}
                        </option>
                        ))}
                    </select>
                    {errors.subject && (
                        <p className="mt-1 text-sm text-redtheme">{errors.subject.message}</p>
                    )}
                    </div>
                </div>

                {/* Message Field */}
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-textdarktheme mb-1">
                    {t("contact.form.message")} <span className="text-redtheme">*</span>
                    </label>
                    <textarea
                    id="message"
                    rows={5}
                    className={`w-full p-3 border ${
                        errors.message ? "border-redtheme" : "border-gray-300 dark:border-darkthemeitems"
                    } rounded-lg focus:ring-2 focus:ring-greentheme focus:outline-none dark:bg-darkthemeitems dark:text-textdarktheme`}
                    placeholder={t("contact.placeholders.message", "How can we help you?")}
                    {...register("message", {
                        required: "Message is required",
                        minLength: {
                        value: 10,
                        message: "Message must be at least 10 characters",
                        },
                    })}
                    aria-invalid={errors.message ? "true" : "false"}
                    ></textarea>
                    {errors.message && (
                    <p className="mt-1 text-sm text-redtheme">{errors.message.message}</p>
                    )}
                </div>

                <div className="flex justify-end">
                    <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-greentheme hover:bg-greentheme/90 text-white rounded-md transition-colors flex items-center justify-center disabled:opacity-70"
                    >
                    {isSubmitting ? (
                        <>
                        <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            ></circle>
                            <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        {t("contact.form.sending", "Sending...")}
                        </>
                    ) : (
                        t("contact.form.submit", "Send Message")
                    )}
                    </button>
                </div>
                </form>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-darkthemeitems">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-textdarktheme mb-4">Other Ways to Reach Us</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-softgreentheme dark:bg-greentheme/20 flex items-center justify-center text-greentheme">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    </div>
                    <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-textdarktheme">{t("contact.phone")}</h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">+1 (555) 123-4567</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">Mon-Fri from 8am to 6pm</p>
                    </div>
                </div>
                
                <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-softgreentheme dark:bg-greentheme/20 flex items-center justify-center text-greentheme">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    </div>
                    <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-textdarktheme">{t("contact.email")}</h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">support@restaurant.com</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">We'll respond as soon as possible</p>
                    </div>
                </div>
                
                <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-softgreentheme dark:bg-greentheme/20 flex items-center justify-center text-greentheme">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    </div>
                    <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-textdarktheme">{t("contact.address")}</h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">123 Restaurant Street</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">New York, NY 10001</p>
                    </div>
                </div>
                
                <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-softgreentheme dark:bg-greentheme/20 flex items-center justify-center text-greentheme">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    </div>
                    <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-textdarktheme">{t("contact.hours")}</h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Mon-Sat: 11am - 10pm</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">Sunday: 12pm - 9pm</p>
                    </div>
                </div>
                </div>
            </div>
        </div>
    </div>
  );
}

