// Service pour gérer les annonces avec Supabase
import { supabase } from '../supabase'
import { getCurrentUser } from './auth'

// Récupérer toutes les annonces
export const getAnnonces = async (filters = {}) => {
  try {
    const onlyCourtiers = filters.onlyCourtiers !== false
    const includeAllStatuses = filters.includeAllStatuses === true
    const statusFilter = filters.status

    let query = supabase
      .from('annonces')
      .select('*')
      .order('created_at', { ascending: false })

    if (!includeAllStatuses) {
      query = query.eq('status', 'active')
    } else if (statusFilter) {
      query = query.eq('status', statusFilter)
    }

    // NOTE: On évite le JOIN sur profiles ici car les policies RLS de profiles
    // peuvent empêcher la lecture et faire revenir une liste vide.

    if (filters.ville) {
      query = query.eq('ville', filters.ville)
    }

    if (filters.type) {
      query = query.eq('type', filters.type)
    }

    if (filters.search) {
      query = query.or(`titre.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) throw error

    // Transformer les données pour correspondre à l'ancien format
    return data.map(annonce => ({
      id: annonce.id,
      titre: annonce.titre,
      type: annonce.type,
      description: annonce.description,
      prix: parseFloat(annonce.prix),
      superficie: parseFloat(annonce.superficie),
      adresse: annonce.adresse,
      ville: annonce.ville,
      quartier: annonce.quartier,
      chambres: annonce.chambres,
      sallesDeBain: annonce.salles_de_bain,
      meuble: annonce.meuble,
      latitude: annonce.latitude ? parseFloat(annonce.latitude) : null,
      longitude: annonce.longitude ? parseFloat(annonce.longitude) : null,
      photos: annonce.photos || [],
      createdBy: annonce.created_by,
      createdByNom: annonce.created_by_nom,
      createdByPhoto: annonce.created_by_photo,
      createdAt: annonce.created_at,
      updatedAt: annonce.updated_at,
      status: annonce.status
    }))
  } catch (error) {
    console.error('Erreur lors de la récupération des annonces:', error)
    return []
  }
}

export const updateAnnonceStatus = async (annonceId, status) => {
  try {
    const { data, error } = await supabase
      .from('annonces')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', annonceId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de l\'annonce:', error)
    throw error
  }
}

// Récupérer une annonce par ID
export const getAnnonceById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('annonces')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    if (!data) return null

    return {
      id: data.id,
      titre: data.titre,
      type: data.type,
      description: data.description,
      prix: parseFloat(data.prix),
      superficie: parseFloat(data.superficie),
      adresse: data.adresse,
      ville: data.ville,
      quartier: data.quartier,
      chambres: data.chambres,
      sallesDeBain: data.salles_de_bain,
      meuble: data.meuble,
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      longitude: data.longitude ? parseFloat(data.longitude) : null,
      photos: data.photos || [],
      createdBy: data.created_by,
      createdByNom: data.created_by_nom,
      createdByPhoto: data.created_by_photo,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      status: data.status
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'annonce:', error)
    return null
  }
}

// Créer une annonce
export const createAnnonce = async (annonceData) => {
  try {
    const userData = await getCurrentUser()
    if (!userData) {
      throw new Error('Vous devez être connecté pour publier une annonce')
    }

    const { data, error } = await supabase
      .from('annonces')
      .insert({
        titre: annonceData.titre,
        type: annonceData.type,
        description: annonceData.description,
        prix: annonceData.prix,
        superficie: annonceData.superficie,
        adresse: annonceData.adresse,
        ville: annonceData.ville,
        quartier: annonceData.quartier,
        chambres: annonceData.chambres || 1,
        salles_de_bain: annonceData.sallesDeBain || 1,
        meuble: annonceData.meuble || false,
        latitude: annonceData.latitude || null,
        longitude: annonceData.longitude || null,
        photos: annonceData.photos || [],
        created_by: userData.user.id,
        created_by_nom: userData.user.nom,
        created_by_photo: userData.user.photoProfil || null,
        status: 'active'
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      titre: data.titre,
      type: data.type,
      description: data.description,
      prix: parseFloat(data.prix),
      superficie: parseFloat(data.superficie),
      adresse: data.adresse,
      ville: data.ville,
      quartier: data.quartier,
      chambres: data.chambres,
      sallesDeBain: data.salles_de_bain,
      meuble: data.meuble,
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      longitude: data.longitude ? parseFloat(data.longitude) : null,
      photos: data.photos || [],
      createdBy: data.created_by,
      createdByNom: data.created_by_nom,
      createdByPhoto: data.created_by_photo,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      status: data.status
    }
  } catch (error) {
    console.error('Erreur lors de la création de l\'annonce:', error)
    throw error
  }
}

// Mettre à jour une annonce
export const updateAnnonce = async (id, updates) => {
  try {
    const userData = await getCurrentUser()
    if (!userData) {
      throw new Error('Vous devez être connecté')
    }

    // Vérifier que l'utilisateur est le propriétaire ou un admin
    const annonce = await getAnnonceById(id)
    if (!annonce) {
      throw new Error('Annonce non trouvée')
    }

    if (annonce.createdBy !== userData.user.id && userData.user.role !== 'admin') {
      throw new Error('Vous n\'avez pas la permission de modifier cette annonce')
    }

    const { data, error } = await supabase
      .from('annonces')
      .update({
        titre: updates.titre,
        type: updates.type,
        description: updates.description,
        prix: updates.prix,
        superficie: updates.superficie,
        adresse: updates.adresse,
        ville: updates.ville,
        quartier: updates.quartier,
        chambres: updates.chambres || 1,
        salles_de_bain: updates.sallesDeBain || 1,
        meuble: updates.meuble || false,
        latitude: updates.latitude || null,
        longitude: updates.longitude || null,
        photos: updates.photos || [],
        created_by_nom: userData.user.nom,
        created_by_photo: userData.user.photoProfil || annonce.createdByPhoto,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      titre: data.titre,
      type: data.type,
      description: data.description,
      prix: parseFloat(data.prix),
      superficie: parseFloat(data.superficie),
      adresse: data.adresse,
      ville: data.ville,
      quartier: data.quartier,
      chambres: data.chambres,
      sallesDeBain: data.salles_de_bain,
      meuble: data.meuble,
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      longitude: data.longitude ? parseFloat(data.longitude) : null,
      photos: data.photos || [],
      createdBy: data.created_by,
      createdByNom: data.created_by_nom,
      createdByPhoto: data.created_by_photo,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      status: data.status
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'annonce:', error)
    throw error
  }
}

// Supprimer une annonce
export const deleteAnnonce = async (id) => {
  try {
    const userData = await getCurrentUser()
    if (!userData) {
      throw new Error('Vous devez être connecté')
    }

    const annonce = await getAnnonceById(id)
    if (!annonce) {
      throw new Error('Annonce non trouvée')
    }

    if (annonce.createdBy !== userData.user.id && userData.user.role !== 'admin') {
      throw new Error('Vous n\'avez pas la permission de supprimer cette annonce')
    }

    const { error } = await supabase
      .from('annonces')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'annonce:', error)
    throw error
  }
}

// Récupérer les annonces d'un courtier
export const getAnnoncesByCourtier = async (courtierId) => {
  try {
    const { data, error } = await supabase
      .from('annonces')
      .select('*')
      .eq('created_by', courtierId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map(annonce => ({
      id: annonce.id,
      titre: annonce.titre,
      type: annonce.type,
      description: annonce.description,
      prix: parseFloat(annonce.prix),
      superficie: parseFloat(annonce.superficie),
      adresse: annonce.adresse,
      ville: annonce.ville,
      quartier: annonce.quartier,
      chambres: annonce.chambres,
      sallesDeBain: annonce.salles_de_bain,
      meuble: annonce.meuble,
      latitude: annonce.latitude ? parseFloat(annonce.latitude) : null,
      longitude: annonce.longitude ? parseFloat(annonce.longitude) : null,
      photos: annonce.photos || [],
      createdBy: annonce.created_by,
      createdByNom: annonce.created_by_nom,
      createdByPhoto: annonce.created_by_photo,
      createdAt: annonce.created_at,
      updatedAt: annonce.updated_at,
      status: annonce.status
    }))
  } catch (error) {
    console.error('Erreur lors de la récupération des annonces du courtier:', error)
    return []
  }
}
