import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.errorMessage || "Ошибка авторизации");
      } else {
        localStorage.setItem("jwt", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        navigate("/");
      }
    } catch (err) {
      console.error("Ошибка при авторизации:", err);
      setError("Ошибка соединения с сервером");
    }
  };

  return (
    <div
      style={{ margin: "40px auto", maxWidth: "400px", textAlign: "center" }}
    >
      <h2>Вход</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <style>
        {`
          .register-link {
            color: black;
            text-decoration: none;
          }
          .register-link:hover {
            text-decoration: underline;
          }
        `}
      </style>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px", textAlign: "left" }}>
          <label
            htmlFor="email"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ padding: "5px", width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: "10px", textAlign: "left" }}>
          <label
            htmlFor="password"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Пароль:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ padding: "5px", width: "100%" }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          Войти
        </button>
      </form>
      <p>
        Нет аккаунта?{" "}
        <Link to="/auth/register" className="register-link">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
};

export default Login;
