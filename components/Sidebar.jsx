'use client'

import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  FiHome, 
  FiMail, 
  FiStar, 
  FiBell,
  FiPackage,
  FiGrid,
  FiMapPin,
  FiSettings, 
  FiHelpCircle,
  FiChevronRight,
  FiLogOut,
  FiUser,
  FiMoon,
  FiSun
} from 'react-icons/fi'
import { useNavigationLoader } from '@/components/NavigationLoaderProvider'
import { useSidebar } from '@/components/SidebarProvider'
import { getCurrentUser, logout } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { startLoading } = useNavigationLoader()
  const { isOpen, close } = useSidebar()

  const [userRole, setUserRole] = useState(null)
  const [user, setUser] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    let mounted = true
    let channel = null

    const refreshUnreadCount = async (userId) => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('read', false)

      if (!mounted) return
      if (error) {
        setUnreadCount(0)
      } else {
        setUnreadCount(count || 0)
      }
    }

    const load = async () => {
      if (typeof window === 'undefined') return
      const authData = await getCurrentUser()
      if (!mounted) return
      setUserRole(authData?.user?.role || null)
      setUser(authData?.user || null)

      const userId = authData?.user?.id
      if (userId) {
        await refreshUnreadCount(userId)

        channel = supabase
          .channel(`sidebar-notifs-${userId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'notifications',
              filter: `recipient_id=eq.${userId}`
            },
            () => {
              refreshUnreadCount(userId)
            }
          )
          .subscribe()
      }
    }

    load()

    return () => {
      mounted = false
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const saved = window.localStorage.getItem('digicode_theme')
    const nextIsDark = saved ? saved === 'dark' : false

    setIsDark(nextIsDark)
    if (nextIsDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)

    if (next) {
      document.documentElement.classList.add('dark')
      window.localStorage.setItem('digicode_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      window.localStorage.setItem('digicode_theme', 'light')
    }
  }

  const isCourtier = userRole === 'courtier'
  const isClient = userRole === 'client'
  const isAdmin = userRole === 'admin'

  const menuItems = isCourtier
    ? [
        { id: 'Tableau de bord', icon: FiGrid, path: '/dashboard-courtier' },
        { id: 'Propriétés', icon: FiMapPin, path: '/proprietes' },
        { id: 'Commandes', icon: FiMail, path: '/demandes' },
        { id: 'Avis', icon: FiStar, path: '/avis' },
        { id: 'Notifications', icon: FiBell, path: '/notifications' },
        { id: 'Version pro', icon: FiPackage, path: '/pro' }
      ]
    : isClient
      ? [
          { id: 'Tableau de bord', icon: FiGrid, path: '/dashboard-client' },
          { id: 'Favoris', icon: FiStar, path: '/favoris' },
          { id: 'Notifications', icon: FiBell, path: '/notifications-client' },
          { id: 'Voir courtiers', icon: FiMail, path: '/rechercher-courtier' }
        ]
      : isAdmin
        ? [
            { id: 'Tableau de bord', icon: FiGrid, path: '/admin' },
            { id: 'Notifications', icon: FiBell, path: '/notifications' }
          ]
        : [
            { id: 'Tableau de bord', icon: FiGrid, path: '/dashboard' }
          ]

  const getActiveItem = () => {
    // Déterminer l'item actif basé sur le pathname
    for (const item of menuItems) {
      if (pathname === item.path || pathname?.startsWith(item.path + '/')) {
        return item.id
      }
    }
    return 'Tableau de bord'
  }

  const activeItem = getActiveItem()

  const handleNavigation = (path) => {
    if (pathname === path || pathname?.startsWith(path + '/')) {
      return
    }
    startLoading()
    close()
    router.push(path)
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={close}
      />

      <aside
        className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen flex flex-col z-50 overflow-y-auto
        w-64 fixed left-0 top-0 md:static md:translate-x-0 transition-transform duration-300 ease-in-out transform-gpu
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:!translate-x-0`}
      >
      <div className="md:hidden p-4 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => handleNavigation('/')}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
            pathname === '/' ? 'bg-primary-500 text-gray-900' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <FiHome size={26} />
          <span className="text-base font-medium">Accueil</span>
        </button>
      </div>

      {/* Mobile user/actions (Header options moved here) */}
      {user && (
        <div className="md:hidden p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            {user.photoProfil || user.photo_profil ? (
              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <Image
                  src={user.photoProfil || user.photo_profil}
                  alt={user.nom || 'Utilisateur'}
                  width={40}
                  height={40}
                  className="w-10 h-10 object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <FiUser className="text-primary-600" size={20} />
              </div>
            )}
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user.nom || 'Utilisateur'}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">{user.role}</span>
          </div>

          <div className="mt-4 space-y-2">
            {isClient && (
              <button
                onClick={() => handleNavigation('/annonces')}
                className="w-full px-3 py-2 rounded-lg text-sm bg-gray-900 text-white hover:bg-gray-800"
              >
                Voir les annonces
              </button>
            )}
            {(isCourtier || isAdmin) && (
              <button
                onClick={() => handleNavigation('/publier')}
                className="w-full px-3 py-2 rounded-lg text-sm bg-primary-500 text-gray-900 hover:bg-primary-600 font-medium"
              >
                Publier une annonce
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => handleNavigation('/admin')}
                className="w-full px-3 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Administration
              </button>
            )}
            <button
              onClick={() => {
                logout()
                close()
                startLoading()
                router.push('/')
                router.refresh()
              }}
              className="w-full px-3 py-2 rounded-lg text-base text-red-600 hover:bg-red-50 dark:hover:bg-gray-800 flex items-center justify-center gap-2"
            >
              <FiLogOut size={22} />
              Déconnexion
            </button>
          </div>
        </div>
      )}

      {/* Menu items */}
      <nav className="flex-1 p-4 space-y-1 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-500 text-gray-900'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="relative">
                <Icon size={26} />
                {item.id === 'Notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] leading-4 text-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </span>
              <span className="text-base font-medium">{item.id}</span>
            </button>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-1">
        <button
          type="button"
          onClick={toggleTheme}
          data-no-global-loader="true"
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {isDark ? <FiSun size={26} /> : <FiMoon size={26} />}
          <span className="text-base font-medium">{isDark ? 'Mode clair' : 'Mode sombre'}</span>
        </button>
        <button 
          onClick={() => handleNavigation('/parametres')}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
            pathname === '/parametres'
              ? 'bg-primary-500 text-gray-900'
              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <FiSettings size={26} />
          <span className="text-base font-medium">Paramètres</span>
        </button>
      </div>
      </aside>
    </>
  )
}

