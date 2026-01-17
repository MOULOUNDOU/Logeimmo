'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiHome, FiMapPin, FiMaximize2, FiUser } from 'react-icons/fi'
import LikeButton from './LikeButton'
import ShareButton from './ShareButton'

export default function AnnonceCarousel({ annonces }) {
  const [displayedAnnonces, setDisplayedAnnonces] = useState([])

  useEffect(() => {
    // Afficher les 6 premières annonces
    setDisplayedAnnonces(annonces.slice(0, 6))
  }, [annonces])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA/mois'
  }

  if (displayedAnnonces.length === 0) {
    return null
  }

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-xl">
        <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4">
          {displayedAnnonces.map((annonce) => (
            <div key={annonce.id} className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 snap-start">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                {/* Image */}
                <Link href={`/annonces/${annonce.id}`}>
                  <div className="h-64 bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden cursor-pointer group">
                    {annonce.photos && annonce.photos.length > 0 ? (
                      <img
                        src={annonce.photos[0]}
                        alt={annonce.titre}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiHome className="text-primary-600" size={64} />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="inline-block px-3 py-1 bg-primary-500 text-gray-900 text-xs font-medium rounded-full">
                        {annonce.type}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Content */}
                <div className="p-6">
                  <Link href={`/annonces/${annonce.id}`}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
                      {annonce.titre}
                    </h3>
                  </Link>
                  <p className="text-2xl font-bold text-primary-600 mb-4">
                    {formatPrice(annonce.prix)}
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiMapPin size={16} />
                      <span>{annonce.quartier}, {annonce.ville}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiMaximize2 size={16} />
                      <span>{annonce.superficie} m²</span>
                    </div>
                  </div>

                  {/* Courtier info */}
                  <div className="flex items-center gap-3 mb-4 pt-4 border-t border-gray-200">
                    {annonce.createdByPhoto ? (
                      <img
                        src={annonce.createdByPhoto}
                        alt={annonce.createdByNom}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <FiUser className="text-primary-600" size={20} />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{annonce.createdByNom}</p>
                      <p className="text-xs text-gray-500">Courtier</p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200">
                    <LikeButton annonceId={annonce.id} />
                    <ShareButton annonceId={annonce.id} titre={annonce.titre} />
                    <Link
                      href={`/annonces/${annonce.id}`}
                      className="w-full sm:w-auto sm:ml-auto px-4 py-2 bg-primary-500 hover:bg-primary-600 text-gray-900 rounded-lg text-sm font-medium transition-colors text-center"
                    >
                      Voir détails
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

