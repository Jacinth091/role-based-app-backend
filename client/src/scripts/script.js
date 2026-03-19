import { login, register, verifyEmail } from "../api/auth.api.js";
import { getEmployeeList, getEmployeeById, addNewEmployee, editEmployee, deleteEmployee } from "../api/employee.api.js";
import { getDepartmentById, getDepartmentList } from "../api/department.api.js";
import { getAccountsList, getUserById, createAccount, editAccount, deleteAccount, resetAccountPassword } from "../api/admin.api.js";


// =============================================================================
// GLOBALS & CONSTANTS
// =============================================================================

let currentUser = null;
const STORAGE_KEY = "ipt_demo_v1";
let editId = null;
let selectedId = null;
let employees = [];
let departments = [];
let accounts = [];


// =============================================================================
// STORAGE
// =============================================================================

function saveToStorage() {
  const data = JSON.stringify(window.db);
  localStorage.setItem(STORAGE_KEY, data);
}
function loadFromStorage() {
  const data = localStorage.getItem(STORAGE_KEY);
  console.log("data", data);
  if (data) {
    window.db = JSON.parse(data);
  } else {
    window.db = {
      accounts: [
        {
          id: Date.now(),
          first_name: "Admin User",
          last_name: "admin",
          email: "admin@example.com",
          password: "Password123!",
          verified: true,
          role: "admin",
        },
      ],
      departments: [
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
      ],
      employee: [],
      requests: [],
    };
  }
  if (!window.db.requests) {
    window.db.requests = [];
  }
  saveToStorage();
}

// =============================================================================
// UTILITIES
// =============================================================================

// Toast notification helper
// type: "success" | "danger" | "warning" | "info"
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const icons = {
    success: "bi-check-circle-fill",
    danger: "bi-x-circle-fill",
    warning: "bi-exclamation-triangle-fill",
    info: "bi-info-circle-fill",
  };
  const icon = icons[type] || icons.info;
  const id = "toast-" + Date.now();
  const toastHTML = `
    <div id="${id}" class="toast align-items-center text-bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body d-flex align-items-center gap-2">
          <i class="bi ${icon}"></i> ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>`;
  container.insertAdjacentHTML("beforeend", toastHTML);
  const toastEl = document.getElementById(id);
  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();
  toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
}

function charactersOnly(str) {
  const nameRegex = /^[a-zA-Z\s]+$/;
  return nameRegex.test(str.trim());
}

function getDataFromTarget(e) {
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  return data;
}
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}


function navigateTo(hash) {
  window.location.hash = hash;
}

function initializePasswordToggles() {
  const passwordFields = document.querySelectorAll(".password-toggleable");

  passwordFields.forEach((input) => {
    const wrapper = document.createElement("div");
    wrapper.className = "input-group";
    input.parentNode.insertBefore(wrapper, input);

    wrapper.appendChild(input);
    wrapper.insertAdjacentHTML(
      "beforeend",
      `
      <button class="btn btn-outline-secondary" type="button">
        <i class="bi bi-eye"></i>
      </button>
    `,
    );

    const btn = wrapper.querySelector("button");
    const icon = btn.querySelector("i");

    btn.onclick = () => {
      const isPw = input.type === "password";
      input.type = isPw ? "text" : "password";
      icon.className = isPw ? "bi bi-eye-slash" : "bi bi-eye";
    };
  });
}

// =============================================================================
//  ROUTING
// =============================================================================

function authenticatedRoutes(hash) {
  return (
    hash === "#profile" ||
    hash === "#account" ||
    hash === "#employee" ||
    hash === "#department" ||
    hash === "#request"
  );
}

function adminPages(hash) {
  return hash === "#account" || hash === "#employee" || hash === "#department";
}

function userOnlyPages(hash) {
  return hash === "#request";
}

