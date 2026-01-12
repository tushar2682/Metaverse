const axios = require('axios');

const BackendURL = 'http://localhost:3000/api';

function sum(a, b) {
  return a + b;
}
describe('Authentication',() => {
    test('user is signing up correctly', async () => {
        const username='tushar'+Math.random().toString(36).substring(7);
        const password='password123';
    axios.post(`${BackendURL}/api/v1/signup`, {
        username,
        password,
        type:"admin"
    });
    expect(response.statusCode).toBe(200);

    const updatedresponse = await axios.post(`${BackendURL}/api/v1/login`, {
        username,
        password
    });
    expect(updatedresponse.statusCode).toBe(400);
    }
    );
});
test('signup failed if username empty', async () => {
    const username='';
    const password='password123';
    const response = await axios.post(`${BackendURL}/api/v1/signup`, {
        username,
        password,
        type:"admin"
    });
    expect(response.statusCode).toBe(400);
}
);
test('login failed if password incorrect', async () => {
    const username='tushar';
    const password='wrongpassword';
    const response = await axios.post(`${BackendURL}/api/v1/login`, {
        username,
        password
    });
    expect(response.statusCode).toBe(400);
}
);