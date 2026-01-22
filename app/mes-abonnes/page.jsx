'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

export default function MesAbonnesPage() {
  return (
    <ProtectedRoute requiredRole="courtier">
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes abonnés</h1>
              <p className="text-gray-600">
                Cette page affichera la liste de vos abonnés. (À compléter)
              </p>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
