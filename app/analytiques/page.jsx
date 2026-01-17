'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { FiBarChart2 } from 'react-icons/fi'

export default function AnalytiquesPage() {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytiques</h1>
                <p className="text-gray-600">Analysez les performances de vos annonces</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <FiBarChart2 className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Fonctionnalité à venir</h3>
                <p className="text-gray-600">Cette section sera disponible prochainement</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
