const jwt = require("jsonwebtoken");

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_KEY, { expiresIn: "360d" });
};

module.exports = generateToken;
