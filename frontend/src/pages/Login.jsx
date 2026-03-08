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
        