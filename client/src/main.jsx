import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// React 应用入口，将根组件挂载到 index.html 中的 #root
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
