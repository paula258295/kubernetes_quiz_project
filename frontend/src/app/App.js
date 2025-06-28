import './App.css';

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
} from "react-router-dom";
import RegisterPage from "../register-page/RegisterPage";
import LoginPage from "../login-page/LoginPage";
import ProfilePage from "../profile-page/ProfilePage";
import LogoutButton from "../logout-button/LogoutButton";
import { useState, useEffect } from "react";
import SocialLoginPage from "../social-login-page/SocialLoginPage";
import AdminPage from "../admin-page/AdminPage";
import QuizListPage from "../quiz-list-page/QuizListPage";
import QuizCreatePage from "../quiz-create-page/QuizCreatePage";
import QuizDetails from "../quiz-details/QuizDetails";
import QuizPlayPage from "../quiz-play-page/QuizPlayPage";
import QuizSessionHistoryPage from "../quiz-session-history-page/QuizSessionHistoryPage";
import QuizSessionDetailsPage from "../quiz-session-details-page/QuizSessionDetailsPage";
import RankingPage from "../ranking-page/RankingPage";
import WeeklyRankingPage from "../weekly-ranking-page/WeeklyRankingPage";
import ResetPasswordRequestPage from "../reset-password-request-page/ResetPasswordRequestPage";
import ResetPasswordConfirmPage from "../reset-password-confirm-page/ResetPasswordConfirmPage";

function QuizDetailsWrapper() {
  const { quizId } = useParams();
  return <QuizDetails quizId={quizId} />;
}

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [userStats, setUserStats] = useState({
    totalScore: 0,
    quizzesCompleted: 0,
  });

  useEffect(() => {
    const onStorage = () => {
      setLoggedIn(!!localStorage.getItem("token"));
      setRole(localStorage.getItem("role"));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      fetch("http://localhost:3001/api/user/me/stats", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
        .then((res) => res.json())
        .then((data) => setUserStats(data));
    }
  }, [loggedIn]);

  function fetchUserStats() {
    fetch("http://localhost:3001/api/user/me/stats", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    })
      .then((res) => res.json())
      .then((data) => setUserStats(data));
  }

  return (
    <BrowserRouter>
      <nav className="main-nav">
        <div className="nav-links">
          {loggedIn && (
            <>
              <Link to="/quizzes" className="nav-link">
                Quiz List
              </Link>
              <Link to="/sessions" className="nav-link">
                Quiz History
              </Link>
            </>
          )}
          <Link to="/ranking" className="nav-link">
            Global Ranking
          </Link>
          <Link to="/ranking/weekly" className="nav-link">
            Weekly Ranking
          </Link>
          {loggedIn && (
            <Link to="/create-quiz" className="nav-link">
              Create Quiz
            </Link>
          )}
          {!loggedIn && (
            <>
              <Link to="/register" className="nav-link">
                Register
              </Link>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/reset-password" className="nav-link">
                Reset Password
              </Link>
            </>
          )}
        </div>
        <div className="nav-user">
          {loggedIn && (
            <span className="user-stats">
              <span>
                <b>Total points:</b> {userStats.totalScore}
              </span>
              <span>
                <b>Quizzes completed:</b> {userStats.quizzesCompleted}
              </span>
            </span>
          )}
          {loggedIn && (
            <div className="nav-profile">
              <Link to="/profile" className="nav-link">
                Profile
              </Link>
              {role === "admin" && (
                <Link to="/admin" className="nav-link">
                  Admin Panel
                </Link>
              )}
              <LogoutButton setLoggedIn={setLoggedIn} />
            </div>
          )}
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          {loggedIn && <Route path="/quizzes" element={<QuizListPage />} />}
          <Route path="/quiz/:quizId" element={<QuizDetailsWrapper />} />
          {loggedIn && <Route path="/sessions" element={<QuizSessionHistoryPage />} />}
          <Route
            path="/session/:sessionId"
            element={<QuizSessionDetailsPage />}
          />
          <Route
            path="/quiz/:quizId/play"
            element={<QuizPlayPage onStatsUpdate={fetchUserStats} />}
          />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/ranking/weekly" element={<WeeklyRankingPage />} />
          {loggedIn && (
            <Route path="/create-quiz" element={<QuizCreatePage />} />
          )}
          {loggedIn && (
            <Route
              path="/quiz/:quizId/add-question"
              element={<QuizCreatePage />}
            />
          )}
          {!loggedIn && (
            <>
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/login"
                element={<LoginPage setLoggedIn={setLoggedIn} />}
              />
              <Route path="/reset-password" element={<ResetPasswordRequestPage />} />
              <Route path="/reset-password/confirm" element={<ResetPasswordConfirmPage />} />

            </>
          )}
          {loggedIn && (
            <>
              <Route path="/profile" element={<ProfilePage />} />
              {role === "admin" && (
                <Route path="/admin" element={<AdminPage />} />
              )}
            </>
          )}
          <Route path="/social-login" element={<SocialLoginPage setLoggedIn={setLoggedIn} />} />
          <Route
            path="/"
            element={
              <div className="welcome">
                Welcome to Quiz App!
              </div>
            }
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
