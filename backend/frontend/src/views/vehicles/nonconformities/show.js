import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, Container, Button } from "react-bootstrap";

const ShowNonconformity = () => {
  const { id, ncid } = useParams();
  const [nc, setNc] = useState(null);
  const [darkTheme, setDarkTheme] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkTheme(document.body.classList.contains("dark-theme"));
    });
    observer.observe(document.body, { attributes: true });
    setDarkTheme(document.body.classList.contains("dark-theme"));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`/api/vehicles/${id}/nonconformities/${ncid}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setNc(data.data.nonconformity));
  }, [id, ncid]);

  if (!nc) return <div>Carregando...</div>;

  // Helper to render arrays or fallback
  const renderField = (field) => {
    if (Array.isArray(field)) return field.join(", ");
    if (typeof field === "object" && field !== null && field.name)
      return field.name;
    return field || "-";
  };

  return (
    <Container style={{ maxWidth: 700, marginTop: 40 }}>
      <Card
        bg={darkTheme ? "dark" : "light"}
        text={darkTheme ? "light" : "dark"}
        className={darkTheme ? "border-secondary" : ""}
      >
        <Card.Body>
          <Card.Title>Detalhes da Não Conformidade</Card.Title>
          <p>
            <b>Peças:</b> {renderField(nc.vehicleParts)}
          </p>
          <p>
            <b>Tipo:</b> {renderField(nc.nonconformityTypes)}
          </p>
          <p>
            <b>Nível:</b> {renderField(nc.nonconformityLevels)}
          </p>
          <p>
            <b>Quadrantes:</b> {renderField(nc.quadrants)}
          </p>
          <p>
            <b>Medidas:</b> {renderField(nc.measures)}
          </p>
          <p>
            <b>Locais:</b> {renderField(nc.nonconformityLocals)}
          </p>
          <div>
            <b>Imagem 1:</b>
            <br />
            {nc.image1 && (
              <img
                src={`/api/images/${nc.image1}`}
                alt="Imagem 1"
                style={{ maxWidth: 200, marginBottom: 8 }}
                className={darkTheme ? "bg-dark" : ""}
              />
            )}
          </div>
          <div>
            <b>Imagem 2:</b>
            <br />
            {nc.image2 && (
              <img
                src={`/api/images/${nc.image2}`}
                alt="Imagem 2"
                style={{ maxWidth: 200, marginBottom: 8 }}
                className={darkTheme ? "bg-dark" : ""}
              />
            )}
          </div>
          <div>
            <b>Imagem 3:</b>
            <br />
            {nc.image3 && (
              <img
                src={`/api/images/${nc.image3}`}
                alt="Imagem 3"
                style={{ maxWidth: 200, marginBottom: 8 }}
                className={darkTheme ? "bg-dark" : ""}
              />
            )}
          </div>
          <div>
            <b>Imagem 4:</b>
            <br />
            {nc.image4 && (
              <img
                src={`/api/images/${nc.image4}`}
                alt="Imagem 4"
                style={{ maxWidth: 200, marginBottom: 8 }}
                className={darkTheme ? "bg-dark" : ""}
              />
            )}
          </div>
          <br />
          <Button
            as={Link}
            to={`/vehicles/${id}/nonconformities/${ncid}/edit`}
            variant={darkTheme ? "secondary" : "primary"}
            className="me-2"
          >
            Editar
          </Button>
          <Button
            as={Link}
            to={`/vehicles/${id}`}
            variant={darkTheme ? "outline-light" : "secondary"}
          >
            Voltar
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ShowNonconformity;
