import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import ProspectForm from "./ProspectForm.jsx";
import "./index.css";

// Simple path-based routing
const path = window.location.pathname;

const RootComponent = () => {
  if (path === "/prospect-form" || path.startsWith("/prospect-form/")) {
    return <ProspectForm />;
  }
  return <App />;
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>
);