function handleRouting() {
  let currentHash = window.location.hash;

  if (currentHash === "" || currentHash === "#/") {
    currentHash = "#/home";
    configureNavbar(false, null);
  }
  const targId = "#" + currentHash.replace("#/", "");

  const isAuthenticated = document.body.classList.contains("authenticated");

  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  if (!isAuthenticated && authenticatedRoutes(targId)) {
    showToast("You are not authenticated, please login first.", "warning");
    window.location.hash = "#/home";
    return;
  }

  const isUserAdmin = currentUser?.role === "admin";

  if (isAuthenticated && !isUserAdmin && adminPages(targId)) {
    showToast("Invalid Request. Unauthorized User.", "danger");
    window.location.hash = isAuthenticated ? "#/profile" : "#/home";
    return;
  }

  if (isAuthenticated && isUserAdmin && userOnlyPages(targId)) {
    showToast("This page is only available for User accounts.", "warning");
    window.location.hash = "#/profile";
    return;
  }

  try {
    const matchingPage = document.querySelector(targId);
    console.log(matchingPage);
    console.log(targId);

    if (matchingPage) {
      matchingPage.classList.add("active");

      if (currentUser) {
        if (targId === "#account") {
          renderAccountsList();
        } else if (targId === "#department") {
          renderDepartmentItems();
        } else if (targId === "#employee") {
          console.log("Employeeeeeeesss");
          renderEmployeeItems();
        } else if (targId === "#request") {
          renderRequestItems();
        }
      }
    } else {
      console.warn("Page not found!");
      window.location.hash = isAuthenticated ? "#/profile" : "#/home";
    }
  } catch (error) {
    console.error("Invalid hash", targId);
    window.location.hash = "#/home";
    configureNavbar(false, null);
  }
}

window.addEventListener("load", () => {
  const currentLoggedEmail = localStorage.getItem("auth_token");
  let isLoggedIn = false;

  if (currentLoggedEmail) {
    const user = window.db.accounts.find((u) => u.email === currentLoggedEmail);
    if (user) {
      setAuthState(true, user);
      configureNavbar(true, user);
      renderProfile();
      isLoggedIn = true;
    }
  }

  if (!window.location.hash || window.location.hash === "#/") {
    window.location.hash = isLoggedIn ? "#/profile" : "#/home";
  } else {
    handleRouting();
  }
});

window.addEventListener("hashchange", () => {
  handleRouting();
});

// =============================================================================
// AUTH
// =============================================================================

function setAuthState(isAuth, user) {
  const body = document.body;
  if (!isAuth) {
    body.className = "not_authenticated";
    body.classList.remove("is-admin");
    return;
  }
  currentUser = user;
  body.className = "authenticated";
  if (user.role === "admin") {
    body.classList.add("is-admin");
  }
}

function configureNavbar(isAuth, user) {
  const authLink = document.getElementById("auth-link");
  const userLink = document.getElementById("user-link");
  const nameHolder = document.getElementById("name-holder");

  if (!isAuth) {
    authLink.classList.remove("d-none");
    authLink.classList.add("d-flex");
    userLink.classList.add("d-none");
    return;
  } else {
    authLink.classList.add("d-none");
    authLink.classList.remove("d-flex");
    userLink.classList.remove("d-none");
  }

  if (user && user.first_name) {
    nameHolder.textContent = user.first_name;
  }

  const adminItems = document.querySelectorAll("#drop-menu .role-admin");
  adminItems.forEach((item) => {
    if (user && user.role === "admin") {
      item.classList.remove("d-none");
    } else {
      item.classList.add("d-none");
    }
  });

  const userItems = document.querySelectorAll("#drop-menu .role-user");
  userItems.forEach((item) => {
    if (user && user.role !== "admin") {
      item.classList.remove("d-none");
    } else {
      item.classList.add("d-none");
    }
  });
}

function logout() {
  console.log("Logging out...");
  sessionStorage.removeItem("authToken");
  setAuthState(false, null);
  configureNavbar(false, null);
  navigateTo("#/home");
}

async function verifyEmailHandler() {
  try {
    const userEmail = localStorage.getItem("unverified_email");
    if (!userEmail) {
      showToast("No stored email to verify");
      navigateTo("#/home");
    }
    const response = await verifyEmail(userEmail);
    if (!response) {
      showToast(response.error || "Email Verification Failed", "danger");
      throw new Error(response.error);
    } else {
      console.log("Response: ", response);
      localStorage.removeItem("unverified_email");
      showToast("Email Verified Successfully!", "success");
      navigateTo("#/login");
    }
  } catch (error) {
    console.error("An error ocurred: ", error);
    showToast(error.message || error, "danger");
  }
  // try {
  //   const userEmail = localStorage.getItem("unverified_email");
  //   if (!userEmail) {
  //     throw new Error("There is no unverified email, register first!");
  //   }
  //   const account = window.db.accounts.find((em) => em.email === userEmail);
  //   if (!account) {
  //     throw new Error("Account not found!");
  //   }
  //   account.verified = true;
  //   saveToStorage();
  //   localStorage.removeItem("unverified_email");
  //   showToast("Email Verified Successfully!", "success");
  //   navigateTo("#/login");
  // } catch (error) {
  //   console.error("An error ocurred: ", error);
  //   showToast(error.message || error, "danger");
  // }
}

