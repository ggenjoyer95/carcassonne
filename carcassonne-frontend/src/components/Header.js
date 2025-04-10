import React from "react";
import { Link, useLocation } from "react-router-dom";
function Header() {
  const location = useLocation();

  if (location.pathname.startsWith("/game/")) {
    return null;
  }
  return (
    <header
      style={{
        backgroundColor: "#f5f5f5",
        padding: "5px",
        textAlign: "center",
      }}
    >
      <h1>
        <Link to="/" style={{ textDecoration: "none", color: "#333" }}>
          Carcassonne
        </Link>
      </h1>
    </header>
  );
}

export default Header;
