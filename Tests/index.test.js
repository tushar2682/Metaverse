const axios = require('axios');

const BACKEND_URL = 'http://localhost:3000';

// shared variables for tests that need a created user + avatar
let token = '';
let avatarId = '';
let userId = '';
let mapId = '';

// Helper: always allow inspecting non-2xx responses rather than throwing
const validate = { validateStatus: () => true };

describe('Authentication', () => {
    test('user is signing up correctly', async () => {
        const username = 'tushar' + Math.random().toString(36).substring(7);
        const password = 'password123';

        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: 'admin'
        }, validate);

        expect(response.status).toBe(200);

        const updatedresponse = await axios.post(`${BACKEND_URL}/api/v1/login`, {
            username,
            password
        }, validate);

        expect(updatedresponse.status).toBe(200);
    });

    test('signup failed if username empty', async () => {
        const password = 'password123';
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            password,
            type: 'admin'
        }, validate);
        expect(response.status).toBe(400);
    });

    test('login failed if password incorrect', async () => {
        const username = 'tushar';
        const password = 'wrongpassword';
        const response = await axios.post(`${BACKEND_URL}/api/v1/login`, {
            username,
            password
        }, validate);
        expect(response.status).toBe(400);
    });

    test('login username and password are correct', async () => {
        const username = 'tushar';
        const password = 'password123';
        const response = await axios.post(`${BACKEND_URL}/api/v1/login`, {
            username,
            password
        }, validate);
        expect(response.status).toBe(200);
    });

    test('login failed if username and password are incorrect', async () => {
        const username = 'wrongusername';
        const password = 'wrongpassword';
        const response = await axios.post(`${BACKEND_URL}/api/v1/login`, {
            username,
            password
        }, validate);
        expect(response.status).toBe(400);
    });
});
