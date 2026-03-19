import { backendConnection } from '../config.js';
import { getHeaders } from './header.js';



async function getUserById(id) {
    try {
        const response = await fetch(`${backendConnection}/admin/user/${id}`, {
            method: "GET",
            headers: getHeaders()
        })
        const data = await response.json();
        console.log("Response from backend: ", data);
        if (response.ok) {
            return data;
        } else {
            return data;
        }
    } catch (error) {
        console.error("Network Error: ", error);
        return null;
    }
}

async function getAccountsList() {
    try {
        const response = await fetch(`${backendConnection}/admin/user/`, {
            method: "GET",
            headers: getHeaders()
        })
        const data = await response.json();
        console.log("Response from backend: ", data);
        if (response.ok) {
            return data;
        } else {
            return data;
        }
    } catch (error) {
        console.error("Network Error: ", error);
        return null;
    }
}

async function createAccount(accountData) {
    try {
        const response = await fetch(`${backendConnection}/admin/user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getHeaders()
            },
            body: JSON.stringify(accountData)
        });
        const data = await response.json();
        console.log("Response from backend: ", data);
        if (response.ok) {
            return data;
        } else {
            return data;
        }
    } catch (error) {
        console.error("Network Error: ", error);
        return null;
    }
}

async function editAccount(id, accountData) {
    try {
        const response = await fetch(`${backendConnection}/admin/user/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...getHeaders()
            },
            body: JSON.stringify(accountData)
        });
        const data = await response.json();
        console.log("Response from backend: ", data);
        if (response.ok) {
            return data;
        } else {
            return data;
        }
    } catch (error) {
        console.error("Network Error: ", error);
        return null;
    }
}

async function deleteAccount(id) {
    try {
        const response = await fetch(`${backendConnection}/admin/user/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                ...getHeaders()
            },
        });
        const data = await response.json();
        console.log("Response from backend: ", data);
        if (response.ok) {
            return data;
        } else {
            return data;
        }
    } catch (error) {
        console.error("Network Error: ", error);
        return null;
    }
}

async function resetAccountPassword(id, passwordData) {
    try {
        const response = await fetch(`${backendConnection}/admin/user/${id}/reset-password`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...getHeaders()
            },
            body: JSON.stringify(passwordData)
        });
        const data = await response.json();
        console.log("Response from backend: ", data);
        if (response.ok) {
            return data;
        } else {
            return data;
        }
    } catch (error) {
        console.error("Network Error: ", error);
        return null;
    }
}

export { getUserById, getAccountsList, createAccount, editAccount, deleteAccount, resetAccountPassword }