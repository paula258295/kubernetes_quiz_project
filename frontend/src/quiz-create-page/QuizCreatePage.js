import { useState, useEffect } from "react";
import QuestionCreate from "../question-create/QuestionCreate";
import QuestionCard from "../question-card/QuestionCard";
import "./QuizCreatePage.css"

export default function QuizCreatePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [msg, setMsg] = useState("");
  const [quizId, setQuizId] = useState(null);
  const [quizDifficulty, setQuizDifficulty] = useState("easy");
  const [quizCreated, setQuizCreated] = useState(false);
  const [duration, setDuration] = useState(10);
  const [isPrivate, setIsPrivate] = useState(false);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [newTag, setNewTag] = useState("");
  const [addingTag, setAddingTag] = useState(false);
  const validateQuizForm = () => {
    if (title.trim().length < 3) {
      setMsg("Title must be at least 3 characters long.");
      return false;
    }
    if (title.trim().length > 100) {
      setMsg("Title cannot exceed 100 characters.");
      return false;
    }
    if (description.trim().length > 500) {
      setMsg("Description cannot exceed 500 characters.");
      return false;
    }
    if (!category) {
      setMsg("Please select a category.");
      return false;
    }
    if (![ "easy", "medium", "hard" ].includes(quizDifficulty)) {
      setMsg("Invalid difficulty level.");
      return false;
    }
    if (duration < 1 || duration > 180) {
      setMsg("Duration must be between 1 and 180 minutes.");
      return false;
    }
    return true;
  };


  useEffect(() => {
    fetch('http://localhost:3001/api/category')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        if (data.length > 0) setCategory(data[0]._id);
      });
  }, []);

  useEffect(() => {
    fetch('http://localhost:3001/api/tag')
      .then(res => res.json())
      .then(data => setTags(data));
  }, []);

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!validateQuizForm()) return;
    
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:3001/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          title,
          description,
          category,
          difficulty: quizDifficulty,
          duration,
          isPrivate,
          tags: selectedTags
        })
      });
      const data = await res.json();
      if (res.ok) {
        setQuizId(data.quiz._id);
        setQuizCreated(true);
        setMsg("Quiz created! Now add questions below.");
      } else {
        setMsg(data.message || (data.errors && data.errors[0].msg) || "Error");
      }
    } catch {
      setMsg("Network error");
    }
  };

  const handleQuestionCreated = (question) => {
    setQuestions(qs => [...qs, question]);
  };

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);

  return (
    <div className="quiz-create-page">
      <h2 className="quiz-create-title">Create Quiz</h2>
      <form className="quiz-create-form" onSubmit={handleCreateQuiz}>
        <input
          className="quiz-create-input"
          placeholder="Quiz title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <textarea
          className="quiz-create-textarea"
          placeholder="Quiz description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <label className="quiz-create-label">
          Category:
          <select
            className="quiz-create-select"
            value={category}
            onChange={e => setCategory(e.target.value)}
            required
          >
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </label>
        <label className="quiz-create-label">
          Difficulty:
          <select
            className="quiz-create-select"
            value={quizDifficulty}
            onChange={e => setQuizDifficulty(e.target.value)}
          >
            <option value="easy">easy</option>
            <option value="medium">medium</option>
            <option value="hard">hard</option>
          </select>
        </label>
        <label className="quiz-create-label">
          Duration (minutes):
          <input
            className="quiz-create-input"
            type="number"
            min="1"
            value={duration}
            onChange={e => setDuration(Number(e.target.value))}
            required
          />
        </label>
        <label className="quiz-create-checkbox-label">
          <input
            type="checkbox"
            checked={!isPrivate}
            onChange={e => setIsPrivate(!e.target.checked)}
          />
          Public quiz
        </label>
        <div className="quiz-create-tags">
          <b>Tags:</b>
          {tags.map(tag => (
            <label key={tag._id} className="quiz-create-tag-label">
              <input
                type="checkbox"
                value={tag._id}
                checked={selectedTags.includes(tag._id)}
                onChange={e => {
                  if (e.target.checked) {
                    setSelectedTags([...selectedTags, tag._id]);
                  } else {
                    setSelectedTags(selectedTags.filter(id => id !== tag._id));
                  }
                }}
              />
              {tag.name}
            </label>
          ))}
          <div className="quiz-create-addtag">
            <input
              className="quiz-create-input"
              type="text"
              placeholder="Add new tag"
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
            />
            <button
              type="button"
              className="quiz-create-btn"
              disabled={addingTag}
              onClick={async () => {
                if (!newTag.trim()) return;
                setAddingTag(true);
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:3001/api/tag", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                  },
                  body: JSON.stringify({ name: newTag.trim() })
                });
                const data = await res.json();
                setAddingTag(false);
                if (res.ok) {
                  setTags([...tags, data]);
                  setSelectedTags([...selectedTags, data._id]);
                  setNewTag("");
                } else {
                  alert(data.message || "Error adding tag");
                }
              }}
            >
              Add
            </button>
          </div>
        </div>
        <div className="quiz-create-msg" style={{ color: msg.startsWith("Quiz created") ? "green" : "red" }}>
          {msg}
        </div>
        <button
          type="submit"
          className="quiz-create-btn quiz-create-btn-main"
          disabled={quizCreated || addingTag}
        >
          Create Quiz
        </button>
      </form>

      {quizCreated && (
        <>
          <h3>Add Questions</h3>
          <QuestionCreate quizId={quizId} onQuestionCreated={handleQuestionCreated} />
          <h4>Questions in this quiz:</h4>
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
          <div><b>Total points for this quiz:</b> {totalPoints}</div>
        </>
      )}
    </div>
  );
}
