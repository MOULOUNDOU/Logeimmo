import { supabase } from '../supabase'
import { getCurrentUser } from './auth'

export const isFollowing = async (followerId, followedId) => {
  const { data, error } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', followerId)
    .eq('followed_id', followedId)
    .limit(1)

  if (error) throw error
  return (data || []).length > 0
}

export const follow = async (followedId) => {
  const authData = await getCurrentUser()
  const followerId = authData?.user?.id
  if (!followerId) throw new Error('Vous devez être connecté pour vous abonner')

  const { data, error } = await supabase
    .from('follows')
    .insert({ follower_id: followerId, followed_id: followedId })
    .select()
    .single()

  if (error) throw error
  return data
}

export const unfollow = async (followedId) => {
  const authData = await getCurrentUser()
  const followerId = authData?.user?.id
  if (!followerId) throw new Error('Vous devez être connecté pour vous désabonner')

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('followed_id', followedId)
    .eq('follower_id', followerId)

  if (error) throw error
  return true
}

export const getFollowerCount = async (userId) => {
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('followed_id', userId)

  if (error) throw error
  return count || 0
}

export const getFollowingCount = async (userId) => {
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId)

  if (error) throw error
  return count || 0
}

export const getMutualFollow = async (myId, otherId) => {
  const [iFollow, theyFollow] = await Promise.all([
    isFollowing(myId, otherId),
    isFollowing(otherId, myId)
  ])

  return {
    iFollow,
    theyFollow,
    mutual: iFollow && theyFollow
  }
}
