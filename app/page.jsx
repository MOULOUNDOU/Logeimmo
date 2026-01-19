'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getCurrentUser } from '@/lib/supabase/auth'
import { getAnnonces } from '@/lib/supabase/annonces'
import { FiHome, FiMapPin, FiMaximize2, FiSearch, FiLogIn, FiUserPlus, FiUser, FiKey, FiChevronLeft, FiChevronRight, FiShield, FiClock, FiCheckCircle, FiMoon, FiSun, FiMenu, FiX, FiHeart, FiBell, FiGrid } from 'react-icons/fi'
import AnnonceCarousel from '@/components/AnnonceCarousel'
import LikeButton from '@/components/LikeButton'
import ShareButton from '@/components/ShareButton'
import Footer from '@/components/Footer'

function HomeAnnonceCard({ annonce, formatPrice }) {
  const [photoIndex, setPhotoIndex] = useState(0)
  const photos = annonce?.photos || []
  const hasPhotos = photos.length > 0
  const canPaginate = photos.length > 1

  const stop = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const prevPhoto = (e) => {
    stop(e)
    setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  const nextPhoto = (e) => {
    stop(e)
    setPhotoIndex((prev) => (prev + 1) % photos.length)
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <Link href={`/annonces/${annonce.id}`}>
        <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden cursor-pointer group">
          {hasPhotos ? (
            <img
              src={photos[photoIndex]}
              alt={annonce.titre}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiHome className="text-primary-600" size={64} />
            </div>
          )}

          {canPaginate && (
            <>
              <button
                type="button"
                onClick={prevPhoto}
                data-no-global-loader="true"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                aria-label="Photo précédente"
              >
                <FiChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={nextPhoto}
                data-no-global-loader="true"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                aria-label="Photo suivante"
              >
                <FiChevronRight size={18} />
              </button>
            </>
          )}

          <div className="absolute top-3 left-3">
            <span className="inline-block px-3 py-1 bg-primary-500 text-gray-900 text-xs font-medium rounded-full">
              {annonce.type}
            </span>
          </div>
          {annonce.meuble && (
            <div className="absolute top-3 right-3">
              <span className="inline-block px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                Meublé
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-6">
        <Link href={`/annonces/${annonce.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
            {annonce.titre}
          </h3>
        </Link>
        <p className="text-2xl font-bold text-primary-600 mb-4">
          {formatPrice(annonce.prix)}
        </p>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <FiMapPin size={16} />
            <span>{annonce.quartier}, {annonce.ville}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <FiMaximize2 size={16} />
            <span>{annonce.superficie} m²</span>
          </div>
          {annonce.chambres > 1 && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <FiHome size={16} />
              <span>{annonce.chambres} chambres • {annonce.sallesDeBain} salle(s) de bain</span>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
          {annonce.description}
        </p>
        
        {/* Courtier info */}
        <div className="flex items-center gap-3 mb-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          {annonce.createdByPhoto ? (
            <img
              src={annonce.createdByPhoto}
              alt={annonce.createdByNom}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <FiUser className="text-primary-600" size={20} />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{annonce.createdByNom}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Courtier</p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
          <LikeButton annonceId={annonce.id} />
          <ShareButton annonceId={annonce.id} titre={annonce.titre} />
          <Link
            href={`/annonces/${annonce.id}`}
            className="w-full sm:w-auto sm:ml-auto px-4 py-2 bg-primary-500 hover:bg-primary-600 text-gray-900 rounded-lg text-sm font-medium transition-colors text-center"
          >
            Voir détails
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const [annonces, setAnnonces] = useState([])
  const [filteredAnnonces, setFilteredAnnonces] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    type: '',
    ville: '',
    prixMin: '',
    prixMax: ''
  })
  const [user, setUser] = useState(null)
  const [isDark, setIsDark] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9
  const heroWords = 'Trouvez votre logement idéal au Sénégal.'.split(' ')

  useEffect(() => {
    const load = async () => {
      if (typeof window === 'undefined') return

      const authData = await getCurrentUser()
      setUser(authData?.user || null)
      await loadAnnonces()
    }

    load()
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

  const loadAnnonces = async () => {
    const allAnnonces = await getAnnonces({ onlyCourtiers: true })
    const shuffled = [...allAnnonces].sort(() => Math.random() - 0.5)
    setAnnonces(shuffled)
    setFilteredAnnonces(shuffled)
    setLoading(false)
  }

  useEffect(() => {
    let filtered = [...annonces]

    if (searchTerm) {
      filtered = filtered.filter(annonce =>
        annonce.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        annonce.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        annonce.quartier.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filters.type) {
      filtered = filtered.filter(annonce => annonce.type === filters.type)
    }

    if (filters.ville) {
      filtered = filtered.filter(annonce => annonce.ville === filters.ville)
    }

    const min = Number(filters.prixMin)
    const max = Number(filters.prixMax)
    const hasMin = Number.isFinite(min) && filters.prixMin !== ''
    const hasMax = Number.isFinite(max) && filters.prixMax !== ''
    if (hasMin) {
      filtered = filtered.filter((annonce) => Number(annonce.prix) >= min)
    }
    if (hasMax) {
      filtered = filtered.filter((annonce) => Number(annonce.prix) <= max)
    }

    setFilteredAnnonces(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchTerm, filters, annonces])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA/mois'
  }

  const handleUserAction = () => {
    if (user) {
      if (user.role === 'client') {
        router.push('/annonces')
      } else if (user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } else {
      router.push('/login')
    }
  }

  const dashboardPath = user
    ? user.role === 'admin'
      ? '/admin'
      : user.role === 'courtier'
        ? '/dashboard-courtier'
        : '/dashboard-client'
    : '/login'

  const notificationsPath = user
    ? user.role === 'client'
      ? '/notifications-client'
      : '/notifications'
    : '/login'

  // Pagination
  const totalPages = Math.ceil(filteredAnnonces.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAnnonces = filteredAnnonces.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                aria-label="Menu"
                title="Menu"
                aria-expanded={mobileMenuOpen}
                data-no-global-loader="true"
              >
                {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>

              <Link href="/" className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                  <Image src="/digicode-immo-logo.jpeg" alt="Digicode Immo" width={36} height={36} priority />
                </div>
                <h1 className="text-sm sm:text-xl font-bold text-gray-900 dark:text-gray-100 truncate max-w-[140px] xs:max-w-[180px] sm:max-w-none">Digicode-IMMO</h1>
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => {
                  if (user) {
                    router.push('/parametres')
                  } else {
                    router.push('/login')
                  }
                }}
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                aria-label={user ? 'Mon compte' : 'Connexion'}
                title={user ? 'Mon compte' : 'Connexion'}
              >
                <FiUser size={18} />
              </button>
              <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <button
                    onClick={handleUserAction}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <FiUser size={18} />
                    <span>{user.nom}</span>
                  </button>
                  {(user.role === 'courtier' || user.role === 'admin') && (
                    <Link
                      href="/publier"
                      className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-gray-900 rounded-lg transition-colors text-sm font-medium"
                    >
                      <FiKey size={18} />
                      <span>Publier une annonce</span>
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <FiLogIn size={18} />
                    <span>Connexion</span>
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-gray-900 rounded-lg transition-colors text-sm font-medium"
                  >
                    <FiUserPlus size={18} />
                    <span>S'inscrire</span>
                  </Link>
                </>
              )}
              </div>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-[60]">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div
              className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl p-4 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <Image src="/digicode-immo-logo.jpeg" alt="Digicode Immo" width={32} height={32} priority />
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Menu</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  data-no-global-loader="true"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                  aria-label="Fermer le menu"
                >
                  <FiX size={20} />
                </button>
              </div>

              <nav className="space-y-1">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <FiHome size={18} />
                  <span>Accueil</span>
                </Link>

                <button
                  type="button"
                  onClick={toggleTheme}
                  data-no-global-loader="true"
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
                  <span>{isDark ? 'Mode clair' : 'Mode sombre'}</span>
                </button>
                <Link
                  href="/annonces"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <FiGrid size={18} />
                  <span>Annonces</span>
                </Link>

                {user ? (
                  <Link
                    href={dashboardPath}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <FiUser size={18} />
                    <span>Mon espace</span>
                  </Link>
                ) : (
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <FiUserPlus size={18} />
                    <span>Devenir courtier</span>
                  </Link>
                )}

                <Link
                  href={notificationsPath}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <FiBell size={18} />
                  <span>Notifications</span>
                </Link>

                <Link
                  href={user ? '/favoris' : '/login'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <FiHeart size={18} />
                  <span>Favoris</span>
                </Link>
              </nav>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                {user ? (
                  <>
                    {(user.role === 'courtier' || user.role === 'admin') && (
                      <Link
                        href="/publier"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-gray-900 rounded-lg transition-colors text-sm font-medium"
                      >
                        <FiKey size={18} />
                        <span>Publier une annonce</span>
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        handleUserAction()
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <FiUser size={18} />
                      <span>{user.nom}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <FiLogIn size={18} />
                      <span>Connexion</span>
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-gray-900 rounded-lg transition-colors text-sm font-medium"
                    >
                      <FiUserPlus size={18} />
                      <span>S'inscrire</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-900 border-b border-primary-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {heroWords.map((w, idx) => (
                <span
                  key={`${w}-${idx}`}
                  className="animate-word"
                  style={{ animationDelay: `${idx * 0.18}s` }}
                >
                  {w}{idx === heroWords.length - 1 ? '' : '\u00A0'}
                </span>
              ))}
            </h2>
            <p className="text-base sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Explorez des milliers de chambres, studios et appartements disponibles dans les principales villes du pays
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 sm:p-6 border border-transparent dark:border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Rechercher par quartier, type de logement..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value="">Tous les types</option>
                    <option value="Appartement">Appartement</option>
                    <option value="Maison">Maison</option>
                    <option value="Studio">Studio</option>
                    <option value="Chambre">Chambre</option>
                    <option value="Terrain">Terrain</option>
                  </select>
                </div>
                <div>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={filters.prixMin}
                    onChange={(e) => setFilters((prev) => ({ ...prev, prixMin: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="Prix min (FCFA)"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={filters.prixMax}
                    onChange={(e) => setFilters((prev) => ({ ...prev, prixMax: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="Prix max (FCFA)"
                  />
                </div>
                <div>
                  <select
                    value={filters.ville}
                    onChange={(e) => setFilters((prev) => ({ ...prev, ville: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value="">Toutes les villes</option>
                    <option value="Dakar">Dakar</option>
                    <option value="Thiès">Thiès</option>
                    <option value="Saint-Louis">Saint-Louis</option>
                    <option value="Kaolack">Kaolack</option>
                    <option value="Ziguinchor">Ziguinchor</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Carousel Section */}
        {annonces.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Annonces en vedette</h3>
            <AnnonceCarousel annonces={annonces.slice(0, 6)} />
          </div>
        )}

        {/* List Section */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Logements disponibles
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {filteredAnnonces.length} {filteredAnnonces.length === 1 ? 'logement trouvé' : 'logements trouvés'}
          </p>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Chargement...</p>
          </div>
        ) : currentAnnonces.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center">
            <FiHome className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Aucun logement trouvé</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Essayez de modifier vos critères de recherche</p>
            {!user && (
              <div className="flex gap-4 justify-center">
                <Link
                  href="/register"
                  className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-gray-900 rounded-lg transition-colors font-medium"
                >
                  Devenir courtier
                </Link>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentAnnonces.map((annonce) => (
                <HomeAnnonceCard key={annonce.id} annonce={annonce} formatPrice={formatPrice} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiChevronLeft size={20} />
                </button>
                
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 border rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-primary-500 text-gray-900 border-primary-500'
                            : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2">...</span>
                  }
                  return null
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}

        <section className="mt-12">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Comment ça marche</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Deux parcours simples selon ton profil.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-gray-50 dark:bg-gray-950">
                <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold mb-3">
                  <FiKey size={18} />
                  <span>Courtiers : publier une annonce</span>
                </div>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <p>1) Crée un compte et choisis le rôle <span className="font-semibold">courtier</span>.</p>
                  <p>2) Va dans <span className="font-semibold">Dashboard</span> puis clique sur <span className="font-semibold">Publier une annonce</span>.</p>
                  <p>3) Ajoute de belles photos, un titre clair, le prix et l’adresse (ville/quartier).</p>
                  <p>4) Publie : ton annonce sera visible par les clients.</p>
                </div>
                <div className="mt-4">
                  <Link
                    href={user && (user.role === 'courtier' || user.role === 'admin') ? '/publier' : '/register'}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-gray-900 text-sm font-medium transition-colors"
                  >
                    <FiKey size={18} />
                    <span>{user && (user.role === 'courtier' || user.role === 'admin') ? 'Publier maintenant' : 'Devenir courtier'}</span>
                  </Link>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-gray-50 dark:bg-gray-950">
                <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold mb-3">
                  <FiSearch size={18} />
                  <span>Clients : trouver une chambre</span>
                </div>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <p>1) Utilise la recherche (quartier/type) et les filtres (ville, type).</p>
                  <p>2) Ouvre une annonce pour voir les détails, photos et informations.</p>
                  <p>3) Ajoute en favoris et compare plusieurs annonces.</p>
                  <p>4) Contacte le courtier depuis l’annonce pour visiter ou réserver.</p>
                </div>
                <div className="mt-4">
                  <Link
                    href="/annonces"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium transition-colors"
                  >
                    <FiHome size={18} />
                    <span>Voir les annonces</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <section className="py-14 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Pourquoi nous choisir</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Une expérience simple, rapide et sécurisée.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg bg-primary-500 text-gray-900 flex items-center justify-center mb-4">
                <FiShield size={22} />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Annonces vérifiées</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Des annonces publiées par des courtiers et une plateforme conçue pour limiter les arnaques.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg bg-primary-500 text-gray-900 flex items-center justify-center mb-4">
                <FiClock size={22} />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Gain de temps</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Recherche rapide par type, ville et quartier pour trouver le logement idéal en quelques minutes.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg bg-primary-500 text-gray-900 flex items-center justify-center mb-4">
                <FiCheckCircle size={22} />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Support réactif</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Une équipe disponible et des courtiers joignables pour t'accompagner jusqu'à la visite.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
