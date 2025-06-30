import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const NewVehiclePart = () => {
  const [form, setForm] = useState({ area: "", name: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/vehicleParts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Erro ao criar peça");
      navigate("/vehicleParts");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Nova Peça do Veículo</h2>
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

export default NewVehiclePart;
