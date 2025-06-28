import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./QuizSessionHistoryPage.css"

export default function QuizSessionHistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3001/api/session/my', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
    })
      .then(res => res.json())
      .then(data => {
        setSessions(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="quiz-history-loading">Loading your quiz history...</div>;

  if (sessions.length === 0) return <div className="quiz-history-empty">No quiz sessions found.</div>;

  return (
    <div className="quiz-history-page">
      <h2 className="quiz-history-title">Quiz History</h2>
      <ul className="quiz-history-list">
        {sessions.map(session => (
          <li key={session._id} className="quiz-history-item">
            <b>{session.quiz?.title || "Quiz deleted"}</b><br />
            <span className="quiz-history-date">
              Date: {new Date(session.startedAt).toLocaleString()}
            </span>
            <br />
            {session.finishedAt ? (
              <>
                <span>
                  Score: <b>{session.score ?? "?"}</b>
                  {session.maxScore ? <> / {session.maxScore}</> : null}
                </span>
                <button
                  className="quiz-history-btn"
                  onClick={() => navigate(`/session/${session._id}`)}
                >
                  Show details
                </button>
              </>
            ) : (
              <>
                <span className="quiz-history-inprogress">In progress</span>
                <button
                  className="quiz-history-btn"
                  onClick={() => navigate(`/quiz/${session.quiz?._id}/play`)}
                >
                  Continue
                </button>
                <button
                  className="quiz-history-btn"
                  onClick={() => navigate(`/session/${session._id}`)}
                >
                  Show details
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
