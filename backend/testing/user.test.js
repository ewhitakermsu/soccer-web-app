const request = require('supertest');
const {app,db} = require('../server'); // this exports my app

describe('User Registration, Login, and Profile', () => {
  const testUser = {
    firstName: 'Test',
    lastName: 'User2',
    email: 'testuser2@example.com',
    password: 'Password123',
    birthDate: '01-01-2000',
    gender: 'Other',
    heightFeet: 5,
    heightInches: 10,
    preferredPosition: 'Midfielder',
    dominantFoot: 'Right'
  };

  let authToken;

  afterAll((done) => {
    // Delete test user after tests
    db.run('DELETE FROM USERS WHERE email = ?', [testUser.email], done);
  });

  //Unit test for user registration
  test('POST /register - should register user successfully', async () => {
    const response = await request(app)
      .post('/register')
      .send(testUser);

    expect(response.status).toBe(200);
    expect(response.body.message).toContain('Successful registration');
  });

  //Unit test for user login
  test('POST /login - should login and return token', async () => {
    const response = await request(app)
      .post('/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.message).toContain('Access granted');
    authToken = response.body.token;
  });

  //Unit test for retrieving the information for the user profile from the database
  test('GET /api/mydatabase/users - should fetch user profiles without password', async () => {
    const response = await request(app)
      .get('/api/mydatabase/users')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    const user = response.body.find(u => u.email === testUser.email);
    expect(user).toMatchObject({
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      email: testUser.email,
      birthDate: testUser.birthDate,
      gender: testUser.gender,
      heightFeet: testUser.heightFeet,
      heightInches: testUser.heightInches,
      preferredPosition: testUser.preferredPosition,
      dominantFoot: testUser.dominantFoot
    });
  });

// JWT-protected route test: valid token
test('GET /protected - should return 200 with valid JWT', async () => {
    const response = await request(app)
      .get('/protected') // Replace with an actual protected route
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Protected route accessed successfully');
  });

  const invalidToken = 'invalid.jwt.token';
  // JWT-protected route test: invalid token
  test('GET /protected - should return 401 with invalid JWT', async () => {
    const response = await request(app)
      .get('/protected') // Replace with an actual protected route
      .set('Authorization', `Bearer ${invalidToken}`);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Unauthorized');
  });

  // JWT-protected route test: missing token
  test('GET /protected - should return 401 when no token is provided', async () => {
    const response = await request(app)
      .get('/protected'); // Replace with an actual protected route

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Unauthorized');
  });
});