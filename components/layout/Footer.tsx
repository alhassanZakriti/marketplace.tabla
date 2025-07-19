'use client'
import Logo from './Logo';
import AuthPopup from '../auth/AuthPopup';
import { Facebook, Instagram, Linkedin, Mail, Phone, Twitter } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [authResult, setAuthResult] = useState<any>(null)
  const { t } = useTranslation();

  const handleSuccess = (data: any) => {
    console.log("Authentication successful:", data)
    setAuthResult(data)
  }

  return (
  <footer className="bg-bgdarktheme2 text-gray-100 pt-12 pb-8 px-4 sm:px-6 lg:px-8">
    <AuthPopup authMode='signup' isOpen={isOpen} onClose={() => setIsOpen(false)} onSuccess={handleSuccess} />
    <div className="max-w-7xl mx-auto">
    {/* Top Section */}
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
      {/* Brand Info */}
      <div className="space-y-4">
      <Logo className="horizontal"  />
      <p className="text-gray-400">
        {t('footer.brandDescription', 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.')}
      </p>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
        <Mail className="text-gray-400" />
        <a href="mailto:support@tabla.ma" className="text-gray-400 hover:text-white transition">
          {t('footer.email', 'support@tabla.ma')}
        </a>
        </div>
        <div className="flex items-center space-x-2">
        <Phone className="text-gray-400" />
        <a href="tel:+2125585474758" className="text-gray-400 hover:text-white transition">
          {t('footer.phone', '+212 (558) 547 4758')}
        </a>
        </div>
      </div>
      </div>

      {/* Quick Links */}
      <div>
      <h3 className="text-lg font-semibold text-white mb-4">{t('footer.quickLinks', 'Quick Links')}</h3>
      <ul className="space-y-2">
        <li><a href="/search" className="text-gray-400 hover:text-white transition">{t('footer.restaurants', 'Restaurants')}</a></li>
        <li><a href="https://restaurant.tabla.ma/" target='_blank' className="text-gray-400 hover:text-white transition">{t('footer.registerRestaurant', 'Register your restaurant')}</a></li>
        <li><button onClick={()=>{setIsOpen(true)}} className="text-gray-400 hover:text-white transition">{t('footer.createAccount', 'Create an account')}</button></li>
      </ul>
      </div>

      {/* About */}
      <div>
      <h3 className="text-lg font-semibold text-white mb-4">{t('footer.about', 'About')}</h3>
      <ul className="space-y-2">
        <li><a href="/about-us" className="text-gray-400 hover:text-white transition">{t('footer.aboutUs', 'About us')}</a></li>
        <li><a href="/terms-conditions" className="text-gray-400 hover:text-white transition">{t('footer.terms', 'Terms & Conditions')}</a></li>
        <li><a href="/privacy-policy" className="text-gray-400 hover:text-white transition">{t('footer.privacy', 'Privacy Policy')}</a></li>
      </ul>
      </div>

      {/* Navigation */}
      <div>
      <h3 className="text-lg font-semibold text-white mb-4">{t('footer.navigation', 'Navigation')}</h3>
      <ul className="space-y-2">
        <li><a href="/" className="text-gray-400 hover:text-white transition">{t('footer.home', 'Home')}</a></li>
        <li><a href="/about-us" className="text-gray-400 hover:text-white transition">{t('footer.aboutUs', 'About us')}</a></li>
        <li><a href="/contact" className="text-gray-400 hover:text-white transition">{t('footer.contactUs', 'Contact us')}</a></li>
        <li><a href="/faq" className="text-gray-400 hover:text-white transition">{t('footer.faq', 'FAQ')}</a></li>
      </ul>
      </div>
    </div>

    {/* Divider */}
    <div className="border-t border-gray-800 my-6"></div>

    {/* Bottom Section */}
    <div className="flex flex-col md:flex-row justify-between items-center">
      <div className="text-gray-500 text-sm mb-4 md:mb-0">
      {t('footer.rights', 'All rights reserved by TABLA.MA')} | {new Date().getFullYear()}©
      </div>
      
      <div className="flex space-x-4">
      <a href="#" className="text-gray-400 hover:text-white transition" aria-label={t('footer.facebook', 'Facebook')}>
        <Facebook size={20} />
      </a>
      <a href="#" className="text-gray-400 hover:text-white transition" aria-label={t('footer.twitter', 'Twitter')}>
        <Twitter size={20} />
      </a>
      <a href="#" className="text-gray-400 hover:text-white transition" aria-label={t('footer.instagram', 'Instagram')}>
        <Instagram size={20} />
      </a>
      <a href='https://www.linkedin.com/company/tabla-maroc/posts/?feedView=all' target='_blank' className="text-gray-400 hover:text-white transition" aria-label={t('footer.linkedin', 'Linkedin')}>
        <Linkedin size={20} />
      </a>
      </div>
    </div>
    </div>
  </footer>
  );
};

export default Footer;