import { backendConnection } from "../config.js";

async function login(userStr, password) {
  try {
    const response = await fetch(`${backendConnection}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userStr, password }),
    });
    const data = await response.json();
    console.log("Response from api: ", data);
    if (response.ok) {
      sessionStorage.setItem("authToken", data.token);
      return data;
    } else {
      return data;
    }
  } catch (error) {
    console.error("Network Error: ", error);
    return null;
  }
}


async function register(formData) {
  try {
    const response = await fetch(`${backendConnection}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Network Error: ", error);
  }
}

async function verifyEmail(email) {
  try {
    const response = await fetch(`${backendConnection}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Network Error: ", error);
  }
}

export { login, register, verifyEmail };
