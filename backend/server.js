const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const profileRoutes = require("./routes/profileRoutes");

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(bodyParser.json());

// Routes
const port=process.env.PORT||5000;
app.use("/auth", authRoutes);
app.use("/students", studentRoutes);
app.use("/profile", profileRoutes);

app.listen(port, () => console.log("Server running on port", port));

