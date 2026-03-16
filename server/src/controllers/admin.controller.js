const adminDashboard = async (req, res) => {
  res.json({
    message: `Welcome to admin dashboard!`,
    data: "Secret admin info",
  });
};

module.exports = { adminDashboard };
