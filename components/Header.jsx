'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { FiSearch, FiCopy, FiLink2, FiGrid, FiUser, FiLogOut, FiHome, FiMenu, FiMoon, FiSun } from 'react-icons/fi'
import { getCurrentUser, logout } from '@/lib/supabase/auth'
import { useNavigationLoader } from '@/components/NavigationLoaderProvider'
import { useSidebar } from '@/components/SidebarProvider'
import Image from 'next/image'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { startLoading } = useNavigationLoader()
  const { toggle } = useSidebar()
  const [user, setUser] = useState(() => {
    return null
  })
  const [showMenu, setShowMenu] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      getCurrentUser().then((authData) => {
        setUser(authData?.user || null)
      })

      const storedTheme = window.localStorage.getItem('digicode_theme')
      if (storedTheme === 'dark') {
        document.documentElement.classList.add('dark')
        setIsDark(true)
      } else {
        document.documentElement.classList.remove('dark')
        setIsDark(false)
      }
    }
  }, [])

  const toggleTheme = () => {
    if (typeof window === 'undefined') return

    setIsDark((prev) => {
      const next = !prev
      if (next) {
        document.documentElement.classList.add('dark')
        window.localStorage.setItem('digicode_theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        window.localStorage.setItem('digicode_theme', 'light')
      }
      return next
    })
  }

  const handleLogout = () => {
    logout()
    startLoading()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="w-full h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 z-10">
      {/* Left section */}
      <div className="flex items-center gap-4 pr-3 sm:pr-0">
        <button
          type="button"
          onClick={toggle}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
          aria-label="Ouvrir le menu"
          title="Menu"
          data-no-global-loader="true"
        >
          <FiMenu size={20} />
        </button>
        <button
          onClick={() => {
            if (pathname !== '/') {
              startLoading()
              router.push('/')
            }
          }}
          className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <FiHome size={18} />
          <span>Accueil</span>
        </button>
        <button
          type="button"
          className="flex items-center gap-3"
          onClick={() => {
            const target = user ? '/dashboard' : '/'
            if (pathname !== target) {
              startLoading()
              router.push(target)
            }
          }}
        >
          <div className="h-9 w-9 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <Image src="/digicode-immo-logo.jpeg" alt="Digicode Immo" width={36} height={36} priority />
          </div>
          <span className="text-sm sm:text-xl font-bold text-gray-900 dark:text-gray-100 truncate max-w-[140px] sm:max-w-none">Digicode-IMMO</span>
        </button>
      </div>

      {/* Center search bar */}
      <div className="hidden md:block flex-1 max-w-2xl mx-8">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher un logement, une chambre : Appuyez sur ⌘K"
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggleTheme}
          data-no-global-loader="true"
          className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
          aria-label={isDark ? 'Mode clair' : 'Mode sombre'}
          title={isDark ? 'Mode clair' : 'Mode sombre'}
        >
          {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>
        <button
          type="button"
          onClick={() => {
            startLoading()
            router.push(user ? '/parametres' : '/login')
          }}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
          aria-label={user ? 'Mon compte' : 'Se connecter'}
          title={user ? 'Mon compte' : 'Connexion'}
        >
          <FiUser size={18} />
        </button>
        <div className="hidden md:flex items-center gap-4">
          {user && (
            <>
              {user.role === 'client' && (
                <button 
                  onClick={() => {
                    startLoading()
                    router.push('/annonces')
                  }}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span>Voir les annonces</span>
                </button>
              )}
              {(user.role === 'courtier' || user.role === 'admin') && (
                <button 
                  onClick={() => {
                    startLoading()
                    router.push('/publier')
                  }}
                  className="flex items-center gap-2 text-sm bg-primary-500 hover:bg-primary-600 text-gray-900 px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  <span>Publier une annonce</span>
                </button>
              )}
              
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-expanded={showMenu}
                  data-no-global-loader="true"
                >
                  <FiUser size={18} />
                  <span>{user.nom || 'Utilisateur'}</span>
                  <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                    {user.role}
                  </span>
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user.nom}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          startLoading()
                          router.push('/admin')
                          setShowMenu(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Administration
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <FiLogOut size={16} />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      {showMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowMenu(false)}
        ></div>
      )}
    </header>
  )
}

