
import axios from "axios"

const axiosClient =  axios.create({
    // baseURL: 'http://localhost:5001',
    baseURL: 'https://sn-bose.onrender.com/',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});


export default axiosClient;

