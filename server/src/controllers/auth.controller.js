const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { accounts } = require("../data.js");
const { SECRET_KEY } = require("../config.js");

const login = async (req, res) => {
  const { userStr, password } = req.body;
  try {
    console.log("Body: ", req.body);
    if (!userStr || !userStr.trim() || !password || !password.trim()) {
      return res.status(400).json({
        error: "Username/Email and Password are required!"
      });
    }
    
    const cleanUserStr = userStr.trim();
    const user = accounts.find(
      (u) => u.email && u.email.toLowerCase() === cleanUserStr.toLowerCase() || 
            (u.username && u.username.toLowerCase() === cleanUserStr.toLowerCase())
    );
    console.log("User: ", user);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        error: "Invalid Credentials",
      });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      SECRET_KEY,
      { expiresIn: "1h" },
    );

    return res.status(200).json({
      token,
      user: {
        username: user.username, 
        role: user.role,
      },
    });
  } catch (error) {
    console.error("An error occurred! ", error);
    return res.status(500).json({
      error: error,
      message: "Internal Server Error!",
    });
  }
};

const register = async (req, res) => {
  const { userStr, password, role = "user" } = req.body;
  try {
    if (!userStr.trim() || !password.trim()) {
      return res.status(400).json({
        message: "userStr and password required.",
      });
    }
    const exists = accounts.find((u) => u.userStr === userStr);
    if (exists) {
      return res.status(409).json({
        error: "User already exists!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: accounts.length + 1,
      userStr,
      password: hashedPassword,
      role,
    };
    accounts.push(newUser);
    console.log("Accounts: ", accounts);
    return res.status(201).json({
      message: "User Registered!",
      userStr,
      role,
      accountList: accounts,
    });
  } catch (error) {
    console.error("An error occurred! ", error);
    return res.status(500).json({
      error: "Internal Server Error!",
    });
  }
};

const profile = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { login, register, profile };
