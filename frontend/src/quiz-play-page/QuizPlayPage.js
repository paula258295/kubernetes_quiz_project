import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./QuizPlayPage.css"

export default function QuizPlayPage({ onStatsUpdate }) {
  const { quizId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem("token");
    Promise.all([
      fetch(`http://localhost:3001/api/quiz/${quizId}`, {
        headers: token ? { Authorization: "Bearer " + token } : {}
      })
        .then(res => res.json()),
      fetch(`http://localhost:3001/api/question?quiz=${quizId}`).then(res => res.json())
    ]).then(([quizData, questionsData]) => {
      if (isMounted) {
        setQuiz(quizData);
        setQuestions(questionsData);
        setLoading(false);
      }
    });

    fetch('http://localhost:3001/api/session/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({ quizId })
    })
      .then(res => res.json())
      .then(data => {
        if (data._id) setSessionId(data._id);
      });

    return () => { isMounted = false; };
  }, [quizId]);

  useEffect(() => {
    setShowHint(false);
  }, [current]);

  if (loading) return <div className="quiz-play-loading">Loading quiz...</div>;
  if (!quiz) return <div className="quiz-play-error">Quiz not found</div>;
  if (questions.length === 0) return <div className="quiz-play-error">No questions in this quiz.</div>;

  const q = questions[current];

  function handleAnswerChange(e, option) {
    if (q.type === "single" || q.type === "boolean") {
      setAnswers({ ...answers, [q._id]: option });
    } else if (q.type === "multiple") {
      const prev = answers[q._id] || [];
      if (e.target.checked) {
        setAnswers({ ...answers, [q._id]: [...prev, option] });
      } else {
        setAnswers({ ...answers, [q._id]: prev.filter(o => o !== option) });
      }
    }
  }

  function next() {
    if (current < questions.length - 1) setCurrent(current + 1);
  }
  function prev() {
    if (current > 0) setCurrent(current - 1);
  }

  async function finish() {
    try {
      const response = await fetch('http://localhost:3001/api/session/finish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
          sessionId,
          answers: Object.entries(answers).map(([question, answer]) => ({ question, answer }))
        })
      });
      const data = await response.json();
      if (response.ok) {
        setResult(data);
        if (onStatsUpdate) onStatsUpdate();
      } else {
        setError(data.message || "Error while saving answer.");
      }
    } catch (err) {
      setError("Błąd sieci lub serwera.");
    }
  }

  if (error) {
    return (
      <div className="quiz-play-error">
        <h2>Błąd</h2>
        <div>{error}</div>
        <button className="quiz-play-btn" onClick={() => window.location.reload()}>Try again</button>
      </div>
    );
  }
  if (result && !showAnswers) {
    return (
      <div className="quiz-play-result">
        <h2>Quiz finished!</h2>
        <div>
          Your score: <b>{result.score}</b> / {result.maxScore}
        </div>
        {result.newBadges && result.newBadges.length > 0 && (
          <div className="quiz-play-badges">
            🎉 New achievement{result.newBadges.length > 1 ? "s" : ""}:{" "}
            {result.newBadges.join(", ")}
          </div>
        )}
        <button className="quiz-play-btn" onClick={() => window.location.reload()}>Solve again</button>
        <button className="quiz-play-btn" onClick={() => setShowAnswers(true)}>Check answers</button>
      </div>
    );
  }

  if (result && showAnswers) {
    return (
      <div className="quiz-play-answers">
        <h2>Quiz answers</h2>
        <ul>
          {questions.map(q => {
            const userAnswer = answers[q._id];
            const correct = q.correctAnswers;
            const correctFiltered = Array.isArray(correct)
              ? correct.filter(x => x !== "")
              : correct;

            const userAnswerFiltered = Array.isArray(userAnswer)
              ? userAnswer.filter(x => x !== "")
              : userAnswer;

            const isCorrect =
              q.type === "multiple"
                ? Array.isArray(userAnswerFiltered) &&
                  Array.isArray(correctFiltered) &&
                  userAnswerFiltered.length === correctFiltered.length &&
                  userAnswerFiltered.slice().sort().every(
                    (v, i) => v === correctFiltered.slice().sort()[i]
                  )
                : userAnswer === correctFiltered[0];
                
            return (
              <li key={q._id} className="quiz-play-answer-li">
                <b>{q.text}</b>
                <div>
                  Your answer:{" "}
                  <span style={{ color: isCorrect ? "green" : "red" }}>
                    {Array.isArray(userAnswer) ? userAnswer.join(", ") : userAnswer || <i>no answer</i>}
                  </span>
                </div>
                {!isCorrect && (
                  <div>
                    Correct answer:{" "}
                    <span style={{ color: "green" }}>
                      {Array.isArray(correct)
                        ? correct.filter(x => x !== "").join(", ")
                        : correct[0]}
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <button className="quiz-play-btn" onClick={() => window.location.reload()}>Solve again</button>
        <button className="quiz-play-btn" onClick={() => setShowAnswers(false)}>Back to result</button>
      </div>
    );
  }

  return (
    <div className="quiz-play-page">
      <h2 className="quiz-play-title">{quiz.title}</h2>
      <div className="quiz-play-question-header">
        <b>{current + 1} / {questions.length}</b>
      </div>
      <div className="quiz-play-question-text">
        <b>{q.text}</b>
        {q.hint && (
          <>
            <button
              type="button"
              className="quiz-play-hint-btn"
              onClick={() => setShowHint(h => !h)}
              style={{ marginLeft: 10 }}
            >
              {showHint ? "Ukryj podpowiedź" : "Pokaż podpowiedź"}
            </button>
            {showHint && (
              <div className="quiz-play-hint">
                <i>Hint: {q.hint}</i>
              </div>
            )}
          </>
        )}
      </div>
      <form className="quiz-play-form">
        {q.options.map((opt, i) => (
          <div key={i} className="quiz-play-option">
            {q.type === "single" || q.type === "boolean" ? (
              <label>
                <input
                  type="radio"
                  name={`answer_${q._id}`}
                  value={opt}
                  checked={answers[q._id] === opt}
                  onChange={() => handleAnswerChange({ target: { checked: true } }, opt)}
                />
                {opt}
              </label>
            ) : (
              <label>
                <input
                  type="checkbox"
                  value={opt}
                  checked={(answers[q._id] || []).includes(opt)}
                  onChange={e => handleAnswerChange(e, opt)}
                />
                {opt}
              </label>
            )}
          </div>
        ))}
      </form>
      <div className="quiz-play-nav">
        <button className="quiz-play-btn" onClick={prev} disabled={current === 0}>Previous</button>
        {current < questions.length - 1 ? (
          <button className="quiz-play-btn" onClick={next}>Next</button>
        ) : (
          <button className="quiz-play-btn" onClick={finish}>Finish the quiz</button>
        )}
      </div>
    </div>
  );
}
