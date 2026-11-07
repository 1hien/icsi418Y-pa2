import { useEffect, useState } from "react";

function ManageStories() {
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [stories, setStories] = useState([]);

  const [selectedProject, setSelectedProject] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [assignedUser, setAssignedUser] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:9000/projects")
      .then(res => res.json())
      .then(data => setProjects(data));
  }, []);

  function loadProjectData(projectId) {
    if (!projectId) return;

    fetch(`http://localhost:9000/stories/${projectId}`)
      .then(res => res.json())
      .then(data => setStories(data));

    fetch(`http://localhost:9000/memberships/${projectId}`)
      .then(res => res.json())
      .then(data => setMembers(data));
  }

  async function createStory() {
    if (!selectedProject || !title || !description) {
      setMessage("Please fill all required fields");
      return;
    }

    const response = await fetch(
      "http://localhost:9000/stories",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          project_id: selectedProject,
          title,
          description,
          priority,
          assigned_user_id: assignedUser || null
        })
      }
    );

    const data = await response.json();

    setMessage(data.message);

    setTitle("");
    setDescription("");
    setPriority("Medium");
    setAssignedUser("");

    loadProjectData(selectedProject);
  }

  async function deleteStory(storyId) {
    await fetch(
      `http://localhost:9000/stories/${storyId}`,
      {
        method: "DELETE"
      }
    );

    loadProjectData(selectedProject);
  }

  async function updateStatus(story, newStatus) {
    await fetch(
      `http://localhost:9000/stories/${story._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: story.title,
          description: story.description,
          priority: story.priority,
          status: newStatus,
          assigned_user_id: story.assigned_user_id
        })
      }
    );

    loadProjectData(selectedProject);
  }

  return (
    <div>
      <h2>Manage User Stories</h2>

      <select
        value={selectedProject}
        onChange={(e) => {
          setSelectedProject(e.target.value);
          loadProjectData(e.target.value);
        }}
      >
        <option value="">Select Project</option>

        {projects.map(project => (
          <option
            key={project._id}
            value={project._id}
          >
            {project.name}
          </option>
        ))}
      </select>

      <h3>Create Story</h3>

      <input
        type="text"
        placeholder="Story Title"
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
      />

      <input
        type="text"
        placeholder="Story Description"
        value={description}
        onChange={(e) =>
          setDescription(e.target.value)
        }
      />

      <select
        value={priority}
        onChange={(e) =>
          setPriority(e.target.value)
        }
      >
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>

      <select
        value={assignedUser}
        onChange={(e) =>
          setAssignedUser(e.target.value)
        }
      >
        <option value="">Unassigned</option>

        {members.map(member => (
          <option
            key={member.user._id}
            value={member.user._id}
          >
            {member.user.username}
          </option>
        ))}
      </select>

      <button onClick={createStory}>
        Create Story
      </button>

      {message && <p>{message}</p>}

      <hr />

      <h3>Project Backlog</h3>

      {stories.map(story => (
        <div
          key={story._id}
          style={{
            border: "1px solid black",
            padding: "10px",
            margin: "10px"
          }}
        >
          <h4>{story.title}</h4>

          <p>
            Description: {story.description}
          </p>

          <p>
            Priority: {story.priority}
          </p>

          <p>
            Assigned To:{" "}
            {story.assignedUser &&
            story.assignedUser.length > 0
              ? story.assignedUser[0].username
              : "Unassigned"}
          </p>

          <p>
            Status: {story.status}
          </p>

          <select
            value={story.status}
            onChange={(e) =>
              updateStatus(
                story,
                e.target.value
              )
            }
          >
            <option value="To Do">
              To Do
            </option>

            <option value="In Progress">
              In Progress
            </option>

            <option value="Done">
              Done
            </option>
          </select>

          <button
            onClick={() =>
              deleteStory(story._id)
            }
          >
            Delete Story
          </button>
        </div>
      ))}
    </div>
  );
}

export default ManageStories;