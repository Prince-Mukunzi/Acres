import { useState } from "react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setTimeout(() => {
      if (email === "admin@acres.com" && password === "password123") {
        alert("Login successful!")
      } else {
        setError("Invalid email or password")
      }
      setLoading(false)
    }, 1000)
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* Logo */}
        <div style={styles.logo}>
          <span style={styles.logoIcon}></span>
          <span style={styles.logoText}>Acres.Inc</span>
        </div>

        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        {/* Error message */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Form */}
        <div style={styles.form}>

          {/* Email */}
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="admin@acres.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
          </div>

          {/* Password */}
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
            <a href="#" style={styles.forgot}>Forgot password?</a>
          </div>

          {/* Login button */}
          <button
            onClick={handleLogin}
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          {/* Divider */}
          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>or</span>
            <div style={styles.dividerLine} />
          </div>

          {/* Google button */}
          <button style={styles.googleButton}>
            <img
              src="https://www.google.com/favicon.ico"
              width={16}
              height={16}
              alt="Google"
            />
            Continue with Google
          </button>

        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f5f6fa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    background: "#ffffff",
    borderRadius: 12,
    padding: "40px",
    width: "100%",
    maxWidth: 400,
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  logoIcon: { fontSize: 24 },
  logoText: { fontWeight: 700, fontSize: 18, color: "#111827" },
  title: { fontSize: 24, fontWeight: 700, color: "#111827", margin: "0 0 6px" },
  subtitle: { fontSize: 14, color: "#6b7280", margin: "0 0 24px" },
  error: {
    background: "#fee2e2",
    color: "#dc2626",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
  },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  input: {
    padding: "10px 14px",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
    color: "#111827",
    background: "#ffffff",
  },
  forgot: {
    fontSize: 12,
    color: "#6b7280",
    textDecoration: "none",
    alignSelf: "flex-end",
  },
  button: {
    padding: "11px",
    background: "#111827",
    color: "#ffffff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  divider: { display: "flex", alignItems: "center", gap: 10 },
  dividerLine: { flex: 1, height: 1, background: "#e5e7eb" },
  dividerText: { fontSize: 12, color: "#9ca3af" },
  googleButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "11px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    color: "#374151",
  },
}