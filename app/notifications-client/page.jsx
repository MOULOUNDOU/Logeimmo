'use client'

import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { FiBell } from 'react-icons/fi'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/supabase/auth'
import { FiUser, FiHome, FiUsers } from 'react-icons/fi'
import RowItem from '@/components/RowItem'

export default function NotificationsClientPage() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [me, setMe] = useState(null)
  const [replyOpenId, setReplyOpenId] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [editOpenId, setEditOpenId] = useState(null)
  const [editText, setEditText] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  const getNotifIcon = (n) => {
    if (n.type === 'annonce') return <FiHome size={18} />
    if (n.type === 'follow') return <FiUsers size={18} />
    return <FiBell size={18} />
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const authData = await getCurrentUser()
      setMe(authData?.user || null)
      const userId = authData?.user?.id
      if (!userId) {
        setItems([])
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*, sender:profiles!notifications_sender_id_fkey(id, nom, email, telephone, photo_profil), message:messages!notifications_message_id_fkey(id, content, created_at)')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error(error)
        setItems([])
        setLoading(false)
        return
      }

      setItems(data || [])
      setLoading(false)
    }

    load()
  }, [])

  const markAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
      if (error) throw error
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    } catch (e) {
      console.error(e)
    }
  }

  const deleteNotification = async (id) => {
    try {
      const { error } = await supabase.from('notifications').delete().eq('id', id)
      if (error) throw error
      setItems((prev) => prev.filter((n) => n.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  const sendReply = async (notification) => {
    try {
      if (!replyText.trim()) return
      if (!me?.id) return

      setSendingReply(true)
      const senderId = me.id
      const recipientId = notification.sender_id
      if (!recipientId) throw new Error('Impossible de répondre')

      const { data: msgRow, error: msgError } = await supabase
        .from('messages')
        .insert({ sender_id: senderId, recipient_id: recipientId, content: replyText.trim() })
        .select('id')
        .single()
      if (msgError) throw msgError

      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          recipient_id: recipientId,
          sender_id: senderId,
          message_id: msgRow?.id || null,
          type: 'message',
          title: 'Réponse du client',
          body: replyText.trim(),
          link: '/notifications'
        })
      if (notifError) throw notifError

      setReplyText('')
      setReplyOpenId(null)
    } catch (e) {
      console.error(e)
    } finally {
      setSendingReply(false)
    }
  }

  const saveEdit = async (notification) => {
    try {
      if (!editText.trim()) return
      if (!me?.id) return
      if (notification.sender_id !== me.id) return

      setSavingEdit(true)

      if (notification.message_id) {
        const { error: msgError } = await supabase
          .from('messages')
          .update({ content: editText.trim() })
          .eq('id', notification.message_id)
        if (msgError) throw msgError
      }

      const { error: notifError } = await supabase
        .from('notifications')
        .update({ body: editText.trim() })
        .eq('id', notification.id)
      if (notifError) throw notifError

      setItems((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? {
                ...n,
                body: editText.trim(),
                message: n.message ? { ...n.message, content: editText.trim() } : n.message
              }
            : n
        )
      )

      setEditOpenId(null)
      setEditText('')
    } catch (e) {
      console.error(e)
    } finally {
      setSavingEdit(false)
    }
  }

  return (
    <ProtectedRoute requiredRole="client">
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <FiBell className="text-primary-500" size={28} />
                  <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                </div>
                <p className="text-gray-600">Vos notifications apparaîtront ici.</p>
              </div>

              {loading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <p className="text-gray-600">Chargement...</p>
                </div>
              ) : items.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <FiBell className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune notification</h3>
                  <p className="text-gray-600">Aucune notification pour le moment.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="divide-y divide-gray-200">
                    {items.map((n) => (
                      <div key={n.id} className="p-2 sm:p-3">
                        <RowItem
                          href={n.link || undefined}
                          icon={
                            <span className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${
                              n.read ? 'bg-gray-100 text-gray-600' : 'bg-primary-100 text-primary-700'
                            }`}
                            >
                              {getNotifIcon(n)}
                            </span>
                          }
                          title={n.title}
                          subtitle={
                            (n.message?.content || n.body || '')
                              ? `${(n.message?.content || n.body || '').slice(0, 80)}${(n.message?.content || n.body || '').length > 80 ? '…' : ''}`
                              : ''
                          }
                          right={
                            <div className="text-right">
                              <p className="text-[11px] text-gray-500">{new Date(n.created_at).toLocaleString('fr-FR')}</p>
                              {!n.read && <p className="text-[11px] font-semibold text-primary-600 mt-0.5">Nouveau</p>}
                            </div>
                          }
                        />

                        {n.sender && (
                          <div className="mt-2 px-2 sm:px-3 flex items-center gap-2 min-w-0">
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                              {n.sender.photo_profil ? (
                                <img src={n.sender.photo_profil} alt={n.sender.nom} className="h-8 w-8 object-cover" />
                              ) : (
                                <FiUser className="text-gray-500" size={16} />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              De: {n.sender.nom} — {n.sender.email}{n.sender.telephone ? ` — ${n.sender.telephone}` : ''}
                            </p>
                          </div>
                        )}

                        <div className="mt-3 px-2 sm:px-3 flex flex-wrap items-center gap-2">
                          {me?.id && n.sender_id === me.id && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditOpenId((prev) => (prev === n.id ? null : n.id))
                                setEditText(n.message?.content || n.body || '')
                              }}
                              data-no-global-loader="true"
                              className="px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                            >
                              Modifier
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setReplyOpenId((prev) => (prev === n.id ? null : n.id))
                              setReplyText('')
                            }}
                            data-no-global-loader="true"
                            className="px-3 py-2 text-sm rounded-lg bg-primary-500 hover:bg-primary-600 text-gray-900"
                          >
                            Répondre
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteNotification(n.id)}
                            data-no-global-loader="true"
                            className="px-3 py-2 text-sm rounded-lg bg-red-50 hover:bg-red-100 text-red-700"
                          >
                            Supprimer
                          </button>
                          {!n.read && (
                            <button
                              type="button"
                              onClick={() => markAsRead(n.id)}
                              data-no-global-loader="true"
                              className="px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                            >
                              Marquer lu
                            </button>
                          )}
                        </div>

                        {editOpenId === n.id && (
                          <div className="mt-4 space-y-3">
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full min-h-[90px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                              placeholder="Modifier votre message..."
                            />
                            <button
                              type="button"
                              onClick={() => saveEdit(n)}
                              disabled={savingEdit}
                              className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50"
                            >
                              {savingEdit ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                          </div>
                        )}

                        {replyOpenId === n.id && (
                          <div className="mt-4 space-y-3">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="w-full min-h-[90px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                              placeholder="Écrivez votre réponse..."
                            />
                            <button
                              type="button"
                              onClick={() => sendReply(n)}
                              disabled={sendingReply}
                              className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50"
                            >
                              {sendingReply ? 'Envoi...' : 'Envoyer la réponse'}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
