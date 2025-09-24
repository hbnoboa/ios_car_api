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
    done: "", // <--- ADICIONADO
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [downloading, setDownloading] = useState(false); // ADICIONADO

  const pdfBaseUrl = pdfUrl || "/api/vehicles/pdf"; // DEFAULT

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      if (name === "nonconformity") {
        setForm((prev) => ({ ...prev, [name]: checked ? "0" : "" }));
        return;
      }
      if (name === "done") {
        setForm((prev) => ({ ...prev, done: checked ? "yes" : "" }));
        return;
      }
    }
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(form);
  };

  // Monta URL com os filtros atuais
  const buildPdfUrl = () => {
    const params = [];
    if (form.ship_and_travel) {
      const [ship, travel] = form.ship_and_travel.split("-");
      params.push(`ship=${encodeURIComponent((ship || "").trim())}`);
      params.push(`travel=${encodeURIComponent((travel || "").trim())}`);
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
    if (form.done) params.push(`done=${encodeURIComponent(form.done)}`); // <--- ADICIONADO
    return `${pdfBaseUrl}?${params.join("&")}`;
  };

  // Igual ao botão PDF da tabela (fetch -> blob -> download)
  const downloadListPdf = async () => {
    try {
      setDownloading(true);
      const url = buildPdfUrl();
      const token = localStorage.getItem("token");
      const resp = await fetch(url, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!resp.ok) throw new Error("Falha ao gerar PDF");
      const blob = await resp.blob();
      const objUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = "vehicles.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(objUrl);
    } catch (e) {
      console.error(e);
      alert("Erro ao baixar PDF da lista.");
    } finally {
      setDownloading(false);
    }
  };

  // Classes utilitárias
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
            <Col md={3} className="d-flex align-items-center gap-3">
              <Button type="submit" variant={btnVariant} className="btn-filter">
                Filtrar
              </Button>
              <Button
                type="button"
                variant={`outline-${btnVariant}`}
                onClick={downloadListPdf}
                disabled={downloading}
              >
                {downloading ? "Gerando..." : "PDF"}
              </Button>
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
                  <Col md={4} className="d-flex align-items-end">
                    <Form.Check
                      type="checkbox"
                      label="Vistoriado"
                      name="done"
                      checked={form.done === "yes"}
                      onChange={handleChange}
                      className={darkTheme ? "text-light" : ""}
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
