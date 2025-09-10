import React from "react";
import { Link } from "react-router-dom";
import "./index.css";

function Navbar({ role, onLogout }) {
    return (
        <nav>
            {role === "admin" && <Link to="/admin">Admin Dashboard</Link>}
            {role === "student" && <Link to="/student">Student Dashboard</Link>}
            {!role && <Link to="/login">Login</Link>}
            {!role && <Link to="/signup">Signup</Link>}
            {role && <button onClick={onLogout}>Logout</button>}
        </nav>
    );
}

export default Navbar;
