'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { getCurrentUser, canPublishAnnonces } from '@/lib/supabase/auth'
import { getAnnoncesByCourtier, deleteAnnonce } from '@/lib/supabase/annonces'
import { supabase } from '@/lib/supabase'
import { FiHome, FiEdit, FiTrash2, FiPlus, FiEye, FiUser, FiBarChart2, FiTrendingUp, FiMessageCircle, FiMapPin } from 'react-icons/fi'
import Link from 'next/link'

function DashboardCourtierPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [mesAnnonces, setMesAnnonces] = useState([])
  const [loading, setLoading] = useState(true)
  const [periodDays, setPeriodDays] = useState(30)
  const [statsLoading, setStatsLoading] = useState(false)
  const [kpis, setKpis] = useState({
    annoncesTotal: 0,
    likesPeriod: 0,
    messagesPeriod: 0,
    topAnnonceTitle: '',
    topAnnonceLikes: 0
  })
  const [likesByDay, setLikesByDay] = useState([])
  const [messagesByDay, setMessagesByDay] = useState([])
  const [topZones, setTopZones] = useState([])

  const getFirstPhoto = (photos) => {
    if (!photos) return null
    if (Array.isArray(photos)) return photos[0] || null
    if (typeof photos === 'string') {
      try {
        const parsed = JSON.parse(photos)
        if (Array.isArray(parsed)) return parsed[0] || null
      } catch (e) {
        return photos
      }
    }
    return null
  }

  useEffect(() => {
    const load = async () => {
      if (typeof window === 'undefined') return

      const authData = await getCurrentUser()
      if (!authData) {
        router.push('/login')
        return
      }

      const canPublish = await canPublishAnnonces()
      if (!canPublish) {
        router.push('/annonces')
        return
      }

      setUser(authData.user)
      await loadMesAnnonces(authData.user.id)
    }

    load()
  }, [router])

  useEffect(() => {
    const run = async () => {
      if (!user?.id) return
      if (!mesAnnonces) return
      await loadAnalytics(user.id, mesAnnonces)
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, periodDays, mesAnnonces.length])

  const loadMesAnnonces = async (userId) => {
    const mes = await getAnnoncesByCourtier(userId)
    setMesAnnonces(mes)
    setLoading(false)
  }

  const getPeriodStartISO = () => {
    const d = new Date()
    d.setDate(d.getDate() - periodDays)
    return d.toISOString()
  }

  const formatDay = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
  }

  const buildEmptyDays = () => {
    const result = []
    const now = new Date()
    for (let i = periodDays - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      result.push({ day: key, label: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }), count: 0 })
    }
    return result
  }

  const loadAnalytics = async (userId, annonces) => {
    setStatsLoading(true)
    try {
      const annonceIds = (annonces || []).map(a => a.id)
      const periodStart = getPeriodStartISO()

      setKpis(prev => ({ ...prev, annoncesTotal: annonceIds.length }))

      if (annonceIds.length === 0) {
        setKpis({ annoncesTotal: 0, likesPeriod: 0, messagesPeriod: 0, topAnnonceTitle: '', topAnnonceLikes: 0 })
        setLikesByDay([])
        setMessagesByDay([])
        setTopZones([])
        return
      }

      const { data: likesRows, error: likesError } = await supabase
        .from('likes')
        .select('annonce_id, created_at')
        .in('annonce_id', annonceIds)
        .gte('created_at', periodStart)

      if (likesError) throw likesError

      const { data: messagesRows, error: msgError } = await supabase
        .from('messages')
        .select('id, created_at')
        .eq('recipient_id', userId)
        .gte('created_at', periodStart)

      if (msgError) throw msgError

      // Likes by day
      const likesDays = buildEmptyDays()
      const likesMap = new Map(likesDays.map(d => [d.day, d]))
      ;(likesRows || []).forEach(r => {
        const dayKey = new Date(r.created_at).toISOString().slice(0, 10)
        const slot = likesMap.get(dayKey)
        if (slot) slot.count += 1
      })
      setLikesByDay(likesDays)

      // Messages by day
      const msgDays = buildEmptyDays()
      const msgMap = new Map(msgDays.map(d => [d.day, d]))
      ;(messagesRows || []).forEach(r => {
        const dayKey = new Date(r.created_at).toISOString().slice(0, 10)
        const slot = msgMap.get(dayKey)
        if (slot) slot.count += 1
      })
      setMessagesByDay(msgDays)

      // Top annonce by likes (period)
      const likesByAnnonce = {}
      ;(likesRows || []).forEach(r => {
        likesByAnnonce[r.annonce_id] = (likesByAnnonce[r.annonce_id] || 0) + 1
      })
      let topAnnonceId = null
      let topCount = 0
      Object.entries(likesByAnnonce).forEach(([id, c]) => {
        if (c > topCount) {
          topCount = c
          topAnnonceId = id
        }
      })
      const topAnnonce = (annonces || []).find(a => a.id === topAnnonceId)

      // Top zones (ville/quartier) par likes (period)
      const zoneCounts = {}
      ;(likesRows || []).forEach(r => {
        const a = (annonces || []).find(x => x.id === r.annonce_id)
        if (!a) return
        const key = `${a.ville || ''}__${a.quartier || ''}`
        zoneCounts[key] = (zoneCounts[key] || 0) + 1
      })
      const zonesSorted = Object.entries(zoneCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([key, count]) => {
          const [ville, quartier] = key.split('__')
          return { ville, quartier, count }
        })
      setTopZones(zonesSorted)

      setKpis({
        annoncesTotal: annonceIds.length,
        likesPeriod: (likesRows || []).length,
        messagesPeriod: (messagesRows || []).length,
        topAnnonceTitle: topAnnonce?.titre || '',
        topAnnonceLikes: topCount
      })
    } catch (e) {
      console.error(e)
    } finally {
      setStatsLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      try {
        await deleteAnnonce(id)
        if (user?.id) {
          await loadMesAnnonces(user.id)
        }
        alert('Annonce supprimée avec succès')
      } catch (error) {
        alert('Erreur lors de la suppression: ' + error.message)
      }
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA/mois'
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen bg-gray-50 items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-start justify-between mb-8 gap-6 flex-col md:flex-row">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <FiBarChart2 className="text-primary-500" size={28} />
                    <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
                  </div>
                  <p className="text-gray-600">Suivez vos annonces, réactions et messages</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-2">
                    <button
                      type="button"
                      onClick={() => setPeriodDays(7)}
                      className={`px-3 py-1 rounded-md text-sm ${periodDays === 7 ? 'bg-primary-500 text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      7j
                    </button>
                    <button
                      type="button"
                      onClick={() => setPeriodDays(30)}
                      className={`px-3 py-1 rounded-md text-sm ${periodDays === 30 ? 'bg-primary-500 text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      30j
                    </button>
                    <button
                      type="button"
                      onClick={() => setPeriodDays(90)}
                      className={`px-3 py-1 rounded-md text-sm ${periodDays === 90 ? 'bg-primary-500 text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      90j
                    </button>
                  </div>
                </div>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Annonces publiées</p>
                      <p className="text-2xl font-bold text-gray-900">{kpis.annoncesTotal}</p>
                    </div>
                    <FiHome className="text-primary-500" size={22} />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Réactions (likes) - {periodDays}j</p>
                      <p className="text-2xl font-bold text-gray-900">{statsLoading ? '...' : kpis.likesPeriod}</p>
                    </div>
                    <FiTrendingUp className="text-primary-500" size={22} />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Messages reçus - {periodDays}j</p>
                      <p className="text-2xl font-bold text-gray-900">{statsLoading ? '...' : kpis.messagesPeriod}</p>
                    </div>
                    <FiMessageCircle className="text-primary-500" size={22} />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm text-gray-600">Top annonce - {periodDays}j</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{kpis.topAnnonceTitle || '—'}</p>
                      <p className="text-xs text-gray-600">{statsLoading ? '...' : `${kpis.topAnnonceLikes} likes`}</p>
                    </div>
                    <FiUser className="text-primary-500" size={22} />
                  </div>
                </div>
              </div>

              {/* Graphes + zones */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Évolution des réactions (likes)</h2>
                  {(likesByDay || []).length === 0 ? (
                    <p className="text-gray-600">Aucune donnée</p>
                  ) : (
                    <div className="grid grid-cols-10 gap-2 items-end h-44">
                      {likesByDay.slice(-10).map((d) => {
                        const max = Math.max(...likesByDay.map(x => x.count), 1)
                        const h = Math.round((d.count / max) * 100)
                        return (
                          <div key={d.day} className="flex flex-col items-center gap-2">
                            <div className="w-5 bg-primary-500 rounded-md" style={{ height: `${Math.max(6, h)}%` }} />
                            <span className="text-[10px] text-gray-500">{d.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Zones les plus actives</h2>
                  {topZones.length === 0 ? (
                    <p className="text-gray-600">Aucune donnée</p>
                  ) : (
                    <div className="space-y-3">
                      {topZones.map((z, idx) => (
                        <div key={`${z.ville}-${z.quartier}-${idx}`} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <FiMapPin className="text-primary-500" size={16} />
                            <span className="text-sm text-gray-900 truncate">{z.ville}{z.quartier ? ` - ${z.quartier}` : ''}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{z.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-3">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Évolution des messages reçus</h2>
                  {(messagesByDay || []).length === 0 ? (
                    <p className="text-gray-600">Aucune donnée</p>
                  ) : (
                    <div className="grid grid-cols-10 gap-2 items-end h-44">
                      {messagesByDay.slice(-10).map((d) => {
                        const max = Math.max(...messagesByDay.map(x => x.count), 1)
                        const h = Math.round((d.count / max) * 100)
                        return (
                          <div key={d.day} className="flex flex-col items-center gap-2">
                            <div className="w-5 bg-gray-900 rounded-md" style={{ height: `${Math.max(6, h)}%` }} />
                            <span className="text-[10px] text-gray-500">{d.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* Liste des annonces */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Toutes mes annonces</h2>
                <p className="text-gray-600">Liste complète de vos annonces publiées</p>
              </div>

              {mesAnnonces.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <FiHome className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune annonce</h3>
                  <p className="text-gray-600 mb-6">Commencez par publier votre première annonce</p>
                  <Link
                    href="/publier"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-gray-900 rounded-lg transition-colors font-medium"
                  >
                    <FiPlus size={20} />
                    <span>Publier une annonce</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mesAnnonces.map((annonce) => (
                    <div key={annonce.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                      {/* Image */}
                      <Link href={`/annonces/${annonce.id}`}>
                        <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden cursor-pointer group">
                          {getFirstPhoto(annonce.photos) ? (
                            <img
                              src={getFirstPhoto(annonce.photos)}
                              alt={annonce.titre}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiHome className="text-primary-600" size={64} />
                            </div>
                          )}
                          <div className="absolute top-3 left-3">
                            <span className="inline-block px-3 py-1 bg-primary-500 text-gray-900 text-xs font-medium rounded-full">
                              {annonce.type}
                            </span>
                          </div>
                        </div>
                      </Link>

                      {/* Content */}
                      <div className="p-4 sm:p-6">
                        <Link href={`/annonces/${annonce.id}`}>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
                            {annonce.titre}
                          </h3>
                        </Link>
                        <p className="text-2xl font-bold text-primary-600 mb-4">
                          {formatPrice(annonce.prix)}
                        </p>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {annonce.description}
                        </p>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-200">
                          <Link
                            href={`/annonces/${annonce.id}`}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Voir l'annonce"
                          >
                            <FiEye size={18} />
                            <span>Voir</span>
                          </Link>
                          <Link
                            href={`/annonces/editer/${annonce.id}`}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Modifier l'annonce"
                          >
                            <FiEdit size={18} />
                            <span>Modifier</span>
                          </Link>
                          <button
                            onClick={() => handleDelete(annonce.id)}
                            data-no-global-loader="true"
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <FiTrash2 size={18} />
                            <span>Supprimer</span>
                          </button>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-xs text-gray-500">
                            Publié le {new Date(annonce.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                          <p className={`text-xs mt-1 ${
                            annonce.status === 'active' ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {annonce.status === 'active' ? '✓ Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default DashboardCourtierPage

