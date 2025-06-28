import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./QuizListPage.css";

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [view, setView] = useState("my");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tagToDelete, setTagToDelete] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/category')
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  useEffect(() => {
    fetch('http://localhost:3001/api/tag')
      .then(res => res.json())
      .then(data => setTags(data));
  }, []);

  function resetFilters() {
    setCategory("");
    setDifficulty("");
    setSearch("");
    setSelectedTags([]);
    setPage(1);
  }

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (difficulty) params.append("difficulty", difficulty);
    if (search) params.append("search", search);
    if (selectedTags.length > 0) params.append("tags", selectedTags.join(","));
    params.append("page", page);

    if (view === "my") {
      fetch("http://localhost:3001/api/quiz/my?" + params.toString(), {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
      })
        .then(res => res.json())
        .then(data => {
          setQuizzes(Array.isArray(data) ? data : (data.quizzes || []));
          setPages(data.pages || 1);
          setLoading(false);
        });
    } else if (view === "public") {
      fetch("http://localhost:3001/api/quiz/public?" + params.toString())
        .then(res => res.json())
        .then(data => {
          setQuizzes(Array.isArray(data) ? data : (data.quizzes || []));
          setPages(data.pages || 1);
          setLoading(false);
        });
    }
  }, [category, difficulty, search, selectedTags, page, view]);


  return (
    <div className="quiz-list-page">
      <h2 className="quiz-list-title">Quiz List</h2>
      <div className="quiz-list-view-buttons">
        <button
          className={view === "my" ? "active" : ""}
          onClick={() => { setView("my"); resetFilters(); }}
        >
          My quizzes
        </button>
        <button
          className={view === "public" ? "active" : ""}
          onClick={() => { setView("public"); resetFilters(); }}
        >
          Public quizzes
        </button>
      </div>
      <div className="quiz-list-filters">
        <input
          className="quiz-list-search"
          placeholder="Search..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          className="quiz-list-select"
          value={category}
          onChange={e => { setCategory(e.target.value); setPage(1); }}
        >
          <option value="">All categories</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
        <select
          className="quiz-list-select"
          value={difficulty}
          onChange={e => { setDifficulty(e.target.value); setPage(1); }}
        >
          <option value="">All difficulties</option>
          <option value="easy">easy</option>
          <option value="medium">medium</option>
          <option value="hard">hard</option>
        </select>
      </div>
      <div className="quiz-list-tags">
        <b>Tags:</b>
        {tags.map(tag => (
          <label key={tag._id} className="quiz-list-tag-label">
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
                setPage(1);
              }}
            />
            {tag.name}
            <button
              type="button"
              className="quiz-list-tag-delete"
              onClick={() => setTagToDelete(tag)}
            >
              ✕
            </button>
          </label>
        ))}
        {tagToDelete && (
          <div className="quiz-list-modal">
            <div className="quiz-list-modal-content">
              <div style={{ marginBottom: "1em" }}>
                Are you sure you want to delete tag <b>{tagToDelete.name}</b>?
              </div>
              <button
                style={{ marginRight: "1em" }}
                onClick={async () => {
                  const token = localStorage.getItem("token");
                  const res = await fetch(`http://localhost:3001/api/tag/${tagToDelete._id}`, {
                    method: "DELETE",
                    headers: {
                      Authorization: "Bearer " + token
                    }
                  });
                  if (res.ok) {
                    setTags(tags.filter(t => t._id !== tagToDelete._id));
                    setSelectedTags(selectedTags.filter(id => id !== tagToDelete._id));
                  } else {
                    const data = await res.json();
                    alert(data.message || "Error deleting tag");
                  }
                  setTagToDelete(null);
                }}
              >
                Yes, delete
              </button>
              <button onClick={() => setTagToDelete(null)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : quizzes.length === 0 ? (
        <div>Brak quizów do wyświetlenia.</div>
      ) : (
        <ul className="quiz-list-ul">
          {quizzes.map(q => (
            <li key={q._id} className="quiz-list-li">
              <Link to={`/quiz/${q._id}`} className="quiz-list-quiz-link">
                <b>{q.title}</b>
              </Link>
              <br />
              <span>
                <b>Level:</b> {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}
              </span>
              <br />
              <b>Description:</b> {q.description}
              <QuizPoints quizId={q._id} />
              <Link to={`/quiz/${q._id}/play`}>
                <button className="quiz-list-play-btn">Play</button>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="quiz-list-pagination">
        <button
          onClick={() => setPage(page => Math.max(1, page - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span> Strona {page} z {pages} </span>
        <button
          onClick={() => setPage(page => Math.min(pages, page + 1))}
          disabled={page === pages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function QuizPoints({ quizId }) {
  const [points, setPoints] = useState(0);
  useEffect(() => {
    fetch(`http://localhost:3001/api/quiz/${quizId}/points`)
      .then(res => res.json())
      .then(data => setPoints(data.totalPoints));
  }, [quizId]);
  return <div><b>Total points:</b> {points}</div>;
}
