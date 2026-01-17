// Service pour gérer les avis avec Supabase
import { supabase } from '../supabase'
import { getCurrentUser } from './auth'

// Récupérer tous les avis d'une annonce
export const getAnnonceAvis = async (annonceId) => {
  try {
    const { data, error } = await supabase
      .from('avis')
      .select('*')
      .eq('annonce_id', annonceId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map(avis => ({
      id: avis.id,
      userId: avis.user_id,
      userName: avis.user_nom,
      userPhoto: avis.user_photo,
      annonceId: avis.annonce_id,
      courtierId: avis.courtier_id,
      note: avis.note,
      commentaire: avis.commentaire,
      createdAt: avis.created_at
    }))
  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error)
    return []
  }
}

// Récupérer tous les avis d'un courtier
export const getCourtierAvis = async (courtierId) => {
  try {
    const { data, error } = await supabase
      .from('avis')
      .select('*')
      .eq('courtier_id', courtierId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map(avis => ({
      id: avis.id,
      userId: avis.user_id,
      userName: avis.user_nom,
      userPhoto: avis.user_photo,
      annonceId: avis.annonce_id,
      courtierId: avis.courtier_id,
      note: avis.note,
      commentaire: avis.commentaire,
      createdAt: avis.created_at
    }))
  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error)
    return []
  }
}

// Calculer la note moyenne d'une annonce
export const getNoteMoyenne = async (annonceId) => {
  try {
    const { data, error } = await supabase
      .from('avis')
      .select('note')
      .eq('annonce_id', annonceId)

    if (error) throw error
    if (!data || data.length === 0) return 0

    const somme = data.reduce((acc, avis) => acc + avis.note, 0)
    return (somme / data.length).toFixed(1)
  } catch (error) {
    console.error('Erreur lors du calcul de la note moyenne:', error)
    return 0
  }
}

// Calculer la note moyenne d'un courtier
export const getCourtierNoteMoyenne = async (courtierId) => {
  try {
    const { data, error } = await supabase
      .from('avis')
      .select('note')
      .eq('courtier_id', courtierId)

    if (error) throw error
    if (!data || data.length === 0) return 0

    const somme = data.reduce((acc, avis) => acc + avis.note, 0)
    return (somme / data.length).toFixed(1)
  } catch (error) {
    console.error('Erreur lors du calcul de la note moyenne:', error)
    return 0
  }
}

// Vérifier si un utilisateur a déjà donné un avis sur une annonce
export const hasUserAvis = async (userId, annonceId) => {
  try {
    const { data, error } = await supabase
      .from('avis')
      .select('id')
      .eq('user_id', userId)
      .eq('annonce_id', annonceId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return !!data
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'avis:', error)
    return false
  }
}

// Ajouter un avis
export const addAvis = async (userId, userName, userPhoto, annonceId, courtierId, note, commentaire) => {
  try {
    if (!note || note < 1 || note > 5) {
      throw new Error('La note doit être entre 1 et 5')
    }

    if (!commentaire || !commentaire.trim()) {
      throw new Error('Le commentaire est requis')
    }

    // Vérifier si l'utilisateur a déjà donné un avis
    const existingAvis = await hasUserAvis(userId, annonceId)
    if (existingAvis) {
      throw new Error('Vous avez déjà donné un avis pour cette annonce')
    }

    const { data, error } = await supabase
      .from('avis')
      .insert({
        user_id: userId,
        user_nom: userName,
        user_photo: userPhoto || null,
        annonce_id: annonceId,
        courtier_id: courtierId,
        note: parseInt(note),
        commentaire: commentaire.trim()
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      userId: data.user_id,
      userName: data.user_nom,
      userPhoto: data.user_photo,
      annonceId: data.annonce_id,
      courtierId: data.courtier_id,
      note: data.note,
      commentaire: data.commentaire,
      createdAt: data.created_at
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'avis:', error)
    throw error
  }
}

// Supprimer un avis
export const deleteAvis = async (avisId, userId) => {
  try {
    const userData = await getCurrentUser()
    if (!userData) {
      throw new Error('Vous devez être connecté')
    }

    // Vérifier que l'utilisateur est l'auteur ou un admin
    const { data: avis, error: fetchError } = await supabase
      .from('avis')
      .select('user_id')
      .eq('id', avisId)
      .single()

    if (fetchError) throw fetchError

    if (avis.user_id !== userData.user.id && userData.user.role !== 'admin') {
      throw new Error('Vous n\'avez pas la permission de supprimer cet avis')
    }

    const { error } = await supabase
      .from('avis')
      .delete()
      .eq('id', avisId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'avis:', error)
    throw error
  }
}
