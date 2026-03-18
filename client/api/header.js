export default function getAuthHeader() {
    const token = sessionStorage.getItem('authToken');
    return token ? {Authorization: `Bearer ${token}`} : {};
}

