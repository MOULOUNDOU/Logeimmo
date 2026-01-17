'use client'

import Link from 'next/link'
import { FiMail, FiPhone, FiFacebook, FiYoutube, FiMessageCircle } from 'react-icons/fi'
import { FaTelegram } from 'react-icons/fa'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 mt-16 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Description */}
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <Image src="/digicode-immo-logo.jpeg" alt="Digicode Immo" width={40} height={40} priority />
              </div>
              <h3 className="text-xl font-bold">Digicode Immo</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Plateforme immobilière pour logements et chambres au Sénégal. 
              Trouvez ou publiez des annonces facilement.
            </p>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-3">
              <a
                href="mailto:contact@digicode-immo.com"
                className="flex items-center gap-3 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                <FiMail size={20} />
                <span className="text-sm">contact@digicode-immo.com</span>
              </a>
              <a
                href="tel:+221777269484"
                className="flex items-center gap-3 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                <FiPhone size={20} />
                <span className="text-sm">+221 77 726 94 84</span>
              </a>
              <a
                href="https://wa.me/221777269484"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                <FiMessageCircle size={20} />
                <span className="text-sm">WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Liens Rapides */}
          <div className="col-span-1">
            <h4 className="text-lg font-semibold mb-4">Liens Rapides</h4>
            <div className="space-y-2">
              <Link href="/" className="block text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                Accueil
              </Link>
              <Link href="/annonces" className="block text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                Toutes les annonces
              </Link>
              <Link href="/publier" className="block text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                Publier une annonce
              </Link>
              <Link href="/aide" className="block text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                Centre d'aide
              </Link>
            </div>
          </div>
        </div>

        {/* Réseaux Sociaux */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Digicode Immo - Tous droits réservés
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">Suivez-nous :</span>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.facebook.com/digicode242"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-900/10 hover:bg-gray-900/20 dark:bg-white/10 dark:hover:bg-white/20 rounded-full flex items-center justify-center transition-colors text-gray-900 dark:text-white"
                  aria-label="Facebook"
                  title="Facebook"
                >
                  <FiFacebook size={20} />
                </a>
                <a
                  href="https://wa.me/221777269484"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-900/10 hover:bg-gray-900/20 dark:bg-white/10 dark:hover:bg-white/20 rounded-full flex items-center justify-center transition-colors text-gray-900 dark:text-white"
                  aria-label="WhatsApp"
                  title="WhatsApp"
                >
                  <FiMessageCircle size={20} />
                </a>
                <a
                  href="https://t.me/digicode242"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-900/10 hover:bg-gray-900/20 dark:bg-white/10 dark:hover:bg-white/20 rounded-full flex items-center justify-center transition-colors text-gray-900 dark:text-white"
                  aria-label="Telegram"
                  title="Telegram"
                >
                  <FaTelegram size={20} />
                </a>
                <a
                  href="https://www.youtube.com/@digicode242"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-900/10 hover:bg-gray-900/20 dark:bg-white/10 dark:hover:bg-white/20 rounded-full flex items-center justify-center transition-colors text-gray-900 dark:text-white"
                  aria-label="YouTube"
                  title="YouTube"
                >
                  <FiYoutube size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

