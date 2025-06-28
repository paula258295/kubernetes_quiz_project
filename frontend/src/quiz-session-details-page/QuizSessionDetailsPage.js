import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./QuizSessionDetailsPage.css";

export default function QuizSessionDetailsPage() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3001/api/session/${sessionId}`, {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
    })
      .then(res => res.json())
      .then(async data => {
        if (data && data.quiz && data.quiz._id) {
          const resQ = await fetch(`http://localhost:3001/api/question?quiz=${data.quiz._id}`);
          const questionsData = await resQ.json();
          setQuestions(questionsData);
        }
        setSession(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load session details.");
        setLoading(false);
      });
  }, [sessionId]);

  if (loading) return <div className="session-details-loading">Loading session details...</div>;
  if (error) return <div className="session-details-error">{error}</div>;
  if (!session) return <div className="session-details-error">Session not found.</div>;

  const answersMap = {};
  (session.answers || []).forEach(a => {
    answersMap[a.question] = a.answer;
  });

  return (
    <div className="session-details-page">
      <h2 className="session-details-title">Quiz session details</h2>
      <div className="session-details-info">
        <div>
          <b>Quiz:</b> {session.quiz?.title || "Quiz deleted"}
        </div>
        <div>
          <b>Date:</b> {new Date(session.startedAt).toLocaleString()}
        </div>
        <div>
          <b>Status:</b> {session.finishedAt ? "Finished" : "In progress"}
        </div>
        {session.finishedAt && (
          <div>
            <b>Score:</b> {session.score ?? "?"}
          </div>
        )}
      </div>
      <hr className="session-details-hr" />
      <h3 className="session-details-answers-title">Answers</h3>
      <ul className="session-details-answers-list">
        {questions.map(q => {
          const userAnswer = answersMap[q._id] || [];
          const correct = q.correctAnswers;
          const isCorrect =
            q.type === "multiple"
              ? Array.isArray(userAnswer) &&
                Array.isArray(correct) &&
                userAnswer.length === correct.length &&
                userAnswer.slice().sort().every((v, i) => v === correct.slice().sort()[i])
              : userAnswer === correct[0];

          return (
            <li key={q._id} className="session-details-answer-li">
              <b>{q.text}</b>
              <div>
                Your answer:{" "}
                <span className={isCorrect ? "session-details-correct" : "session-details-wrong"}>
                  {Array.isArray(userAnswer)
                    ? userAnswer.join(", ")
                    : userAnswer || <i>no answer</i>}
                </span>
              </div>
              {!isCorrect && (
                <div>
                  Correct answer:{" "}
                  <span className="session-details-correct">
                    {Array.isArray(correct) ? correct.join(", ") : correct[0]}
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <Link to="/sessions">
        <button className="session-details-btn">Back to history</button>
      </Link>
    </div>
  );
}
