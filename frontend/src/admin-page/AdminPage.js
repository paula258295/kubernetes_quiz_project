import { useEffect, useState } from "react";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3001/api/admin/users", {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => {
        if (res.status === 403) throw new Error("Forbidden");
        return res.json();
      })
      .then(data => setUsers(data))
      .catch(() => setMsg("You are not admin or network error"));
  }, []);

  return (
    <div>
      <h2>Admin Panel</h2>
      {msg && <div style={{ color: "red" }}>{msg}</div>}
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Role</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.email}</td>
              <td>{u.name}</td>
              <td>{u.role}</td>
              <td>{new Date(u.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
