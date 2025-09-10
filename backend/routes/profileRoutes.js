const express = require("express")
const sqlite3 = require("sqlite3").verbose()
const jwt = require("jsonwebtoken")

const router = express.Router()
const db = new sqlite3.Database("./database.db")
const SECRET = "secret123"

// Middleware: authenticate user
function authenticate(req, res, next) {
    const token = req.headers["authorization"]
    if (!token) return res.sendStatus(403)

    jwt.verify(token.split(" ")[1], SECRET, (err, decoded) => {
        if (err) return res.sendStatus(403)
        req.user = decoded
        next()
    })
}

// ✅ Get own profile
router.get("/", authenticate, (req, res) => {
    if (req.user.role === "student") {
        db.get(
            "SELECT id,name,email,course,enrollment_date,'student' AS role FROM students WHERE email=?",
            [req.user.email],
            (err, row) => {
                if (err) return res.status(500).json({ error: "DB error" })
                if (!row) return res.status(404).json({ error: "Profile not found" })
                res.json(row)
            }
        )
    } else {
        db.get(
            "SELECT id,name,email,role FROM users WHERE id=?",
            [req.user.id],
            (err, row) => {
                if (err) return res.status(500).json({ error: "DB error" })
                if (!row) return res.status(404).json({ error: "Profile not found" })
                res.json(row)
            }
        )
    }
})

// ✅ Update own profile (students only)
router.put("/update", authenticate, (req, res) => {
    if (req.user.role !== "student") return res.status(403).json({ error: "Only students can update profile" })

    const { name, email, course } = req.body
    if (!name || !email || !course) return res.status(400).json({ error: "All fields required" })

    db.serialize(() => {
        db.run("UPDATE students SET name=?, email=?, course=? WHERE email=?", [name, email, course, req.user.email], function (err) {
            if (err) return res.status(500).json({ error: "Update failed (students)" })
        })

        db.run("UPDATE users SET name=?, email=? WHERE email=? AND role='student'", [name, email, req.user.email], function (err) {
            if (err) return res.status(500).json({ error: "Update failed (users)" })
            res.json({ message: "Profile updated successfully" })
        })
    })
})

module.exports = router
