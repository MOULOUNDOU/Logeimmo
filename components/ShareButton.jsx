'use client'

import { useState } from 'react'
import { FiShare2, FiCheck } from 'react-icons/fi'

export default function ShareButton({ annonceId, titre, description, photoUrl }) {
  const [copied, setCopied] = useState(false)

  const getShareText = () => {
    const desc = (description || '').trim()
    if (!desc) return `Découvrez cette annonce: ${titre}`
    const short = desc.length > 180 ? `${desc.slice(0, 180)}...` : desc
    return `${titre}\n\n${short}`
  }

  const tryBuildShareFile = async () => {
    if (!photoUrl) return null
    try {
      const res = await fetch(photoUrl, { mode: 'cors' })
      if (!res.ok) return null
      const blob = await res.blob()
      const ext = blob.type === 'image/png' ? 'png' : 'jpg'
      const fileName = `annonce-${annonceId}.${ext}`
      return new File([blob], fileName, { type: blob.type || 'image/jpeg' })
    } catch {
      return null
    }
  }

  const handleShare = async (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    const url = `${window.location.origin}/annonces/${annonceId}`
    const shareText = getShareText()
    const clipboardText = `${shareText}\n\n${url}`

    // Vérifier si l'API Web Share est disponible
    if (navigator.share) {
      try {
        const basePayload = {
          title: titre,
          text: shareText,
          url: url
        }

        const file = await tryBuildShareFile()
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ ...basePayload, files: [file] })
        } else {
          await navigator.share(basePayload)
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Erreur lors du partage:', error)
          copyToClipboard(clipboardText)
        }
      }
    } else {
      // Fallback: copier le lien
      copyToClipboard(clipboardText)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(error => {
      console.error('Erreur lors de la copie:', error)
      // Fallback pour les navigateurs plus anciens
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      title="Partager cette annonce"
    >
      {copied ? (
        <>
          <FiCheck size={18} />
          <span className="text-sm hidden sm:inline">Copié!</span>
        </>
      ) : (
        <>
          <FiShare2 size={18} />
          <span className="text-sm hidden sm:inline">Partager</span>
        </>
      )}
    </button>
  )
}