// Register form
const registerForm = document.getElementById("registerForm");
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  // try {
  //   const formData = new FormData(e.target);
  //   const data = Object.fromEntries(formData.entries());
  //   console.log(data);

  //   const uniqueEmail = window.db.accounts.find(
  //     (em) => em.email === data.email,
  //   );
  //   if (uniqueEmail) {
  //     showToast("Email is already taken!", "warning");
  //     return;
  //   }

  //   const newUser = {
  //     id: Date.now(),
  //     first_name: data.firstname,
  //     last_name: data.lastname,
  //     email: data.email,
  //     password: data.password,
  //     verified: false,
  //     role: "user",
  //   };

  //   localStorage.setItem("unverified_email", data.email);
  //   window.db.accounts.push(newUser);
  //   saveToStorage();
  //   navigateTo("#/verify");
  // } catch (error) {
  //   console.error("An error occurred: ", error);
  // }
  try {
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    console.log(data);

    if (data.password !== data.confirm_password) {
      showToast("Passwords do not match!", "danger");
      return;
    }

    const formattedData = {
      username: data.username,
      email: data.email,
      first_name: data.firstname,
      last_name: data.lastname,
      middle_name: data.middlename,
      password: data.password,
    };
    const response = await register(formattedData);

    if (!response) {
      showToast(response.error || "Registration Failed", "danger");
    } else {
      console.log("Hellow");
      console.log("Response User: ", response);
      console.log("Response Email: ", response.data.email);
      localStorage.setItem("unverified_email", response.data.email);
      navigateTo("#/verify");
      showToast("Registered Successfully!", "success");
    }
  } catch (error) {
    console.error("An error occurred: ", error);
  }
});

// Login form
const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  // try {
  //   const formData = new FormData(e.target);
  //   const data = Object.fromEntries(formData.entries());
  //   console.log("Data: ", data);

  //   const result = await login(data.userStr, data.password);
  //   if (result) {
  //     console.log("Result: ", result);
  //   }

  //   window.history.replaceState(
  //     null,
  //     "",
  //     window.location.pathname + window.location.hash,
  //   );
  //   setAuthState(true, user);
  //   configureNavbar(true, user);
  //   renderProfile();
  //   navigateTo("#/profile");
  //   showToast("Logged In Successfully!", "success");
  // } catch (error) {
  //   console.error("An error occurred: ", error);
  //   showToast(error.message || error, "danger");
  // }
  try {
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const response = await login(data.userStr, data.password);
    console.log("Responsedadwa: ", response);
    if (!response || !response.success) {
      showToast(response.error || "Invalid Credentials", "danger");
    } else {
      setAuthState(response.success, response.data);
      configureNavbar(response.success, response.data);
      if (renderProfile) renderProfile();
      navigateTo("#/profile");
      showToast("Logged In Successfully!", "success");
    }
  } catch (error) {
    console.error("An error occurred: ", error);
    showToast("Network Error", "danger");
  }
});

// Logout link
const logoutLink = document.getElementById("logout");
logoutLink.addEventListener("click", (e) => {
  e.preventDefault();
  logout();
});

// =============================================================================
// PROFILE
// =============================================================================

function renderProfile() {
  const accountName = document.getElementById("user-name");
  const accountEmail = document.getElementById("user-email");
  const accountRole = document.getElementById("user-role");
  const editButton = document.getElementById("edit-profile");
  const accountUsername = document.getElementById('user-username');

  const name = currentUser.first_name + " " + currentUser.last_name;

  accountName.innerText = name;
  accountEmail.innerText = currentUser.email;
  accountRole.innerText = currentUser.role;
  accountUsername.innerText = currentUser.username;

  editButton.onclick = () => {
    showToast("Not Implemented Yet, Tehee :>", "info");
  };
}

// =============================================================================
// ACCOUNTS
// =============================================================================


const tableItemContainer = document.getElementById("table-items");
const accFormContainer = document.getElementById("acc-form-cont");
const accountForm = document.getElementById("acc-form");
const modalAccountForm = document.getElementById("acc-modal-form");
const accountModal = document.getElementById("reset-pw");
const confirmModal = document.getElementById("delete-confirm-modal");
const accConfirmDeleteBtn = document.getElementById("confirm-delete-btn");

