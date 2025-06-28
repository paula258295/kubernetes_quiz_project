import { useEffect, useState } from "react";
import QuestionCreate from "../question-create/QuestionCreate";
import QuestionCard from "../question-card/QuestionCard";
import { Link } from "react-router-dom";
import "./QuizDetails.css";

export default function QuizDetails({ quizId }) {
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editQuiz, setEditQuiz] = useState(false);
  const [quizEditData, setQuizEditData] = useState({});
  const [msg, setMsg] = useState("");
  const token = localStorage.getItem("token");
  const [categories, setCategories] = useState([]);
  const [showDeleteQuizModal, setShowDeleteQuizModal] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/category')
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:3001/api/user/me", {
        headers: { Authorization: "Bearer " + token }
      })
        .then(res => res.json())
        .then(data => setUser(data));
    }
  }, []);

  const fetchAll = () => {
    fetch(`http://localhost:3001/api/quiz/${quizId}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then(res => res.json())
      .then(data => {
        setQuiz(data);
        setQuizEditData({
          title: data.title,
          description: data.description,
          category: data.category,
          difficulty: data.difficulty,
          duration: data.duration,
          isPrivate: data.isPrivate
        });
      });
    fetch(`http://localhost:3001/api/question/quiz/${quizId}`)
      .then(res => res.json())
      .then(data => setQuestions(data));
    fetch(`http://localhost:3001/api/quiz/${quizId}/points`)
      .then(res => res.json())
      .then(data => setTotalPoints(data.totalPoints));
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, [quizId]);

  const handleQuestionCreated = () => {
    setShowAddQuestion(false);
    fetchAll();
  };

  const handleQuizEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuizEditData({
      ...quizEditData,
      [name]: type === "checkbox" ? !checked : value
    });
  };

  const handleQuizEditSave = async () => {
    setMsg("");
    const res = await fetch(`http://localhost:3001/api/quiz/${quizId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(quizEditData)
    });
    if (res.ok) {
      setEditQuiz(false);
      fetchAll();
      setMsg("Quiz updated!");
    } else {
      setMsg("Error updating quiz");
    }
  };

  if (!quiz) return <div className="quiz-details-loading">Loading quiz...</div>;

  return (
    <div className="quiz-details-page">
      <h2 className="quiz-details-title">
        {editQuiz ? (
          <input
            className="quiz-details-input"
            name="title"
            value={quizEditData.title}
            onChange={handleQuizEditChange}
            required
          />
        ) : (
          quiz.title
        )}
      </h2>
      {editQuiz ? (
        <>
          <textarea
            className="quiz-details-textarea"
            name="description"
            value={quizEditData.description}
            onChange={handleQuizEditChange}
            placeholder="Description"
          /><br />
          <label className="quiz-details-label">
            Category:
            <select
              className="quiz-details-select"
              name="category"
              value={quizEditData.category}
              onChange={handleQuizEditChange}
              required
            >
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </label><br />
          <label className="quiz-details-label">
            Difficulty:
            <select
              className="quiz-details-select"
              name="difficulty"
              value={quizEditData.difficulty}
              onChange={handleQuizEditChange}
            >
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="hard">hard</option>
            </select>
          </label><br />
          <label className="quiz-details-label">
            Duration (minutes):
            <input
              className="quiz-details-input"
              name="duration"
              type="number"
              min="1"
              value={quizEditData.duration}
              onChange={handleQuizEditChange}
              required
            />
          </label><br />
          <label className="quiz-details-checkbox-label">
            <input
              name="isPrivate"
              type="checkbox"
              checked={!quizEditData.isPrivate}
              onChange={handleQuizEditChange}
            />
            Public quiz (visible to everyone)
          </label>
          <div className="quiz-details-info">
            If unchecked, only you will see this quiz in your list.
          </div>
          <div className="quiz-details-btn-row">
            <button className="quiz-details-btn" onClick={handleQuizEditSave}>Save</button>
            <button className="quiz-details-btn quiz-details-btn-cancel" onClick={() => setEditQuiz(false)}>Cancel</button>
          </div>
        </>
      ) : (
        <>
          <p>
            <b>Category:</b> {categories.find(cat => cat._id === quiz.category)?.name || quiz.category}
          </p>
          <p><b>Difficulty:</b> {quiz.difficulty}</p>
          <p><b>Description:</b> {quiz.description}</p>
          <p><b>Duration:</b> {quiz.duration} min</p>
          <p>
            <b>Visibility:</b> {quiz.isPrivate ? "Private (only you)" : "Public (everyone can see)"}
          </p>
          <div className="quiz-details-btn-row">
            {user && String(quiz.owner) === String(user._id) && (
              <button className="quiz-details-btn" onClick={() => setEditQuiz(true)}>
                Edit quiz
              </button>
            )}
            <Link to={`/quiz/${quiz._id}/play`}>
              <button className="quiz-details-btn">Play</button>
            </Link>
            {user && String(quiz.owner) === String(user._id) && (
              <button
                className="quiz-details-btn quiz-details-btn-delete"
                style={{ marginLeft: "1em" }}
                onClick={() => setShowDeleteQuizModal(true)}
              >
                Delete quiz
              </button>
            )}
          </div>
        </>
      )}
      <div className="quiz-details-msg" style={{ color: "green" }}>{msg}</div>
      <h3 className="quiz-details-points">Total points: {totalPoints}</h3>
      <button className="quiz-details-btn" onClick={() => setShowAddQuestion(s => !s)}>
        {showAddQuestion ? "Hide add question" : "Add question"}
      </button>
      {showAddQuestion && (
        <div className="quiz-details-add-question">
          <QuestionCreate quizId={quizId} onQuestionCreated={handleQuestionCreated} />
        </div>
      )}
      <h4 className="quiz-details-questions-title">Questions:</h4>
      <div className="question-list">
        {questions.map(q => (
          <QuestionCard
            key={q._id}
            question={q}
            onSave={updatedQuestion => {
              setQuestions(questions =>
                questions.map(qq => qq._id === updatedQuestion._id ? updatedQuestion : qq)
              );
            }}
            onDelete={id => {
              fetch(`http://localhost:3001/api/question/${id}`, {
                method: "DELETE",
                headers: {
                  Authorization: "Bearer " + localStorage.getItem("token"),
                },
              }).then(res => {
                if (res.ok) {
                  setQuestions(questions => questions.filter(q => q._id !== id));
                } else {
                  alert("Error deleting question");
                }
              });
            }}
          />
        ))}
      </div>
      {showDeleteQuizModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete quiz?</h3>
            <p>Are you sure you want to delete this quiz? This action cannot be undone.</p>
            <div style={{ marginTop: "1em" }}>
              <button
                className="quiz-details-btn quiz-details-btn-delete"
                onClick={async () => {
                  setShowDeleteQuizModal(false);
                  const token = localStorage.getItem("token");
                  const res = await fetch(`http://localhost:3001/api/quiz/${quiz._id}`, {
                    method: "DELETE",
                    headers: {
                      Authorization: "Bearer " + token,
                    },
                  });
                  if (res.ok) {
                    window.location.href = "/quizzes";
                  } else {
                    alert("Error deleting quiz");
                  }
                }}
              >
                Yes, delete
              </button>
              <button
                className="quiz-details-btn quiz-details-btn-cancel"
                onClick={() => setShowDeleteQuizModal(false)}
                style={{ marginLeft: "1em" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
