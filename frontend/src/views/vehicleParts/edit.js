import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const EditVehiclePart = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/vehicleParts/${id}`)
      .then((res) => res.json())
      .then((data) => setForm(data.data.vehiclePart));
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/vehicleParts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Erro ao editar peça");
      navigate("/vehicleParts");
    } catch (err) {
      setError(err.message);
    }
  };

  if (!form) return <div>Carregando...</div>;

  return (
    <div>
      <h2>Editar Peça do Veículo</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>
          Área:
          <input
            name="area"
            type="number"
            value={form.area}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Nome:
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <button type="submit">Salvar</button>
      </form>
      <br />
      <Link to="/vehicleParts">Cancelar</Link>
    </div>
  );
};

export default EditVehiclePart;