async function renderAccountsList() {
  const response = await getAccountsList();
  accounts = response.data ?? [];
  tableItemContainer.innerHTML = "";

  if (!accounts.length) {
    tableItemContainer.insertAdjacentHTML("beforeend", `
      <tr><td colspan="5" class="text-center bg-secondary-subtle">No accounts.</td></tr>
    `);
    return;
  }

  accounts.forEach((acc) => {
    tableItemContainer.insertAdjacentHTML("beforeend", `
      <tr>
        <td>${acc.first_name} ${acc.last_name}</td>
        <td>${acc.email}</td>
        <td>${acc.username ?? "N/A"}</td>
        <td>${capitalizeFirst(acc.role)}</td>
        <td>${acc.verified ? "✅" : "❌"}</td>
        <td>
          <button type="button" class="btn btn-outline-primary edit-acc-btn" data-id="${acc.id}">Edit</button>
          <button type="button" class="btn btn-outline-warning reset-acc-btn" data-id="${acc.id}"
            data-bs-toggle="modal" data-bs-target="#reset-pw">Reset Password</button>
          <button type="button" class="btn btn-outline-danger delete-acc-btn" data-id="${acc.id}"
            data-bs-toggle="modal" data-bs-target="#delete-confirm-modal">Delete</button>
        </td>
      </tr>`);
  });
}

function renderAccountDetails() {
  if (!selectedId) return;
  const user = accounts.find((u) => u.id === Number(selectedId));
  if (!user) { showToast("Account not found!", "danger"); return; }

  confirmModal.querySelector(".modal-body").innerHTML = `
    <div class="bg-light rounded-3 p-3 border border-secondary-subtle">
      <div class="row mb-2">
        <div class="col-5 fw-bold text-secondary text-end">Name:</div>
        <div class="col-7 fw-medium">${user.first_name} ${user.last_name}</div>
      </div>
      <div class="row mb-2">
        <div class="col-5 fw-bold text-secondary text-end">Email:</div>
        <div class="col-7 text-break fw-medium">${user.email}</div>
      </div>
      <div class="row mb-2 align-items-center">
        <div class="col-5 fw-bold text-secondary text-end">Role:</div>
        <div class="col-7">
          <span class="badge ${user.role === "admin" ? "bg-danger" : "bg-primary"}">${user.role}</span>
        </div>
      </div>
      <div class="row align-items-center">
        <div class="col-5 fw-bold text-secondary text-end">Status:</div>
        <div class="col-7">${user.verified ? '<span class="text-success">Verified ✅</span>' : '<span class="text-warning">Pending ❌</span>'}</div>
      </div>
    </div>`;
}

function openAccountForm() {
  selectedId = null;  // always reset when opening fresh
  clearForm();
  accFormContainer.classList.remove("d-none");
}

function clearForm() {
  accFormContainer.querySelectorAll('input[id*="acc-"]').forEach((f) => {
    f.id.replace("acc-", "") === "check" ? (f.checked = false) : (f.value = "");
  });
  accountModal.querySelector(".modal-body").querySelectorAll("input").forEach((f) => f.value = "");
}

function closeAccountForm() {
  selectedId = null;
  clearForm();
  accFormContainer.classList.add("d-none");
}

function prefillAccountForm(savedId) {
  // restore selectedId since openAccountForm() clears it
  selectedId = savedId;
  const user = accounts.find((u) => u.id === Number(selectedId));
  if (!user) { showToast("Account not found!", "danger"); return; }

  accFormContainer.classList.remove("d-none");
  clearForm();
  selectedId = savedId; // clearForm resets it, restore again

  const fieldMap = { fname: "first_name", lname: "last_name", email: "email", role: "role", username: "username" };
  accFormContainer.querySelectorAll('input[id*="acc-"]').forEach((f) => {
    const suffix = f.id.replace("acc-", "");
    if (fieldMap[suffix]) {
      const value = user[fieldMap[suffix]];
      f.value = suffix === "role" ? capitalizeFirst(value) : value;
    } else if (suffix === "check") {
      f.checked = user.verified;
    }
  });
}

async function saveOrEditUserAccount(formData) {
  try {
    if (!formData.first_name?.trim() || !formData.last_name?.trim() ||
      !formData.email?.trim() || !formData.role?.trim() || !formData.username?.trim()) {
      throw new Error("Important fields should not be empty.");
    }
    if (formData.role.toLowerCase() !== "admin" && formData.role.toLowerCase() !== "user") {
      throw new Error("Invalid role. Only 'Admin' or 'User' allowed.");
    }

    const payload = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email.trim(),
      username: formData.username?.trim(),
      role: formData.role.trim().toLowerCase(),
      verified: formData.verified,
      ...(formData.password?.trim() && { password: formData.password.trim() }),
    };

    if (selectedId === null) {
      if (!formData.password || formData.password.trim().length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }
      const response = await createAccount(payload);
      console.log("Response from save uyser functiuon: ", response);
      if (!response.success) throw new Error(response.error);
      showToast(response.message, "success");
    } else {
      const response = await editAccount(selectedId, payload);
      if (!response.success) throw new Error(response.error);
      showToast(response.message ?? "Account updated successfully!", "success");
    }

    selectedId = null;
    closeAccountForm();
    renderAccountsList();
  } catch (error) {
    console.error(error);
    showToast(error.message, "danger");
  }
}

