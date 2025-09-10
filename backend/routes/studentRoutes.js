const express = require("express")
const sqlite3 = require("sqlite3").verbose()
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

const router = express.Router()
const db = new sqlite3.Database("./database.db")
const SECRET = "secret123"

// Middleware
function authenticate(req, res, next) {
    const token = req.headers["authorization"]
    if (!token) return res.sendStatus(403)

    jwt.verify(token.split(" ")[1], SECRET, (err, decoded) => {
        if (err) return res.sendStatus(403)
        req.user = decoded
        next()
    })
}

// ✅ Admin: get all students
router.get("/", authenticate, (req, res) => {
    if (req.user.role !== "admin")
        return res.status(403).json({ error: "Only admins can view students" })

    db.all("SELECT * FROM students", [], (err, rows) => {
        if (err) return res.status(500).json({ error: "DB error" })
        res.json(rows)
    })
})

// ✅ Admin: add student (also adds to users table)
router.post("/", authenticate, (req, res) => {
    if (req.user.role !== "admin")
        return res.status(403).json({ error: "Only admins can add" })

    const { name, email, course } = req.body
    const defaultPassword = "student123" // can be changed later
    const hashed = bcrypt.hashSync(defaultPassword, 8)

    db.serialize(() => {
        db.run(
            "INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)",
            [name, email, hashed, "student"],
            function (err) {
                if (err) return res.status(400).json({ error: "User email already exists" })

                const userId = this.lastID
                db.run(
                    "INSERT INTO students(name,email,course,enrollment_date) VALUES(?,?,?,date('now'))",
                    [name, email, course],
                    function (err2) {
                        if (err2) return res.status(400).json({ error: "Student insert failed" })
                        res.json({ id: this.lastID, userId })
                    }
                )
            }
        )
    })
})

// ✅ Admin: update student
router.put("/:id", authenticate, (req, res) => {
    if (req.user.role !== "admin")
        return res.status(403).json({ error: "Only admins can update" })

    const { name, email, course } = req.body

    db.serialize(() => {
        db.run(
            "UPDATE students SET name=?, email=?, course=? WHERE id=?",
            [name, email, course, req.params.id],
            function (err) {
                if (err) return res.status(500).json({ error: "Update failed" })
            }
        )
        db.run(
            "UPDATE users SET name=?, email=? WHERE email=(SELECT email FROM students WHERE id=?)",
            [name, email, req.params.id],
            function (err) {
                if (err) return res.status(500).json({ error: "User table update failed" })
                res.json({ updated: this.changes })
            }
        )
    })
})

// ✅ Admin: delete student
router.delete("/:id", authenticate, (req, res) => {
    if (req.user.role !== "admin")
        return res.status(403).json({ error: "Only admins can delete" })

    db.serialize(() => {
        db.get("SELECT email FROM students WHERE id=?", [req.params.id], (err, row) => {
            if (err || !row) return res.status(404).json({ error: "Student not found" })

            const email = row.email

            db.run("DELETE FROM students WHERE id=?", [req.params.id], function (err2) {
                if (err2) return res.status(500).json({ error: "Delete failed (students)" })

                db.run("DELETE FROM users WHERE email=?", [email], function (err3) {
                    if (err3) return res.status(500).json({ error: "Delete failed (users)" })
                    res.json({ deleted: this.changes })
                })
            })
        })
    })
})

module.exports = router
