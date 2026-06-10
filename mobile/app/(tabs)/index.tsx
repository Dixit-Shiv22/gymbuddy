import { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, Dimensions
} from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import * as Location from 'expo-location'
import { useRouter } from 'expo-router'
import api from '../../lib/api'

const { height } = Dimensions.get('window')

type Gym = {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  rating: number | null
  amenities: string[]
  distance?: number
}

export default function HomeScreen() {
  const [gyms, setGyms] = useState<Gym[]>([])
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedGym, setSelectedGym] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    console.log('HomeScreen mounted, requesting location...')
    initLocation()
  }, [])

  const initLocation = async () => {
    try {
      console.log('Requesting permission...')
      const { status } = await Location.requestForegroundPermissionsAsync()
      console.log('Permission status:', status)
      if (status !== 'granted') {
        setError('Location permission denied')
        fetchGyms(null)
        return
      }
      const loc = await Location.getCurrentPositionAsync({})
      console.log('Got location:', loc.coords)
      const coords = { lat: loc.coords.latitude, lng: loc.coords.longitude }
      setLocation(coords)
      fetchGyms(coords)
    } catch (e) {
      console.log('Location error:', e)
      fetchGyms(null)
    }
  }

  const fetchGyms = async (coords: { lat: number; lng: number } | null) => {
    try {
      console.log('Fetching gyms...')
      const params = coords ? `?lat=${coords.lat}&lng=${coords.lng}` : ''
      const res = await api.get(`/gyms${params}`)
      console.log('Gyms fetched:', res.data.length)
      setGyms(res.data)
    } catch (e) {
      console.log('Gym fetch error:', e)
      setError('Failed to load gyms')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Finding gyms near you...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: location?.lat ?? 26.4637,
          longitude: location?.lng ?? 80.3455,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
      >
        {gyms.map((gym) => (
          <Marker
            key={gym.id}
            coordinate={{ latitude: gym.latitude, longitude: gym.longitude }}
            title={gym.name}
            description={gym.address}
            pinColor={selectedGym === gym.id ? '#6C63FF' : '#FF4444'}
            onPress={() => setSelectedGym(gym.id)}
          />
        ))}
      </MapView>

      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>
          {location ? 'Gyms Near You' : 'All Gyms'} ({gyms.length})
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <FlatList
          data={gyms}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.gymCard, selectedGym === item.id && styles.gymCardSelected]}
              onPress={() => {
                setSelectedGym(item.id)
                router.push(`/gym/${item.id}`)
              }}
            >
              <View style={styles.gymInfo}>
                <Text style={styles.gymName}>{item.name}</Text>
                <Text style={styles.gymAddress}>{item.address}</Text>
                <View style={styles.gymMeta}>
                  {item.distance !== undefined && (
                    <Text style={styles.gymDistance}>📍 {item.distance} km</Text>
                  )}
                  {item.rating && (
                    <Text style={styles.gymRating}>⭐ {item.rating}</Text>
                  )}
                </View>
                <View style={styles.amenitiesRow}>
                  {item.amenities.slice(0, 3).map((a) => (
                    <View key={a} style={styles.amenityTag}>
                      <Text style={styles.amenityText}>{a}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  centered: { flex: 1, backgroundColor: '#0f0f0f', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#888', marginTop: 12, fontSize: 14 },
  map: { height: height * 0.4 },
  listContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  listTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  error: { color: '#ff4444', fontSize: 13, marginBottom: 8 },
  gymCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  gymCardSelected: { borderColor: '#6C63FF' },
  gymInfo: { flex: 1 },
  gymName: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  gymAddress: { color: '#888', fontSize: 13, marginBottom: 6 },
  gymMeta: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  gymDistance: { color: '#6C63FF', fontSize: 13 },
  gymRating: { color: '#FFD700', fontSize: 13 },
  amenitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  amenityTag: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  amenityText: { color: '#aaa', fontSize: 11 },
})