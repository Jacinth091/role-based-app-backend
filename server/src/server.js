const express = require("express");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const cors = require("cors");
const AuthRoutes = require("./routes/auth.route.js");
const AdminRoutes = require("./routes/admin.route.js");
const PublicRoutes = require("./routes/public.route.js");
const { accounts } = require("./data.js");
const { SECRET_KEY, PORT } = require("./config.js");

const app = express();

app.use(
  cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
  }),
);

app.use(express.json());

try {
  if (accounts[0].password.includes("$2a$")) {
    console.log("Hellog");
    accounts[0].password = bcryptjs.hashSync("admin123", 10);
    accounts[1].password = bcryptjs.hashSync("user123", 10);
  }
} catch (error) {
  console.error("Something went wrong!", error);
}

app.use("/api/content", PublicRoutes);
app.use("/api", AuthRoutes);
app.use("/api/admin", AdminRoutes);

app.listen(PORT, () => {
  console.log(`Backend runing on http://localhost:${PORT}`);
  console.log("Try logging in with:");
  console.log(" ---- Admin: username=admin, password=admin123");
  console.log(" ---- User: username=alice, password=user123");
});
