import { useState } from "react";
import Signup from "./Components/Signup";
import Login from "./Components/Login";
import "./App.css";

function App() {
  const [view, setView] = useState("signup");

  return (
    <div className="container">
      <h1>ICSI 418Y – Login & Signup</h1>

      <div className="nav-buttons">
        <button onClick={() => setView("signup")}>Signup</button>
        <button onClick={() => setView("login")} style={{ marginLeft: "1rem" }}>
          Login
        </button>
      </div>

      <div className="content">
        {view === "signup" ? <Signup /> : <Login />}
      </div>
    </div>
  );
}

export default App;
