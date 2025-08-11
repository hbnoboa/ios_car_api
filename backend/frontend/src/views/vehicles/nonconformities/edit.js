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

const EditNonconformity = () => {
  const { id, ncid } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [images, setImages] = useState({
    image1: null,
    image2: null,
  });
  const [error, setError] = useState("");
  const [darkTheme, setDarkTheme] = useState(false);

  // --- ADICIONADO: States para as opções dos selects ---
  const [vehiclePartsOptions, setVehiclePartsOptions] = useState([]);
  const [nonconformityTypesOptions, setNonconformityTypesOptions] = useState(
    []
  );
  const [nonconformityLevelsOptions, setNonconformityLevelsOptions] = useState(
    []
  );
  const [quadrantsOptions, setQuadrantsOptions] = useState([]);
  const [measuresOptions, setMeasuresOptions] = useState([]);
  const [nonconformityLocalsOptions, setNonconformityLocalsOptions] = useState(
    []
  );

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
    const headers = { Authorization: `Bearer ${token}` };

    // Buscar dados da não conformidade para preencher o formulário
    fetch(`/api/vehicles/${id}/nonconformities/${ncid}`, { headers })
      .then((res) => res.json())
      .then((data) => setForm(data.nonconformity));

    // --- ADICIONADO: Fetches para preencher os selects ---
    fetch("/api/vehicleparts", { headers })
      .then((res) => res.json())
      .then((data) => setVehiclePartsOptions(data.vehicleParts || []));

    fetch("/api/nonconformitytypes", { headers })
      .then((res) => res.json())
      .then((data) =>
        setNonconformityTypesOptions(data.nonconformityTypes || [])
      );

    fetch("/api/nonconformitylevels", { headers })
      .then((res) => res.json())
      .then((data) =>
        setNonconformityLevelsOptions(data.nonconformityLevels || [])
      );

    fetch("/api/quadrants", { headers })
      .then((res) => res.json())
      .then((data) => setQuadrantsOptions(data.quadrants || []));

    fetch("/api/measures", { headers })
      .then((res) => res.json())
      .then((data) => setMeasuresOptions(data.measures || []));

    fetch("/api/nonconformitylocals", { headers })
      .then((res) => res.json())
      .then((data) =>
        setNonconformityLocalsOptions(data.nonconformityLocals || [])
      );
  }, [id, ncid]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e, field) => {
    setImages({ ...images, [field]: e.target.files[0] });
  };

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
      const image1 = await editImage(images.image1, form.image1);
      const image2 = await editImage(images.image2, form.image2);

      const updatedForm = {
        ...form,
        image1,
        image2,
      };

      const res = await fetch(`/api/vehicles/${id}/nonconformities/${ncid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updatedForm),
      });
      if (!res.ok) throw new Error("Erro ao editar não conformidade");
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
          <Card.Title>Editar Não Conformidade</Card.Title>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                {/* --- ALTERADO: Todos os Form.Control para Form.Select --- */}
                <Form.Group className="mb-3">
                  <Form.Label>Peças do veículo</Form.Label>
                  <Form.Select
                    name="vehicleParts"
                    value={form.vehicleParts || ""}
                    onChange={handleChange}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  >
                    <option value="">Selecione...</option>
                    {vehiclePartsOptions.map((part) => (
                      <option key={part._id} value={part.name}>
                        {part.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo de não conformidade</Form.Label>
                  <Form.Select
                    name="nonconformityTypes"
                    value={form.nonconformityTypes || ""}
                    onChange={handleChange}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  >
                    <option value="">Selecione...</option>
                    {nonconformityTypesOptions.map((type) => (
                      <option key={type._id} value={type.nctype}>
                        {type.nctype}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Nível de não conformidade</Form.Label>
                  <Form.Select
                    name="nonconformityLevels"
                    value={form.nonconformityLevels || ""}
                    onChange={handleChange}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  >
                    <option value="">Selecione...</option>
                    {nonconformityLevelsOptions.map((level) => (
                      <option key={level._id} value={level.level}>
                        {level.level}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Quadrante</Form.Label>
                  <Form.Select
                    name="quadrants"
                    value={form.quadrants || ""}
                    onChange={handleChange}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  >
                    <option value="">Selecione...</option>
                    {quadrantsOptions.map((quad) => (
                      <option key={quad._id} value={quad.option}>
                        {quad.option}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Medida</Form.Label>
                  <Form.Select
                    name="measures"
                    value={form.measures || ""}
                    onChange={handleChange}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  >
                    <option value="">Selecione...</option>
                    {measuresOptions.map((measure) => (
                      <option key={measure._id} value={measure.size}>
                        {measure.size}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Local da não conformidade</Form.Label>
                  <Form.Select
                    name="nonconformityLocals"
                    value={form.nonconformityLocals || ""}
                    onChange={handleChange}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  >
                    <option value="">Selecione...</option>
                    {nonconformityLocalsOptions.map((local) => (
                      <option key={local._id} value={local.local}>
                        {local.local}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                {/* ... Campos de imagem permanecem os mesmos ... */}
                <Form.Group className="mb-3">
                  <Form.Label>Imagem 1</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "image1")}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                  {form.image1 && (
                    <img
                      src={`/api/images/${form.image1}`}
                      alt="Imagem 1"
                      style={{ maxWidth: 100, display: "block", marginTop: 8 }}
                      className={darkTheme ? "bg-dark" : ""}
                    />
                  )}
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Imagem 2</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "image2")}
                    className={darkTheme ? "bg-dark text-light" : ""}
                  />
                  {form.image2 && (
                    <img
                      src={`/api/images/${form.image2}`}
                      alt="Imagem 2"
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

export default EditNonconformity;
