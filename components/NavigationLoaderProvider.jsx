'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Image from 'next/image'

const NavigationLoaderContext = createContext(null)

export function NavigationLoaderProvider({ children }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const timeoutRef = useRef(null)

  const stopLoading = useCallback(() => {
    setIsLoading(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const startLoading = useCallback(() => {
    setIsLoading(true)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Fallback anti-blocage: si jamais une navigation échoue, on masque après 1.5s
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false)
      timeoutRef.current = null
    }, 1500)
  }, [])

  // Dès que l'URL change, on considère la navigation terminée
  useEffect(() => {
    stopLoading()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams])

  // Loader global sur clic (plus intrusif): bouton / lien / role="button"
  useEffect(() => {
    if (typeof window === 'undefined') return

    const shouldIgnoreTarget = (el) => {
      if (!el) return true

      const tag = (el.tagName || '').toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || tag === 'option') return true

      if (el.closest('[data-no-global-loader="true"]')) return true
      return false
    }

    const handleDocumentClick = (e) => {
      if (e.defaultPrevented) return

      const target = e.target
      if (!(target instanceof Element)) return
      if (shouldIgnoreTarget(target)) return

      const actionable = target.closest('a,button,[role="button"]')
      if (!actionable) return

      if (actionable instanceof HTMLButtonElement && actionable.disabled) return
      if (actionable.getAttribute('aria-disabled') === 'true') return
      if (actionable.hasAttribute('aria-expanded')) return
      if (actionable.getAttribute('aria-haspopup') === 'true') return
      if (actionable.closest('[data-no-global-loader="true"]')) return

      startLoading()
    }

    document.addEventListener('click', handleDocumentClick, true)
    return () => {
      document.removeEventListener('click', handleDocumentClick, true)
    }
  }, [startLoading])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const value = useMemo(
    () => ({ isLoading, startLoading, stopLoading }),
    [isLoading, startLoading, stopLoading]
  )

  return (
    <NavigationLoaderContext.Provider value={value}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm">
          <div className="text-center">
            <div className="mx-auto mb-4 h-24 w-24 rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800 flex items-center justify-center overflow-hidden">
              <Image
                src="/digicode-immo-logo.jpeg"
                alt="Digicode Immo"
                width={88}
                height={88}
                priority
                className="animate-pulse"
              />
            </div>
            <p className="text-gray-700 dark:text-gray-200 font-medium">Chargement...</p>
          </div>
        </div>
      )}
    </NavigationLoaderContext.Provider>
  )
}

export function useNavigationLoader() {
  const ctx = useContext(NavigationLoaderContext)
  if (!ctx) {
    throw new Error('useNavigationLoader must be used within NavigationLoaderProvider')
  }
  return ctx
}
