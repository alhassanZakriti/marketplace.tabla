import { Metadata } from "next"

export const metadata:Metadata = {
  title: "Terms and Conditions - Tabla | Taste Morocco's Best",
  description: "Read our terms and conditions for using Tabla, your go-to platform for restaurant bookings in Morocco. Learn about our policies and user agreement.",
}

export default function TermsAndConditionsPage() {

    return (
      <div className="max-w-4xl mx-auto px-4 py-12 bg-whitetheme dark:bg-bgdarktheme min-h-screen">
        <h1 className="text-3xl font-bold text-blacktheme dark:text-textdarktheme mb-8">Terms and Conditions</h1>
        
        <div className="prose prose-green dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Last Updated: April 18, 2024</p>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme mb-4">1. Introduction</h2>
            <p>
              Welcome to [Your Restaurant Booking Platform] ("we," "our," or "us"). By accessing or using our website, mobile applications, or any other services we offer (collectively, the "Services"), you agree to be bound by these Terms and Conditions ("Terms"). Please read these Terms carefully before using our Services.
            </p>
            <p className="mt-4">
              By accessing or using our Services, you confirm that you accept these Terms and agree to comply with them. If you do not agree with these Terms, you must not use our Services.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme mb-4">2. Definitions</h2>
            <p>In these Terms, the following definitions apply:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>"User," "you," and "your" refer to the individual or entity accessing or using our Services.</li>
              <li>"Restaurant" refers to any dining establishment listed on our platform.</li>
              <li>"Reservation" refers to a booking made through our Services for a table at a Restaurant.</li>
              <li>"Content" refers to all information, text, images, data, links, software, or other material that we or our users provide or make available through the Services.</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme mb-4">3. Account Registration</h2>
            <p>
              To use certain features of our Services, you may need to register for an account. When you register, you agree to provide accurate, current, and complete information about yourself and to update this information to keep it accurate, current, and complete.
            </p>
            <p className="mt-4">
              You are responsible for safeguarding your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.
            </p>
            <p className="mt-4">
              We reserve the right to disable any user account at any time if, in our opinion, you have failed to comply with these Terms or if we suspect fraudulent or abusive activity.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme mb-4">4. Reservations</h2>
            <p>
              Our Services allow you to make Reservations at participating Restaurants. By making a Reservation, you agree to arrive at the Restaurant at the scheduled time and with the number of guests specified in your Reservation.
            </p>
            <p className="mt-4">
              If you need to modify or cancel a Reservation, please do so as early as possible, and in accordance with the cancellation policy of the specific Restaurant. Repeated no-shows or late cancellations may result in restrictions on your ability to use our Services.
            </p>
            <p className="mt-4">
              We do not guarantee that all Restaurants will honor all Reservations made through our Services. While we strive to maintain accurate information, we are not responsible for any Restaurant's failure to honor a Reservation or for any other actions of the Restaurants.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme mb-4">5. User Conduct</h2>
            <p>When using our Services, you agree not to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Violate any applicable laws or regulations.</li>
              <li>Infringe the rights of others, including privacy and intellectual property rights.</li>
              <li>Use our Services to send unsolicited communications, promotions, or advertisements.</li>
              <li>Impersonate any person or entity or falsely state or misrepresent your affiliation with a person or entity.</li>
              <li>Interfere with or disrupt the operation of our Services or the servers or networks used to make our Services available.</li>
              <li>Attempt to gain unauthorized access to any portion of our Services or any other accounts, computer systems, or networks connected to our Services.</li>
              <li>Use any automated means to access or use our Services.</li>
              <li>Transmit any viruses, worms, defects, Trojan horses, or other items of a destructive nature.</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme mb-4">6. Reviews and User Content</h2>
            <p>
              Our Services may allow you to post reviews, comments, and other content. You retain ownership of any intellectual property rights you hold in that content, but you grant us a worldwide, royalty-free, non-exclusive, perpetual, irrevocable license to use, copy, modify, create derivative works from, distribute, publicly display, and sublicense such content.
            </p>
            <p className="mt-4">
              You are solely responsible for any content you post and its accuracy. We reserve the right to remove any content that we determine, in our sole discretion, violates these Terms or is otherwise objectionable.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme mb-4">7. Intellectual Property</h2>
            <p>
              Our Services and all content and materials included on our Services, such as text, graphics, logos, images, and software, are owned by us or our licensors and are protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p className="mt-4">
              You may not reproduce, distribute, modify, create derivative works from, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Services without our prior written consent.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme mb-4">8. Disclaimer of Warranties</h2>
            <p>
              OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p className="mt-4">
              WE DO NOT WARRANT THAT OUR SERVICES WILL BE UNINTERRUPTED OR ERROR-FREE, THAT DEFECTS WILL BE CORRECTED, OR THAT OUR SERVICES OR THE SERVERS THAT MAKE THEM AVAILABLE ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme mb-4">9. Limitation of Liability</h2>
            <p>
              TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT WILL WE, OUR AFFILIATES, OR THEIR LICENSORS, SERVICE PROVIDERS, EMPLOYEES, AGENTS, OFFICERS, OR DIRECTORS BE LIABLE FOR DAMAGES OF ANY KIND, UNDER ANY LEGAL THEORY, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OR INABILITY TO USE OUR SERVICES, INCLUDING ANY DIRECT, INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme mb-4">10. Changes to These Terms</h2>
            <p>
              We may revise these Terms from time to time. The most current version will always be posted on our website. If a revision, in our sole discretion, is material, we will notify you via email or through our Services. By continuing to access or use our Services after revisions become effective, you agree to be bound by the revised Terms.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme mb-4">11. Governing Law</h2>
            <p>
              These Terms and your use of our Services will be governed by and construed in accordance with the laws of [Your Jurisdiction], without giving effect to any principles of conflicts of law.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme mb-4">12. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="mt-2">
              Email: legal@example.com<br />
              Address: 123 Main Street, City, State, ZIP
            </p>
          </section>
        </div>
      </div>
    )
  }
  