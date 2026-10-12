import { useState } from "react";
import Signup from "./components/Signup";
import Login from "./components/Login";
import CreateProject from "./Components/CreateProject";
import ViewProjects from "./Components/ViewProjects";
import ManageMemberships from "./Components/ManageMemberships";

function App() {
  const [view, setView] = useState("signup");

  return (
    <div className="container">
      <h1>ICSI 418Y – Full Stack App</h1>

      <div className="nav-buttons">
        <button onClick={() => setView("signup")}>Signup</button>
        <button onClick={() => setView("login")}>Login</button>
        <button onClick={() => setView("create")}>Create Project</button>
        <button onClick={() => setView("view")}>View Projects</button>
        <button onClick={() => setView("manage")}>Manage Memberships</button>
      </div>

      <div className="content">
        {view === "signup" && <Signup />}
        {view === "login" && <Login />}
        {view === "create" && <CreateProject />}
        {view === "view" && <ViewProjects />}
        {view === "manage" && <ManageMemberships />}
      </div>
    </div>
  );
}

export default App;
