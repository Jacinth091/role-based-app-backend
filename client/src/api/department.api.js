import { backendConnection } from "../config.js";
import { getHeaders } from './header.js'


async function getDepartmentList() {
    try {
        const response = await fetch(`${backendConnection}/department/`, {
            method: "GET",
            headers: getHeaders()
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

async function getDepartmentById(id) {
    try {
        const response = await fetch(`${backendConnection}/department/${id}`, {
            method: "GET",
            headers: getHeaders()
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

export { getDepartmentList, getDepartmentById };
