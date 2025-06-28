import { useState } from "react";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";

export default function LoginPage({ setLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Login successful!");
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        setLoggedIn(true);
        navigate("/quizzes");
      } else {
        setMsg(data.message || (data.errors && data.errors[0].msg) || "Error");
      }
    } catch (err) {
      setMsg("Network error");
    }
  };

  return (
    <div className="login-page">
      <h2 className="login-title">Login</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          className="login-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button className="login-btn" type="submit">Login</button>
      </form>
      <div className="login-or">or</div>
      <a href="http://localhost:3001/api/auth/google">
        <button className="login-btn login-btn-google" type="button">
          Login with Google
        </button>
      </a>
      <div
        className="login-msg"
        style={{ color: msg.startsWith("Login successful") ? "green" : "red" }}
      >
        {msg}
      </div>
    </div>
  );
}