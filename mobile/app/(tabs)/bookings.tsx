import { useEffect, useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, Alert
} from 'react-native'
import { useFocusEffect } from 'expo-router'
import api from '../../lib/api'

type Booking = {
  id: string
  status: string
  createdAt: string
  session: {
    id: string
    type: string
    date: string
    price: number
    gym: {
      name: string
      address: string
    }
  }
}

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useFocusEffect(
    useCallback(() => {
      fetchBookings()
    }, [])
  )

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my')
      setBookings(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = (bookingId: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setCancellingId(bookingId)
            try {
              await api.patch(`/bookings/${bookingId}/cancel`)
              fetchBookings()
            } catch (e: any) {
              Alert.alert('Error', e.response?.data?.message || 'Failed to cancel')
            } finally {
              setCancellingId(null)
            }
          }
        }
      ]
    )
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    )
  }

  const active = bookings.filter(b => b.status === 'confirmed')
  const cancelled = bookings.filter(b => b.status === 'cancelled')

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>
      {bookings.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🏋️</Text>
          <Text style={styles.emptyText}>No bookings yet</Text>
          <Text style={styles.emptySubtext}>Book a session at a nearby gym to get started</Text>
        </View>
      ) : (
        <FlatList
          data={[...active, ...cancelled]}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={[styles.card, item.status === 'cancelled' && styles.cardCancelled]}>
              <View style={styles.cardHeader}>
                <Text style={styles.gymName}>{item.session.gym.name}</Text>
                <View style={[styles.badge, item.status === 'cancelled' && styles.badgeCancelled]}>
                  <Text style={styles.badgeText}>
                    {item.status === 'confirmed' ? '✅ Confirmed' : '❌ Cancelled'}
                  </Text>
                </View>
              </View>
              <Text style={styles.gymAddress}>📍 {item.session.gym.address}</Text>
              <Text style={styles.sessionType}>
                {item.session.type === 'demo' ? '🎯 Demo Session' : '🏋️ Day Pass'}
              </Text>
              <Text style={styles.sessionDate}>
                📅 {new Date(item.session.date).toLocaleDateString('en-IN', {
                  weekday: 'long', day: 'numeric', month: 'long'
                })}
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.price}>₹{item.session.price}</Text>
                {item.status === 'confirmed' && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => handleCancel(item.id)}
                    disabled={cancellingId === item.id}
                  >
                    {cancellingId === item.id
                      ? <ActivityIndicator size="small" color="#ff4444" />
                      : <Text style={styles.cancelText}>Cancel</Text>
                    }
                  </TouchableOpacity>
                )}
              </View>
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
  title: { color: '#fff', fontSize: 24, fontWeight: '800', paddingHorizontal: 16, marginBottom: 20 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySubtext: { color: '#888', fontSize: 14, textAlign: 'center' },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cardCancelled: { opacity: 0.6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  gymName: { color: '#fff', fontSize: 16, fontWeight: '700', flex: 1 },
  badge: {
    backgroundColor: '#1a3a1a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeCancelled: { backgroundColor: '#3a1a1a' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  gymAddress: { color: '#888', fontSize: 13, marginBottom: 6 },
  sessionType: { color: '#aaa', fontSize: 13, marginBottom: 4 },
  sessionDate: { color: '#aaa', fontSize: 13, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { color: '#6C63FF', fontSize: 18, fontWeight: '800' },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#ff4444',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cancelText: { color: '#ff4444', fontSize: 13, fontWeight: '600' },
})