async function handleResetPassword(formData) {
  try {
    if (!formData.password?.trim() || !formData.confirm_password?.trim()) {
      throw new Error("Fields should not be empty.");
    }
    if (formData.password.trim().length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }
    if (formData.password.trim() !== formData.confirm_password.trim()) {
      throw new Error("Passwords do not match.");
    }
    if (!selectedId) throw new Error("No account selected.");

    const response = await resetAccountPassword(selectedId, {
      password: formData.password.trim(),
      confirm_password: formData.confirm_password.trim(),
    });
    if (!response.success) throw new Error(response.error);

    showToast(response.message, "success");
    selectedId = null;
    clearForm();
    bootstrap.Modal.getOrCreateInstance(accountModal).hide();
  } catch (error) {
    console.error("Reset Password Error: ", error);
    showToast(error.message, "danger");
  }
}

async function handleDeleteAccount() {
  try {
    if (!selectedId) throw new Error("No account selected.");
    if (Number(selectedId) === Number(currentUser.id)) {
      throw new Error("You can't delete your own account.");
    }

    const response = await deleteAccount(selectedId);
    if (!response.success) throw new Error(response.error);

    showToast(response.message, "success");
    selectedId = null;
    renderAccountsList();
    bootstrap.Modal.getOrCreateInstance(document.getElementById("delete-confirm-modal")).hide();
  } catch (error) {
    console.error("Delete Account Error: ", error);
    showToast(error.message, "danger");
  }
}

// Account event listeners
accountForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = getDataFromTarget(e);
  data.verified = e.target.elements["acc-check"].checked;
  saveOrEditUserAccount(data);
});

accountForm.querySelector("#role-menu").addEventListener("click", (e) => {
  if (e.target.classList.contains("dropdown-item")) {
    e.preventDefault();
    accountForm.querySelector("#acc-role").value = e.target.textContent.trim();
  }
});

tableItemContainer.addEventListener("click", (e) => {
  const id = e.target.dataset.id;
  if (e.target.classList.contains("edit-acc-btn")) {
    selectedId = id;
    prefillAccountForm(id);
  } else if (e.target.classList.contains("reset-acc-btn")) {
    selectedId = id;
  } else if (e.target.classList.contains("delete-acc-btn")) {
    selectedId = id;
    renderAccountDetails();
  }
});

accConfirmDeleteBtn.addEventListener("click", (e) => {
  e.preventDefault();
  handleDeleteAccount();
});

modalAccountForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleResetPassword(getDataFromTarget(e));
});

// =============================================================================
//  DEPARTMENTS
// =============================================================================

const deptTableCont = document.getElementById("dept-table-cont");
const addDeptButton = document.getElementById("add-department");

function renderDepartmentItems() {
  try {
    const departments = window.db.departments;
    console.log("Departments: ", departments);
    deptTableCont.innerHTML = "";

    if (departments.length <= 0 || !departments) {
      const row = `
      <td colspan="5" class="text-center bg-secondary-subtle">
        No department.
      </td>`;
      deptTableCont.insertAdjacentHTML("beforeend", row);
      return;
    }

    departments.forEach((d) => {
      const row = `
      <tr>
        <td>${d.name}</td>
        <td>${d.description}</td>
        <td>
          <button type="button" class="btn btn-outline-primary" data-id=${d.id}>
            Edit
          </button>
          <button type="button" class="btn btn-outline-danger" data-id=${d.id}>
            Delete
          </button>
        </td>
      </tr>`;
      deptTableCont.insertAdjacentHTML("beforeend", row);
    });
  } catch (error) {
    console.error("Error Occurred: ", error);
  }
}

addDeptButton.onclick = () => {
  showToast("Not Implemented Yet", "info");
};

// =============================================================================
// EMPLOYEES
// =============================================================================

const empTableCont = document.getElementById("emp-table-cont");
const empDetailCont = document.getElementById("emp-detail-cont");
const empForm = document.getElementById("emp-form");
const delEmpForm = document.getElementById("delete-confirm-modal-emp");


