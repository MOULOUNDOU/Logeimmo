'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { FiPackage } from 'react-icons/fi'

export default function ProPage() {
  return (
    <ProtectedRoute requiredRole="courtier">
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <FiPackage className="text-primary-500" size={28} />
                  <h1 className="text-3xl font-bold text-gray-900">Passer en version Pro</h1>
                </div>
                <p className="text-gray-600">Débloquez des fonctionnalités avancées pour gérer vos annonces</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Bientôt disponible</h2>
                <p className="text-gray-700">
                  La version Pro sera disponible prochainement.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
