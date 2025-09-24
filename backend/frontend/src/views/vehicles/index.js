import React, { useEffect, useState } from "react";
import { Table, Button, Pagination, Modal, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useSocket } from "../../contexts/SocketContext";
import "bootstrap/dist/css/bootstrap.min.css";
import VehicleSearchForm from "../../components/vehicleSearchForm";

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState({});
  const [shipsTravels, setShipsTravels] = useState([]);
  const [darkTheme, setDarkTheme] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [importModal, setImportModal] = useState({ show: false, file: null });
  const [importData, setImportData] = useState({
    ship: "",
    travel: "",
    location: "",
  });
  const socket = useSocket();

  // Detecta o tema pelo body (usado pelo Navbar)
  useEffect(() => {
    console.log("🔄 Detectando tema...");
    const observer = new MutationObserver(() => {
      setDarkTheme(document.body.classList.contains("dark-theme"));
    });
    observer.observe(document.body, { attributes: true });
    setDarkTheme(document.body.classList.contains("dark-theme"));
    return () => observer.disconnect();
  }, []);

  // Fetch vehicles with pagination and auth
  useEffect(() => {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams({
      page,
      limit,
      ...filters,
    });
    fetch(`/api/vehicles?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          window.location.href = "/login";
          return {};
        }
        return res.json();
      })
      .then((data) => {
        setVehicles(data.vehicles || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      });

    fetch("/api/vehicles/ships-travels", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setShipsTravels(Array.isArray(data) ? data : []));
  }, [page, limit, filters, refresh]);

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;

    console.log("🎧 Listening for socket events...");

    const fetchVehicles = () => {
      console.log("🔄 Evento socket recebido - atualizando lista");
      setRefresh((r) => r + 1);
    };

    const handleVehicleCreated = (data) => {
      console.log("📨 Recebido vehicleCreated:", data);
      fetchVehicles();
    };

    const handleVehicleUpdated = (data) => {
      console.log("📨 Recebido vehicleUpdated:", data);
      fetchVehicles();
    };

    const handleVehicleDeleted = (data) => {
      console.log("📨 Recebido vehicleDeleted:", data);
      fetchVehicles();
    };

    socket.on("vehicleCreated", handleVehicleCreated);
    socket.on("vehicleUpdated", handleVehicleUpdated);
    socket.on("vehicleDeleted", handleVehicleDeleted);

    return () => {
      socket.off("vehicleCreated", handleVehicleCreated);
      socket.off("vehicleUpdated", handleVehicleUpdated);
      socket.off("vehicleDeleted", handleVehicleDeleted);
    };
  }, [socket, setRefresh]);

  // Pagination buttons
  const renderPagination = () => {
    const items = [];
    const maxButtons = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(pages, start + maxButtons - 1);

    if (end - start < maxButtons - 1) {
      start = Math.max(1, end - maxButtons + 1);
    }

    items.push(
      <Pagination.Prev
        key="prev"
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
      />
    );

    for (let p = start; p <= end; p++) {
      items.push(
        <Pagination.Item key={p} active={p === page} onClick={() => setPage(p)}>
          {p}
        </Pagination.Item>
      );
    }

    items.push(
      <Pagination.Next
        key="next"
        disabled={page === pages}
        onClick={() => setPage(page + 1)}
      />
    );

    return items;
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deseja realmente excluir este veículo?")) {
      const token = localStorage.getItem("token");
      await fetch(`/api/vehicles/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setVehicles((prev) => prev.filter((v) => v._id !== id));
      setTotal((prev) => prev - 1);
    }
  };

  const handleGeneratePDF = (vehicle) => {
    const token = localStorage.getItem("token");

    // Criar um link temporário para download
    const link = document.createElement("a");
    link.href = `/api/vehicles/${vehicle._id}/pdf`;
    link.setAttribute("download", `${vehicle.chassis}.pdf`);

    // Adicionar headers de autorização através de fetch
    fetch(`/api/vehicles/${vehicle._id}/pdf`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.blob();
        }
        throw new Error("Erro ao gerar PDF");
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error("Erro ao baixar PDF:", error);
        alert("Erro ao gerar PDF");
      });
  };

  const handleSearch = (formFilters) => {
    setFilters(formFilters); // formFilters já deve ser um objeto {campo: valor}
    setPage(1);
  };

  return (
    <div>
      <h2 className={darkTheme ? "text-light" : ""}>Veículos</h2>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex gap-2">
          <Button
            as={Link}
            to="/vehicles/new"
            variant={darkTheme ? "secondary" : "primary"}
          >
            Novo Veículo
          </Button>
          <input
            type="file"
            accept=".json,.xlsx,.xls"
            id="import-file"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setImportModal({ show: true, file });
            }}
          />
          <Button
            variant={darkTheme ? "outline-light" : "outline-secondary"}
            onClick={() => document.getElementById("import-file").click()}
          >
            Importar JSON/Excel
          </Button>
        </div>
      </div>
      <VehicleSearchForm
        onSearch={handleSearch}
        shipsTravels={shipsTravels}
        darkTheme={darkTheme}
      />
      <Table
        striped
        bordered
        hover
        variant={darkTheme ? "dark" : undefined}
        className={darkTheme ? "border-secondary" : ""}
      >
        <thead>
          <tr>
            <th>Chassi</th>
            <th>Modelo</th>
            <th>Local</th>
            <th>Situação</th>
            <th>Nº de Conformidades</th>
            <th>Data</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {(vehicles || []).map((v) => (
            <tr key={v._id}>
              <td>{v.chassis}</td>
              <td>{v.model}</td>
              <td>{v.location}</td>
              <td>{v.situation}</td>
              <td>{v.nonconformities?.length || 0}</td>
              <td>
                {v.updated_at
                  ? new Date(v.updated_at).toLocaleString()
                  : v.updatedAt
                  ? new Date(v.updatedAt).toLocaleString()
                  : ""}
              </td>
              <td>
                <div className="d-flex flex-wrap gap-2">
                  <Button
                    as={Link}
                    to={`/vehicles/${v._id}`}
                    size="sm"
                    variant="info"
                  >
                    Ver
                  </Button>
                  <Button
                    as={Link}
                    to={`/vehicles/${v._id}/edit`}
                    size="sm"
                    variant="warning"
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleGeneratePDF(v)}
                  >
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(v._id)}
                  >
                    Excluir
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div
        className={`d-flex justify-content-between align-items-center ${
          darkTheme ? "text-light" : ""
        }`}
      >
        <Pagination>{renderPagination()}</Pagination>
        <span>
          <strong>{total} itens</strong>
        </span>
      </div>
      <Modal
        show={importModal.show}
        onHide={() => {
          setImportModal({ show: false, file: null });
          setImportData({ ship: "", travel: "", location: "" });
          const input = document.getElementById("import-file");
          if (input) input.value = "";
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Importar Veículos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Navio (Ship)</Form.Label>
              <Form.Control
                value={importData.ship}
                onChange={(e) =>
                  setImportData((d) => ({ ...d, ship: e.target.value }))
                }
                placeholder="Ex: Brasilia"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Viagem (Travel)</Form.Label>
              <Form.Control
                value={importData.travel}
                onChange={(e) =>
                  setImportData((d) => ({ ...d, travel: e.target.value }))
                }
                placeholder="Ex: 161A"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Local (Location)</Form.Label>
              <Form.Control
                value={importData.location}
                onChange={(e) =>
                  setImportData((d) => ({ ...d, location: e.target.value }))
                }
                placeholder="Ex: Itajaí"
              />
            </Form.Group>
            <p className="small text-muted mb-0">
              Esses valores serão aplicados a todas as linhas importadas.
            </p>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setImportModal({ show: false, file: null });
              setImportData({ ship: "", travel: "", location: "" });
              const input = document.getElementById("import-file");
              if (input) input.value = "";
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={async () => {
              if (
                !importData.ship.trim() ||
                !importData.travel.trim() ||
                !importData.location.trim()
              ) {
                alert("Preencha ship, travel e location.");
                return;
              }
              const file = importModal.file;
              if (!file) return;
              const formData = new FormData();
              formData.append("file", file);
              formData.append("ship", importData.ship.trim());
              formData.append("travel", importData.travel.trim());
              formData.append("location", importData.location.trim());
              const token = localStorage.getItem("token");
              try {
                const res = await fetch("/api/vehicles/import", {
                  method: "POST",
                  headers: { Authorization: `Bearer ${token}` },
                  body: formData,
                });
                const data = await res.json();
                if (!res.ok) {
                  alert("Erro: " + (data.error || "Falha ao importar"));
                } else {
                  alert(
                    `Importação concluída:
Total no arquivo: ${data.total_linhas_arquivo}
Válidos: ${data.registros_validos}
Já existiam: ${data.ja_existiam}
Criados: ${data.criados}
Ship: ${data.ship}
Travel: ${data.travel}
Location: ${data.location}`
                  );
                  setRefresh((r) => r + 1);
                }
              } catch (err) {
                alert("Erro ao importar: " + err.message);
              } finally {
                setImportModal({ show: false, file: null });
                setImportData({ ship: "", travel: "", location: "" });
                const input = document.getElementById("import-file");
                if (input) input.value = "";
              }
            }}
          >
            Importar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Vehicles;
