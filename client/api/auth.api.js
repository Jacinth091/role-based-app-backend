import {backendConnection} from '../config.js';

async function login(userStr, password) {
    try {
        const response  = await fetch(`${backendConnection}/login`, {
            method: 'POST',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify({userStr, password})
        })
        console.log("Response: ", response);

        const data = await response.json();

        console.log("Data: ",data);
        if(response.ok){
            sessionStorage.setItem('authToken', data.token);
        }
        else{
            alert('Login Failed: ' + data.error);
        }
    } catch (error) {
        console.error('Network Error: ', error);
        alert('Network Error');
    }    
}

export {login};