import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Navbar, Nav, Container, Button } from "react-bootstrap";

const AppNavbar = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [darkTheme, setDarkTheme] = useState(false);

  useEffect(() => {
    if (darkTheme) {
      document.body.style.backgroundColor = "#181818";
      document.body.style.color = "#fff";
      document.body.classList.add("dark-theme");
    } else {
      document.body.style.backgroundColor = "#fff";
      document.body.style.color = "#000";
      document.body.classList.remove("dark-theme");
    }
  }, [darkTheme]);

  if (!token) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleThemeToggle = () => {
    setDarkTheme((prev) => !prev);
  };

  return (
    <Navbar
      bg={darkTheme ? "dark" : "light"}
      variant={darkTheme ? "dark" : "light"}
      expand="lg"
      className="mb-4"
    >
      <Container>
        <Navbar.Brand as={Link} to="/">
          IOS Car API
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar-nav" />
        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/vehicles">
              Veículos
            </Nav.Link>
          </Nav>
          <Button
            variant={darkTheme ? "secondary" : "dark"}
            onClick={handleThemeToggle}
            className="me-2"
          >
            {darkTheme ? "Tema Claro" : "Tema Escuro"}
          </Button>
          <Button variant="outline-danger" onClick={handleLogout}>
            Logout
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;

// Adicione este CSS global (por exemplo, em index.css ou App.css):
/*
.dark-theme table {
  background-color: #232323 !important;
  color: #fff !important;
}
.dark-theme th, .dark-theme td {
  background-color: #232323 !important;
  color: #fff !important;
  border-color: #444 !important;
}
.dark-theme thead {
  background-color: #181818 !important;
}
*/
