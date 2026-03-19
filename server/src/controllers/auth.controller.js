const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { accounts } = require("../data.js");
const { SECRET_KEY } = require("../config.js");

const login = async (req, res) => {
  const { userStr, password } = req.body;
  console.log(req.body);
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
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Account not found! Register first.",
      });
    }
    if (!user.verified) {
      return res.status(401).json({
        success: false,
        notVerified: true,
        error: "Account not verified!",
      });
    }
    const passwordValid = await bcrypt.compare(password, user.password);
    console.log("Password Valid: ", passwordValid);
    if (!passwordValid) {
      console.log("Hello Crazzzyyy");
      return res.status(401).json({
        success: false,
        error: "Invalid Credentials",
      });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role },
      SECRET_KEY,
      { expiresIn: "1h" },
    );

    console.log("Hellooooooooo");
    return res.status(200).json({
      success: true,
      token,
      data: {
        username: user.username,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });
  } catch (error) {
    console.error("An error occurred! ", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error!",
    });
  }
};

const register = async (req, res) => {
  console.log("Request Body: ", req.body);
  const { username, email, first_name, last_name, middle_name, password } = req.body;
  try {
    if (!username.trim() || !password.trim() || !email.trim() || !first_name.trim() || !last_name.trim()) {
      return res.status(400).json({
        success: false,
        error: "Important fields are required.",
      });
    }
    const user = accounts.find(
      (u) => u.email && u.email.toLowerCase() === email.toLowerCase() ||
        (u.username && u.username.toLowerCase() === username.toLowerCase())
    );
    if (user) {
      return res.status(409).json({
        success: false,
        error: "User already exists!",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: accounts.length + 1,
      username,
      email,
      first_name,
      middle_name: middle_name ? middle_name : '',
      last_name,
      password: hashedPassword,
      role: "user",
      verified: false,
    };
    accounts.push(newUser);
    console.log("Accounts: ", accounts);
    return res.status(201).json({
      success: true,
      message: "User Registered Successfully!",
      data: {
        username: username
      }
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

const verifyEmail = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }
    const user = accounts.find(
      (u) => u.email && u.email.toLowerCase() === email.toLowerCase()
    );
    if (!user) {
      return res.status(404).json({
        success: false,

        error: "User not found!",
      });
    }
    user.verified = true;
    return res.status(200).json({
      success: true,
      message: "Email Verified Successfully!",
    });
  } catch (error) {
    console.error("An error occurred! ", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error!",
    });
  }
};

module.exports = { login, register, profile, verifyEmail };
