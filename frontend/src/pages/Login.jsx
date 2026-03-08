import { useState } from "react";

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f5f5f5",
    },
    card: {
        width: "400px",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#fff",
    },
};

export default function Login() {
    //tracks what user types
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault(); //stops from refreshing
        setError("");

        //basic validation
        if (!email || !password) {
            setError("Fill in all fields");
            return;
        }

        //Mock login 
        setLoading(true)
        setTimeout(() => {
            if(email === "admin@acres.com" && password === "password123") {
                alert("Login successful!");
            } else {
                setError("Invalid email or password");
            }
            setLoading(false);
        }, 1000);

        };
    
        return (
            <div style={styles.container}>
                <div style={styles.card}>

                {/* Logo */}
                <div style={styles.logo}>
                <div style={styles.logoIcon}>🏢</div>
                <span style={styles.logoText}>Acres.Inc</span>
                </div> 

                <h1 style={styles.title}>Welcome back</h1>
                <p style={styles.subtitle}>Sign in to your account</p>

                {/* Error message */}
                {error && <div style={styles.error}>{error}</div>}

                {/* Form */}
                <div style={styles.form}>

                    {/* Email field */}
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

                    {/* Password field */}
                    <div style={styles.field}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            placeholder="password123"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={style.input}
                        />
                        <a href="#" style={styles.forgot}>Forgot password?</a>
                    </div>

                    {/* Submit button */}
                    <button 
                    onClick={handleLogin} 
                    style={{...styles.button, opacity: loading ? 0.7 : 1}}
                    disabled={loading}
                    >
                    {loading ? "Loading..." : "Login"}
                    </button>

                    {/* divider */}
                    <div style={styles.divider} />
                        <div style={styles.dividerLine} />
                        <span style={styles.dividerText}>or</span>
                        <div style={styles.dividerLine} />
                    </div>

                    {/* google login */}
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
    );
}       

//styling object
const style = {
    container: {
        minHeight: "100vh",
        background: "#f5f6fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
    },
    card: {
        background: "#fff",
        borderRadius: 12,
        padding: "40px",
        width: "100%",
        maxWidth: 400,
        border: "1px solid #e5e7eb",
        baxShadow: "0 4px 24px rgba(0, 0, 0, 06)",
    },
    logo: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 24,
    },
    logoIcon: { fontSize: 24 },
    logoText: { fontWeight: 700, fontSize: 18, color: "#111827" },
    title: { fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: "0 0 6px" },
    subtitle: { fontSize: 14, color: "#6b7280", marginBottom: "0 0 24" },
    error: {
        background: "#fee2e2",
        color: "#dc2626",
        padding: "10px 14px",
        borderRadius: 8,
        fontSize: 13,
        marginBottom: 16
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
    },
    forgot: { fontSize: 12, color: "#2563eb", textDecoration: "none", alignSelf: "flex-end" },
    button: {
        padding: "11px",
        background: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",  
    },
    divider: { display: "flex", alignItems: "center", gap: 10,},
    dividerLine: { flex: 1, height: 1, background: "#e5e7eb" },
    dividerText: { fontSize: 12, color: "#9ca3af" },
    googleButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "11px",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 500,
        cursor: "pointer",
        color: "#374151",
    }
};
