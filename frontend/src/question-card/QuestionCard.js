import { useState, useEffect } from "react";
import "./QuestionCard.css";

export default function QuestionCard({ question, onSave, onDelete }) {
  const [edit, setEdit] = useState(false);
  const [text, setText] = useState(question.text);
  const isBoolean = question.type === "boolean";
  const [options, setOptions] = useState(
    isBoolean ? ["True", "False"] : [...question.options]
  );
  const [correctAnswers, setCorrectAnswers] = useState([...question.correctAnswers]);
  const [points, setPoints] = useState(question.points || 1);
  const [hint, setHint] = useState(question.hint || "");
  const isChanged =
  text !== question.text ||
  points !== (question.points || 1) ||
  hint !== (question.hint || "") ||
  JSON.stringify(options) !== JSON.stringify(question.options) ||
  JSON.stringify(correctAnswers) !== JSON.stringify(question.correctAnswers);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [msg, setMsg] = useState("");


  useEffect(() => {
    if (!question) return;
    setOptions(isBoolean ? ["True", "False"] : [...question.options]);
    setCorrectAnswers([...question.correctAnswers]);
    setText(question.text);
    setPoints(question.points || 1);
    setHint(question.hint || "");
  }, [question, isBoolean]);

  function handleOptionChange(i, value) {
    setOptions((opts) => opts.map((opt, idx) => (idx === i ? value : opt)));
  }

  function handleCorrectToggle(opt) {
    if (isBoolean) {
      setCorrectAnswers([opt]);
    } else if (question.type === "single") {
      setCorrectAnswers([opt]);
    } else {
      if (correctAnswers.includes(opt)) {
        setCorrectAnswers(ca => ca.filter(a => a !== opt));
      } else {
        setCorrectAnswers(ca => [...ca, opt]);
      }
    }
  }

  function handleAddOption() {
    setOptions((opts) => [...opts, ""]);
  }

  function handleRemoveOption(i) {
    setOptions((opts) => opts.filter((_, idx) => idx !== i));
    setCorrectAnswers((ca) => ca.filter((a) => a !== options[i]));
  }

  async function handleSave() {
    if (text.trim().length < 2) {
      setMsg("Question text must be at least 2 characters long.");
      return false;
    }
    if ((question.type === "single" || question.type === "multiple") && options.some(opt => !opt.trim())) {
      setMsg("All options must have text.");
      return false;
    }
    if ((question.type === "single" || question.type === "multiple" || question.type === "boolean") && correctAnswers.length === 0) {
      setMsg("At least one correct answer is required.");
      return false;
    }
    if (points < 1) {
      setMsg("Points must be at least 1.");
      return false;
    }

    setMsg("");


    try {
      const res = await fetch(`http://localhost:3001/api/question/${question._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({
          text,
          options,
          correctAnswers,
          points,
          hint,
        }),
      });

      const data = await res.json();
      if (data._id) {
        onSave(data);
        setEdit(false);
        return true;
      } else {
        alert("Error updating question");
        return false;
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Network error");
      return false;
    }
  }


  return (
    <div className="question-card">
      {edit ? (
        <>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await handleSave();
              if (!ok) return;
            }}
          >
            <label>
              Question:
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
            </label>
            <label>
              Points:
              <input
                type="number"
                min="1"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                required
              />
            </label>
            <label>
              Hint:
              <input value={hint} onChange={(e) => setHint(e.target.value)} />
            </label>
            <div>
              <b>Options:</b>
              {options.map((opt, i) => (
                <div key={i} className="question-option-item">
                  <input
                    type="text"
                    value={opt}
                    disabled={isBoolean}
                    style={isBoolean ? { background: "#f0f0f0" } : {}}
                    onChange={e => handleOptionChange(i, e.target.value)}
                  />
                  <input
                    type={isBoolean || question.type === "single" ? "radio" : "checkbox"}
                    name={isBoolean || question.type === "single" ? "correct" : undefined}
                    checked={correctAnswers.includes(opt)}
                    onChange={() => handleCorrectToggle(opt)}
                  />
                  <span className="correct-label">Correct</span>
                  {!isBoolean && (
                    <button type="button" onClick={() => handleRemoveOption(i)}>
                      Remove
                    </button>
                  )}
                </div>
              ))}
              {!isBoolean && (
                <button type="button" onClick={handleAddOption}>
                  Add option
                </button>
              )}
              {msg && <div className="question-error-msg" style={{ color: "red", marginTop: "10px" }}>{msg}</div>}
            </div>
            <div style={{ marginTop: "1em" }}>
              <button type="submit" className="question-btn" disabled={!isChanged}>Save</button>
              <button type="button" className="question-btn" onClick={() => setEdit(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="question-btn delete"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete
              </button>
            </div>
          </form>
          {showDeleteModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Delete question?</h3>
                <p>Are you sure you want to delete this question?</p>
                <div style={{ marginTop: "1em" }}>
                  <button
                    className="question-btn delete"
                    onClick={() => {
                      setShowDeleteModal(false);
                      onDelete(question._id);
                    }}
                  >
                    Yes, delete
                  </button>
                  <button
                    className="question-btn cancel"
                    onClick={() => setShowDeleteModal(false)}
                    style={{ marginLeft: "1em" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          </>
      ) : (
        <>
          <div>
            <b>{text}</b> ({question.type}, {points} pts)
            {hint && (
              <div>
                <i>Hint: {hint}</i>
              </div>
            )}
          </div>
          <div>
            <b>Options:</b>
            <ul>
              {options.map((opt, i) => (
                <li key={i}>
                  {opt}{" "}
                  {correctAnswers.includes(opt) && (
                    <span style={{ color: "green", fontWeight: "bold" }}>
                      (correct)
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <button onClick={() => setEdit(true)}>Edit</button>
        </>
      )}
    </div>
  );
}

