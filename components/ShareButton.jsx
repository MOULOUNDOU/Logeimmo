'use client'

import { useState } from 'react'
import { FiShare2, FiCopy, FiCheck } from 'react-icons/fi'

export default function ShareButton({ annonceId, titre }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    const url = `${window.location.origin}/annonces/${annonceId}`
    const shareText = `Découvrez cette annonce: ${titre}`

    // Vérifier si l'API Web Share est disponible
    if (navigator.share) {
      try {
        await navigator.share({
          title: titre,
          text: shareText,
          url: url
        })
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Erreur lors du partage:', error)
          copyToClipboard(url)
        }
      }
    } else {
      // Fallback: copier le lien
      copyToClipboard(url)
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
