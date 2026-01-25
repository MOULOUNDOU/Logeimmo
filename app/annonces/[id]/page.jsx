'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getAnnonceById } from '@/lib/annonces'
import { supabase } from '@/lib/supabase'
import { FiHome, FiMapPin, FiMaximize2, FiArrowLeft, FiPhone, FiMessageCircle, FiUser, FiNavigation, FiX } from 'react-icons/fi'
import LikeButton from '@/components/LikeButton'
import ShareButton from '@/components/ShareButton'
import AvisSection from '@/components/AvisSection'
import { getCurrentUser } from '@/lib/supabase/auth'
import { follow, unfollow, getFollowerCount, getMutualFollow } from '@/lib/supabase/follows'

export default function AnnonceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [annonce, setAnnonce] = useState(null)
  const [courtier, setCourtier] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [me, setMe] = useState(null)
  const [followLoading, setFollowLoading] = useState(false)
  const [followState, setFollowState] = useState({ iFollow: false, theyFollow: false, mutual: false })
  const [followersCount, setFollowersCount] = useState(0)

  const RECENT_KEY = 'digicode_recent_annonces'

  useEffect(() => {
    const load = async () => {
      if (typeof window === 'undefined' || !params.id) return

      const authData = await getCurrentUser()
      setMe(authData?.user || null)

      const annonceData = await getAnnonceById(params.id)
      if (!annonceData) {
        router.push('/')
        return
      }

      setAnnonce(annonceData)

      try {
        const stored = window.localStorage.getItem(RECENT_KEY)
        const current = stored ? JSON.parse(stored) : []
        const next = [annonceData.id, ...current.filter((id) => id !== annonceData.id)].slice(0, 10)
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(next))
      } catch {
        // ignore
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('nom, telephone, photo_profil')
        .eq('id', annonceData.createdBy)
        .single()

      setCourtier(
        profile
          ? {
              nom: profile.nom,
              telephone: profile.telephone,
              photoProfil: profile.photo_profil
            }
          : {
              nom: annonceData.createdByNom,
              telephone: null,
              photoProfil: annonceData.createdByPhoto || null
            }
      )

      try {
        const count = await getFollowerCount(annonceData.createdBy)
        setFollowersCount(count)
      } catch (e) {
        console.error(e)
      }

      if (authData?.user?.id && authData.user.id !== annonceData.createdBy) {
        try {
          const mutual = await getMutualFollow(authData.user.id, annonceData.createdBy)
          setFollowState(mutual)
        } catch (e) {
          console.error(e)
        }
      }

      setLoading(false)
    }

    load()
  }, [params.id, router])

  const toggleFollow = async () => {
    if (!annonce?.createdBy) return
    if (!me?.id) {
      router.push('/login?from=' + encodeURIComponent(`/annonces/${params.id}`))
      return
    }
    if (me.id === annonce.createdBy) return

    setFollowLoading(true)
    try {
      if (followState.iFollow) {
        await unfollow(annonce.createdBy)
        setFollowState((prev) => ({ ...prev, iFollow: false, mutual: false }))
        setFollowersCount((c) => Math.max(0, c - 1))
      } else {
        await follow(annonce.createdBy)
        const next = { ...followState, iFollow: true, mutual: followState.theyFollow }
        setFollowState(next)
        setFollowersCount((c) => c + 1)
      }
    } catch (e) {
      console.error(e)
      alert(e.message || 'Erreur')
    } finally {
      setFollowLoading(false)
    }
  }

  useEffect(() => {
    if (!isLightboxOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsLightboxOpen(false)
      if (!annonce?.photos || annonce.photos.length <= 1) return
      if (e.key === 'ArrowLeft') {
        setCurrentImageIndex((prev) => (prev - 1 + annonce.photos.length) % annonce.photos.length)
      }
      if (e.key === 'ArrowRight') {
        setCurrentImageIndex((prev) => (prev + 1) % annonce.photos.length)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isLightboxOpen, annonce?.photos])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA/mois'
  }

  const handleWhatsApp = () => {
    if (!courtier.telephone) {
      alert('Numéro de téléphone non disponible')
      return
    }
    const phone = courtier.telephone.replace(/\s/g, '')
    const message = encodeURIComponent(`Bonjour, je suis intéressé(e) par votre annonce: ${annonce.titre}`)
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
  }

  const handlePhoneCall = () => {
    if (!courtier.telephone) {
      alert('Numéro de téléphone non disponible')
      return
    }
    const phone = courtier.telephone.replace(/\s/g, '')
    window.location.href = `tel:${phone}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!annonce) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isLightboxOpen && annonce.photos && annonce.photos.length > 0 && (
        <div
          className="fixed inset-0 z-[80] bg-black/90 flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setIsLightboxOpen(false)
            }}
            className="absolute top-4 right-4 inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Fermer"
          >
            <FiX size={24} />
          </button>

          {annonce.photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setCurrentImageIndex((prev) => (prev - 1 + annonce.photos.length) % annonce.photos.length)
              }}
              className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Photo précédente"
            >
              <FiArrowLeft size={24} />
            </button>
          )}

          <img
            src={annonce.photos[currentImageIndex]}
            alt={annonce.titre}
            className="max-w-[95vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {annonce.photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setCurrentImageIndex((prev) => (prev + 1) % annonce.photos.length)
              }}
              className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Photo suivante"
            >
              <FiArrowLeft className="rotate-180" size={24} />
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 bg-white">
                <Image src="/digicode-immo-logo.jpeg" alt="Digicode Immo" width={40} height={40} priority className="w-10 h-10 object-cover" />
              </div>
              <h1 className="text-base sm:text-xl font-bold text-gray-900">Digicode Immo</h1>
            </Link>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <Link
                href="/"
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiArrowLeft size={18} />
                <span className="hidden sm:inline">Retour</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group">
              {annonce.photos && annonce.photos.length > 0 ? (
                <>
                  <div className="relative h-72 sm:h-96 bg-gray-100">
                    <img
                      src={annonce.photos[currentImageIndex]}
                      alt={annonce.titre}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02] cursor-zoom-in"
                      onClick={() => setIsLightboxOpen(true)}
                    />
                    {annonce.photos.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIndex((prev) => (prev - 1 + annonce.photos.length) % annonce.photos.length)}
                          data-no-global-loader="true"
                          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 sm:p-2 transition-colors"
                        >
                          <FiArrowLeft size={20} className="sm:hidden" />
                          <FiArrowLeft size={24} className="hidden sm:block" />
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex((prev) => (prev + 1) % annonce.photos.length)}
                          data-no-global-loader="true"
                          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 sm:p-2 transition-colors"
                        >
                          <FiArrowLeft className="rotate-180 sm:hidden" size={20} />
                          <FiArrowLeft className="rotate-180 hidden sm:block" size={24} />
                        </button>
                      </>
                    )}

                    {annonce.photos.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/35">
                        {annonce.photos.map((_, idx) => (
                          <button
                            key={`dot-${idx}`}
                            type="button"
                            onClick={() => setCurrentImageIndex(idx)}
                            data-no-global-loader="true"
                            className={`h-2 w-2 rounded-full transition-colors ${
                              currentImageIndex === idx ? 'bg-white' : 'bg-white/50 hover:bg-white/80'
                            }`}
                            aria-label={`Aller à la photo ${idx + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {annonce.photos.length > 1 && (
                    <div className="p-4 border-t border-gray-200">
                      <div className="flex gap-2 overflow-x-auto">
                        {annonce.photos.map((photo, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            data-no-global-loader="true"
                            className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-transform duration-200 hover:scale-[1.03] ${
                              currentImageIndex === index ? 'border-primary-500' : 'border-gray-200'
                            }`}
                          >
                            <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-72 sm:h-96 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <FiHome className="text-primary-600" size={96} />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <h1 className="text-xl sm:text-3xl font-bold text-gray-900">{annonce.titre}</h1>
                    <span className="px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full">
                      {annonce.type}
                    </span>
                    {annonce.meuble && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                        Meublé
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FiMapPin size={18} />
                    <span className="text-sm sm:text-lg">{annonce.quartier}, {annonce.ville}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <LikeButton annonceId={annonce.id} />
                  <ShareButton
                    annonceId={annonce.id}
                    titre={annonce.titre}
                    description={annonce.description}
                    photoUrl={annonce.photos && annonce.photos.length > 0 ? annonce.photos[0] : undefined}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-gray-200 mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Prix</p>
                  <p className="text-xl sm:text-2xl font-bold text-primary-600">{formatPrice(annonce.prix)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Superficie</p>
                  <p className="text-lg sm:text-xl font-semibold text-gray-900">{annonce.superficie} m²</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Chambres</p>
                  <p className="text-lg sm:text-xl font-semibold text-gray-900">{annonce.chambres}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Salles de bain</p>
                  <p className="text-lg sm:text-xl font-semibold text-gray-900">{annonce.sallesDeBain}</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{annonce.description}</p>
              </div>

              {/* Localisation GPS */}
              {annonce.latitude && annonce.longitude && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Localisation</h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Coordonnées GPS:</p>
                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                      <FiNavigation size={18} />
                      <span>Lat: {parseFloat(annonce.latitude).toFixed(6)}, Long: {parseFloat(annonce.longitude).toFixed(6)}</span>
                    </div>
                    <a
                      href={`https://www.google.com/maps?q=${annonce.latitude},${annonce.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Voir sur Google Maps
                    </a>
                  </div>
                </div>
              )}

              {/* Section Avis */}
              <div className="mt-8">
                <AvisSection annonceId={annonce.id} courtierId={annonce.createdBy} />
              </div>
            </div>
          </div>

          {/* Right Column - Contact */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6 lg:sticky lg:top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contacter le courtier</h2>
              <Link href={`/profil/${annonce.createdBy}`} className="mb-4 flex items-center gap-3 group">
                {courtier.photoProfil ? (
                  <img
                    src={courtier.photoProfil}
                    alt={courtier.nom}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <FiUser className="text-primary-600" size={32} />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{courtier.nom}</p>
                  {courtier.telephone && (
                    <p className="text-sm text-gray-600 mt-1">{courtier.telephone}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{followersCount} abonné(s)</p>
                </div>
              </Link>

              {annonce.createdBy !== me?.id && (
                <button
                  type="button"
                  onClick={toggleFollow}
                  disabled={followLoading}
                  data-no-global-loader="true"
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                    followState.iFollow ? 'bg-gray-100 hover:bg-gray-200 text-gray-900' : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  {followLoading
                    ? '...' 
                    : followState.iFollow
                      ? followState.mutual
                        ? 'Abonnés mutuels'
                        : 'Se désabonner'
                      : "S'abonner"}
                </button>
              )}
              
              <div className="space-y-3">
                {courtier.telephone ? (
                  <>
                    <button
                      onClick={handleWhatsApp}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                    >
                      <FiMessageCircle size={20} />
                      <span>Contacter par WhatsApp</span>
                    </button>
                    <button
                      onClick={handlePhoneCall}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                    >
                      <FiPhone size={20} />
                      <span>Appeler</span>
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 text-center">Numéro de téléphone non disponible</p>
                )}
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Informations rapides</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium text-gray-900 capitalize">{annonce.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ville</span>
                  <span className="font-medium text-gray-900">{annonce.ville}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Quartier</span>
                  <span className="font-medium text-gray-900">{annonce.quartier}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Meublé</span>
                  <span className="font-medium text-gray-900">{annonce.meuble ? 'Oui' : 'Non'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

