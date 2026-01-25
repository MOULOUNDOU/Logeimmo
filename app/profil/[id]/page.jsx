'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/supabase/auth'
import { follow, unfollow, getFollowerCount, getFollowingCount, getMutualFollow } from '@/lib/supabase/follows'
import { getAnnoncesByCourtier } from '@/lib/supabase/annonces'
import RowItem from '@/components/RowItem'
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiUsers, FiHome, FiMapPin } from 'react-icons/fi'

export default function ProfilPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [me, setMe] = useState(null)
  const [annonces, setAnnonces] = useState([])
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [followLoading, setFollowLoading] = useState(false)
  const [followState, setFollowState] = useState({ iFollow: false, theyFollow: false, mutual: false })
  const [openList, setOpenList] = useState(null) // 'followers' | 'following' | null
  const [listLoading, setListLoading] = useState(false)
  const [followersList, setFollowersList] = useState([])
  const [followingList, setFollowingList] = useState([])

  useEffect(() => {
    const load = async () => {
      if (typeof window === 'undefined') return
      if (!params?.id) return

      const authData = await getCurrentUser()
      setMe(authData?.user || null)

      const { data, error } = await supabase
        .from('profiles')
        .select('id, nom, email, telephone, role, photo_profil, cover_photo, created_at')
        .eq('id', params.id)
        .single()

      if (error || !data) {
        console.error(error)
        setProfile(null)
        setLoading(false)
        return
      }

      setProfile(data)

      if (data.role === 'courtier') {
        try {
          const a = await getAnnoncesByCourtier(data.id)
          setAnnonces(a || [])
        } catch (e) {
          console.error(e)
          setAnnonces([])
        }
      } else {
        setAnnonces([])
      }

      try {
        const [followers, following] = await Promise.all([
          getFollowerCount(data.id),
          getFollowingCount(data.id)
        ])
        setFollowersCount(followers)
        setFollowingCount(following)
      } catch (e) {
        console.error(e)
      }

      if (authData?.user?.id && authData.user.id !== data.id) {
        try {
          const mutual = await getMutualFollow(authData.user.id, data.id)
          setFollowState(mutual)
        } catch (e) {
          console.error(e)
        }
      }

      setLoading(false)
    }

    load()
  }, [params?.id])

  useEffect(() => {
    const loadList = async () => {
      if (!profile?.id) return
      if (!openList) return

      // Cache in-memory: avoid refetch if already loaded
      if (openList === 'followers' && followersList.length > 0) return
      if (openList === 'following' && followingList.length > 0) return

      setListLoading(true)
      try {
        if (openList === 'followers') {
          const { data, error } = await supabase
            .from('follows')
            .select('follower:profiles!follows_follower_id_fkey(id, nom, email, photo_profil)')
            .eq('followed_id', profile.id)
            .order('created_at', { ascending: false })

          if (error) throw error
          const mapped = (data || []).map((r) => r.follower).filter(Boolean)
          setFollowersList(mapped)
        }

        if (openList === 'following') {
          const { data, error } = await supabase
            .from('follows')
            .select('followed:profiles!follows_followed_id_fkey(id, nom, email, photo_profil)')
            .eq('follower_id', profile.id)
            .order('created_at', { ascending: false })

          if (error) throw error
          const mapped = (data || []).map((r) => r.followed).filter(Boolean)
          setFollowingList(mapped)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setListLoading(false)
      }
    }

    loadList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openList, profile?.id])

  const toggleFollow = async () => {
    if (!profile?.id) return

    if (!me?.id) {
      router.push('/login?from=' + encodeURIComponent(`/profil/${profile.id}`))
      return
    }

    if (me.id === profile.id) return

    setFollowLoading(true)
    try {
      if (followState.iFollow) {
        await unfollow(profile.id)
        setFollowState((prev) => ({ ...prev, iFollow: false, mutual: false }))
        setFollowersCount((c) => Math.max(0, c - 1))
      } else {
        await follow(profile.id)
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 bg-white">
                  <Image src="/digicode-immo-logo.jpeg" alt="Digicode Immo" width={40} height={40} priority className="w-10 h-10 object-cover" />
                </div>
                <h1 className="text-base sm:text-xl font-bold text-gray-900">Digicode Immo</h1>
              </Link>
              <Link href="/" className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <FiArrowLeft size={18} />
                <span className="hidden sm:inline">Retour</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
            <FiUser className="mx-auto text-gray-400 mb-4" size={52} />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Profil introuvable</h2>
            <p className="text-gray-600">Ce profil n'existe pas ou n'est pas accessible.</p>
          </div>
        </main>
      </div>
    )
  }

  const canFollow = profile.role === 'courtier' && profile.id !== me?.id

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA/mois'
  }

  const formatRowValue = (value) => {
    if (value === null || value === undefined || value === '') return '—'
    return value
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 bg-white">
                <Image src="/digicode-immo-logo.jpeg" alt="Digicode Immo" width={40} height={40} priority className="w-10 h-10 object-cover" />
              </div>
              <h1 className="text-base sm:text-xl font-bold text-gray-900">Digicode Immo</h1>
            </Link>
            <Link href="/" className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <FiArrowLeft size={18} />
              <span className="hidden sm:inline">Retour</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-44 sm:h-56 bg-gradient-to-br from-primary-100 to-primary-200">
            {profile.cover_photo ? (
              <img src={profile.cover_photo} alt="Couverture" className="w-full h-full object-cover" />
            ) : null}
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div className="flex items-center gap-4">
                {profile.photo_profil ? (
                  <img src={profile.photo_profil} alt={profile.nom} className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                    <FiUser className="text-primary-600" size={34} />
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{profile.nom}</h2>
                  <p className="text-sm text-gray-600 mt-1">{profile.role}</p>
                  <p className="text-xs text-gray-500 mt-2">Inscrit le {new Date(profile.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              {canFollow && (
                <button
                  type="button"
                  onClick={toggleFollow}
                  disabled={followLoading}
                  data-no-global-loader="true"
                  className={`w-full sm:w-auto px-5 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 ${
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
            </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
            <button
              type="button"
              onClick={() => setOpenList((prev) => (prev === 'followers' ? null : 'followers'))}
              data-no-global-loader="true"
              className={`text-left rounded-xl border border-gray-200 p-4 transition-colors hover:bg-gray-50 ${
                openList === 'followers' ? 'bg-gray-50' : ''
              }`}
            >
              <p className="text-sm text-gray-600 flex items-center gap-2"><FiUsers size={16} /> Abonnés</p>
              <p className="text-3xl font-bold text-yellow-500 mt-2">{followersCount}</p>
            </button>

            <button
              type="button"
              onClick={() => setOpenList((prev) => (prev === 'following' ? null : 'following'))}
              data-no-global-loader="true"
              className={`text-left rounded-xl border border-gray-200 p-4 transition-colors hover:bg-gray-50 ${
                openList === 'following' ? 'bg-gray-50' : ''
              }`}
            >
              <p className="text-sm text-gray-600">Abonnements</p>
              <p className="text-3xl font-bold text-yellow-500 mt-2">{followingCount}</p>
            </button>

            <div className="col-span-2 sm:col-span-1 rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Contact</p>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-700 flex items-center gap-2"><FiMail size={16} /> {formatRowValue(profile.email)}</p>
                {profile.telephone && (
                  <p className="text-sm text-gray-700 flex items-center gap-2"><FiPhone size={16} /> {profile.telephone}</p>
                )}
              </div>
            </div>
          </div>

          {openList && (
            <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-900">
                  {openList === 'followers' ? 'Abonnés' : 'Abonnements'}
                </p>
                <p className="text-xs text-gray-500">
                  Cliquez sur un profil pour ouvrir la page.
                </p>
              </div>

              {listLoading ? (
                <div className="p-6 text-center">
                  <p className="text-gray-600">Chargement...</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {(openList === 'followers' ? followersList : followingList).map((u) => (
                    <RowItem
                      key={`${openList}-${u.id}`}
                      href={`/profil/${u.id}`}
                      icon={
                        <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary-100 text-primary-700 overflow-hidden">
                          {u.photo_profil ? (
                            <img src={u.photo_profil} alt={u.nom} className="w-11 h-11 object-cover" />
                          ) : (
                            <FiUser size={18} />
                          )}
                        </span>
                      }
                      title={u.nom}
                      subtitle={u.email}
                      right={
                        <span className="text-[11px] text-gray-500">Voir profil</span>
                      }
                    />
                  ))}

                  {(openList === 'followers' ? followersList : followingList).length === 0 && (
                    <div className="p-8 text-center">
                      <p className="text-gray-600">Aucun résultat.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          </div>
        </div>

        {profile.role === 'courtier' && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <FiHome className="text-primary-500" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">Annonces</h3>
              <span className="text-sm text-gray-500">({annonces.length})</span>
            </div>

            {annonces.length === 0 ? (
              <div className="rounded-xl border border-gray-200 p-8 text-center">
                <p className="text-gray-600">Aucune annonce publiée pour le moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {annonces.map((a) => (
                  <Link
                    key={a.id}
                    href={`/annonces/${a.id}`}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="h-44 bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden">
                      {a.photos && a.photos.length > 0 ? (
                        <img src={a.photos[0]} alt={a.titre} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiHome className="text-primary-600" size={56} />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-gray-900 line-clamp-2">{a.titre}</p>
                      <p className="text-primary-600 font-bold mt-2">{formatPrice(a.prix)}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                        <FiMapPin size={16} />
                        <span className="truncate">{a.quartier}, {a.ville}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
