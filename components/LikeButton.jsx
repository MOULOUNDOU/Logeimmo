'use client'

import { useState, useEffect } from 'react'
import { FiHeart } from 'react-icons/fi'
import { getCurrentUser } from '@/lib/supabase/auth'
import { getLikeCount, hasUserLiked, toggleLike } from '@/lib/supabase/likes'

export default function LikeButton({ annonceId, showCount = true }) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [user, setUser] = useState(null)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      if (typeof window === 'undefined') return
      const authData = await getCurrentUser()
      if (!mounted) return

      setUser(authData?.user || null)

      const count = await getLikeCount(annonceId)
      if (!mounted) return
      setLikeCount(count)

      if (authData?.user) {
        const userLiked = await hasUserLiked(authData.user.id, annonceId)
        if (!mounted) return
        setLiked(userLiked)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [annonceId])

  const handleLike = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!user) {
      alert('Vous devez être connecté pour liker une annonce')
      return
    }

    try {
      ;(async () => {
        const nextLiked = await toggleLike(user.id, annonceId)
        setLiked(nextLiked)
        const count = await getLikeCount(annonceId)
        setLikeCount(count)
      })()
    } catch (error) {
      console.error('Erreur lors du like:', error)
      alert('Erreur lors du like')
    }
  }

  return (
    <button
      onClick={handleLike}
      className={`flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg transition-colors ${
        liked
          ? 'bg-red-50 text-red-600 hover:bg-red-100'
          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
      }`}
      title={liked ? 'Retirer le like' : 'Ajouter un like'}
    >
      <FiHeart className={liked ? 'fill-current' : ''} size={20} />
      {showCount && likeCount > 0 && (
        <span className="text-sm font-medium hidden sm:inline">{likeCount}</span>
      )}
    </button>
  )
}
