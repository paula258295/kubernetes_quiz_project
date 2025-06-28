import { useEffect, useState } from "react";
import "./ProfilePage.css";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState("");
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState("");
  const [editPassword, setEditPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const passwordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={[\]|:;"'<>,.?/~`]).{8,}/;

  const validatePassword = (password, confirmPassword) => {
    if (password.length < 8 || password.length > 100) {
      setMsg("Password must be between 8 and 100 characters.");
      return false;
    }
    if (!passwordRegex.test(password)) {
      setMsg("Password must contain uppercase, lowercase, number, and special character.");
      return false;
    }
    if (password !== confirmPassword) {
      setMsg("Passwords do not match.");
      return false;
    }
    return true;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMsg("You are not logged in.");
      return;
    }
    fetch("http://localhost:3001/api/user/me", {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => res.json())
      .then(data => {
        if (data.email) {
          setUser(data);
          setNewName(data.name);
        } else setMsg(data.message || "Error");
      })
      .catch(() => setMsg("Network error"));
  }, []);

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    setMsg("");
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3001/api/user/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ name: newName })
    });
    const data = await res.json();
    if (res.ok) {
      setMsg("Name updated!");
      setUser({ ...user, name: newName });
      setEditName(false);
    } else {
      setMsg(data.message || "Error");
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!validatePassword(newPassword, newPassword)) {
      return;
    }

    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3001/api/user/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ oldPassword, newPassword })
    });
    const data = await res.json();
    if (res.ok) {
      setMsg("Password updated!");
      setOldPassword("");
      setNewPassword("");
      setEditPassword(false);
    } else {
      setMsg(data.message || "Error");
    }
  };

  if (msg && !user) return <div className="profile-msg">{msg}</div>;
  if (!user) return <div className="profile-msg">Loading...</div>;

  return (
    <div className="profile-page">
      <h2 className="profile-title">My Profile</h2>
      <div className="profile-info">
        <p>
          <b>Email:</b> {user.email}
        </p>
        <p>
          <b>Role:</b> {user.role}
        </p>
        <p>
          <b>Name:</b> {user.name}{" "}
          {!editName && (
            <button className="profile-btn" onClick={() => setEditName(true)}>Edit</button>
          )}
        </p>
        {editName && (
          <form className="profile-form" onSubmit={handleNameUpdate}>
            <input
              className="profile-input"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              required
            />
            <button className="profile-btn" type="submit">Save</button>
            <button
              className="profile-btn profile-btn-cancel"
              type="button"
              onClick={() => { setEditName(false); setNewName(user.name); }}
            >
              Cancel
            </button>
          </form>
        )}
        {user.authType !== "google" ? (
          <>
            <p>
              <b>Password:</b> ********{" "}
              {!editPassword && (
                <button className="profile-btn" onClick={() => setEditPassword(true)}>Edit</button>
              )}
            </p>
            {editPassword && (
              <form className="profile-form" onSubmit={handlePasswordUpdate}>
                <input
                  className="profile-input"
                  type="password"
                  placeholder="Old password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  required
                />
                <input
                  className="profile-input"
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />
                <button className="profile-btn" type="submit">Save</button>
                <button
                  className="profile-btn profile-btn-cancel"
                  type="button"
                  onClick={() => {
                    setEditPassword(false);
                    setOldPassword("");
                    setNewPassword("");
                  }}
                >
                  Cancel
                </button>
              </form>
            )}
          </>
        ) : (
          <p><b>Password:</b> <i>Logged in via Google – no password set</i></p>
        )}
        <div
          className="profile-msg"
          style={{
            color:
              msg.startsWith("Name updated") || msg.startsWith("Password updated")
                ? "green"
                : "red"
          }}
        >
          {msg}
        </div>
        {user.badges && user.badges.length > 0 && (
          <div className="profile-badges">
            <h3>Your badges:</h3>
            <ul>
              {user.badges.map(badge => (
                <li key={badge}>🏅 {badge}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}