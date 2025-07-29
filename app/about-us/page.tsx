
"use client"

import { Metadata } from "next";
import { useTranslation } from "react-i18next";

export default function AboutUsPage() {

  const {t} = useTranslation();

    return (
      <div className="bg-whitetheme dark:bg-bgdarktheme min-h-screen">
        {/* Hero Section */}
        <section className="relative h-80 md:h-96 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-greentheme/80 to-greentheme/40 z-10"></div>
          <div className="absolute inset-0 bg-gray-900/30 dark:bg-gray-900/50 z-10"></div>
          <div className="relative h-full w-full bg-gray-200 dark:bg-gray-700">
            {/* Replace with your actual image */}
            <img
              src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Restaurant dining experience"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 flex items-center z-20">
            <div className="container mx-auto px-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t("about.title")}</h1>
              <p className="text-xl text-white/90 max-w-2xl">
                {t("about.description")}
              </p>
            </div>
          </div>
        </section>
  
        {/* Our Story */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-blacktheme dark:text-textdarktheme mb-8 text-center">Our Story</h2>
  
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Founded in 2018, [Your Restaurant Booking Platform] was born from a simple idea: make discovering and
                  booking great restaurants effortless. Our founders, passionate food enthusiasts themselves, recognized
                  the challenges diners faced when trying to find and secure tables at quality restaurants.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  What began as a small startup with just a handful of partner restaurants in one city has grown into a
                  comprehensive platform connecting diners with thousands of restaurants across the country. Our journey
                  has been guided by our commitment to enhancing the dining experience from discovery to reservation.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Today, we're proud to help millions of diners discover new culinary experiences while supporting
                  restaurants in filling their tables and delighting their guests.
                </p>
              </div>
  
              <div className="relative h-80 rounded-lg overflow-hidden shadow-lg">
                {/* Replace with your actual image */}
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Our founding team"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
  
        {/* Our Mission */}
        <section className="py-16 px-4 bg-softgreentheme dark:bg-greentheme/10">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-blacktheme dark:text-textdarktheme mb-6">Our Mission</h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              To connect people with exceptional dining experiences by making restaurant discovery and reservations
              simple, reliable, and enjoyable.
            </p>
  
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="bg-white dark:bg-darkthemeitems p-6 rounded-lg shadow-md">
                <div className="w-16 h-16 bg-greentheme rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-blacktheme dark:text-textdarktheme mb-2">Discover</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We help diners discover new restaurants that match their preferences, dietary needs, and occasions.
                </p>
              </div>
  
              <div className="bg-white dark:bg-darkthemeitems p-6 rounded-lg shadow-md">
                <div className="w-16 h-16 bg-greentheme rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-blacktheme dark:text-textdarktheme mb-2">Connect</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We connect diners with restaurants through our seamless reservation platform, ensuring tables are ready
                  when you arrive.
                </p>
              </div>
  
              <div className="bg-white dark:bg-darkthemeitems p-6 rounded-lg shadow-md">
                <div className="w-16 h-16 bg-greentheme rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-blacktheme dark:text-textdarktheme mb-2">Enhance</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We enhance the dining experience through personalized recommendations, special offers, and a trusted
                  review system.
                </p>
              </div>
            </div>
          </div>
        </section>
  
        {/* Our Team */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-blacktheme dark:text-textdarktheme mb-8 text-center">
              Our Leadership Team
            </h2>
  
            <div className="grid md:grid-cols-3 gap-8">
              {/* Team Member 1 */}
              <div className="text-center">
                <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden mb-4">
                  <img src="/placeholder.svg?height=200&width=200" alt="CEO" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme">Sarah Johnson</h3>
                <p className="text-greentheme mb-2">CEO & Co-Founder</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Former restaurant manager with a passion for connecting people through food.
                </p>
              </div>
  
              {/* Team Member 2 */}
              <div className="text-center">
                <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden mb-4">
                  <img src="/placeholder.svg?height=200&width=200" alt="CTO" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme">Michael Chen</h3>
                <p className="text-greentheme mb-2">CTO & Co-Founder</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Tech innovator with expertise in creating seamless digital experiences.
                </p>
              </div>
  
              {/* Team Member 3 */}
              <div className="text-center">
                <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden mb-4">
                  <img src="/placeholder.svg?height=200&width=200" alt="COO" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme">David Rodriguez</h3>
                <p className="text-greentheme mb-2">COO</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Operations expert with over 15 years in the hospitality industry.
                </p>
              </div>
            </div>
          </div>
        </section>
  
        {/* Our Impact */}
        <section className="py-16 px-4 bg-softgreentheme dark:bg-greentheme/10">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-blacktheme dark:text-textdarktheme mb-8">Our Impact</h2>
  
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-bold text-greentheme mb-2">5M+</div>
                <p className="text-gray-700 dark:text-gray-300">Diners Served</p>
              </div>
  
              <div>
                <div className="text-4xl font-bold text-greentheme mb-2">10K+</div>
                <p className="text-gray-700 dark:text-gray-300">Restaurant Partners</p>
              </div>
  
              <div>
                <div className="text-4xl font-bold text-greentheme mb-2">200+</div>
                <p className="text-gray-700 dark:text-gray-300">Cities Covered</p>
              </div>
            </div>
          </div>
        </section>
  
        {/* Contact Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-blacktheme dark:text-textdarktheme mb-8 text-center">Get In Touch</h2>
  
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme mb-4">
                  Contact Information
                </h3>
  
                <div className="space-y-4">
                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-greentheme mr-3 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div>
                      <p className="font-medium text-blacktheme dark:text-textdarktheme">Address</p>
                      <p className="text-gray-600 dark:text-gray-300">
                        123 Main Street, Suite 456
                        <br />
                        San Francisco, CA 94105
                      </p>
                    </div>
                  </div>
  
                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-greentheme mr-3 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <p className="font-medium text-blacktheme dark:text-textdarktheme">Email</p>
                      <p className="text-gray-600 dark:text-gray-300">info@example.com</p>
                    </div>
                  </div>
  
                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-greentheme mr-3 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <div>
                      <p className="font-medium text-blacktheme dark:text-textdarktheme">Phone</p>
                      <p className="text-gray-600 dark:text-gray-300">(123) 456-7890</p>
                    </div>
                  </div>
                </div>
  
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme mb-4">Follow Us</h3>
                  <div className="flex space-x-4">
                    <a
                      href="#"
                      className="w-10 h-10 rounded-full bg-greentheme flex items-center justify-center text-white hover:bg-opacity-90 transition-colors"
                    >
                      <span className="sr-only">Facebook</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fillRule="evenodd"
                          d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 rounded-full bg-greentheme flex items-center justify-center text-white hover:bg-opacity-90 transition-colors"
                    >
                      <span className="sr-only">Twitter</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 rounded-full bg-greentheme flex items-center justify-center text-white hover:bg-opacity-90 transition-colors"
                    >
                      <span className="sr-only">Instagram</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fillRule="evenodd"
                          d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
  
              <div>
                <h3 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme mb-4">Send Us a Message</h3>
  
                <form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full p-3 border border-softgreytheme dark:border-darkthemeitems rounded-lg bg-white dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme focus:ring-2 focus:ring-greentheme focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>
  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full p-3 border border-softgreytheme dark:border-darkthemeitems rounded-lg bg-white dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme focus:ring-2 focus:ring-greentheme focus:border-transparent"
                      placeholder="Your email"
                    />
                  </div>
  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full p-3 border border-softgreytheme dark:border-darkthemeitems rounded-lg bg-white dark:bg-bgdarktheme2 text-blacktheme dark:text-textdarktheme focus:ring-2 focus:ring-greentheme focus:border-transparent resize-none"
                      placeholder="Your message"
                    ></textarea>
                  </div>
  
                  <button
                    type="submit"
                    className="px-6 py-3 bg-greentheme text-white rounded-lg hover:bg-opacity-90 transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }
  