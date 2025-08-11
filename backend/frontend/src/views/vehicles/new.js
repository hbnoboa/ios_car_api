import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Alert,
  Card,
} from "react-bootstrap";

const NewVehicle = () => {
  const [form, setForm] = useState({
    chassis: "",
    model: "",
    location: "",
    situation: "",
    brand: "",
    travel: "",
    status: "",
    ship: "",
    observations: "",
    done: "no",
  });
  const [images, setImages] = useState({
    etChassisImage: null,
    profileImage: null,
  });
  const [error, setError] = useState("");
  const [darkTheme, setDarkTheme] = useState(false);
  const navigate = useNavigate();

  // Detecta o tema pelo body (usado pelo Navbar)
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
      const etChassisImageFilename = await uploadImage(images.etChassisImage);
      const profileImageFilename = await uploadImage(images.profileImage);

      const vehicleData = {
        ...form,
        etChassisImageFilename,
        profileImageFilename,
      };

      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(vehicleData),
      });
      if (!res.ok) throw new Error("Erro ao criar veículo");
      navigate("/vehicles");
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
          <Card.Title>Novo Veículo</Card.Title>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Chassi</Form.Label>
                  <Form.Control
                    name="chassis"
                    value={form.chassis}
                    onChange={handleChange}
                    required
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Modelo</Form.Label>
                  <Form.Control
                    name="model"
                    value={form.model}
                    onChange={handleChange}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Local</Form.Label>
                  <Form.Control
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Situação</Form.Label>
                  <Form.Control
                    name="situation"
                    value={form.situation}
                    onChange={handleChange}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Marca</Form.Label>
                  <Form.Control
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Viagem</Form.Label>
                  <Form.Control
                    name="travel"
                    value={form.travel}
                    onChange={handleChange}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Control
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Navio</Form.Label>
                  <Form.Control
                    name="ship"
                    value={form.ship}
                    onChange={handleChange}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Observações</Form.Label>
                  <Form.Control
                    name="observations"
                    value={form.observations}
                    onChange={handleChange}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Imagem Chassi</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "etChassisImage")}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Imagem Perfil</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "profileImage")}
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
                to="/vehicles"
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

export default NewVehicle;
