import { useEffect, useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, ActivityIndicator, Alert
} from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { clearToken } from '../../lib/auth'
import api from '../../lib/api'

const FITNESS_GOALS = ['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility', 'General Fitness']
const INTERESTS = ['Weights', 'Cardio', 'Yoga', 'Crossfit', 'Zumba', 'Swimming', 'Boxing', 'Cycling']

type User = {
  id: string
  name: string
  bio: string | null
  fitnessGoal: string | null
  interests: string[]
}

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null)
  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState('')
  const [fitnessGoal, setFitnessGoal] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useFocusEffect(
    useCallback(() => {
      fetchProfile()
    }, [])
  )

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/me')
      setUser(res.data)
      setBio(res.data.bio || '')
      setFitnessGoal(res.data.fitnessGoal || '')
      setInterests(res.data.interests || [])
    } catch (e) {
      console.error(e)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch('/users/me', { bio, fitnessGoal, interests })
      setEditing(false)
      fetchProfile()
      Alert.alert('✅ Profile updated!')
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    )
  }

  const handleLogout = async () => {
    await clearToken()
    router.replace('/(auth)/phone')
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        {!editing && (
          <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      {editing ? (
        <View style={styles.section}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={styles.input}
            placeholder="Tell others about yourself..."
            placeholderTextColor="#666"
            value={bio}
            onChangeText={setBio}
            multiline
          />

          <Text style={styles.label}>Fitness Goal</Text>
          <View style={styles.tagsRow}>
            {FITNESS_GOALS.map((goal) => (
              <TouchableOpacity
                key={goal}
                style={[styles.tag, fitnessGoal === goal && styles.tagSelected]}
                onPress={() => setFitnessGoal(goal)}
              >
                <Text style={[styles.tagText, fitnessGoal === goal && styles.tagTextSelected]}>
                  {goal}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Interests</Text>
          <View style={styles.tagsRow}>
            {INTERESTS.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[styles.tag, interests.includes(interest) && styles.tagSelected]}
                onPress={() => toggleInterest(interest)}
              >
                <Text style={[styles.tagText, interests.includes(interest) && styles.tagTextSelected]}>
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelEditButton}
              onPress={() => setEditing(false)}
            >
              <Text style={styles.cancelEditText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.saveButtonText}>Save</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.label}>Bio</Text>
          <Text style={styles.value}>{user.bio || 'No bio yet'}</Text>

          <Text style={styles.label}>Fitness Goal</Text>
          <Text style={styles.value}>{user.fitnessGoal || 'Not set'}</Text>

          <Text style={styles.label}>Interests</Text>
          <View style={styles.tagsRow}>
            {user.interests.length > 0 ? user.interests.map((i) => (
              <View key={i} style={styles.tagSelected}>
                <Text style={styles.tagTextSelected}>{i}</Text>
              </View>
            )) : <Text style={styles.value}>No interests set</Text>}
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  centered: { flex: 1, backgroundColor: '#0f0f0f', justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: '#222' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#6C63FF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '800' },
  name: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 12 },
  editButton: { borderWidth: 1, borderColor: '#6C63FF', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  editButtonText: { color: '#6C63FF', fontSize: 14, fontWeight: '600' },
  section: { padding: 20 },
  label: { color: '#888', fontSize: 13, marginBottom: 8, marginTop: 16 },
  value: { color: '#fff', fontSize: 15 },
  input: { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333', borderRadius: 10, color: '#fff', fontSize: 15, padding: 12, minHeight: 80 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#333', backgroundColor: '#1a1a1a' },
  tagSelected: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#6C63FF' },
  tagText: { color: '#aaa', fontSize: 13 },
  tagTextSelected: { color: '#fff', fontSize: 13, fontWeight: '600' },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelEditButton: { flex: 1, borderWidth: 1, borderColor: '#333', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  cancelEditText: { color: '#aaa', fontSize: 15 },
  saveButton: { flex: 1, backgroundColor: '#6C63FF', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  logoutButton: { margin: 20, borderWidth: 1, borderColor: '#ff4444', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  logoutText: { color: '#ff4444', fontSize: 15, fontWeight: '600' },
})