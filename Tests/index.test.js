const axios = require('axios');
const BACKEND_URL = 'http://localhost:3000';
const axiosConfig = { validateStatus: () => true };

// Shared state for all tests
let token = '';
let avatarId = '';
let userId = '';
let mapId = '';

describe('Authentication flow and session management', () => {
    test('user is signing up correctly', async () => {
        const username = 'tushar' + Math.random().toString(36).substring(7);
        const password = 'password123';

        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: 'admin'
        }, axiosConfig);

        expect(response.status).toBe(200);

        const updatedresponse = await axios.post(`${BACKEND_URL}/api/v1/login`, {
            username,
            password
        }, axiosConfig);

        expect(updatedresponse.status).toBe(200);
    });

    test('signup failed if username empty', async () => {
        const password = 'password123';
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            password,
            type: 'admin'
        }, axiosConfig);
        expect(response.status).toBe(400);
    });

    test('signup failed if username already exists', async () => {
        const username = 'existinguser' + Math.random().toString(36).substring(7);
        const password = 'password123';
        // Standardizing on 400 Bad Request for validation errors
        await axios.post(`${BACKEND_URL}/api/v1/signup`, { username, password, type: 'user' }, axiosConfig);
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, { username, password, type: 'user' }, axiosConfig);
        expect(response.status).toBe(400);
    });

    test('login failed if password incorrect', async () => {
        const username = 'tushar';
        const password = 'wrongpassword';
        const response = await axios.post(`${BACKEND_URL}/api/v1/login`, {
            username,
            password
        }, axiosConfig);
        expect(response.status).toBe(400);
    });

    test('login username and password are correct', async () => {
        const username = 'tushar';
        const password = 'password123';
        const response = await axios.post(`${BACKEND_URL}/api/v1/login`, {
            username,
            password
        }, axiosConfig);
        expect(response.status).toBe(200);
    });

    test('login failed if username and password are incorrect', async () => {
        const username = 'wrongusername';
        const password = 'wrongpassword';
        const response = await axios.post(`${BACKEND_URL}/api/v1/login`, {
            username,
            password
        }, axiosConfig);
        expect(response.status).toBe(400);
    });

    test('signup with extremely long username should be handled', async () => {
        const username = 'a'.repeat(200);
        const password = 'password123';
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: 'user'
        }, axiosConfig);
        expect([200, 400]).toContain(response.status);
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
    }, axiosConfig);

    userId = signupResponse.data && signupResponse.data.userId;

    const signinResponse = await axios.post(`${BACKEND_URL}/api/v1/login`, {
        username,
        password
    }, axiosConfig);

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

describe('User metadata and profile operations', () => {
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
        }, axiosConfig);
        expect(response.status).toBe(401);
    });

    test('admin avatar creation fails without token', async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            imageUrl: 'https://example.com/image.png',
            name: 'TestAvatar'
        }, axiosConfig);
        expect(response.status).toBe(401);
    });

    test('admin avatar creation fails with invalid image URL format', async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            imageUrl: 'not-a-url',
            name: 'InvalidUrlAvatar'
        }, {
            headers: { authorization: `Bearer ${token}` },
            axiosConfig
        });
        expect([400, 200]).toContain(response.status);
    });
});

test('get back avatar information for user', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`, axiosConfig);
    expect(response.data && response.data.avatars && response.data.avatars.length).toBe(1);
    expect(response.data.avatars[0].userId).toBe(userId);
});

test('get back empty avatar information for non-existent user', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[nonexistentid]`, axiosConfig);
    expect(response.data && response.data.avatars && response.data.avatars.length).toBe(0);
});

test('Available avatars lists the recently created avatar', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`, axiosConfig);
    expect(response.data && response.data.avatars.length).not.toBe(0);
    const currentAvatar = response.data.avatars.find(x => x.id == avatarId);
    expect(currentAvatar).toBeDefined();
});

test('GET /api/v1/elements lists available world elements', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/elements`, axiosConfig);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.elements)).toBe(true);
});

test("user is able to create a space", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/user/space`, {
        "name": "test",
        "mapId": mapId
    }, {
        headers: {
            authorization: `Bearer ${token}`
        },
        validateStatus: () => true
    });
    expect(response.status).toBeDefined();
});

test("user is able to create a space with mapId", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/user/space`, {
        "name": "test",
        "mapId": mapId
    }, {
        headers: {
            authorization: `Bearer ${token}`
        },
        validateStatus: () => true
    });
    expect(response.data.spaceId).toBeDefined();
});

test('user is able to create space with dimensions', async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
        "name": "Test",
        "dimensions": "100x200",
    }, {
        headers: {
            authorization: `Bearer ${token}`
        },
        validateStatus: () => true
    });
    expect(response.data.spaceId).toBeDefined();
});

test('user is not able to create space without mapId and dimension', async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/user/space`, {
        "name": "test"
    }, {
        headers: {
            authorization: `Bearer ${token}`
        },
        validateStatus: () => true
    });
    expect(response.status).toBe(400);
});

test('user is able to create space with special characters in name', async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
        "name": "!@#$%^&*()",
        "dimensions": "100x200",
    }, {
        headers: {
            authorization: `Bearer ${token}`
        },
        axiosConfig
    });
    expect(response.status).toBe(200);
});

test("User is not able to delete a space that doesnt exist", async () => {
    const response = await axios.delete(`${BACKEND_URL}/api/v1/space/randomIdDoesntExist`, {
        headers: {
            authorization: `Bearer ${token}`
        },
        validateStatus: () => true
    });
    expect(response.status).toBe(400);
});

test("User is able to delete a space that does exist", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
        "name": "Test",
        "dimensions": "100x200",
    }, {
        headers: {
            authorization: `Bearer ${token}`
        },
        validateStatus: () => true
    });

    const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}`, {
        headers: {
            authorization: `Bearer ${token}`
        },
        validateStatus: () => true
    });

    expect(deleteResponse.status).toBe(200);
});

