import { useState } from "react";

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

        return (
            <div style={style.container}>
                <div style={style.card}>

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
                    <div style={styles.field}
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
