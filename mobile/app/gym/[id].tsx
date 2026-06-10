import { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import api from '../../lib/api'

type Gym = {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  rating: number | null
  amenities: string[]
  phone: string | null
  sessions: Session[]
}

type Session = {
  id: string
  type: string
  date: string
  price: number
  slots: number
  booked: number
}

export default function GymDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [gym, setGym] = useState<Gym | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchGym()
  }, [id])

  const fetchGym = async () => {
    try {
      const res = await api.get(`/gyms/${id}`)
      setGym(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleBook = async (sessionId: string) => {
    try {
      setBookingId(sessionId)
      await api.post('/bookings', { sessionId })
      Alert.alert(
        '🎉 Booked!',
        'Your session has been booked successfully.',
        [{ text: 'View Bookings', onPress: () => router.replace('/(tabs)/bookings') },
         { text: 'Stay Here', style: 'cancel' }]
      )
      fetchGym() // refresh slots
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Booking failed')
    } finally {
      setBookingId(null)
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    )
  }

  if (!gym) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Gym not found</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.name}>{gym.name}</Text>
        <Text style={styles.address}>📍 {gym.address}</Text>
        {gym.rating && <Text style={styles.rating}>⭐ {gym.rating} / 5</Text>}
        {gym.phone && <Text style={styles.phone}>📞 {gym.phone}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Amenities</Text>
        <View style={styles.amenitiesRow}>
          {gym.amenities.map((a) => (
            <View key={a} style={styles.amenityTag}>
              <Text style={styles.amenityText}>{a}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Sessions</Text>
        {gym.sessions.length === 0 ? (
          <Text style={styles.noSessions}>No sessions available yet</Text>
        ) : (
          gym.sessions.map((session) => {
            const slotsLeft = session.slots - session.booked
            const isFull = slotsLeft <= 0
            const isBooking = bookingId === session.id

            return (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionType}>
                    {session.type === 'demo' ? '🎯 Demo Session' : '🏋️ Day Pass'}
                  </Text>
                  <Text style={styles.sessionDate}>
                    {new Date(session.date).toLocaleDateString('en-IN', {
                      weekday: 'short', day: 'numeric', month: 'short'
                    })}
                  </Text>
                  <Text style={[styles.sessionSlots, isFull && styles.sessionFull]}>
                    {isFull ? 'Full' : `${slotsLeft} slots left`}
                  </Text>
                </View>
                <View style={styles.sessionRight}>
                  <Text style={styles.sessionPrice}>₹{session.price}</Text>
                  <TouchableOpacity
                    style={[styles.bookButton, isFull && styles.bookButtonDisabled]}
                    onPress={() => !isFull && handleBook(session.id)}
                    disabled={isFull || isBooking}
                  >
                    {isBooking
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <Text style={styles.bookButtonText}>
                          {isFull ? 'Full' : 'Book'}
                        </Text>
                    }
                  </TouchableOpacity>
                </View>
              </View>
            )
          })
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  centered: { flex: 1, backgroundColor: '#0f0f0f', justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#ff4444', fontSize: 16 },
  back: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  backText: { color: '#6C63FF', fontSize: 16 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  name: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 8 },
  address: { color: '#888', fontSize: 14, marginBottom: 6 },
  rating: { color: '#FFD700', fontSize: 14, marginBottom: 6 },
  phone: { color: '#888', fontSize: 14 },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  amenitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityTag: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  amenityText: { color: '#aaa', fontSize: 13 },
  noSessions: { color: '#666', fontSize: 14 },
  sessionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  sessionInfo: { flex: 1 },
  sessionType: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  sessionDate: { color: '#888', fontSize: 13, marginBottom: 4 },
  sessionSlots: { color: '#6C63FF', fontSize: 12 },
  sessionFull: { color: '#ff4444' },
  sessionRight: { alignItems: 'flex-end', gap: 8 },
  sessionPrice: { color: '#fff', fontSize: 18, fontWeight: '800' },
  bookButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  bookButtonDisabled: { backgroundColor: '#333' },
  bookButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' },
})