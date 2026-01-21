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

  const marqueeAnnonces = [...displayedAnnonces, ...displayedAnnonces]

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-xl">
        <div className="pb-4">
          <div className="annonce-marquee flex w-max gap-3">
            {marqueeAnnonces.map((annonce, index) => (
              <div key={`${annonce.id}-${index}`} className="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px]">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-[220px] sm:h-[270px] md:h-[290px] flex flex-col">
                {/* Image */}
                <Link href={`/annonces/${annonce.id}`}>
                  <div className="h-20 sm:h-28 md:h-32 bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden cursor-pointer group">
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
                      <span className="inline-block px-2 py-0.5 bg-primary-500 text-gray-900 text-[10px] font-medium rounded-full">
                        {annonce.type}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Content */}
                <div className="p-2 sm:p-3 flex-1 flex flex-col">
                  <Link href={`/annonces/${annonce.id}`}>
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-primary-600 transition-colors">
                      {annonce.titre}
                    </h3>
                  </Link>
                  <p className="text-sm sm:text-base font-bold text-primary-600 mb-1">
                    {formatPrice(annonce.prix)}
                  </p>
                  <div className="hidden sm:block space-y-1 mb-2">
                    <div className="flex items-center gap-1 text-[11px] text-gray-600">
                      <FiMapPin size={14} />
                      <span>{annonce.quartier}, {annonce.ville}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-gray-600">
                      <FiMaximize2 size={14} />
                      <span>{annonce.superficie} m²</span>
                    </div>
                  </div>

                  {/* Courtier info */}
                  <div className="hidden sm:flex items-center gap-2 mb-2 pt-2 border-t border-gray-200">
                    {annonce.createdByPhoto ? (
                      <img
                        src={annonce.createdByPhoto}
                        alt={annonce.createdByNom}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
                        <FiUser className="text-primary-600" size={16} />
                      </div>
                    )}
                    <div>
                      <p className="text-[11px] font-medium text-gray-900 leading-tight">{annonce.createdByNom}</p>
                      <p className="text-[10px] text-gray-500 leading-tight">Courtier</p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="sm:hidden mt-auto">
                    <Link
                      href={`/annonces/${annonce.id}`}
                      className="block w-full px-2 py-1 bg-primary-500 hover:bg-primary-600 text-gray-900 rounded-lg text-[11px] font-medium transition-colors text-center"
                    >
                      Voir
                    </Link>
                  </div>
                  <div className="hidden sm:flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200 mt-auto">
                    <LikeButton annonceId={annonce.id} />
                    <ShareButton
                      annonceId={annonce.id}
                      titre={annonce.titre}
                      description={annonce.description}
                      photoUrl={annonce.photos && annonce.photos.length > 0 ? annonce.photos[0] : undefined}
                    />
                    <Link
                      href={`/annonces/${annonce.id}`}
                      className="w-full sm:w-auto sm:ml-auto px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-gray-900 rounded-lg text-xs font-medium transition-colors text-center"
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

      <style jsx>{`
        .annonce-marquee {
          animation: annonce-marquee-scroll 28s linear infinite;
          will-change: transform;
        }

        @keyframes annonce-marquee-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .annonce-marquee {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}

