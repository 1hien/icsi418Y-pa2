import { useState } from "react";

function Signup() {
  const [fName, setFName] = useState("");
  const [lName, setLName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const response = await fetch("http://localhost:9000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        f_name: fName,
        l_name: lName,
        username,
        password,
      }),
    });

    const data = await response.json();
    setMessage(data.message);
  }

  return (
    <div>
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <input value={fName} onChange={(e) => setFName(e.target.value)} placeholder="First Name" />
        <input value={lName} onChange={(e) => setLName(e.target.value)} placeholder="Last Name" />
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <button type="submit">Create Account</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Signup;
