const accounts = [
  {
    id: 1,
    first_name: "Admin User",
    last_name: "Admin",
    username: "admin",
    email: "admin@example.com",
    password: "$2a$10$...",
    verified: true,
    role: "admin",
  },
  {
    id: 2,
    first_name: "Alice",
    last_name: "In Borderland",
    username: "alice",
    email: "alice@example.com",
    password: "$2a$10$...",
    verified: true,
    role: "user",
  },
  
];


const departments = [
  {
    id: Date.now(),
    name: "Engineer",
    description: "Software Team",
  },
  {
    id: Date.now(),
    name: "HR",
    description: "Human Resources",
  },
];
const employees = [];
const requests = [];

module.exports = { accounts, departments, employees, requests };
