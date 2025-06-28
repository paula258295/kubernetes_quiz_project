import { useEffect, useState } from "react";
import "./RankingPage.css"

export default function RankingPage() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/stats/global')
      .then(res => res.json())
      .then(data => {
        setRanking(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="ranking-loading">Loading ranking...</div>;

  return (
    <div className="ranking-page">
      <h2 className="ranking-title">Global Ranking</h2>
      <div className="ranking-table-wrapper">
        <table className="ranking-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name / Email</th>
              <th>Total Points</th>
              <th>Quizzes Completed</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((user, idx) => (
              <tr key={user._id} className={idx < 3 ? "ranking-top" : ""}>
                <td>{idx + 1}</td>
                <td>{user.name || user.email}</td>
                <td>{user.totalScore || 0}</td>
                <td>{user.quizzesCompleted || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
