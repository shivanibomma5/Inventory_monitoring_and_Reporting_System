import { useState } from "react";
import AuthService from "../api/AuthService";

function Register() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    role: "ADMIN",
  });

  const handleRegister = async () => {
    try {
      await AuthService.register(form);
      alert("Registered Successfully ✅");
    } catch (err) {
      alert("Registration Failed ❌");
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Register</h2>

      <input
        placeholder="Username"
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />

      <input
        placeholder="Email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <select
        onChange={(e) => setForm({ ...form, role: e.target.value })}
      >
        <option value="STAFF">STAFF</option>
        <option value="ADMIN">ADMIN</option>
        <option value="SUPPLIER">SUPPLIER</option>
      </select>

      <button onClick={handleRegister}>Register</button>
    </div>
  );
}

export default Register;