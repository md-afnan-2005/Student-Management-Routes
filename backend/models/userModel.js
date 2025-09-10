const db = require("../config/db");

const createUser = (name, email, hashedPassword, role, callback) => {
    db.run(
        "INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)",
        [name, email, hashedPassword, role || "student"],
        function (err) {
            callback(err, this?.lastID);
        }
    );
};

const findUserByEmail = (email, callback) => {
    db.get("SELECT * FROM users WHERE email=?", [email], callback);
};

const findUserById = (id, callback) => {
    db.get("SELECT name,email,role FROM users WHERE id=?", [id], callback);
};

module.exports = { createUser, findUserByEmail, findUserById };
