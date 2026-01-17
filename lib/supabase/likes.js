// Service pour gérer les likes avec Supabase
import { supabase } from '../supabase'
import { getCurrentUser } from './auth'

// Récupérer tous les likes d'une annonce
export const getAnnonceLikes = async (annonceId) => {
  try {
    const { data, error } = await supabase
      .from('likes')
      .select('user_id')
      .eq('annonce_id', annonceId)

    if (error) throw error
    return data.map(like => like.user_id)
  } catch (error) {
    console.error('Erreur lors de la récupération des likes:', error)
    return []
  }
}

// Vérifier si un utilisateur a liké une annonce
export const hasUserLiked = async (userId, annonceId) => {
  try {
    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('annonce_id', annonceId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return !!data
  } catch (error) {
    console.error('Erreur lors de la vérification du like:', error)
    return false
  }
}

// Ajouter un like
export const addLike = async (userId, annonceId) => {
  try {
    const { data, error } = await supabase
      .from('likes')
      .insert({
        user_id: userId,
        annonce_id: annonceId
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur lors de l\'ajout du like:', error)
    throw error
  }
}

// Retirer un like
export const removeLike = async (userId, annonceId) => {
  try {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq('annonce_id', annonceId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Erreur lors de la suppression du like:', error)
    throw error
  }
}

// Toggle like (ajouter ou retirer)
export const toggleLike = async (userId, annonceId) => {
  try {
    const liked = await hasUserLiked(userId, annonceId)
    
    if (liked) {
      await removeLike(userId, annonceId)
      return false
    } else {
      await addLike(userId, annonceId)
      return true
    }
  } catch (error) {
    console.error('Erreur lors du toggle du like:', error)
    throw error
  }
}

// Obtenir le nombre de likes d'une annonce
export const getLikeCount = async (annonceId) => {
  try {
    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('annonce_id', annonceId)

    if (error) throw error
    return count || 0
  } catch (error) {
    console.error('Erreur lors du comptage des likes:', error)
    return 0
  }
}