async function renderEmployeeItems() {
  try {
    const response = await getEmployeeList();
    employees = response.data ?? [];
    empTableCont.innerHTML = "";
    if (employees.length <= 0 || !employees) {
      const row = `
      <td colspan="6" class="text-center bg-secondary-subtle">
        No employees.
      </td>`;
      empTableCont.insertAdjacentHTML("beforeend", row);
      return;
    }

    employees.forEach(async (em) => {
      const dateObj = new Date(em.hire_date);
      const formattedDate = dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      let deptName = "N/A";
      const deptResponse = await getDepartmentById(Number(em.department_id));
      const department = deptResponse.data ?? null;
      if (department) deptName = department.name;

      let email = "N/A";
      const userResponse = await getUserById(Number(em.user_id));
      const user = userResponse.data ?? null;
      if (user) email = user.email;
      const row = `
      <tr>
        <th scope="row">${em.id}</th>
        <td>${email}</td>
        <td>${em.position}</td>
        <td>${deptName}</td>
        <td>${formattedDate}</td>
        <td>
          <button type="button" class="btn btn-outline-primary editEmpBtn" data-id=${em.id}>
            Edit
          </button>
          <button type="button" class="btn btn-outline-danger delEmpBtn" data-id=${em.id}
            data-bs-toggle="modal" data-bs-target="#delete-confirm-modal-emp">
            Delete
          </button>
        </td>
      </tr>`;
      empTableCont.insertAdjacentHTML("beforeend", row);
    });
  } catch (error) {
    console.error("Error Occurred: ", error);
  }
}

function openEmpDetailCont() {
  clearEmpForm();
  empDetailCont.classList.remove("d-none");
  populateDeptDropdown();

  const hireDateField = document.getElementById("emp_date");
  hireDateField.readOnly = false;
  hireDateField.classList.remove("bg-body-secondary");
}

function closeEmpDetailCont() {
  clearEmpForm();
  empDetailCont.classList.add("d-none");
}

function clearEmpForm() {
  selectedId = null;
  const fields = empDetailCont.querySelectorAll('input[id*="emp_"]');
  console.log(fields);
  fields.forEach((f) => {
    if (f.id === "emp_id") {
      f.value = "Employee ID read-only";
      return;
    }
    const suffix = f.id.replace("acc-", "");
    if (suffix === "check") {
      f.checked = false;
    } else {
      f.value = "";
    }
  });
}

async function prefillEmpForm() {
  try {
    if (selectedId === null) {
      showToast("There is no selected id, try again.", "warning");
      return;
    }
    const emp = employees.find((em) => em.id === Number(selectedId));
    if (!emp) {
      showToast("Employee not found!", "danger");
      return;
    }

    openEmpDetailCont();
    const fields = empDetailCont.querySelectorAll(
      'input[id*="emp_"], select[id*="emp_"]',
    );
    const userResponse = await getUserById(Number(emp.user_id));
    const matchedAccount = userResponse?.data ?? null;

    fields.forEach((f) => {
      const dataKey = f.name;
      if (f.id === "emp_email") {
        f.value = matchedAccount ? matchedAccount.email : "Account not found";
        return;
      }
      if (emp[dataKey] !== undefined && emp[dataKey] !== null) {
        if (f.type === "date") {
          f.value = emp[dataKey].toString().split("T")[0];
        } else {
          f.value = emp[dataKey];
        }
      }
    });

    const hireDateField = document.getElementById("emp_date");
    hireDateField.readOnly = true;
    hireDateField.classList.add("bg-body-secondary");
  } catch (error) {
    console.error(error);
    showToast(error.message, "danger");
  }
}

async function populateDeptDropdown() {
  try {
    const deptDropdown = document.getElementById("emp_dept");
    deptDropdown.innerHTML =
      '<option value="" disabled selected>Select a department...</option>';
    const response = await getDepartmentList();
    const deptDetails = response.data ?? [];
    deptDetails.forEach((dept) => {
      const option = document.createElement("option");
      option.value = dept.id;
      option.textContent = dept.name;
      deptDropdown.appendChild(option);
    });
  } catch (error) {
    console.error("Error Occurred: ", error);
  }
}

async function saveOrEditEmployee(formData) {
  console.log("FormData", formData);
  console.log("Selected Id: ", selectedId);
  try {
    if (!formData.email?.trim()) {
      throw new Error("User email should not be empty.");
    }
    if (!formData.position?.trim()) {
      throw new Error("Position should not be empty.");
    }
    if (!formData.department_id || !formData.department_id.trim()) {
      throw new Error("Please select a department.");
    }
    if (!formData.hire_date?.trim()) {
      throw new Error("Please enter a hire date.");
    }
    if (!charactersOnly(formData.position.trim())) {
      throw new Error("Position contains numerical characters.");
    }

    const hireDate = new Date(formData.hire_date);
    if (isNaN(hireDate.getTime())) {
      throw new Error("Please enter a valid hire date.");
    }

    const todayDateStr = new Date().toLocaleDateString("en-CA");
    if (formData.hire_date > todayDateStr) {
      throw new Error("Hire date cannot be in the future.");
    }

    if (selectedId === null) {
      const response = await addNewEmployee(formData);
      if (!response.success) {
        throw new Error(response.error);
      }
      showToast(response.message, "success");
    } else {
      const editResponse = await editEmployee(selectedId, formData);
      if (!editResponse.success) {
        throw new Error(editResponse.error ?? "Edit failed.");
      }
      showToast(editResponse.message ?? "Employee updated successfully!", "success");
    }
    selectedId = null;
    renderEmployeeItems();
    closeEmpDetailCont();
  } catch (error) {
    console.error(error);
    showToast(error.message, "danger");
  }
}

