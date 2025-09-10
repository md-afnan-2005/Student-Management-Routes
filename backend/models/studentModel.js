const db = require("../config/db");

const getAllStudents = (callback) => {
    db.all("SELECT * FROM students", [], callback);
};

const addStudent = (name, email, course, callback) => {
    db.run(
        "INSERT INTO students(name,email,course,enrollment_date) VALUES(?,?,?,date('now'))",
        [name, email, course],
        function (err) {
            callback(err, this?.lastID);
        }
    );
};

const updateStudent = (id, name, email, course, callback) => {
    db.run(
        "UPDATE students SET name=?,email=?,course=? WHERE id=?",
        [name, email, course, id],
        function (err) {
            callback(err, this?.changes);
        }
    );
};

const deleteStudent = (id, callback) => {
    db.run("DELETE FROM students WHERE id=?", [id], function (err) {
        callback(err, this?.changes);
    });
};

const updateProfile = (email, name, newEmail, course, callback) => {
    db.run(
        "UPDATE students SET name=?,email=?,course=? WHERE email=?",
        [name, newEmail, course, email],
        function (err) {
            callback(err, this?.changes);
        }
    );
};

module.exports = {
    getAllStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    updateProfile,
};
