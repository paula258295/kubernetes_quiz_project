import { useState } from "react";
import "./RegisterPage.css";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const emailRegex = /\S+@\S+\.\S+/;
  const nameRegex = /^[a-zA-Z0-9\s]+$/;
  const passwordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={[\]|:;"'<>,.?/~`]).{8,}/;

  const validateForm = () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (trimmedName.length < 3) {
      setMsg("Name must be at least 3 characters long.");
      return false;
    }
    if (trimmedName.length > 50) {
      setMsg("Name cannot exceed 50 characters.");
      return false;
    }
    if (!nameRegex.test(trimmedName)) {
      setMsg("Name can only contain letters, numbers, and spaces.");
      return false;
    }
    if (!emailRegex.test(trimmedEmail)) {
      setMsg("Please enter a valid email address.");
      return false;
    }
    if (trimmedPassword.length < 8 || trimmedPassword.length > 100) {
      setMsg("Password must be between 8 and 100 characters.");
      return false;
    }
    if (!passwordRegex.test(trimmedPassword)) {
      setMsg("Password must contain uppercase, lowercase, number, and special character.");
      return false;
    }
    if (trimmedPassword !== confirmPassword) {
      setMsg("Passwords do not match.");
      return false;
    }

    setName(trimmedName);
    setEmail(trimmedEmail);
    setPassword(trimmedPassword);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        window.location.href = "/quizzes";
      } else {
        let errorMessage = data.message || (data.errors?.[0]?.msg) || "Registration failed.";
        setMsg(errorMessage);
      }
    } catch (err) {
      console.error("Network error:", err);
      setMsg("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <h2 className="register-title">Register</h2>
      <form className="register-form" onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          className="register-input"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          className="register-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          className="register-input"
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          className="register-input"
          type={showPassword ? "text" : "password"}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button
          type="button"
          className="toggle-password-btn"
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? "Hide Passwords" : "Show Passwords"}
        </button>

        <button className="register-btn" type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <a href="/api/auth/google" style={{ width: "100%" }}>
          <button className="register-btn register-btn-google" type="button">
            Register with Google
          </button>
        </a>
      </form>

      {msg && (
        <div className={`register-msg ${msg.startsWith("Registration successful") ? "success" : "error"}`}>
          {msg}
        </div>
      )}
    </div>
  );
}
