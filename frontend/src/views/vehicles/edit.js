import React, { useEffect, useState } from "react";
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

const EditVehicle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [images, setImages] = useState({
    et_chassis_image: null,
    profile_image: null,
    front_image: null,
    back_image: null,
  });
  const [error, setError] = useState("");
  const [darkTheme, setDarkTheme] = useState(false);

  // Detecta o tema pelo body (usado pelo Navbar)
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
    fetch(`/api/vehicles/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setForm(data.data.vehicle));
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e, field) => {
    setImages({ ...images, [field]: e.target.files[0] });
  };

  // Substitui a imagem antiga por uma nova no GridFS
  const editImage = async (file, oldFilename) => {
    if (!file) return oldFilename || "";
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`/api/images/edit/${oldFilename || ""}`, {
      method: "PUT",
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
      const et_chassis_image_filename = await editImage(
        images.et_chassis_image,
        form.et_chassis_image_filename
      );
      const profile_image_filename = await editImage(
        images.profile_image,
        form.profile_image_filename
      );
      const front_image_filename = await editImage(
        images.front_image,
        form.front_image_filename
      );
      const back_image_filename = await editImage(
        images.back_image,
        form.back_image_filename
      );

      const updatedForm = {
        ...form,
        et_chassis_image_filename,
        profile_image_filename,
        front_image_filename,
        back_image_filename,
      };

      const res = await fetch(`/api/vehicles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updatedForm),
      });
      if (!res.ok) throw new Error("Erro ao editar veículo");
      navigate(`/vehicles/${id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!form) return <div>Carregando...</div>;

  return (
    <Container style={{ maxWidth: 700, marginTop: 40 }}>
      <Card
        bg={darkTheme ? "dark" : "light"}
        text={darkTheme ? "light" : "dark"}
        className={darkTheme ? "border-secondary" : ""}
      >
        <Card.Body>
          <Card.Title>Editar Veículo</Card.Title>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Chassi</Form.Label>
                  <Form.Control
                    name="chassis"
                    value={form.chassis || ""}
                    onChange={handleChange}
                    required
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Modelo</Form.Label>
                  <Form.Control
                    name="model"
                    value={form.model || ""}
                    onChange={handleChange}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Local</Form.Label>
                  <Form.Control
                    name="location"
                    value={form.location || ""}
                    onChange={handleChange}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Situação</Form.Label>
                  <Form.Control
                    name="situation"
                    value={form.situation || ""}
                    onChange={handleChange}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Marca</Form.Label>
                  <Form.Control
                    name="brand"
                    value={form.brand || ""}
                    onChange={handleChange}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Viagem</Form.Label>
                  <Form.Control
                    name="travel"
                    value={form.travel || ""}
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
                    value={form.status || ""}
                    onChange={handleChange}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Navio</Form.Label>
                  <Form.Control
                    name="ship"
                    value={form.ship || ""}
                    onChange={handleChange}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Observações</Form.Label>
                  <Form.Control
                    name="observations"
                    value={form.observations || ""}
                    onChange={handleChange}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Imagem Chassi</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "et_chassis_image")}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                  {form.et_chassis_image_filename && (
                    <img
                      src={`/api/images/${form.et_chassis_image_filename}`}
                      alt="Chassi"
                      style={{ maxWidth: 100, display: "block", marginTop: 8 }}
                      className={darkTheme ? "bg-dark" : ""}
                    />
                  )}
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Imagem Perfil</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "profile_image")}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                  {form.profile_image_filename && (
                    <img
                      src={`/api/images/${form.profile_image_filename}`}
                      alt="Perfil"
                      style={{ maxWidth: 100, display: "block", marginTop: 8 }}
                      className={darkTheme ? "bg-dark" : ""}
                    />
                  )}
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Imagem Frente</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "front_image")}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                  {form.front_image_filename && (
                    <img
                      src={`/api/images/${form.front_image_filename}`}
                      alt="Frente"
                      style={{ maxWidth: 100, display: "block", marginTop: 8 }}
                      className={darkTheme ? "bg-dark" : ""}
                    />
                  )}
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Imagem Traseira</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "back_image")}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                  {form.back_image_filename && (
                    <img
                      src={`/api/images/${form.back_image_filename}`}
                      alt="Traseira"
                      style={{ maxWidth: 100, display: "block", marginTop: 8 }}
                      className={darkTheme ? "bg-dark" : ""}
                    />
                  )}
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

export default EditVehicle;
