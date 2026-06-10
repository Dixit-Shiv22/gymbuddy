import { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, Alert
} from 'react-native'
import { useFocusEffect } from 'expo-router'
import api from '../../lib/api'

type Buddy = {
  id: string
  name: string
  bio: string | null
  fitnessGoal: string | null
  interests: string[]
  sharedInterests: string[]
  score: number
  requestStatus: 'none' | 'pending' | 'accepted' | 'received'
}

type Request = {
  id: string
  sender: {
    id: string
    name: string
    bio: string | null
    fitnessGoal: string | null
    interests: string[]
  }
}

export default function BuddiesScreen() {
  const [tab, setTab] = useState<'discover' | 'requests' | 'my'>('discover')
  const [buddies, setBuddies] = useState<Buddy[]>([])
  const [requests, setRequests] = useState<Request[]>([])
  const [myBuddies, setMyBuddies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  useFocusEffect(
    useCallback(() => {
      fetchAll()
    }, [])
  )

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [buddiesRes, requestsRes, myRes] = await Promise.all([
        api.get('/users/buddies'),
        api.get('/buddies/requests'),
        api.get('/buddies/my'),
      ])
      setBuddies(buddiesRes.data)
      setRequests(requestsRes.data)
      setMyBuddies(myRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSendRequest = async (userId: string) => {
    setActionId(userId)
    try {
      await api.post('/buddies/request', { receiverId: userId })
      fetchAll()
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to send request')
    } finally {
      setActionId(null)
    }
  }

  const handleRespond = async (requestId: string, status: 'accepted' | 'rejected') => {
    setActionId(requestId)
    try {
      await api.patch(`/buddies/request/${requestId}`, { status })
      fetchAll()
    } catch (e) {
      Alert.alert('Error', 'Failed to respond to request')
    } finally {
      setActionId(null)
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gym Buddies</Text>

      <View style={styles.tabs}>
        {(['discover', 'requests', 'my'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'discover' ? 'Discover' : t === 'requests' ? `Requests${requests.length > 0 ? ` (${requests.length})` : ''}` : 'My Buddies'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'discover' && (
        <FlatList
          data={buddies}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No users found</Text>
              <Text style={styles.emptySubtext}>Set your fitness goals in Profile to find better matches</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.name[0].toUpperCase()}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  {item.fitnessGoal && (
                    <Text style={styles.cardGoal}>🎯 {item.fitnessGoal}</Text>
                  )}
                </View>
              </View>
              {item.bio && <Text style={styles.cardBio}>{item.bio}</Text>}
              {item.sharedInterests.length > 0 && (
                <View style={styles.sharedRow}>
                  <Text style={styles.sharedLabel}>Shared: </Text>
                  <Text style={styles.sharedInterests}>{item.sharedInterests.join(', ')}</Text>
                </View>
              )}
              <TouchableOpacity
                style={[
                  styles.requestButton,
                  item.requestStatus !== 'none' && styles.requestButtonDisabled,
                ]}
                onPress={() => item.requestStatus === 'none' && handleSendRequest(item.id)}
                disabled={item.requestStatus !== 'none' || actionId === item.id}
              >
                {actionId === item.id
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.requestButtonText}>
                      {item.requestStatus === 'none' && 'Send Request'}
                      {item.requestStatus === 'pending' && 'Request Sent'}
                      {item.requestStatus === 'accepted' && '✅ Buddies'}
                      {item.requestStatus === 'received' && 'Respond in Requests'}
                    </Text>
                }
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {tab === 'requests' && (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No pending requests</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.sender.name[0].toUpperCase()}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{item.sender.name}</Text>
                  {item.sender.fitnessGoal && (
                    <Text style={styles.cardGoal}>🎯 {item.sender.fitnessGoal}</Text>
                  )}
                </View>
              </View>
              {item.sender.bio && <Text style={styles.cardBio}>{item.sender.bio}</Text>}
              <View style={styles.respondRow}>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => handleRespond(item.id, 'rejected')}
                  disabled={actionId === item.id}
                >
                  <Text style={styles.rejectText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => handleRespond(item.id, 'accepted')}
                  disabled={actionId === item.id}
                >
                  {actionId === item.id
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.acceptText}>Accept</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {tab === 'my' && (
        <FlatList
          data={myBuddies}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🤝</Text>
              <Text style={styles.emptyText}>No buddies yet</Text>
              <Text style={styles.emptySubtext}>Discover and connect with gym buddies</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.name[0].toUpperCase()}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  {item.fitnessGoal && (
                    <Text style={styles.cardGoal}>🎯 {item.fitnessGoal}</Text>
                  )}
                </View>
              </View>
              {item.bio && <Text style={styles.cardBio}>{item.bio}</Text>}
              {item.interests.length > 0 && (
                <View style={styles.tagsRow}>
                  {item.interests.map((i: string) => (
                    <View key={i} style={styles.tag}>
                      <Text style={styles.tagText}>{i}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', paddingTop: 60 },
  centered: { flex: 1, backgroundColor: '#0f0f0f', justifyContent: 'center', alignItems: 'center' },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', paddingHorizontal: 16, marginBottom: 16 },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, gap: 8 },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', backgroundColor: '#1a1a1a' },
  tabBtnActive: { backgroundColor: '#6C63FF' },
  tabText: { color: '#888', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  emptySubtext: { color: '#888', fontSize: 13, textAlign: 'center' },
  card: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a2a' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#6C63FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  cardInfo: { flex: 1 },
  cardName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cardGoal: { color: '#888', fontSize: 13, marginTop: 2 },
  cardBio: { color: '#aaa', fontSize: 13, marginBottom: 10 },
  sharedRow: { flexDirection: 'row', marginBottom: 10 },
  sharedLabel: { color: '#888', fontSize: 13 },
  sharedInterests: { color: '#6C63FF', fontSize: 13, fontWeight: '600' },
  requestButton: { backgroundColor: '#6C63FF', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  requestButtonDisabled: { backgroundColor: '#2a2a2a' },
  requestButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  respondRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  rejectButton: { flex: 1, borderWidth: 1, borderColor: '#ff4444', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  rejectText: { color: '#ff4444', fontSize: 14, fontWeight: '600' },
  acceptButton: { flex: 1, backgroundColor: '#6C63FF', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  acceptText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: { backgroundColor: '#2a2a2a', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  tagText: { color: '#aaa', fontSize: 12 },
})