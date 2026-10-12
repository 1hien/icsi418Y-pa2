import { useState, useEffect } from "react";

function ViewProjects() {
  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:9000/projects")
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(() => setMessage("Failed to load projects"));
  }, []);

  return (
    <div>
      <h2>Projects</h2>
      {message && <p>{message}</p>}
      {projects.map(p => (
        <div key={p._id} style={{ border: "1px solid #ccc", margin: "8px", padding: "8px" }}>
          <h3>{p.name}</h3>
          <p>{p.description}</p>
          <p>Status: {p.status}</p>
          <p>Project Lead: {p.lead.username}</p>
        </div>
      ))}
    </div>
  );
}

export default ViewProjects;
