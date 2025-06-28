import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function SocialLoginPage({ setLoggedIn }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      fetch("http://localhost:3001/api/user/me", {
        headers: { Authorization: "Bearer " + token }
      })
        .then(res => res.json())
        .then(data => {
          if (data.role) localStorage.setItem("role", data.role);
          setLoggedIn(true);
          navigate("/profile");
        })
        .catch(() => {
          localStorage.removeItem("token");
          setLoggedIn(false);
          navigate("/login");
        });
    } else {
      setLoggedIn(false);
      navigate("/login");
    }
  }, [location, navigate, setLoggedIn]);

  return <div>Logging in...</div>;
}
