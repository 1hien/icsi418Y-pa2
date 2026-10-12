import { useState, useEffect } from "react";

function ManageMemberships() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:9000/projects")
      .then(res => res.json())
      .then(data => setProjects(data));

    fetch("http://localhost:9000/users")
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  function loadMembers(projectId) {
    if (!projectId) return;
    fetch(`http://localhost:9000/memberships/${projectId}`)
      .then(res => res.json())
      .then(data => setMembers(data));
  }

  async function addMember() {
    if (!selectedProject || !selectedUser) {
      setMessage("Select a project and a user");
      return;
    }

    const response = await fetch(`http://localhost:9000/memberships/${selectedProject}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: selectedUser })
    });

    const data = await response.json();
    setMessage(data.message);
    loadMembers(selectedProject);
  }

  async function removeMember(userId) {
    if (!selectedProject) return;

    const response = await fetch(
      `http://localhost:9000/memberships/${selectedProject}/${userId}`,
      { method: "DELETE" }
    );

    const data = await response.json();
    setMessage(data.message);
    loadMembers(selectedProject);
  }

  const currentProject = projects.find(p => p._id === selectedProject);

  return (
    <div>
      <h2>Manage Project Memberships</h2>

      <select
        value={selectedProject}
        onChange={e => {
          const id = e.target.value;
          setSelectedProject(id);
          loadMembers(id);
        }}
      >
        <option value="">Select Project</option>
        {projects.map(p => (
          <option key={p._id} value={p._id}>
            {p.name}
          </option>
        ))}
      </select>

      <h3>Members</h3>
      {members.map(m => (
        <div key={m._id}>
          {m.user.username}
          {currentProject &&
            m.user._id !== currentProject.project_lead_id && (
              <button onClick={() => removeMember(m.user._id)}>Remove</button>
            )}
        </div>
      ))}

      <h3>Add Member</h3>
      <select
        value={selectedUser}
        onChange={e => setSelectedUser(e.target.value)}
      >
        <option value="">Select User</option>
        {users.map(u => (
          <option key={u._id} value={u._id}>
            {u.username}
          </option>
        ))}
      </select>

      <button onClick={addMember}>Add to Project</button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default ManageMemberships;
