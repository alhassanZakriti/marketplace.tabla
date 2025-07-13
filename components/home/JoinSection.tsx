import { ArrowRight } from "lucide-react"
import RestaurantImage from "../../public/restaurant-owner.jpg"
import Image from "next/image"
import Link from "next/link"

function JoinSection() {
  return (
    <section className="w-full px-4 py-16 md:py-24 lg:py-32">
      <div className="container mx-auto max-w-7xl">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-greentheme dark:text-white mb-8 md:mb-12">
          Are you a restaurant owner?
        </h2>

        <div className="bg-white dark:bg-bgdarktheme2 rounded-2xl shadow-lg overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center">
            {/* Image container - hidden on mobile, visible on lg screens */}
            <div className="hidden lg:block lg:w-1/2 p-6">
              <Image
                src={RestaurantImage || "/placeholder.svg"}
                className="w-full h-[400px] object-cover rounded-xl"
                alt="Restaurant owner using Tabla platform"
              />
            </div>

            {/* Content container */}
            <div className="w-full lg:w-1/2 p-6 md:p-8 lg:p-10">
              <div className="max-w-lg mx-auto lg:mx-0">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Tabla For Business Owners
                </h3>

                <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg mb-8">
                  Join Tabla and get more customers for your restaurant. Our platform helps you increase visibility and
                  connect with hungry diners in your area.
                </p>

                <Link href="https://restaurant.tabla.ma/" className="btn-primary inline-flex items-center" target="_blank">
                  Join Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default JoinSection
