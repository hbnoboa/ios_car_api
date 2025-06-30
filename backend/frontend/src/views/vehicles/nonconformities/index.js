import React, { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const NonconformityIndex = ({ vehicleId }) => {
  const [nonconformities, setNonconformities] = useState([]);
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

    fetch(`/api/vehicles/${vehicleId}/nonconformities`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setNonconformities(data.nonconformities || []));
  }, [vehicleId]);

  const handleDelete = async (ncId) => {
    if (!window.confirm("Deseja excluir esta não conformidade?")) return;
    const token = localStorage.getItem("token");
    await fetch(`/api/vehicles/${vehicleId}/nonconformities/${ncId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setNonconformities((prev) => prev.filter((nc) => nc._id !== ncId));
  };

  return (
    <div>
      <br />
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button
          as={Link}
          to={`/vehicles/${vehicleId}/nonconformities/new`}
          variant={darkTheme ? "secondary" : "primary"}
        >
          Nova Não Conformidade
        </Button>
      </div>
      <Table
        striped
        bordered
        hover
        variant={darkTheme ? "dark" : undefined}
        className={darkTheme ? "border-secondary" : ""}
      >
        <thead>
          <tr>
            <th>Peças</th>
            <th>Tipo</th>
            <th>Nível</th>
            <th>Data</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {(nonconformities || []).map((nc) => (
            <tr key={nc._id}>
              <td>
                {Array.isArray(nc.vehicleParts)
                  ? nc.vehicleParts.join(", ")
                  : nc.vehicleParts}
              </td>
              <td>
                {Array.isArray(nc.nonconformityTypes)
                  ? nc.nonconformityTypes.join(", ")
                  : nc.nonconformityTypes}
              </td>
              <td>
                {Array.isArray(nc.nonconformityLevels)
                  ? nc.nonconformityLevels.join(", ")
                  : nc.nonconformityLevels}
              </td>
              <td>
                {nc.created_at
                  ? new Date(nc.created_at).toLocaleString()
                  : nc.createdAt
                  ? new Date(nc.createdAt).toLocaleString()
                  : ""}
              </td>
              <td>
                <div className="d-flex flex-wrap gap-2">
                  <Button
                    as={Link}
                    to={`/vehicles/${vehicleId}/nonconformities/${nc._id}`}
                    size="sm"
                    variant="info"
                  >
                    Ver
                  </Button>
                  <Button
                    as={Link}
                    to={`/vehicles/${vehicleId}/nonconformities/${nc._id}/edit`}
                    size="sm"
                    variant="warning"
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(nc._id)}
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
        className={`d-flex justify-content-end align-items-center ${
          darkTheme ? "text-light" : ""
        }`}
      >
        <span>
          <strong>{nonconformities.length} itens</strong>
        </span>
      </div>
    </div>
  );
};

export default NonconformityIndex;
