const express = require("express")
const sqlite3 = require("sqlite3").verbose()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const router = express.Router()
const db = new sqlite3.Database("./database.db")
const SECRET = "secret123"

// ✅ Signup
router.post("/signup", (req, res) => {
    const { name, email, password, role } = req.body
    if (!name || !email || !password || !role) return res.status(400).json({ error: "All fields required" })

    const hashed = bcrypt.hashSync(password, 10)
    db.run(
        "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
        [name, email, hashed, role],
        function (err) {
            if (err) {
                if (err.message.includes("UNIQUE")) return res.status(400).json({ error: "Email already exists" })
                return res.status(500).json({ error: "Signup failed" })
            }

            // ✅ If student, create record in students table
            if (role === "student") {
                db.run(
                    "INSERT INTO students (name,email,course,enrollment_date) VALUES (?,?,?,?)",
                    [name, email, "", new Date().toISOString().split("T")[0]],
                    (err) => { if (err) console.log(err) }
                )
            }

            const token = jwt.sign({ id: this.lastID, role, email }, SECRET, { expiresIn: "1h" })
            res.json({ token, role })
        }
    )
})

// ✅ Login
router.post("/login", (req, res) => {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: "Email and password required" })

    db.get("SELECT * FROM users WHERE email=?", [email], (err, user) => {
        if (err) return res.status(500).json({ error: "DB error" })
        if (!user) return res.status(401).json({ error: "User not found" })

        const valid = bcrypt.compareSync(password, user.password)
        if (!valid) return res.status(401).json({ error: "Invalid password" })

        const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, SECRET, { expiresIn: "1h" })
        res.json({ token, role: user.role })
    })
})

module.exports = router
