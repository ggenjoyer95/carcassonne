
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const authLinkStyle = {
    color: "black",
    textDecoration: "none",
    marginLeft: "15px",
    fontSize: "16px",
    cursor: "pointer",
  };

  const handleMouseOver = (e) => {
    e.target.style.textDecoration = "underline";
  };
  const handleMouseOut = (e) => {
    e.target.style.textDecoration = "none";
  };

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        padding: "10px 20px",
        backgroundColor: "#f5f5f5",
        position: "relative",
      }}
    >
      {}
      <div style={{ flexGrow: 1, textAlign: "center" }}>
        <Link
          to="/"
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "black",
            textDecoration: "none",
          }}
        >
          Carcassonne
        </Link>
      </div>

      {}
      <nav style={{ position: "absolute", right: "20px" }}>
        {!user ? (
          <>
            <Link
              to="/auth/login"
              style={authLinkStyle}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
            >
              Войти
            </Link>
            <Link
              to="/auth/register"
              style={authLinkStyle}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
            >
              Регистрация
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/profile"
              style={{ ...authLinkStyle, fontWeight: "bold" }}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
            >
              {user.username}
            </Link>
            <span
              onClick={handleLogout}
              style={{ ...authLinkStyle, marginLeft: "15px" }}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
            >
              Выйти
            </span>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
