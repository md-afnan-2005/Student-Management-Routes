import React, { useEffect, useState } from "react"
import { API_URL2 } from "../../config"
import "./index.css"

function StudentDashboard({ token: propToken }) {
    const token = propToken || localStorage.getItem("token")
    const [profile, setProfile] = useState({})
    const [error, setError] = useState("")
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({ name: "", email: "", course: "" })

    const fetchProfile = async () => {
        if (!token) {
            setError("No authentication token found. Please login again.")
            return
        }
        try {
            const res = await fetch(`${API_URL2}/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) {
                setProfile(data)
                setForm({ name: data.name, email: data.email, course: data.course || "" })
            } else {
                setError(data.error || "Failed to fetch profile")
            }
        } catch {
            setError("Failed to fetch profile")
        }
    }

    useEffect(() => {
        fetchProfile()
    }, [token])

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleUpdate = async () => {
        try {
            const res = await fetch(`${API_URL2}/profile/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(form)
            })
            const data = await res.json()
            if (res.ok) {
                // ✅ Update UI instantly with new form values
                setProfile(prev => ({
                    ...prev,
                    name: form.name,
                    email: form.email,
                    course: form.course
                }))
                setEditing(false)
            } else {
                setError(data.error || "Update failed")
            }
        } catch {
            setError("Update failed")
        }
    }

    return (
        <div className="student-dashboard">
            <h2>Student Dashboard</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}

            {editing ? (
                <div>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Name"
                    />
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Email"
                    />
                    <input
                        type="text"
                        name="course"
                        value={form.course}
                        onChange={handleChange}
                        placeholder="Course"
                    />
                    <button onClick={handleUpdate}>Save</button>
                    <button onClick={() => setEditing(false)}>Cancel</button>
                </div>
            ) : (
                profile.name && (
                    <div>
                        <p><b>Name:</b> {profile.name}</p>
                        <p><b>Email:</b> {profile.email}</p>
                        {profile.course && <p><b>Course:</b> {profile.course}</p>}
                        {profile.enrollment_date && <p><b>Enrolled On:</b> {profile.enrollment_date}</p>}
                        {profile.role && <p><b>Role:</b> {profile.role}</p>}
                        <button onClick={() => setEditing(true)}>Edit Profile</button>
                    </div>
                )
            )}
        </div>
    )
}

export default StudentDashboard
