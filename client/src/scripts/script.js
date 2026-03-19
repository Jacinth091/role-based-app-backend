import { loadFromStorage } from "./modules/db.js";
import { configureNavbar, initializePasswordToggles } from "./modules/ui.js";
import { handleRouting, navigateTo } from "./modules/router.js";
import { 
  currentUser, 
  setAuthState, 
  loginHandler, 
  registerHandler, 
  logout, 
  verifyEmailHandler
} from "./modules/auth.js";
import { renderProfile } from "./modules/profile.js";
import { initAccounts, renderAccountsList } from "./modules/accounts.js";
import { initDepartments, renderDepartmentItems } from "./modules/departments.js";
import { initEmployees, renderEmployeeItems } from "./modules/employees.js";
import { initRequests, renderRequestItems } from "./modules/requests.js";

// Initialize App
window.addEventListener("load", () => {
  // loadFromStorage();
  
  // const currentLoggedEmail = localStorage.getItem("auth_token");
  // let isLoggedIn = false;
  
  // if (currentLoggedEmail) {
  //   const user = window.db.accounts.find((u) => u.email === currentLoggedEmail);
  //   if (user) {
  //     setAuthState(true, user);
  //     configureNavbar(true, user);
  //     renderProfile(user);
  //     isLoggedIn = true;
  //   }
  // }

  if (!window.location.hash || window.location.hash === "#/") {
    if (isLoggedIn) {
      window.location.hash = "#/profile";
    } else {
      window.location.hash = "#/home";
    }
  } else {
    handleRouting(currentUser);
  }

  // Global event listeners
  window.addEventListener("hashchange", () => {
    handleRouting(currentUser);
  });

  // Attach global handlers for HTML onclicks
  window.navigateTo = navigateTo;
  window.verifyEmail = verifyEmailHandler;
  
  // Initialize module-specific listeners
  initAccounts(currentUser);
  initDepartments();
  initEmployees();
  initRequests(currentUser);

  // Auth form listeners
  document.getElementById("loginForm")?.addEventListener("submit", (e) => {
    loginHandler(e, () => renderProfile(currentUser));
  });
  document.getElementById("registerForm")?.addEventListener("submit", registerHandler);
  document.getElementById("logout")?.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });

  initializePasswordToggles();
});
