'use client'

import { useEffect, useMemo, useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import RowItem from '@/components/RowItem'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/supabase/auth'
import { follow, unfollow } from '@/lib/supabase/follows'
import { FiUsers, FiUser } from 'react-icons/fi'

export default function MesAbonnesPage() {
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState(null)
  const [followers, setFollowers] = useState([])
  const [followingSet, setFollowingSet] = useState(() => new Set())
  const [actionLoadingId, setActionLoadingId] = useState(null)

  const followerCount = followers.length
  const followingLookup = useMemo(() => followingSet, [followingSet])

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoading(true)
      const authData = await getCurrentUser()
      if (!mounted) return
      const userId = authData?.user?.id
      setMe(authData?.user || null)

      if (!userId) {
        setFollowers([])
        setFollowingSet(new Set())
        setLoading(false)
        return
      }

      const [{ data: followersRows, error: followersError }, { data: followingRows, error: followingError }] =
        await Promise.all([
          supabase
            .from('follows')
            .select('follower_id, follower:profiles!follows_follower_id_fkey(id, nom, email, photo_profil)')
            .eq('followed_id', userId)
            .order('created_at', { ascending: false }),
          supabase
            .from('follows')
            .select('followed_id')
            .eq('follower_id', userId)
        ])

      if (!mounted) return

      if (followersError) {
        console.error(followersError)
        setFollowers([])
      } else {
        const mapped = (followersRows || [])
          .map((r) => r?.follower)
          .filter((u) => Boolean(u?.id))
        setFollowers(mapped)
      }

      if (followingError) {
        console.error(followingError)
        setFollowingSet(new Set())
      } else {
        setFollowingSet(new Set((followingRows || []).map((r) => r.followed_id)))
      }

      setLoading(false)
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  const toggleFollowBack = async (userId) => {
    if (!userId) return
    if (userId === me?.id) return
    setActionLoadingId(userId)
    try {
      if (followingLookup.has(userId)) {
        await unfollow(userId)
        setFollowingSet((prev) => {
          const next = new Set(prev)
          next.delete(userId)
          return next
        })
      } else {
        await follow(userId)
        setFollowingSet((prev) => {
          const next = new Set(prev)
          next.add(userId)
          return next
        })
      }
    } catch (e) {
      console.error(e)
      alert(e.message || 'Erreur')
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <ProtectedRoute requiredRole="courtier">
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <FiUsers className="text-primary-500" size={28} />
                  <h1 className="text-3xl font-bold text-gray-900">Mes abonnés</h1>
                </div>
                <p className="text-gray-600">
                  {me?.nom ? `${me.nom}, ` : ''}{followerCount} abonné(s)
                </p>
              </div>

              {loading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <p className="text-gray-600">Chargement...</p>
                </div>
              ) : followers.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <FiUsers className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun abonné</h3>
                  <p className="text-gray-600">Vos abonnés apparaîtront ici.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="divide-y divide-gray-200">
                    {followers.map((u) => {
                      if (!u?.id) return null
                      const iFollowBack = followingLookup.has(u.id)
                      return (
                        <div key={u.id} className="p-2 sm:p-3">
                          <RowItem
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
                            title={u.nom || 'Utilisateur'}
                            subtitle={u.email}
                            right={
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  toggleFollowBack(u.id)
                                }}
                                disabled={actionLoadingId === u.id || u.id === me?.id}
                                data-no-global-loader="true"
                                className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors disabled:opacity-50 ${
                                  iFollowBack
                                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                                }`}
                              >
                                {actionLoadingId === u.id ? '...' : iFollowBack ? 'Suivi' : 'Suivre en retour'}
                              </button>
                            }
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="mt-4 text-xs text-gray-500">
                Astuce: cliquez sur un abonné pour ouvrir son profil.
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
