const accounts = [
  {
    id: 1,
    first_name: "Admin",
    last_name: "User",
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
  {
    id: 3,
    first_name: "Bob",
    last_name: "Builder",
    username: "bob",
    email: "bob@example.com",
    password: "$2a$10$...",
    verified: true,
    role: "user",
  },
];

const departments = [
  {
    id: 1,
    name: "Engineering",
    description: "Software development team",
  },
  {
    id: 2,
    name: "HR",
    description: "Human resources team",
  },
  {
    id: 3,
    name: "Finance",
    description: "Accounting and finance team",
  },
];

const employees = [
  {
    id: 1,
    user_id: 2,           // alice
    department_id: 1,     // Engineering
    position: "Software Engineer",
    hire_date: "2024-01-15",
  },
  {
    id: 2,
    user_id: 3,           // bob
    department_id: 2,     // HR
    position: "HR Specialist",
    hire_date: "2024-03-01",
  },
];

const requests = [
  {
    id: 1,
    user_id: 2,
    type: "Equipment",
    items: [
      { name: "Laptop Stand", qty: 1 },
      { name: "Mechanical Keyboard", qty: 1 },
    ],
    status: "Pending",
    date: "2026-03-01T08:00:00.000Z",
  },
  {
    id: 2,
    user_id: 3,
    type: "Leave",
    items: [
      { name: "Sick Leave", qty: 2 },
    ],
    status: "Approved",
    date: "2026-03-10T08:00:00.000Z",
  },
];

module.exports = { accounts, departments, employees, requests };