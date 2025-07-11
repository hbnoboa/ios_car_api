import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import { BrowserRouter as Router } from "react-router-dom";
import { SocketProvider } from "./contexts/SocketContext";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <SocketProvider>
    <Router>
      <AuthProvider>
        <Container>
          <App />
        </Container>
      </AuthProvider>
    </Router>
  </SocketProvider>
);
