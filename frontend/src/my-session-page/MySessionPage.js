import { useEffect, useState } from "react";

export default function MySessionsPage() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/session/my', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
    })
      .then(res => res.json())
      .then(data => setSessions(data));
  }, []);

  return (
    <div>
      <h2>My Quiz Sessions</h2>
      <ul>
        {sessions.map(s => (
          <li key={s._id}>
            <b>{s.quiz.title}</b> <br />
            Date: {new Date(s.startedAt).toLocaleString()} <br />
            {s.finishedAt
              ? <>Score: {s.score} / {s.quiz.questionsCount} <button>Show details</button></>
              : <button>Continue</button>
            }
          </li>
        ))}
      </ul>
    </div>
  );
}
