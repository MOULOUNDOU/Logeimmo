'use client'

import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/supabase/auth'
import { FiMail, FiPhone, FiUser, FiSend } from 'react-icons/fi'

export default function RechercherCourtierPage() {
  const [loading, setLoading] = useState(true)
  const [courtiers, setCourtiers] = useState([])
  const [user, setUser] = useState(null)
  const [openId, setOpenId] = useState(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', text: '' })

  useEffect(() => {
    const loadUser = async () => {
      const authData = await getCurrentUser()
      setUser(authData?.user || null)
    }
    loadUser()
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nom, email, telephone, photo_profil')
        .eq('role', 'courtier')
        .order('created_at', { ascending: false })

      if (error) {
        console.error(error)
        setCourtiers([])
        setLoading(false)
        return
      }

      setCourtiers(data || [])
      setLoading(false)
    }

    load()
  }, [])

  const handleSendMessage = async (courtier) => {
    setFeedback({ type: '', text: '' })

    try {
      if (!user?.id) {
        throw new Error('Vous devez être connecté')
      }
      if (!message.trim()) {
        throw new Error('Le message est requis')
      }

      setSending(true)

      const { data: msgRow, error: msgError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: courtier.id,
          content: message.trim()
        })
        .select('id')
        .single()

      if (msgError) throw new Error(msgError.message || "Erreur lors de l'envoi")

      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          recipient_id: courtier.id,
          sender_id: user.id,
          message_id: msgRow?.id || null,
          type: 'message',
          title: 'Nouveau message',
          body: message.trim(),
          link: '/notifications'
        })

      if (notifError) {
        throw new Error(notifError.message || 'Message envoyé, mais notification échouée')
      }

      setFeedback({ type: 'success', text: 'Message envoyé avec succès.' })
      setMessage('')
      setOpenId(null)
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || "Erreur lors de l'envoi" })
    } finally {
      setSending(false)
    }
  }

  return (
    <ProtectedRoute requiredRole="client">
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Rechercher un courtier</h1>
                <p className="text-gray-600">Tous les profils des courtiers disponibles</p>
              </div>

              {loading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <p className="text-gray-600">Chargement...</p>
                </div>
              ) : courtiers.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <p className="text-gray-600">Aucun courtier trouvé.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courtiers.map((c) => (
                    <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                          {c.photo_profil ? (
                            <img src={c.photo_profil} alt={c.nom} className="h-12 w-12 object-cover" />
                          ) : (
                            <FiUser className="text-gray-500" size={22} />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{c.nom}</p>
                          <p className="text-sm text-gray-500">Courtier</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <FiMail size={16} />
                          <span className="truncate">{c.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <FiPhone size={16} />
                          <span>{c.telephone || 'Non renseigné'}</span>
                        </div>
                      </div>

                      <div className="mt-5">
                        <button
                          type="button"
                          onClick={() => {
                            setFeedback({ type: '', text: '' })
                            setOpenId((prev) => (prev === c.id ? null : c.id))
                          }}
                          className="w-full px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-gray-900 font-medium"
                        >
                          Envoyer un message
                        </button>

                        {openId === c.id && (
                          <div className="mt-4 space-y-3">
                            <textarea
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              className="w-full min-h-[90px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                              placeholder="Écrivez votre message..."
                            />
                            <button
                              type="button"
                              onClick={() => handleSendMessage(c)}
                              disabled={sending}
                              className="w-full px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              <FiSend size={18} />
                              {sending ? 'Envoi...' : 'Envoyer'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {feedback.text && (
                <div className={`mt-6 p-4 rounded-lg border ${
                  feedback.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {feedback.text}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
