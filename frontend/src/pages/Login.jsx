import { useState } from "react";

const style = {
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
            <div style={style.container}>
                <div style={style.card}>

                {/* Logo */}
                <div style={style.logo}>
                <div style={style.logoIcon}>🏢</div>
                <span style={style.logoText}>Acres.Inc</span>
                </div> 

                <h1 style={style.title}>Welcome back</h1>
                <p style={style.subtitle}>Sign in to your account</p>

                {/* Error message */}
                {error && <div style={style.error}>{error}</div>}

                {/* Form */}
                <div style={style.form}>

                    {/* Email field */}
                    <div style={style.field}>
                        <label style={style.label}>Email</label>
                        <input
                            type="email"
                            placeholder="admin@acres.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={style.input}
                        />
                    </div>

                    {/* Password field */}
                    <div style={style.field}>
                        <label style={style.label}>Password</label>
                        <input
                            type="password"
                            placeholder="password123"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={style.input}
                        />
                        <a href="#" style={style.forgot}>Forgot password?</a>
                    </div>

                    {/* Submit button */}
                    <button 
                    onClick={handleLogin} 
                    style={{...style.button, opacity: loading ? 0.7 : 1}}
                    disabled={loading}
                    >
                    {loading ? "Loading..." : "Login"}
                    </button>

                    {/* divider */}
                    <div style={style.divider} />
                        <div style={style.dividerLine} />
                        <span style={style.dividerText}>or</span>
                        <div style={style.dividerLine} />
                    </div>

                    {/* google login */}
                    <button style={style.googleButton}>
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