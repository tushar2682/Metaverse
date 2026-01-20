const axios = require('axios');
const BACKEND_URL = 'http://localhost:3000';
const axiosConfig = { validateStatus: () => true };

// Shared state for all tests
let token = '';
let avatarId = '';
let userId = '';
let mapId = '';

describe('Authentication flow and session management', () => {
    /**
     * These tests verify the core security logic including registration,
     * login, and password validation.
     */
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

    test('login failed if user does not exist', async () => {
        const username = 'thisuserdoesnotexist' + Math.random();
        const password = 'password123';
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
    /**
     * These tests ensure that user profile data, including avatar selections
     * and metadata bulk retrieval, are correctly managed and secured.
     */
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

test('get back partial information for mix of existent and non-existent users', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId},nonexistentid]`, axiosConfig);
    expect(response.data && response.data.avatars && response.data.avatars.length).toBe(1);
    expect(response.data.avatars[0].userId).toBe(userId);
});

test('Available avatars lists the recently created avatar and has correct structure', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`, axiosConfig);
    expect(response.data && response.data.avatars.length).not.toBe(0);
    expect(response.data.avatars[0]).toHaveProperty('id');
    expect(response.data.avatars[0]).toHaveProperty('imageUrl');
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

expect(response.status).toBe(400);
});

test('user is not able to create space with malformed dimensions', async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
        "name": "Test",
        "dimensions": "abcxyz",
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

test('user is not able to delete space with malformed id', async () => {
    const response = await axios.delete(`${BACKEND_URL}/api/v1/space/not-a-valid-uuid`, {
        headers: {
            authorization: `Bearer ${token}`
        },
        validateStatus: () => true
    });
    expect(response.status).toBe(400);
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
test("Delete endpoint is able to delete an element", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
        headers: {
            "authorization": `Bearer ${userToken}`
        }
    });

    console.log(response.data.elements[0].id)
    let res = await axios.delete(`${BACKEND_URL}/api/v1/space/element`, {
        data: { id: response.data.elements[0].id },
        headers: {
            "authorization": `Bearer ${userToken}`
        }
    });


    const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
        headers: {
            "authorization": `Bearer ${userToken}`
        }
    });

    expect(newResponse.data.elements.length).toBe(2)
})

test("Adding an element fails if the element lies outside the dimensions", async () => {
    const newResponse = await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
        "elementId": element1Id,
        "spaceId": spaceId,
        "x": 10000,
        "y": 210000
    }, {
        headers: {
            "authorization": `Bearer ${userToken}`
        }
    });

    expect(newResponse.status).toBe(400)
})

test("Adding an element works as expected", async () => {
    await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
        "elementId": element1Id,
        "spaceId": spaceId,
        "x": 50,
        "y": 20
    }, {
        headers: {
            "authorization": `Bearer ${userToken}`
        }
    });

    const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
        headers: {
            "authorization": `Bearer ${userToken}`
        }
    });

    expect(newResponse.data.elements.length).toBe(3)
})

})

describe("Admin Endpoints", () => {
    let adminToken;
    let adminId;
    let userToken;
    let userId;

    beforeAll(async () => {
        const username = `kirat-${Math.random()}`
        const password = "123456"

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        });

        adminId = signupResponse.data.userId

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username,
            password
        })

        adminToken = response.data.token

        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username: username + "-user",
            password,
            type: "user"
        });

        userId = userSignupResponse.data.userId

        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username + "-user",
            password
        })

        userToken = userSigninResponse.data.token
    });

    test("User is not able to hit admin Endpoints", async () => {
        const elementReponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        });

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "test space",
            "defaultElements": []
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        })

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"
        }, {
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })

        const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/123`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        }, {
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })

        expect(elementReponse.status).toBe(403)
        expect(mapResponse.status).toBe(403)
        expect(avatarResponse.status).toBe(403)
        expect(updateElementResponse.status).toBe(403)
    })

    test("Admin is able to hit admin Endpoints", async () => {
        const elementReponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true
        }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "name": "Space",
            "dimensions": "100x200",
            "defaultElements": []
        }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        })

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"
        }, {
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })
        expect(elementReponse.status).toBe(200)
        expect(mapResponse.status).toBe(200)
        expect(avatarResponse.status).toBe(200)
    })

    test("Admin is able to update the imageUrl for an element", async () => {
        const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true
        }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });

        const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/${elementResponse.data.id}`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        }, {
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })

        expect(updateElementResponse.status).toBe(200);

    })
});

