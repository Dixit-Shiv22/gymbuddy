import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import api from '../../lib/api'

export default function PhoneScreen() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

const handleSendOtp = async () => {
  if (phone.length < 10) {
    setError('Enter a valid 10-digit phone number')
    return
  }
  setError('')
  setLoading(true)
  try {
    const formatted = phone.startsWith('+') ? phone : `+91${phone}`
    console.log('Sending OTP to:', formatted)
    const res = await api.post('/auth/send-otp', { phone: formatted })
    console.log('Response:', JSON.stringify(res.data))
    router.push({ pathname: '/(auth)/otp', params: { phone: formatted } })
  } catch (e: any) {
    console.log('Error:', JSON.stringify(e.response?.data || e.message))
    setError(e.response?.data?.message || 'Something went wrong')
  } finally {
    setLoading(false)
  }
}

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.logo}>💪</Text>
        <Text style={styles.appName}>GymBuddy</Text>
        <Text style={styles.title}>Enter your phone number</Text>
        <Text style={styles.subtitle}>We'll send you a one-time password</Text>

        <View style={styles.inputRow}>
          <View style={styles.prefix}>
            <Text style={styles.prefixText}>+91</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="98765 43210"
            placeholderTextColor="#666"
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        {error !== '' && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSendOtp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send OTP</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  logo: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#6C63FF',
    textAlign: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 32,
  },
  inputRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  prefix: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
  prefixText: {
    color: '#fff',
    fontSize: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  error: {
    color: '#ff4444',
    fontSize: 13,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
})