'use client'

import { useEffect, useMemo, useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { getAnnonces } from '@/lib/supabase/annonces'
import Link from 'next/link'

export default function ComparerPage() {
  const COMPARE_KEY = 'digicode_compare_annonces'

  const [loading, setLoading] = useState(true)
  const [allAnnonces, setAllAnnonces] = useState([])
  const [comparisonIds, setComparisonIds] = useState([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const stored = window.localStorage.getItem(COMPARE_KEY)
      setComparisonIds(stored ? JSON.parse(stored) : [])
    } catch {
      setComparisonIds([])
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      const annonces = await getAnnonces({ onlyCourtiers: true })
      setAllAnnonces(annonces)
      setLoading(false)
    }
    load()
  }, [])

  const annonces = useMemo(() => {
    return (comparisonIds || []).map((id) => allAnnonces.find((a) => a.id === id)).filter(Boolean)
  }, [comparisonIds, allAnnonces])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA/mois'
  }

  const clearComparison = () => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.removeItem(COMPARE_KEY)
    } catch {
      // ignore
    }
    setComparisonIds([])
  }

  const remove = (id) => {
    if (typeof window === 'undefined') return
    const next = (comparisonIds || []).filter((x) => x !== id)
    try {
      window.localStorage.setItem(COMPARE_KEY, JSON.stringify(next))
    } catch {
      // ignore
    }
    setComparisonIds(next)
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Comparer</h1>
                  <p className="text-gray-600">Compare jusqu'à 3 annonces.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/annonces"
                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-gray-900 rounded-lg text-sm font-medium transition-colors"
                  >
                    Retour aux annonces
                  </Link>
                  <button
                    type="button"
                    onClick={clearComparison}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors"
                  >
                    Vider
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Chargement...</p>
                </div>
              ) : annonces.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Aucune annonce en comparaison</h2>
                  <p className="text-gray-600 mb-4">Ajoute des annonces depuis la page des annonces.</p>
                  <Link
                    href="/annonces"
                    className="inline-flex items-center justify-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-gray-900 rounded-lg text-sm font-medium transition-colors"
                  >
                    Aller aux annonces
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
                  <table className="min-w-[900px] w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left p-4 text-sm font-semibold text-gray-700 w-[180px]">Critère</th>
                        {annonces.map((a) => (
                          <th key={a.id} className="p-4 text-left">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <Link href={`/annonces/${a.id}`} className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2">
                                  {a.titre}
                                </Link>
                                <div className="text-sm text-gray-500">{a.quartier}, {a.ville}</div>
                              </div>
                              <button
                                type="button"
                                onClick={() => remove(a.id)}
                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-medium transition-colors"
                              >
                                Retirer
                              </button>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="p-4 text-sm font-medium text-gray-700">Prix</td>
                        {annonces.map((a) => (
                          <td key={a.id} className="p-4 text-primary-700 font-semibold">{formatPrice(a.prix)}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="p-4 text-sm font-medium text-gray-700">Type</td>
                        {annonces.map((a) => (
                          <td key={a.id} className="p-4 text-gray-800">{a.type || '-'}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="p-4 text-sm font-medium text-gray-700">Superficie</td>
                        {annonces.map((a) => (
                          <td key={a.id} className="p-4 text-gray-800">{a.superficie ? `${a.superficie} m²` : '-'}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="p-4 text-sm font-medium text-gray-700">Chambres</td>
                        {annonces.map((a) => (
                          <td key={a.id} className="p-4 text-gray-800">{a.chambres || '-'}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="p-4 text-sm font-medium text-gray-700">Salles de bain</td>
                        {annonces.map((a) => (
                          <td key={a.id} className="p-4 text-gray-800">{a.sallesDeBain || '-'}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="p-4 text-sm font-medium text-gray-700">Meublé</td>
                        {annonces.map((a) => (
                          <td key={a.id} className="p-4 text-gray-800">{a.meuble ? 'Oui' : 'Non'}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 text-sm font-medium text-gray-700">Description</td>
                        {annonces.map((a) => (
                          <td key={a.id} className="p-4 text-gray-700 whitespace-pre-wrap">{a.description || '-'}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
