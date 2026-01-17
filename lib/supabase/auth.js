// Service d'authentification Supabase
import { supabase } from '../supabase'

const STORAGE_KEY_AUTH = 'digicode_immo_auth'

export const USER_ROLES = {
  CLIENT: 'client',
  COURTIER: 'courtier',
  ADMIN: 'admin'
}

// Inscription avec Supabase
export const register = async (userData) => {
  try {
    const emailRedirectTo =
      typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined

    // Inscrire l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        emailRedirectTo,
        data: {
          nom: userData.nom,
          telephone: userData.telephone || null,
          role: userData.role || USER_ROLES.CLIENT
        }
      }
    })

    if (authError) throw authError

    if (typeof window !== 'undefined') {
      const authCache = {
        user: {
          id: authData.user.id,
          nom: userData.nom,
          email: userData.email,
          telephone: userData.telephone,
          role: userData.role || USER_ROLES.CLIENT
        },
        token: authData.session?.access_token || null,
        loginTime: new Date().toISOString()
      }
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(authCache))
    }

    return {
      user: {
        id: authData.user.id,
        nom: userData.nom,
        email: userData.email,
        telephone: userData.telephone,
        role: userData.role || USER_ROLES.CLIENT
      },
      session: authData.session
    }
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error)
    throw new Error(error.message || 'Erreur lors de l\'inscription')
  }
}

export const updateUserRole = async (userId, role) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('*')
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error)
    throw error
  }
}

// Connexion avec Supabase
export const login = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    // Récupérer le profil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) throw profileError

    const authResult = {
      user: {
        id: profile.id,
        nom: profile.nom,
        email: profile.email,
        telephone: profile.telephone,
        role: profile.role,
        photoProfil: profile.photo_profil
      },
      session: data.session
    }

    if (typeof window !== 'undefined') {
      const authCache = {
        user: authResult.user,
        token: data.session?.access_token || null,
        loginTime: new Date().toISOString()
      }
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(authCache))
    }

    return authResult
  } catch (error) {
    console.error('Erreur lors de la connexion:', error)
    throw new Error(error.message || 'Email ou mot de passe incorrect')
  }
}

// Déconnexion
export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_AUTH)
    }
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
    throw error
  }
}

// Obtenir l'utilisateur actuel
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) return null

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) return null

    const authResult = {
      user: {
        id: profile.id,
        nom: profile.nom,
        email: profile.email,
        telephone: profile.telephone,
        role: profile.role,
        photoProfil: profile.photo_profil
      },
      session: null // La session est gérée par Supabase
    }

    if (typeof window !== 'undefined') {
      const { data: { session } } = await supabase.auth.getSession()
      const authCache = {
        user: authResult.user,
        token: session?.access_token || null,
        loginTime: new Date().toISOString()
      }
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(authCache))
    }

    return authResult
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error)
    return null
  }
}

// Obtenir l'utilisateur actuel de manière synchrone (pour compatibilité)
export const getCurrentUserSync = () => {
  if (typeof window === 'undefined') return null
  try {
    const authData = localStorage.getItem(STORAGE_KEY_AUTH)
    if (!authData) return null
    return JSON.parse(authData)
  } catch (e) {
    return null
  }
}

// Vérifier si l'utilisateur est connecté
export const isAuthenticated = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return !!user
}

// Vérifier si l'utilisateur peut publier des annonces
export const canPublishAnnonces = async () => {
  const userData = await getCurrentUser()
  if (!userData) return false
  return userData.user.role === USER_ROLES.COURTIER || userData.user.role === USER_ROLES.ADMIN
}

// Mettre à jour le profil
export const updateProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        nom: updates.nom,
        telephone: updates.telephone,
        photo_profil: updates.photoProfil,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error)
    throw error
  }
}

// Récupérer tous les profils (admin)
export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map((profile) => ({
      id: profile.id,
      nom: profile.nom,
      email: profile.email,
      telephone: profile.telephone,
      role: profile.role,
      photoProfil: profile.photo_profil,
      createdAt: profile.created_at
    }))
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    return []
  }
}

// Écouter les changements d'authentification
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback)
}
