'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { FiHelpCircle } from 'react-icons/fi'

export default function AidePage() {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Centre d'aide</h1>
                <p className="text-gray-600">Besoin d'aide ? Consultez notre documentation</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <FiHelpCircle className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Centre d'aide</h3>
                <p className="text-gray-600">Documentation et support disponibles prochainement</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