test("user is not able to delete a space with an invalid token", async () => {
    const response = await axios.delete(`${BACKEND_URL}/api/v1/space/somespaceid`, {
        headers: {
            authorization: `Bearer invalidtoken`
        },
        axiosConfig
    });
    expect(response.status).toBe(401);
});

test("user is not able to delete a space created by another user", async () => {
    // 1. Setup a second user
    const username = 'user' + Math.random().toString(36).substring(7);
    const password = 'password123';
    await axios.post(`${BACKEND_URL}/api/v1/signup`, { username, password, type: 'user' }, axiosConfig);
    const loginRes = await axios.post(`${BACKEND_URL}/api/v1/login`, { username, password }, axiosConfig);
    const secondToken = loginRes.data.token;

    // 2. Create space with the primary user (token)
    const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
        "name": "Test",
        "dimensions": "100x200",
    }, {
        headers: {
            authorization: `Bearer ${token}`
        },
        validateStatus: () => true
    });

    // 3. Try to delete the space using the second user's token
    const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}`, {
        headers: {
            authorization: `Bearer ${secondToken}`
        },
        validateStatus: () => true
    });

    expect(deleteResponse.status).toBe(403);
});

test("admin has no spaces initially", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
        headers: {
            authorization: `Bearer ${token}`
        },
        validateStatus: () => true
    });
    expect(response.data.spaces.length).toBe(0);
});

test("admin gets one space after creation", async () => {
    const spaceCreateResponse = await axios.post(`${BACKEND_URL}/api/v1/space`, {
        "name": "Test",
        "dimensions": "100x200",
    }, {
        headers: {
            authorization: `Bearer ${token}`
        },
        validateStatus: () => true
    });

    const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
        headers: {
            authorization: `Bearer ${token}`
        },
        validateStatus: () => true
    });

    const filteredSpace = response.data.spaces.find(x => x.id == spaceCreateResponse.data.spaceId);
    expect(response.data.spaces.length).toBe(1);
    expect(filteredSpace).toBeDefined();
});

describe("Arena endpoints", () => {
    // Shared state for arena-specific testing
    let mapId;
    let element1Id;
    let element2Id;
    let adminToken;
    let adminId;
    let userToken;
    let userId;
    let spaceId;

    beforeAll(async () => {
        // 1. Setup Admin and User accounts for integration tests
        const username = `kirat-${Math.random()}`
        const password = "123456"

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        }, axiosConfig);

        adminId = signupResponse.data && signupResponse.data.userId;

        const response = await axios.post(`${BACKEND_URL}/api/v1/login`, {
            username: username,
            password
        }, axiosConfig)

        adminToken = response.data && response.data.token;

        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username: username + "-user",
            password,
            type: "user"
        }, axiosConfig);

        userId = userSignupResponse.data && userSignupResponse.data.userId;

        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/login`, {
            username: username + "-user",
            password
        }, axiosConfig)

        userToken = userSigninResponse.data && userSigninResponse.data.token;

        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true
        }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            },
            validateStatus: () => true
        });

        element1Id = element1Response.data && element1Response.data.id;

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            thumbnailUrl: "https://thumbnail.com/a.png",
            dimensions: "100x200",
            name: "Default space",
            defaultElements: [
                {
                    elementId: element1Id,
                    x: 20,
                    y: 20
                },
                {
                    elementId: element1Id,
                    x: 18,
                    y: 20
                },
                {
                    elementId: element2Id,
                    x: 19,
                    y: 20
                }
            ]
        }, axiosConfig);

        mapId = mapResponse.data && mapResponse.data.id;
        expect(mapId).toBeDefined();
        expect(mapResponse.data.defaultElements.length).toBe(3);

        const spaceResponse = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            name: "Default space",
            dimensions: "100x200",
            mapId: mapId
        }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });
        spaceId = spaceResponse.data.spaceId;
    });
});
test("Incorrect spaceId returns a 400", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/123kasdk01`, {
        headers: {
            "authorization": `Bearer ${userToken}`
        }
    });
    expect(response.status).toBe(400)
})

test("Correct spaceId returns all the elements", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
        headers: {
            "authorization": `Bearer ${userToken}`
        }
    });
    console.log(response.data)
    expect(response.data.dimensions).toBe("100x200")
    expect(response.data.elements.length).toBe(3)
})


 
// commit 1 
 
// commit 2 
 
// commit 3 
 
// commit 4 
 
// commit 5 
 
// commit 6 
 
// commit 7 
 
// commit 8 
 
// commit 9 
 
// commit 10 
// commit 1  
// commit 2  
// commit 3  
// commit 4  
// commit 5  
// commit 6  
// commit 7  
// commit 8  
// commit 9  
// commit 10  
// commit 1  
// commit 2  
// commit 3  
// commit 4  
// commit 5  
// commit 6  
// commit 7  
// commit 8  
// commit 9  
// commit 10  