async function renderEmployeeDetails() {
  try {
    if (!selectedId) {
      showToast("There is no selected id, try again.", "warning");
      return;
    }

    const modal_body = delEmpForm.querySelector(".modal-body");
    modal_body.innerHTML = "";

    const empResponse = await getEmployeeById(Number(selectedId));
    const emp = empResponse?.data ?? null;
    if (!emp) {
      showToast("Employee Not Found!", "danger");
      return;
    }

    const userResponse = await getUserById(Number(emp.user_id));
    const user = userResponse?.data ?? null;
    if (!user) {
      showToast("Account Not Found!", "danger");
      return;
    }

    const departmentResponse = await getDepartmentById(Number(emp.department_id));
    const department = departmentResponse?.data ?? null;
    if (!department) {
      showToast("Department not found!", "danger");
      return;
    }

    const dateObj = new Date(emp.hire_date);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const item = `
      <div class="bg-light rounded-3 p-3 border border-secondary-subtle">
        <div class="row mb-2">
          <div class="col-5 fw-bold text-secondary text-end">Email:</div>
          <div class="col-7 text-break fw-medium">${user.email}</div>
        </div>
        <div class="row mb-2">
          <div class="col-5 fw-bold text-secondary text-end">Position:</div>
          <div class="col-7 text-break fw-medium">${emp.position}</div>
        </div>
        <div class="row mb-2">
          <div class="col-5 fw-bold text-secondary text-end">Department:</div>
          <div class="col-7 text-break fw-medium">${department.name}</div>
        </div>
        <div class="row mb-0">
          <div class="col-5 fw-bold text-secondary text-end">Hire Date:</div>
          <div class="col-7 text-break fw-medium">${formattedDate}</div>
        </div>
      </div>
    `;
    modal_body.innerHTML = item;
  } catch (error) {
    console.error(error);
  }
}

async function deleteEmployeeHandler() {
  try {
    if (selectedId === null) {
      showToast("There is no selected id, try again.", "warning");
      return;
    }
    const response = await deleteEmployee(Number(selectedId));
    if (!response.success) {
      throw new Error(response.error);
    }
    console.log("Response Delete Employee: ", response);
    showToast(response.message ?? "Employee Deleted Successfully!", "success");
    selectedId = null;
    renderEmployeeItems();
    bootstrap.Modal.getOrCreateInstance(
      document.getElementById("delete-confirm-modal-emp"),
    ).hide();
  } catch (error) {
    console.error("An Error Occurred: ", error);
    showToast("An Error Occurred: " + error.message, "danger");
  }
}

// Employee event listeners

empForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = getDataFromTarget(e);
  saveOrEditEmployee(data);
});

empTableCont.addEventListener("click", (e) => {
  console.log("Hellooo");
  if (e.target.classList.contains("editEmpBtn")) {
    selectedId = e.target.dataset.id;
    console.log("Selected Id: ", selectedId);
    prefillEmpForm();
  } else if (e.target.classList.contains("delEmpBtn")) {
    selectedId = e.target.dataset.id;
    renderEmployeeDetails();
  }
});

const empConfirmDeleteBtn = document.getElementById("confirm-delete-emp-btn");
empConfirmDeleteBtn.addEventListener("click", (e) => {
  e.preventDefault();
  deleteEmployeeHandler();
});

// =============================================================================
// REQUESTS
// =============================================================================

const requestTableCont = document.getElementById("request-table-cont");
const requestForm = document.getElementById("request-form");
const requestItemContainer = document.getElementById("request-item-container");
const requestModal = document.getElementById("requestModal");

