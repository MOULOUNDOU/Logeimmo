'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { USER_ROLES, getCurrentUser, getAllUsers, updateUserRole } from '@/lib/supabase/auth'
import { getAnnonces, deleteAnnonce, updateAnnonceStatus } from '@/lib/supabase/annonces'
import { supabase } from '@/lib/supabase'
import { FiUsers, FiHome, FiTrash2, FiShield, FiBarChart2, FiSearch, FiRefreshCw } from 'react-icons/fi'

function AdminPage() {
  const [activeTab, setActiveTab] = useState('stats')
  const [users, setUsers] = useState([])
  const [annonces, setAnnonces] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('')

  const [annonceSearch, setAnnonceSearch] = useState('')
  const [annonceVilleFilter, setAnnonceVilleFilter] = useState('')
  const [annonceStatusFilter, setAnnonceStatusFilter] = useState('')

  const [periodDays, setPeriodDays] = useState(30)
  const [statsLoading, setStatsLoading] = useState(false)
  const [stats, setStats] = useState({
    annoncesTotal: 0,
    annoncesActive: 0,
    likesPeriod: 0,
    messagesPeriod: 0,
    topVilles: []
  })

  useEffect(() => {
    const load = async () => {
      if (typeof window === 'undefined') return

      const authData = await getCurrentUser()
      if (!authData?.user || authData.user.role !== USER_ROLES.ADMIN) {
        setLoading(false)
        return
      }
      await loadData()
    }

    load()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [allUsers, allAnnonces] = await Promise.all([
      getAllUsers(),
      getAnnonces({ onlyCourtiers: false, includeAllStatuses: true })
    ])
    setUsers(allUsers)
    setAnnonces(allAnnonces)
    setLoading(false)
  }

  const handleAnnonceStatus = async (annonceId, status) => {
    try {
      setMessage('')
      await updateAnnonceStatus(annonceId, status)
      await loadData()
      setMessage('Statut de l\'annonce mis à jour avec succès')
    } catch (error) {
      setMessage('Erreur: ' + (error.message || error))
    }
  }

  const handleRoleChange = async (userId, role) => {
    try {
      setMessage('')
      await updateUserRole(userId, role)
      await loadData()
      setMessage('Rôle mis à jour avec succès')
    } catch (error) {
      setMessage('Erreur: ' + (error.message || error))
    }
  }

  const getPeriodStartISO = () => {
    const d = new Date()
    d.setDate(d.getDate() - periodDays)
    return d.toISOString()
  }

  useEffect(() => {
    const run = async () => {
      if (!users || !annonces) return
      await loadStats(users, annonces)
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users.length, annonces.length, periodDays])

  const loadStats = async (_users, _annonces) => {
    setStatsLoading(true)
    try {
      const periodStart = getPeriodStartISO()

      const annoncesTotal = (_annonces || []).length
      const annoncesActive = (_annonces || []).filter(a => a.status === 'active').length

      const { count: likesCount, error: likesErr } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', periodStart)
      if (likesErr) throw likesErr

      const { count: messagesCount, error: msgErr } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', periodStart)
      if (msgErr) throw msgErr

      const villeCounts = {}
      ;(_annonces || []).forEach(a => {
        const key = a.ville || '—'
        villeCounts[key] = (villeCounts[key] || 0) + 1
      })
      const topVilles = Object.entries(villeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([ville, count]) => ({ ville, count }))

      setStats({
        annoncesTotal,
        annoncesActive,
        likesPeriod: likesCount || 0,
        messagesPeriod: messagesCount || 0,
        topVilles
      })
    } catch (e) {
      console.error(e)
    } finally {
      setStatsLoading(false)
    }
  }

  const handleDeleteAnnonce = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      try {
        await deleteAnnonce(id)
        await loadData()
        alert('Annonce supprimée avec succès')
      } catch (error) {
        alert('Erreur lors de la suppression: ' + error.message)
      }
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return 'bg-red-100 text-red-800'
      case USER_ROLES.COURTIER:
        return 'bg-primary-100 text-primary-800'
      case USER_ROLES.CLIENT:
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredUsers = users.filter(u => {
    const q = userSearch.trim().toLowerCase()
    const matchesText = !q || (u.nom || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
    const matchesRole = !userRoleFilter || u.role === userRoleFilter
    return matchesText && matchesRole
  })

  const villes = Array.from(new Set(annonces.map(a => a.ville).filter(Boolean))).sort((a, b) => a.localeCompare(b))

  const filteredAnnonces = annonces.filter(a => {
    const q = annonceSearch.trim().toLowerCase()
    const matchesText = !q || (a.titre || '').toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q)
    const matchesVille = !annonceVilleFilter || a.ville === annonceVilleFilter
    const matchesStatus = !annonceStatusFilter || a.status === annonceStatusFilter
    return matchesText && matchesVille && matchesStatus
  })

  if (loading) {
    return (
      <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
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
    <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <FiShield className="text-primary-500" size={32} />
                  <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
                </div>
                <p className="text-gray-600">Gérez les utilisateurs et les annonces</p>
              </div>

              {message && (
                <div className={`mb-6 p-4 rounded-lg ${
                  message.startsWith('Erreur') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'
                }`}>
                  {message}
                </div>
              )}

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('stats')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'stats'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FiBarChart2 className="inline mr-2" size={18} />
                    Statistiques
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'users'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FiUsers className="inline mr-2" size={18} />
                    Utilisateurs ({filteredUsers.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('annonces')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'annonces'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FiHome className="inline mr-2" size={18} />
                    Annonces ({filteredAnnonces.length})
                  </button>
                </nav>
              </div>

              {activeTab === 'stats' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4 flex-col md:flex-row">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Vue d'ensemble</h2>
                      <p className="text-gray-600">Statistiques globales sur la période sélectionnée</p>
                    </div>
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
                      <button
                        type="button"
                        onClick={() => loadData()}
                        className="px-3 py-1 rounded-md text-sm text-gray-700 hover:bg-gray-100"
                        title="Rafraîchir"
                      >
                        <FiRefreshCw size={16} className="inline" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                      <p className="text-sm text-gray-600">Annonces (total)</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.annoncesTotal}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                      <p className="text-sm text-gray-600">Annonces actives</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.annoncesActive}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                      <p className="text-sm text-gray-600">Likes ({periodDays}j)</p>
                      <p className="text-2xl font-bold text-gray-900">{statsLoading ? '...' : stats.likesPeriod}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                      <p className="text-sm text-gray-600">Messages ({periodDays}j)</p>
                      <p className="text-2xl font-bold text-gray-900">{statsLoading ? '...' : stats.messagesPeriod}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top villes (par nombre d'annonces)</h3>
                    {stats.topVilles.length === 0 ? (
                      <p className="text-gray-600">Aucune donnée</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {stats.topVilles.map((v) => (
                          <div key={v.ville} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                            <span className="text-sm text-gray-900">{v.ville}</span>
                            <span className="text-sm font-semibold text-gray-900">{v.count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          placeholder="Rechercher un utilisateur (nom/email)"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <select
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Tous les rôles</option>
                        <option value={USER_ROLES.CLIENT}>client</option>
                        <option value={USER_ROLES.COURTIER}>courtier</option>
                        <option value={USER_ROLES.ADMIN}>admin</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => { setUserSearch(''); setUserRoleFilter('') }}
                        className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Réinitialiser
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Utilisateur
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rôle
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Téléphone
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date d'inscription
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                  <FiUsers className="text-primary-600" size={20} />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{user.nom}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.telephone || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {user.role !== USER_ROLES.ADMIN ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleRoleChange(user.id, user.role === USER_ROLES.CLIENT ? USER_ROLES.COURTIER : USER_ROLES.CLIENT)}
                                    className="px-3 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                                  >
                                    Basculer rôle
                                  </button>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredUsers.length === 0 && (
                    <div className="p-12 text-center">
                      <FiUsers className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-600">Aucun utilisateur trouvé</p>
                    </div>
                  )}
                </div>
                </div>
              )}

              {/* Annonces Tab */}
              {activeTab === 'annonces' && (
                <div className="space-y-4">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="relative md:col-span-2">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          value={annonceSearch}
                          onChange={(e) => setAnnonceSearch(e.target.value)}
                          placeholder="Rechercher une annonce (titre/description)"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <select
                        value={annonceVilleFilter}
                        onChange={(e) => setAnnonceVilleFilter(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Toutes les villes</option>
                        {villes.map(v => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                      <select
                        value={annonceStatusFilter}
                        onChange={(e) => setAnnonceStatusFilter(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Tous les statuts</option>
                        <option value="active">active</option>
                        <option value="inactive">inactive</option>
                        <option value="archived">archived</option>
                      </select>
                    </div>
                  </div>

                  {filteredAnnonces.map((annonce) => (
                    <div key={annonce.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              annonce.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : annonce.status === 'inactive'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {annonce.status}
                          </span>
                          <h3 className="font-semibold text-gray-900 truncate">{annonce.titre}</h3>
                          <span className="text-xs px-2 py-1 rounded-full bg-primary-100 text-primary-800">{annonce.type}</span>
                        </div>
                        <div className="mt-2 text-sm text-gray-600 flex flex-wrap gap-3">
                          <span>{formatPrice(annonce.prix)}</span>
                          <span>{annonce.superficie} m²</span>
                          <span>{annonce.ville}, {annonce.quartier}</span>
                        </div>
                        <div className="mt-3 text-xs text-gray-500">
                          Publié par <span className="font-medium">{annonce.createdByNom}</span> le{' '}
                          {new Date(annonce.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <select
                          value={annonce.status}
                          onChange={(e) => handleAnnonceStatus(annonce.id, e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 flex-1 md:flex-none"
                          title="Changer le statut"
                        >
                          <option value="active">active</option>
                          <option value="inactive">inactive</option>
                          <option value="archived">archived</option>
                        </select>
                        <button
                          onClick={() => handleDeleteAnnonce(annonce.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <FiTrash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredAnnonces.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                      <FiHome className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-600">Aucune annonce trouvée</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default AdminPage

