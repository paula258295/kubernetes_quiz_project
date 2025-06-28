import { useState } from "react";
import "./QuestionCreate.css"

export default function QuestionCreate({ quizId, onQuestionCreated }) {
  const [type, setType] = useState("single");
  const [text, setText] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [points, setPoints] = useState(1);
  const [hint, setHint] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [msg, setMsg] = useState("");

  const handleOptionChange = (i, value) => {
    const newOptions = [...options];
    newOptions[i] = value;
    setOptions(newOptions);
  };

  const addOption = () => setOptions([...options, ""]);
  const removeOption = (i) => setOptions(options.filter((_, idx) => idx !== i));

  const handleCorrectChange = (value, checked) => {
    if (type === "single" || type === "boolean") {
      setCorrectAnswers([value]);
    } else if (type === "multiple") {
      setCorrectAnswers(checked
        ? [...correctAnswers, value]
        : correctAnswers.filter(ans => ans !== value)
      );
    }
  };

  const resetForm = () => {
    setType("single");
    setText("");
    setOptions(["", ""]);
    setCorrectAnswers([]);
    setPoints(1);
    setHint("");
    setDifficulty("easy");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (text.trim().length < 2) {
      setMsg("Question text must be at least 2 characters long.");
      return;
    }
    if ((type === "single" || type === "multiple") && options.some(opt => !opt.trim())) {
      setMsg("All options must have text.");
      return;
    }
    if ((type === "single" || type === "multiple" || type === "boolean") && correctAnswers.length === 0) {
      setMsg("Please select at least one correct answer.");
      return;
    }
    if (points < 1) {
      setMsg("Points must be at least 1.");
      return;
    }

  
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:3001/api/question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          quiz: quizId,
          type,
          text,
          options: type === "boolean" ? ["True", "False"] : type === "open" ? [] : options,
          correctAnswers: type === "open" ? [] : correctAnswers,
          points,
          hint,
          difficulty
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Question created!");
        resetForm();
        if (onQuestionCreated) onQuestionCreated(data.question);
      } else {
        setMsg(data.message || (data.errors && data.errors[0].msg) || "Error");
      }
    } catch {
      setMsg("Network error");
    }
  };

  let optionsFields = null;
  if (type === "single" || type === "multiple") {
    optionsFields = (
      <div className="question-create-options">
        <b>Options:</b>
        {options.map((opt, i) => (
          <div key={i} className="question-create-option-row">
            <input
              className="question-create-input"
              value={opt}
              onChange={e => handleOptionChange(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
              required
            />
            {options.length > 2 && (
              <button
                type="button"
                className="question-create-btn question-create-btn-remove"
                onClick={() => removeOption(i)}
              >
                Remove
              </button>
            )}
            {type === "single" ? (
              <input
                type="radio"
                name="correct"
                checked={correctAnswers[0] === opt}
                onChange={() => handleCorrectChange(opt, true)}
                title="Correct"
              />
            ) : (
              <input
                type="checkbox"
                checked={correctAnswers.includes(opt)}
                onChange={e => handleCorrectChange(opt, e.target.checked)}
                title="Correct"
              />
            )}
            <span> Correct</span>
          </div>
        ))}
        <button
          type="button"
          className="question-create-btn"
          onClick={addOption}
        >
          Add option
        </button>
      </div>
    );
  } else if (type === "boolean") {
    optionsFields = (
      <div className="question-create-options">
        <b>Answer:</b>
        <label className="question-create-radio-label">
          <input
            type="radio"
            name="correct"
            checked={correctAnswers[0] === "True"}
            onChange={() => handleCorrectChange("True", true)}
          /> True
        </label>
        <label className="question-create-radio-label">
          <input
            type="radio"
            name="correct"
            checked={correctAnswers[0] === "False"}
            onChange={() => handleCorrectChange("False", true)}
          /> False
        </label>
      </div>
    );
  }

  return (
    <form className="question-create-form" onSubmit={handleSubmit}>
      <label className="question-create-label">
        Question type:
        <select
          className="question-create-select"
          value={type}
          onChange={e => { setType(e.target.value); setCorrectAnswers([]); }}
        >
          <option value="single">Single choice</option>
          <option value="multiple">Multiple choice</option>
          <option value="boolean">True/False</option>
        </select>
      </label>
      <input
        className="question-create-input"
        placeholder="Question text"
        value={text}
        onChange={e => {
          setText(e.target.value);
          if (msg) setMsg("");
        }}
        required
      />
      {optionsFields}
      <label className="question-create-label">
        Points:
        <input
          className="question-create-input"
          type="number"
          min="1"
          value={points}
          onChange={e => setPoints(Number(e.target.value))}
          required
        />
      </label>
      <label className="question-create-label">
        Difficulty:
        <select
          className="question-create-select"
          value={difficulty}
          onChange={e => setDifficulty(e.target.value)}
        >
          <option value="easy">easy</option>
          <option value="medium">medium</option>
          <option value="hard">hard</option>
        </select>
      </label>
      <input
        className="question-create-input"
        placeholder="Hint (optional)"
        value={hint}
        onChange={e => setHint(e.target.value)}
      />
      <button type="submit" className="question-create-btn question-create-btn-main">
        Add question
      </button>
      <div
        className="question-create-msg"
        style={{ color: msg.startsWith("Question created") ? "green" : "red" }}
      >
        {msg}
      </div>
    </form>
  );
}
