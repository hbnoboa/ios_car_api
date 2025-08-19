import React from "react";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./views/Home";
import Vehicles from "./views/vehicles/index";
import NewVehicle from "./views/vehicles/new";
import ShowVehicle from "./views/vehicles/show";
import EditVehicle from "./views/vehicles/edit";
import NewNonconformity from "./views/vehicles/nonconformities/new";
import ShowNonconformity from "./views/vehicles/nonconformities/show";
import EditNonconformity from "./views/vehicles/nonconformities/edit";
import VehicleParts from "./views/vehicleParts/index";
import NewVehiclePart from "./views/vehicleParts/new";
import EditVehiclePart from "./views/vehicleParts/edit";
import ShowVehiclePart from "./views/vehicleParts/show";
import ConfirmEmail from "./views/auth/ConfirmEmail";
import Login from "./views/auth/Login";
import Register from "./views/auth/Register";
import PrivateRoute from "./components/PrivateRoute";

const App = () => {
  const { token } = useAuth();

  return (
    <main>
      {token && <Navbar />}
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route path="/confirm/:token" element={<ConfirmEmail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/vehicles"
          element={
            <PrivateRoute>
              <Vehicles />
            </PrivateRoute>
          }
        />
        <Route
          path="/vehicles/new"
          element={
            <PrivateRoute>
              <NewVehicle />
            </PrivateRoute>
          }
        />
        <Route
          path="/vehicles/:id"
          element={
            <PrivateRoute>
              <ShowVehicle />
            </PrivateRoute>
          }
        />
        <Route
          path="/vehicles/:id/edit"
          element={
            <PrivateRoute>
              <EditVehicle />
            </PrivateRoute>
          }
        />
        <Route
          path="/vehicles/:id/nonconformities/new"
          element={
            <PrivateRoute>
              <NewNonconformity />
            </PrivateRoute>
          }
        />
        <Route
          path="/vehicles/:id/nonconformities/:ncid"
          element={
            <PrivateRoute>
              <ShowNonconformity />
            </PrivateRoute>
          }
        />
        <Route
          path="/vehicles/:id/nonconformities/:ncid/edit"
          element={
            <PrivateRoute>
              <EditNonconformity />
            </PrivateRoute>
          }
        />
        <Route path="/vehicleParts" element={<VehicleParts />} />
        <Route path="/vehicleParts/new" element={<NewVehiclePart />} />
        <Route path="/vehicleParts/:id" element={<ShowVehiclePart />} />
        <Route path="/vehicleParts/:id/edit" element={<EditVehiclePart />} />
      </Routes>
    </main>
  );
};

export default App;