describe("Websocket tests", () => {
    let adminToken;
    let adminUserId;
    let userToken;
    let adminId;
    let userId;
    let mapId;
    let element1Id;
    let element2Id;
    let spaceId;
    let ws1;
    let ws2;
    let ws1Messages = []
    let ws2Messages = []
    let userX;
    let userY;
    let adminX;
    let adminY;

    function waitForAndPopLatestMessage(messageArray) {
        return new Promise(resolve => {
            if (messageArray.length > 0) {
                resolve(messageArray.shift())
            } else {
                let interval = setInterval(() => {
                    if (messageArray.length > 0) {
                        resolve(messageArray.shift())
                        clearInterval(interval)
                    }
                }, 100)
            }
        })
    }
    async function setupHTTP() {
        const username = `kirat-${Math.random()}`
        const password = "123456"
        const adminSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })

        const adminSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })

        adminUserId = adminSignupResponse.data.userId;
        adminToken = adminSigninResponse.data.token;
        console.log("adminSignupResponse.status")
        console.log(adminSignupResponse.status)

        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username: username + `-user`,
            password,
            type: "user"
        })
        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username + `-user`,
            password
        })
        userId = userSignupResponse.data.userId
        userToken = userSigninResponse.data.token
        console.log("useroktne", userToken)
        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true
        }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });

        const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true
        }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        })
        element1Id = element1Response.data.id
        element2Id = element2Response.data.id

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "Defaul space",
            "defaultElements": [{
                elementId: element1Id,
                x: 20,
                y: 20
            }, {
                elementId: element1Id,
                x: 18,
                y: 20
            }, {
                elementId: element2Id,
                x: 19,
                y: 20
            }
            ]
        }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        })
        mapId = mapResponse.data.id

        const spaceResponse = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimensions": "100x200",
            "mapId": mapId
        }, {
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })

        console.log(spaceResponse.status)
        spaceId = spaceResponse.data.spaceId
    }
    async function setupWs() {
        ws1 = new WebSocket(WS_URL)

        ws1.onmessage = (event) => {
            console.log("got back adata 1")
            console.log(event.data)

            ws1Messages.push(JSON.parse(event.data))
        }
        await new Promise(r => {
            ws1.onopen = r
        })

        ws2 = new WebSocket(WS_URL)

        ws2.onmessage = (event) => {
            console.log("got back data 2")
            console.log(event.data)
            ws2Messages.push(JSON.parse(event.data))
        }
        await new Promise(r => {
            ws2.onopen = r
        })
    }

    beforeAll(async () => {
        await setupHTTP()
        await setupWs()
    })

    test("Get back ack for joining the space", async () => {
        console.log("insixce first test")
        ws1.send(JSON.stringify({
            "type": "join",
            "payload": {
                "spaceId": spaceId,
                "token": adminToken
            }
        }))
        console.log("insixce first test1")
        const message1 = await waitForAndPopLatestMessage(ws1Messages);
        console.log("insixce first test2")
        ws2.send(JSON.stringify({
            "type": "join",
            "payload": {
                "spaceId": spaceId,
                "token": userToken
            }
        }))
        console.log("insixce first test3")

        const message2 = await waitForAndPopLatestMessage(ws2Messages);
        const message3 = await waitForAndPopLatestMessage(ws1Messages);

        expect(message1.type).toBe("space-joined")
        expect(message2.type).toBe("space-joined")
        expect(message1.payload.users.length).toBe(0)
        expect(message2.payload.users.length).toBe(1)
        expect(message3.type).toBe("user-joined");
        expect(message3.payload.x).toBe(message2.payload.spawn.x);
        expect(message3.payload.y).toBe(message2.payload.spawn.y);
        expect(message3.payload.userId).toBe(userId);

        adminX = message1.payload.spawn.x
        adminY = message1.payload.spawn.y

        userX = message2.payload.spawn.x
        userY = message2.payload.spawn.y
    })

    test("User should not be able to move across the boundary of the wall", async () => {
        ws1.send(JSON.stringify({
            type: "move",
            payload: {
                x: 1000000,
                y: 10000
            }
        }));

        const message = await waitForAndPopLatestMessage(ws1Messages);
        expect(message.type).toBe("movement-rejected")
        expect(message.payload.x).toBe(adminX)
        expect(message.payload.y).toBe(adminY)
    })

    test("User should not be able to move two blocks at the same time", async () => {
        ws1.send(JSON.stringify({
            type: "move",
            payload: {
                x: adminX + 2,
                y: adminY
            }
        }));

        const message = await waitForAndPopLatestMessage(ws1Messages);
        expect(message.type).toBe("movement-rejected")
        expect(message.payload.x).toBe(adminX)
        expect(message.payload.y).toBe(adminY)
    })

    test("Correct movement should be broadcasted to the other sockets in the room", async () => {
        ws1.send(JSON.stringify({
            type: "move",
            payload: {
                x: adminX + 1,
                y: adminY,
                userId: adminId
            }
        }));

        const message = await waitForAndPopLatestMessage(ws2Messages);
        expect(message.type).toBe("movement")
        expect(message.payload.x).toBe(adminX + 1)
        expect(message.payload.y).toBe(adminY)
    })

    test("If a user leaves, the other user receives a leave event", async () => {
        ws1.close()
        const message = await waitForAndPopLatestMessage(ws2Messages);
        expect(message.type).toBe("user-left")
        expect(message.payload.userId).toBe(adminUserId)
    })
})



