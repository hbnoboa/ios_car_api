import React, { useEffect, useState } from "react";
import { Table, Button, Pagination } from "react-bootstrap";
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

  const handleSearch = (formFilters) => {
    setFilters(formFilters); // formFilters já deve ser um objeto {campo: valor}
    setPage(1);
  };

  return (
    <div>
      <h2 className={darkTheme ? "text-light" : ""}>Veículos</h2>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button
          as={Link}
          to="/vehicles/new"
          variant={darkTheme ? "secondary" : "primary"}
        >
          Novo Veículo
        </Button>
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
              <td>
                {typeof v.nonconformity === "number" ? v.nonconformity : 0}
              </td>
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
    </div>
  );
};

export default Vehicles;
