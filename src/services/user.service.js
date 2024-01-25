import axios from 'axios';
import authHeader from './auth-header';

const API_URL = process.env.REACT_APP_API_URL + ":" + process.env.REACT_APP_API_PORT + '/api/';

class UserService {
    getAllDevices() {
        return axios.get(API_URL + 'devices', { headers: authHeader() });
    }
}

export default new UserService();