import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const VehicleParts = () => {
  const [vehicleParts, setVehicleParts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const fetchVehicleParts = () => {
      fetch(`/api/vehicleParts?page=${page}&limit=10`)
        .then((res) => res.json())
        .then((data) => {
          setVehicleParts(data.vehicleParts);
          setPages(data.pages);
        });
    };
    fetchVehicleParts();
  }, [page]);

  const handleDelete = (id) => {
    if (window.confirm("Deseja realmente excluir esta peça?")) {
      fetch(`/api/vehicleParts/${id}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then(() =>
          setVehicleParts((prev) => prev.filter((p) => p._id !== id))
        );
    }
  };

  return (
    <div>
      <h2>Peças do Veículo</h2>
      <Link to="/vehicleParts/new">
        <button>Nova Peça</button>
      </Link>
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}
      >
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc" }}>Área</th>
            <th style={{ borderBottom: "1px solid #ccc" }}>Nome</th>
            <th style={{ borderBottom: "1px solid #ccc" }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {vehicleParts.map((part) => (
            <tr key={part._id}>
              <td style={{ borderBottom: "1px solid #eee" }}>{part.area}</td>
              <td style={{ borderBottom: "1px solid #eee" }}>{part.name}</td>
              <td style={{ borderBottom: "1px solid #eee" }}>
                <Link to={`/vehicleParts/${part._id}`}>Ver</Link> |{" "}
                <Link to={`/vehicleParts/${part._id}/edit`}>Editar</Link> |{" "}
                <button
                  style={{
                    color: "red",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => handleDelete(part._id)}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 16 }}>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Anterior
        </button>
        <span style={{ margin: "0 8px" }}>
          Página {page} de {pages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(pages, p + 1))}
          disabled={page === pages}
        >
          Próxima
        </button>
      </div>
    </div>
  );
};

export default VehicleParts;
