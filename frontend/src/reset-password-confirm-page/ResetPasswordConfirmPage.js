import { useState } from "react";
import { useLocation } from "react-router-dom";

export default function ResetPasswordConfirmPage() {
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const query = new URLSearchParams(useLocation().search);
  const token = query.get("token");

  function validatePassword(password) {
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one digit.";
    }
    return "";
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (newPassword !== repeatPassword) {
      setError("Passwords do not match.");
      return;
    }
    const validationError = validatePassword(newPassword);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    try {
      const res = await fetch(
        "http://localhost:3001/api/password/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMsg("Password has been reset! You can now log in.");
        setNewPassword("");
        setRepeatPassword("");
      } else {
        setMsg(data.message || "Error");
      }
    } catch {
      setMsg("Network error");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Repeat new password"
        value={repeatPassword}
        onChange={e => setRepeatPassword(e.target.value)}
        required
      />
      {error && <div style={{ color: "red" }}>{error}</div>}
      <button type="submit">Reset Password</button>
      <div>{msg}</div>
    </form>
  );
}