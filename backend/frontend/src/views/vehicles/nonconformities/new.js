import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Alert,
  Card,
} from "react-bootstrap";

const NewNonconformity = () => {
  const { id } = useParams(); // vehicle id
  const navigate = useNavigate();
  const [form, setForm] = useState({
    vehicleParts: "",
    nonconformityTypes: "",
    nonconformityLevels: "",
    quadrants: "",
    measures: "",
    nonconformityLocals: "",
  });
  const [images, setImages] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null,
  });
  const [error, setError] = useState("");
  const [darkTheme, setDarkTheme] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkTheme(document.body.classList.contains("dark-theme"));
    });
    observer.observe(document.body, { attributes: true });
    setDarkTheme(document.body.classList.contains("dark-theme"));
    return () => observer.disconnect();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e, field) => {
    setImages({ ...images, [field]: e.target.files[0] });
  };

  const uploadImage = async (file) => {
    if (!file) return "";
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/images/upload", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();
    return data.filename;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const image1 = await uploadImage(images.image1);
      const image2 = await uploadImage(images.image2);
      const image3 = await uploadImage(images.image3);
      const image4 = await uploadImage(images.image4);

      const ncData = {
        ...form,
        image1,
        image2,
        image3,
        image4,
      };

      const res = await fetch(`/api/vehicles/${id}/nonconformities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(ncData),
      });
      if (!res.ok) throw new Error("Erro ao criar não conformidade");
      navigate(`/vehicles/${id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container style={{ maxWidth: 700, marginTop: 40 }}>
      <Card
        bg={darkTheme ? "dark" : "light"}
        text={darkTheme ? "light" : "dark"}
        className={darkTheme ? "border-secondary" : ""}
      >
        <Card.Body>
          <Card.Title>Nova Não Conformidade</Card.Title>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Peças do veículo</Form.Label>
                  <Form.Control
                    name="vehicleParts"
                    value={form.vehicleParts}
                    onChange={handleChange}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Tipos de não conformidade</Form.Label>
                  <Form.Control
                    name="nonconformityTypes"
                    value={form.nonconformityTypes}
                    onChange={handleChange}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Níveis de não conformidade</Form.Label>
                  <Form.Control
                    name="nonconformityLevels"
                    value={form.nonconformityLevels}
                    onChange={handleChange}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Quadrantes</Form.Label>
                  <Form.Control
                    name="quadrants"
                    value={form.quadrants}
                    onChange={handleChange}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Medidas</Form.Label>
                  <Form.Control
                    name="measures"
                    value={form.measures}
                    onChange={handleChange}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Locais de não conformidade</Form.Label>
                  <Form.Control
                    name="nonconformityLocals"
                    value={form.nonconformityLocals}
                    onChange={handleChange}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Imagem 1</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "image1")}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Imagem 2</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "image2")}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Imagem 3</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "image3")}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Imagem 4</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "image4")}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-between mt-4">
              <Button
                variant={darkTheme ? "secondary" : "primary"}
                type="submit"
              >
                Salvar
              </Button>
              <Button
                as={Link}
                to={`/vehicles/${id}`}
                variant={darkTheme ? "outline-light" : "secondary"}
              >
                Cancelar
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default NewNonconformity;
