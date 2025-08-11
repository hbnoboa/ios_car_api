import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { io } from "socket.io-client";
import NonconformityIndex from "./nonconformities/index";
import { Card, Container } from "react-bootstrap";

const socket = io();

const ShowVehicle = () => {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [darkTheme, setDarkTheme] = useState(false);

  // Detecta o tema pelo body (usado pelo Navbar)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkTheme(document.body.classList.contains("dark-theme"));
    });
    observer.observe(document.body, { attributes: true });
    setDarkTheme(document.body.classList.contains("dark-theme"));
    return () => observer.disconnect();
  }, []);

  const fetchVehicle = () => {
    const token = localStorage.getItem("token");
    fetch(`/api/vehicles/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setVehicle(data.data.vehicle));
  };

  useEffect(() => {
    fetchVehicle();

    // Update only if the event is for this vehicle
    const handleNCEvent = (nc) => {
      if (nc.vehicle === id || (nc.vehicle && nc.vehicle._id === id)) {
        fetchVehicle(); // update count
      }
    };

    socket.on("nonconformityCreated", handleNCEvent);
    socket.on("nonconformityUpdated", handleNCEvent);
    socket.on("nonconformityDeleted", handleNCEvent);

    return () => {
      socket.off("nonconformityCreated", handleNCEvent);
      socket.off("nonconformityUpdated", handleNCEvent);
      socket.off("nonconformityDeleted", handleNCEvent);
    };
    // eslint-disable-next-line
  }, [id]);

  if (!vehicle) return <div>Carregando...</div>;

  return (
    <Container style={{ maxWidth: 700, marginTop: 40 }}>
      <Card
        bg={darkTheme ? "dark" : "light"}
        text={darkTheme ? "light" : "dark"}
        className={darkTheme ? "border-secondary" : ""}
      >
        <Card.Body>
          <Card.Title>Detalhes do Veículo</Card.Title>
          <p>
            <b>Chassi:</b> {vehicle.chassis}
          </p>
          <p>
            <b>Modelo:</b> {vehicle.model}
          </p>
          <p>
            <b>Local:</b> {vehicle.location}
          </p>
          <p>
            <b>Situação:</b> {vehicle.situation}
          </p>
          <p>
            <b>Nº de Conformidades:</b> {vehicle.nonconformities?.length || 0}
          </p>
          <p>
            <b>Data:</b>{" "}
            {vehicle.createdAt
              ? new Date(vehicle.createdAt).toLocaleDateString()
              : ""}
          </p>
          <div>
            <b>Imagem Chassi:</b>
            <br />
            {vehicle.et_chassis_image_filename && (
              <img
                src={`/api/images/${vehicle.et_chassis_image_filename}?t=${vehicle.et_chassis_image_filename}`}
                alt="Chassi"
                style={{ maxWidth: 200, marginBottom: 8 }}
                className={darkTheme ? "bg-dark" : ""}
              />
            )}
          </div>
          <div>
            <b>Imagem Perfil:</b>
            <br />
            {vehicle.profile_image_filename && (
              <img
                src={`/api/images/${vehicle.profile_image_filename}`}
                alt="Perfil"
                style={{ maxWidth: 200, marginBottom: 8 }}
                className={darkTheme ? "bg-dark" : ""}
              />
            )}
          </div>
          <br />
          <Link
            to={`/vehicles/${id}/edit`}
            className={darkTheme ? "text-light" : ""}
          >
            Editar
          </Link>
          <br />
          <Link to="/vehicles" className={darkTheme ? "text-light" : ""}>
            Voltar
          </Link>
        </Card.Body>
      </Card>
      <NonconformityIndex vehicleId={id} />
    </Container>
  );
};

export default ShowVehicle;
