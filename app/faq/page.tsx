"use client"
import { useState, useEffect } from "react"
import { ChevronDown } from 'lucide-react'
import Link from "next/link"
import { t } from "i18next";

interface FAQItem {
  question: string
  answer: string
}

export default function FAQPage() {
  const [openItem, setOpenItem] = useState<number | null>(null)

  useEffect(() => {
    document.title = "FAQ - Tabla | Taste Morocco's Best";
  }, []);

  const toggleItem = (index: number) => {
    setOpenItem(openItem === index ? null : index)
  }

  const faqItems: FAQItem[] = [
    {
      question: "How do I make a reservation?",
      answer:
        "You can make a reservation directly through our website by selecting a restaurant, choosing your preferred date and time, and entering the number of guests. Alternatively, you can use the mobile app for a seamless booking experience. If you prefer, you can also contact the restaurant directly by phone.",
    },
    {
      question: "Can I modify or cancel my reservation?",
      answer:
        "Yes, you can modify or cancel your reservation up to 2 hours before the scheduled time without any penalty. Simply log in to your account, go to 'My Reservations', and select the booking you wish to change. For last-minute changes, we recommend contacting the restaurant directly.",
    },
    {
      question: "Is there a fee for using the reservation service?",
      answer:
        "No, our reservation service is completely free for diners. We believe in providing a seamless dining experience without any additional costs to you.",
    },
    {
      question: "How can I leave a review for a restaurant?",
      answer:
        "After dining at a restaurant you've booked through our platform, you'll receive an email invitation to leave a review. Alternatively, you can visit the restaurant's page on our website or app, scroll down to the reviews section, and click on 'Write a Review'. We encourage honest, detailed feedback to help other diners make informed choices.",
    },
    {
      question: "What happens if the restaurant cancels my reservation?",
      answer:
        "If a restaurant needs to cancel your reservation, you'll be notified immediately via email and text message. Our customer service team will also reach out to help you find an alternative restaurant if needed. In some cases, we may offer a dining credit as compensation for the inconvenience.",
    },
    {
      question: "Are there any loyalty rewards for frequent bookings?",
      answer:
        "Yes! Our loyalty program rewards you for dining out. You earn points for each reservation you honor, which can be redeemed for dining credits, exclusive experiences, or partner offers. Check the 'Rewards' section in your profile to see your current points balance and available rewards.",
    },
    {
      question: "How do I report an issue with my dining experience?",
      answer:
        "We take your dining experience seriously. If you encounter any issues, please contact our customer support team through the 'Help' section in the app or website, or email us at support@example.com. Please provide details about your reservation and the issue so we can address it promptly.",
    },
    {
      question: "Can I make special requests for my reservation?",
      answer:
        "During the reservation process, you'll find a 'Special Requests' field where you can note any preferences or requirements. While restaurants will try their best to accommodate these requests, please understand they cannot always be guaranteed, especially during peak hours.",
    },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 bg-whitetheme dark:bg-bgdarktheme min-h-screen">
      <h1 className="text-3xl font-bold text-blacktheme dark:text-textdarktheme mb-8">{t("faq.title")}</h1>
      
      <div className="space-y-4">
        {faqItems.map((item, index) => (
          <div 
            key={index} 
            className="border border-softgreytheme dark:border-darkthemeitems rounded-lg overflow-hidden bg-white dark:bg-darkthemeitems transition-colors"
          >
            <button
              onClick={() => toggleItem(index)}
              className="flex justify-between items-center w-full p-4 text-left focus:outline-none focus:ring-2 focus:ring-greentheme"
              aria-expanded={openItem === index}
            >
              <span className="font-medium text-blacktheme dark:text-textdarktheme">{item.question}</span>
              <ChevronDown 
                className={`w-5 h-5 text-greentheme transition-transform ${openItem === index ? 'transform rotate-180' : ''}`} 
              />
            </button>
            
            <div 
              className={`overflow-hidden transition-all duration-300 ${
                openItem === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="p-4 pt-0 text-gray-600 dark:text-gray-300 border-t border-softgreytheme dark:border-darkthemeitems">
                {item.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 p-6 bg-softgreentheme dark:bg-greentheme/10 rounded-lg">
        <h2 className="text-xl font-semibold text-greentheme mb-4">{t("faq.stillHaveQuestions")}</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {t("faq.contactUs")}
        </p>
        <Link href="/contact" className="px-6 py-2 bg-greentheme text-white rounded-lg hover:bg-opacity-90 transition-colors">
          {t("faq.contactSupport")}
        </Link>
      </div>
    </div>
  )
}
