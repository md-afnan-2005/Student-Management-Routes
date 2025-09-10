import React, { useEffect, useState } from "react"
import { API_URL2 } from "../../config"
import "./index.css"

function AdminDashboard({ token: propToken }) {
    const token = propToken || localStorage.getItem("token")

    const [students, setStudents] = useState([])
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)

    // Add/Edit form state
    const [form, setForm] = useState({ id: null, name: "", email: "", course: "" })

    const fetchStudents = async () => {
        if (!token) {
            setError("No authentication token found. Please login again.")
            setLoading(false)
            return
        }
        try {
            const res = await fetch(`${API_URL2}/students`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            if (res.ok) {
                setStudents(data)
            } else {
                setError(data.error || "Failed to fetch students")
            }
        } catch {
            setError("Failed to fetch students")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStudents()
    }, [token])

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    // ✅ Add or Update
    const handleSubmit = async (e) => {
        e.preventDefault()
        const method = form.id ? "PUT" : "POST"
        const url = form.id
            ? `${API_URL2}/students/${form.id}`
            : `${API_URL2}/students`

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    course: form.course,
                }),
            })
            const data = await res.json()
            if (res.ok) {
                setForm({ id: null, name: "", email: "", course: "" })
                fetchStudents()
            } else {
                alert(data.error || "Operation failed")
            }
        } catch {
            alert("Operation failed")
        }
    }

    // ✅ Delete
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return
        try {
            const res = await fetch(`${API_URL2}/students/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                fetchStudents()
            } else {
                const data = await res.json()
                alert(data.error || "Delete failed")
            }
        } catch {
            alert("Delete failed")
        }
    }

    // ✅ Populate form for edit
    const handleEdit = (student) => {
        setForm(student)
    }

    return (
        <div className="admin-dashboard">
            <h2>Admin Dashboard</h2>
            {loading && <p>Loading students...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* Add/Edit Form */}
            <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="course"
                    placeholder="Course"
                    value={form.course}
                    onChange={handleChange}
                    required
                />
                <button type="submit">{form.id ? "Update Student" : "Add Student"}</button>
                {form.id && (
                    <button type="button" onClick={() => setForm({ id: null, name: "", email: "", course: "" })}>
                        Cancel
                    </button>
                )}
            </form>

            {/* Students List */}
            {!loading && students.length > 0 && (
                <ul>
                    {students.map((s) => (
                        <li key={s.id}>
                            {s.name} - {s.email} - {s.course}{" "}
                            <div>
                                <button onClick={() => handleEdit(s)}>Edit</button>{" "}
                                <button onClick={() => handleDelete(s.id)}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {!loading && students.length === 0 && !error && <p>No students found.</p>}
        </div>
    )
}

export default AdminDashboard
