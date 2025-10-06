import React, { useState } from 'react'

const App: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string>('')
  const [token, setToken] = useState<string>('')
  const [userEmail, setUserEmail] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data?.message || 'Login failed')
      } else {
        setMessage('Login successful')
        setToken(data.token)
        setUserEmail(data.user?.email || '')
        localStorage.setItem('session', JSON.stringify({ user: data.user, token: data.token }))
      }
    } catch (err) {
      setMessage('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <h1>Passive Optical LAN Designer</h1>

      <div style={{ marginTop: 24, maxWidth: 420 }}>
        <h2 style={{ color: '#22d3ee' }}>Login</h2>
        {message && <div style={{ background: '#0f766e', padding: 12, borderRadius: 8, marginBottom: 12 }}>{message}</div>}
        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ display: 'block', width: '100%', marginBottom: 12, padding: 8, borderRadius: 6 }}
          />
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ display: 'block', width: '100%', marginBottom: 12, padding: 8, borderRadius: 6 }}
          />
          <button type="submit" disabled={loading} style={{ padding: '8px 16px', borderRadius: 6 }}>Login</button>
        </form>

        {token && (
          <div style={{ marginTop: 16 }}>
            <div><strong>User:</strong> {userEmail}</div>
            <div style={{ wordBreak: 'break-all' }}><strong>Token:</strong> {token}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App