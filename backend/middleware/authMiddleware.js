const jwt = require("jsonwebtoken");
const SECRET = "secret123";

function authenticate(req, res, next) {
    const token = req.headers["authorization"];
    if (!token) return res.sendStatus(403);

    jwt.verify(token.split(" ")[1], SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

module.exports = { authenticate, SECRET };
