const axios = require('axios');

const BACKEND_URL = 'http://localhost:3000';

function sum(a, b) {
    return a + b;
}

// shared variables for tests that need a created user + avatar
let token = '';
let avatarId = '';
let userId = '';

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

// Create a user + avatar once for the user/avatar-related tests
beforeAll(async () => {
    const username = `tushar-${Math.random()}`;
    const password = '123456';

    const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
        username,
        password,
        type: 'admin'
    }, validate);

    userId = signupResponse.data && signupResponse.data.userId;

    const signinResponse = await axios.post(`${BACKEND_URL}/api/v1/login`, {
        username,
        password
    }, validate);

    token = signinResponse.data && signinResponse.data.token;

    const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s',
        name: 'Tommy'
    }, {
        headers: { authorization: `Bearer ${token}` },
        validateStatus: () => true
    });

    avatarId = avatarResponse.data && avatarResponse.data.avatarId;
});

describe('user endpoint data', () => {
    test('user cant update metadata with wrong avatar id', async () => {
        const response = await axios.put(`${BACKEND_URL}/api/v1/user/avatar/wrongid`, {
            name: 'NewName'
        }, {
            headers: { authorization: `Bearer ${token}` },
            validateStatus: () => true
        });
        expect(response.status).toBe(400);
    });

    test('user can update metadata with correct avatar id', async () => {
        const response = await axios.put(`${BACKEND_URL}/api/v1/user/avatar/${avatarId}`, {
            name: 'NewName'
        }, {
            headers: { authorization: `Bearer ${token}` },
            validateStatus: () => true
        });
        expect(response.status).toBe(200);
    });

    test('user cant update metadata if the auth header is not provided', async () => {
        const response = await axios.put(`${BACKEND_URL}/api/v1/user/avatar/${avatarId}`, {
            name: 'NewName'
        }, validate);
        expect(response.status).toBe(401);
    });
});

test('get back avatar information for user', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`, validate);
    expect(response.data && response.data.avatars && response.data.avatars.length).toBe(1);
    expect(response.data.avatars[0].userId).toBe(userId);
});

test('Available avatars lists the recently created avatar', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`, validate);
    expect(response.data && response.data.avatars.length).not.toBe(0);
    const currentAvatar = response.data.avatars.find(x => x.id == avatarId);
    expect(currentAvatar).toBeDefined();
});

