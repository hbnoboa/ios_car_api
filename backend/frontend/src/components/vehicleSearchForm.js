import React, { useState } from "react";
import { Form, Button, Row, Col, Collapse } from "react-bootstrap";

const VehicleSearchForm = ({ onSearch, pdfUrl, shipsTravels, darkTheme }) => {
  const [form, setForm] = useState({
    ship_and_travel: "",
    chassis: "",
    model: "",
    situation: "",
    nonconformity: "",
    start_date: "",
    end_date: "",
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "0" : "") : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(form);
  };

  // Monta a URL do PDF com os filtros atuais
  const buildPdfUrl = () => {
    const params = [];
    if (form.ship_and_travel) {
      const [ship, travel] = form.ship_and_travel.split("-");
      params.push(`ship=${encodeURIComponent(ship.trim())}`);
      params.push(`travel=${encodeURIComponent(travel.trim())}`);
    }
    if (form.chassis)
      params.push(`chassis=${encodeURIComponent(form.chassis)}`);
    if (form.model) params.push(`model=${encodeURIComponent(form.model)}`);
    if (form.situation)
      params.push(`situation=${encodeURIComponent(form.situation)}`);
    if (form.nonconformity) params.push(`nonconformity=${form.nonconformity}`);
    if (form.start_date)
      params.push(`start_date=${encodeURIComponent(form.start_date)}`);
    if (form.end_date)
      params.push(`end_date=${encodeURIComponent(form.end_date)}`);
    return `${pdfUrl}?${params.join("&")}`;
  };

  // Classes utilitárias para campos no tema escuro
  const inputClass = darkTheme ? "bg-dark text-light border-secondary" : "";
  const selectClass = darkTheme ? "bg-dark text-light border-secondary" : "";
  const btnVariant = darkTheme ? "secondary" : "primary";

  return (
    <Form onSubmit={handleSubmit} className="mb-4">
      <Row className="justify-content-center">
        <Col>
          <Row className="g-3 mt-2">
            <Col md={3}>
              <Form.Select
                name="ship_and_travel"
                value={form.ship_and_travel}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Selecione um Navio</option>
                {Array.isArray(shipsTravels) &&
                  shipsTravels.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Control
                name="chassis"
                value={form.chassis}
                onChange={handleChange}
                placeholder="Procure por um Chassi"
                className={inputClass}
              />
            </Col>
            <Col md={3} className="d-flex align-items-center">
              <Button type="submit" variant={btnVariant} className="btn-filter">
                Filtrar
              </Button>
              <a
                href={buildPdfUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="ps-4"
              >
                <img
                  src="/pdf.png"
                  alt="PDF"
                  width={40}
                  height={40}
                  className="img-fluid"
                />
              </a>
            </Col>
          </Row>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              className={`advanced btn btn-link p-0 ${
                darkTheme ? "text-light" : ""
              }`}
              style={{ textDecoration: "none" }}
            >
              Mais Filtros <i className="fa fa-angle-down"></i>
            </button>
            <Collapse in={showAdvanced}>
              <div id="collapseExample">
                <Row>
                  <Col md={4}>
                    <Form.Control
                      name="model"
                      value={form.model}
                      onChange={handleChange}
                      placeholder="Modelo"
                      className={inputClass}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Control
                      name="situation"
                      value={form.situation}
                      onChange={handleChange}
                      placeholder="Situação"
                      className={inputClass}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Check
                      type="checkbox"
                      label="Não conformidade"
                      name="nonconformity"
                      checked={form.nonconformity === "0"}
                      onChange={handleChange}
                      className={darkTheme ? "text-light" : ""}
                    />
                  </Col>
                </Row>
                <Row className="pt-2">
                  <Col md={4}>
                    <Form.Label className={darkTheme ? "text-light" : ""}>
                      Data e Hora de Início
                    </Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="start_date"
                      value={form.start_date}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Label className={darkTheme ? "text-light" : ""}>
                      Data e Hora de Término
                    </Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="end_date"
                      value={form.end_date}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </Col>
                </Row>
              </div>
            </Collapse>
          </div>
        </Col>
      </Row>
    </Form>
  );
};

export default VehicleSearchForm;