function renderRequestItems() {
  try {
    const requests = window.db.requests.filter(
      (r) => r.employeeEmail === currentUser.email,
    );
    requestTableCont.innerHTML = "";

    if (!requests || requests.length <= 0) {
      const row = `
        <tr>
          <td colspan="5" class="text-center bg-secondary-subtle">
            No requests yet.
          </td>
        </tr>`;
      requestTableCont.insertAdjacentHTML("beforeend", row);
      return;
    }

    requests.forEach((req) => {
      const dateObj = new Date(req.date);
      const formattedDate = dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      let badgeClass = "bg-warning text-dark";
      if (req.status === "Approved") badgeClass = "bg-success";
      else if (req.status === "Rejected") badgeClass = "bg-danger";

      const itemsList = req.items
        .map((item) => `${item.name} (x${item.qty})`)
        .join(", ");

      const row = `
      <tr>
        <th scope="row">${req.id}</th>
        <td>${req.type}</td>
        <td>${itemsList}</td>
        <td>${formattedDate}</td>
        <td><span class="badge ${badgeClass}">${req.status}</span></td>
      </tr>`;
      requestTableCont.insertAdjacentHTML("beforeend", row);
    });
  } catch (error) {
    console.error("Error Occurred: ", error);
  }
}

function addRequestItem() {
  const newItemRow = `
  <div class="d-flex align-items-center gap-1 w-100 request-item-row">
    <div class="flex-grow-1">
      <input type="text" class="form-control request-item-name" placeholder="Item name">
    </div>
    <div class="w-25">
      <input type="number" class="form-control request-item-qty" placeholder="Qty" min="1">
    </div>
    <div>
      <button type="button" class="btn btn-danger remove-request-item-btn">&times;</button>
    </div>
  </div>`;
  requestItemContainer.insertAdjacentHTML("beforeend", newItemRow);
}

function clearRequestForm() {
  requestForm.reset();
  requestItemContainer.innerHTML = `
    <div class="d-flex align-items-center gap-1 w-100 request-item-row">
      <div class="flex-grow-1">
        <input type="text" class="form-control request-item-name" placeholder="Item name">
      </div>
      <div class="w-25">
        <input type="number" class="form-control request-item-qty" placeholder="Qty" min="1">
      </div>
      <div>
        <button type="button" class="btn btn-secondary add-request-item-btn">+</button>
      </div>
    </div>`;
}

// Request event listeners
requestItemContainer.addEventListener("click", function (e) {
  if (e.target.classList.contains("add-request-item-btn")) {
    addRequestItem();
  } else if (e.target.classList.contains("remove-request-item-btn")) {
    const row = e.target.closest(".request-item-row");
    row.remove();
  }
});

requestForm.addEventListener("submit", (e) => {
  e.preventDefault();
  try {
    const type = document.getElementById("request-type").value;
    if (!type) {
      throw new Error("Please select a request type.");
    }

    const itemRows = requestItemContainer.querySelectorAll(".request-item-row");
    const items = [];
    itemRows.forEach((row) => {
      const name = row.querySelector(".request-item-name").value.trim();
      const qty = parseInt(row.querySelector(".request-item-qty").value);
      if (name && qty > 0) {
        items.push({ name, qty });
      }
    });

    if (items.length === 0) {
      throw new Error(
        "Please add at least one item with a valid name and quantity.",
      );
    }

    const requests = window.db.requests;
    const reqIdCount =
      requests.length === 0 ? 1 : requests[requests.length - 1].id + 1;

    const newRequest = {
      id: reqIdCount,
      type: type,
      items: items,
      status: "Pending",
      date: new Date().toISOString(),
      employeeEmail: currentUser.email,
    };

    window.db.requests.push(newRequest);
    saveToStorage();
    clearRequestForm();
    renderRequestItems();
    bootstrap.Modal.getOrCreateInstance(requestModal).hide();
    showToast("Request submitted successfully!", "success");
  } catch (error) {
    console.error("An Error Occurred: ", error);
    showToast(error.message, "danger");
  }
});

// =============================================================================
// INITIALIZATION
// =============================================================================

initializePasswordToggles();

// Home
document.getElementById("get-started-btn").addEventListener("click", () => navigateTo("#/login"));

// Login
document.getElementById("login-cancel-btn").addEventListener("click", () => navigateTo("#/home"));

// Register
document.getElementById("register-cancel-btn").addEventListener("click", () => navigateTo("#/home"));

// Verify
document.getElementById("verify-email-btn").addEventListener("click", () => verifyEmailHandler());
document.getElementById("go-to-login-btn").addEventListener("click", () => navigateTo("#/login"));

// Employees
document.getElementById("add-emp-btn").addEventListener("click", () => openEmpDetailCont());
document.getElementById("emp-cancel-btn").addEventListener("click", () => closeEmpDetailCont());

// Accounts
document.getElementById("add-account").addEventListener("click", () => openAccountForm());
document.getElementById("acc-cancel-btn").addEventListener("click", () => closeAccountForm());