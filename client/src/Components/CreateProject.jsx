import { useState, useEffect } from "react";

function CreateProject() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Planning");
  const [lead, setLead] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:9000/users")
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(() => setMessage("Failed to load users"));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name || !description || !status || !lead) {
      setMessage("All fields are required");
      return;
    }

    const response = await fetch("http://localhost:9000/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        status,
        project_lead_id: lead
      })
    });

    const data = await response.json();
    setMessage(data.message || "Unknown response");
  }

  return (
    <div>
      <h2>Create Project</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Project Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="Planning">Planning</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
        </select>

        <select value={lead} onChange={e => setLead(e.target.value)}>
          <option value="">Select Project Lead</option>
          {users.map(u => (
            <option key={u._id} value={u._id}>
              {u.username}
            </option>
          ))}
        </select>

        <button type="submit">Create Project</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default CreateProject;
