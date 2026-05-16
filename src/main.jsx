import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.jsx";
import DriverPanel from "./DriverPanel.jsx";

const path = window.location.pathname;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {path === "/driver" ? (
      <DriverPanel />
    ) : (
      <App />
    )}
  </React.StrictMode>
);