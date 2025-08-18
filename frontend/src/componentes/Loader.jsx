import React from "react";
import "./Loader.css";
import cargando from "../assets/loader/cargando.gif";

export default function Loader() {
  return (
    <div className="loader-container">
      <img src={cargando} alt="Cargando..." className="loader-img" />
    </div>
  );
}
