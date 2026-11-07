import { useState } from "react";
import Signup from "./Components/Signup";
import Login from "./Components/Login";
import CreateProject from "./Components/CreateProject";
import ViewProjects from "./Components/ViewProjects";
import ManageMemberships from "./Components/ManageMemberships";
import ManageStories from "./Components/ManageStories";


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
        <button onClick={() => setView("stories")}>Manage Stories</button>
        <button onClick={() => setView("stories")}>
  Stories
</button>

      </div>

      <div className="content">
        {view === "signup" && <Signup />}
        {view === "login" && <Login />}
        {view === "create" && <CreateProject />}
        {view === "view" && <ViewProjects />}
        {view === "manage" && <ManageMemberships />}
        {view === "stories" && <ManageStories />}
      </div>
    </div>
  );
}

export default App;
