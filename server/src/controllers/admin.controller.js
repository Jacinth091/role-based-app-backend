const { accounts } = require('../data.js');
const bcrypt = require("bcryptjs");

const adminDashboard = async (req, res) => {
  res.json({
    message: `Welcome to admin dashboard!`,
    data: "Secret admin info",
  });
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = accounts.find((u) => u.id === Number(id));
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not Found!"
      });
    }
    const { password, ...safeUser } = user;

    return res.status(200).json({ success: true, message: "User Found Successfully!", data: safeUser });
  } catch (error) {
    console.error("An Error Occurred fetching user: ", error);
    return res.status(500).json({ succes: false, error: "Internal Server Error!" })
  }
}

const getAccountsList = async (req, res) => {
  try {
    const accountsList = accounts;
    if (accountsList.length <= 0) {
      return res.status(401).json({
        success: false,
        data: accountsList,
        error: "No accounts in the database."
      })
    }

    return res.status(200).json({
      success: true,
      message: "Fetched Accounts List Successfully.",
      data: accountsList
    })
  } catch (error) {
    console.error("Internal Server Error! : ", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    })
  }
}

const createAccount = async (req, res) => {
  const { first_name, last_name, email, password, role, verified } = req.body;
  try {
    if (!first_name?.trim() || !last_name?.trim() || !email?.trim() || !role?.trim()) {
      return res.status(400).json({ success: false, error: "Important fields should not be empty." });
    }
    if (!password || password.trim().length < 6) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters." });
    }
    if (role !== "admin" && role !== "user") {
      return res.status(400).json({ success: false, error: "Invalid role. Only 'admin' or 'user' allowed." });
    }

    const emailExists = accounts.find((a) => a.email === email.trim());
    if (emailExists) {
      return res.status(400).json({ success: false, error: "Email is already taken." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAccount = {
      id: accounts.length === 0 ? 1 : accounts[accounts.length - 1].id + 1,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.trim(),
      username: username.trim(),
      password: hashedPassword,
      role: role.trim(),
      verified: verified ?? false,
    };

    accounts.push(newAccount);
    const { password: _, ...safeAccount } = newAccount; // don't return password
    return res.status(201).json({ success: true, message: "Account created successfully!", data: safeAccount });
  } catch (error) {
    console.error("Create Account Error: ", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const editAccount = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, role, verified, username } = req.body;
  console.log(req.body);

  try {
    const account = accounts.find((a) => a.id === Number(id));
    if (!account) {
      return res.status(404).json({ success: false, error: "Account not found." });
    }

    if (email && email !== account.email) {
      const emailTaken = accounts.find((a) => a.email === email.trim() && a.id !== Number(id));
      if (emailTaken) {
        return res.status(400).json({ success: false, error: "Email is already taken." });
      }
    }

    if (username && username !== account.username) {
      const usernameTaken = accounts.find((a) => a.username === username.trim() && a.id !== Number(id));
      if (usernameTaken) {
        return res.status(400).json({ success: false, error: "Username is already taken." });
      }
    }

    if (role && role !== "admin" && role !== "user") {
      return res.status(400).json({ success: false, error: "Invalid role. Only 'admin' or 'user' allowed." });
    }

    if (first_name) account.first_name = first_name.trim();
    if (last_name) account.last_name = last_name.trim();
    if (email) account.email = email.trim();
    if (role) account.role = role.trim();
    if (verified !== undefined) account.verified = verified;

    const { password: _, ...safeAccount } = account;
    return res.status(200).json({ success: true, message: "Account updated successfully!", data: safeAccount });
  } catch (error) {
    console.error("Edit Account Error: ", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const deleteAccount = async (req, res) => {
  const { id } = req.params;
  try {
    const index = accounts.findIndex((a) => a.id === Number(id));
    if (index === -1) {
      return res.status(404).json({ success: false, error: "Account not found." });
    }

    const [deleted] = accounts.splice(index, 1);
    const { password: _, ...safeAccount } = deleted;
    return res.status(200).json({ success: true, message: "Account deleted successfully!", data: safeAccount });
  } catch (error) {
    console.error("Delete Account Error: ", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const resetAccountPassword = async (req, res) => {
  const { id } = req.params;
  const { password, confirm_password } = req.body;
  try {
    if (!password?.trim() || !confirm_password?.trim()) {
      return res.status(400).json({ success: false, error: "Fields should not be empty." });
    }
    if (password.trim().length < 6) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters." });
    }
    if (password.trim() !== confirm_password.trim()) {
      return res.status(400).json({ success: false, error: "Passwords do not match." });
    }

    const account = accounts.find((a) => a.id === Number(id));
    if (!account) {
      return res.status(404).json({ success: false, error: "Account not found." });
    }

    account.password = await bcrypt.hash(password.trim(), 10);
    return res.status(200).json({ success: true, message: "Password reset successfully!" });
  } catch (error) {
    console.error("Reset Password Error: ", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = { adminDashboard, getUserById, getAccountsList, createAccount, editAccount, deleteAccount, resetAccountPassword };
