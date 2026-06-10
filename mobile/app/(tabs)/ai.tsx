import { useState, useRef } from 'react'
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native'
import api from '../../lib/api'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const QUICK_PROMPTS = [
  'Create a beginner workout plan',
  'Best exercises for weight loss',
  'How to build muscle fast',
  'Nutrition tips for gym goers',
]

export default function AIScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hi! I'm your AI fitness coach 💪 Ask me anything about workouts, nutrition, or gym tips!",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef<FlatList>(null)

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Build history for context (exclude the initial greeting)
      const history = messages
        .filter((m) => m.id !== '0')
        .map((m) => ({ role: m.role, content: m.content }))

      const res = await api.post('/ai/chat', {
        message: text.trim(),
        history,
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.reply,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (e: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <View style={styles.header}>
        <Text style={styles.title}>AI Fitness Coach</Text>
        <Text style={styles.subtitle}>Powered by Claude</Text>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={
          loading ? (
            <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" color="#6C63FF" />
              <Text style={styles.typingText}>AI Coach is thinking...</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble,
            item.role === 'user' ? styles.userBubble : styles.assistantBubble
          ]}>
            {item.role === 'assistant' && (
              <Text style={styles.assistantLabel}>💪 Coach</Text>
            )}
            <Text style={[
              styles.messageText,
              item.role === 'user' ? styles.userText : styles.assistantText
            ]}>
              {item.content}
            </Text>
          </View>
        )}
      />

      {messages.length === 1 && (
        <View style={styles.quickPromptsContainer}>
          <Text style={styles.quickPromptsLabel}>Quick questions:</Text>
          <View style={styles.quickPrompts}>
            {QUICK_PROMPTS.map((prompt) => (
              <TouchableOpacity
                key={prompt}
                style={styles.quickPrompt}
                onPress={() => sendMessage(prompt)}
              >
                <Text style={styles.quickPromptText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask your fitness coach..."
          placeholderTextColor="#666"
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]}
          onPress={() => sendMessage(input)}
          disabled={!input.trim() || loading}
        >
          <Text style={styles.sendButtonText}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  header: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
  title: { color: '#fff', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#6C63FF', fontSize: 13, marginTop: 2 },
  messagesList: { padding: 16, paddingBottom: 8 },
  messageBubble: { marginBottom: 12, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#6C63FF', borderRadius: 16, borderBottomRightRadius: 4, padding: 12 },
  assistantBubble: { alignSelf: 'flex-start', backgroundColor: '#1a1a1a', borderRadius: 16, borderBottomLeftRadius: 4, padding: 12, borderWidth: 1, borderColor: '#2a2a2a' },
  assistantLabel: { color: '#6C63FF', fontSize: 11, fontWeight: '700', marginBottom: 4 },
  messageText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#fff' },
  assistantText: { color: '#ddd' },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  typingText: { color: '#888', fontSize: 13 },
  quickPromptsContainer: { paddingHorizontal: 16, paddingBottom: 8 },
  quickPromptsLabel: { color: '#888', fontSize: 13, marginBottom: 8 },
  quickPrompts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickPrompt: { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  quickPromptText: { color: '#aaa', fontSize: 13 },
  inputContainer: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#222', gap: 8, alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: '#fff', fontSize: 15, maxHeight: 100 },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#6C63FF', justifyContent: 'center', alignItems: 'center' },
  sendButtonDisabled: { opacity: 0.4 },
  sendButtonText: { color: '#fff', fontSize: 20, fontWeight: '700' },
})