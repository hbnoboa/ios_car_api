import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const ShowVehiclePart = () => {
  const { id } = useParams();
  const [vehiclePart, setVehiclePart] = useState(null);

  useEffect(() => {
    fetch(`/api/vehicleParts/${id}`)
      .then((res) => res.json())
      .then((data) => setVehiclePart(data.data.vehiclePart));
  }, [id]);

  if (!vehiclePart) return <div>Carregando...</div>;

  return (
    <div>
      <h2>Detalhes da Peça</h2>
      <p>
        <b>Área:</b> {vehiclePart.area}
      </p>
      <p>
        <b>Nome:</b> {vehiclePart.name}
      </p>
      <Link to={`/vehicleParts/${id}/edit`}>Editar</Link>
      <br />
      <Link to="/vehicleParts">Voltar</Link>
    </div>
  );
};

export default ShowVehiclePart;
