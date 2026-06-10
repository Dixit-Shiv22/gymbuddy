import { useState, useRef, useEffect } from 'react'
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
import { useRouter, useLocalSearchParams } from 'expo-router'
import api from '../../lib/api'
import { saveToken } from '../../lib/auth'

export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [name, setName] = useState('')
  const [isNewUser, setIsNewUser] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(30)
  const inputs = useRef<Array<TextInput | null>>([])
  const router = useRouter()

  useEffect(() => {
    if (resendTimer === 0) return
    const t = setTimeout(() => setResendTimer((r) => r - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  const handleOtpChange = (val: string, idx: number) => {
    const newOtp = [...otp]
    newOtp[idx] = val
    setOtp(newOtp)
    if (val && idx < 5) inputs.current[idx + 1]?.focus()
    if (!val && idx > 0) inputs.current[idx - 1]?.focus()
  }

  const handleVerify = async () => {
  const code = otp.join('')
  if (code.length < 6) {
    setError('Enter the complete 6-digit OTP')
    return
  }
  if (isNewUser && !name.trim()) {
    setError('Please enter your name')
    return
  }
  setError('')
  setLoading(true)
  try {
    const res = await api.post('/auth/verify-otp', { phone, code, name })
    if (res.data.isNewUser && !name.trim()) {
      setIsNewUser(true)
      setLoading(false)
      return
    }
    await saveToken(res.data.token)  // wait for token to be saved
    router.replace('/(tabs)/')
  } catch (e: any) {
    const data = e.response?.data
    if (data?.isNewUser) {
      setIsNewUser(true)
      setLoading(false)
      return
    }
    setError(data?.message || 'Invalid OTP')
    setLoading(false)
  }
}

  const handleResend = async () => {
    setResendTimer(30)
    setOtp(['', '', '', '', '', ''])
    await api.post('/auth/send-otp', { phone })
    inputs.current[0]?.focus()
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Verify your number</Text>
        <Text style={styles.subtitle}>OTP sent to {phone}</Text>

        <View style={styles.otpRow}>
          {otp.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={(r) => { inputs.current[idx] = r }}
              style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
              value={digit}
              onChangeText={(val) => handleOtpChange(val.slice(-1), idx)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {isNewUser && (
          <View style={styles.nameContainer}>
            <Text style={styles.nameLabel}>What's your name?</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="Your full name"
              placeholderTextColor="#666"
              value={name}
              onChangeText={setName}
            />
          </View>
        )}

        {error !== '' && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isNewUser ? 'Create Account' : 'Verify & Login'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleResend}
          disabled={resendTimer > 0}
          style={styles.resend}
        >
          <Text style={[styles.resendText, resendTimer > 0 && styles.resendDisabled]}>
            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
          </Text>
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
  back: {
    position: 'absolute',
    top: 60,
    left: 28,
  },
  backText: {
    color: '#6C63FF',
    fontSize: 16,
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
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  otpBoxFilled: {
    borderColor: '#6C63FF',
  },
  nameContainer: {
    marginBottom: 16,
  },
  nameLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8,
  },
  nameInput: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
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
  resend: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendText: {
    color: '#6C63FF',
    fontSize: 15,
  },
  resendDisabled: {
    color: '#555',
  },
})