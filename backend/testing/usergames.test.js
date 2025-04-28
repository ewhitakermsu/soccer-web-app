const request = require('supertest');
const {app,db} = require('../server'); // this exports my app
const jwt = require("jsonwebtoken");

describe('Player join game, leave game, and view players', () => {
    let authToken;
    let gameId;
    let userIdFromToken;

     // Cleanup the game and user after tests
     afterAll((done) => {
        if (gameId) {
          db.run('DELETE FROM GAMES WHERE GameID = ?', [gameId], () => {
            if (userIdFromToken) {
              db.run('DELETE FROM USERS WHERE UserID = ?', [userIdFromToken], done);
            } else {
              done();
            }
          });
        } else {
          done();
        }
      });
  
    beforeAll(async () => {
      // Register a user (or use login route)
      const userData = {
        firstName: 'Test',
        lastName: 'User3',
        email: 'testuser3@example.com',
        password: 'Password123',
        birthDate: '01-01-2000',
        gender: 'Other',
        heightFeet: 5,
        heightInches: 10,
        preferredPosition: 'Midfielder',
        dominantFoot: 'Right'
      };
  
      const response = await request(app)
        .post('/register')
        .send(userData);
  
      const loginResponse = await request(app)
        .post('/login')
        .send(userData);
  
        const decodedToken = jwt.decode(loginResponse.body.token);
        console.log('Decoded Token:', decodedToken); // This will show the decoded token and its properties

        userIdFromToken = decodedToken?.user.id;  // Access the userId from the token payload
        console.log('User ID from Token:', userIdFromToken);
        authToken = loginResponse.body.token;
    });
  
    //Unit test for game creation
    it('POST /api/creategame - should create a new game and return its ID', async () => {
      const gameData = {
        gameLocation: 'Murray State Soccer Field',
        gameDate: '05-15-2025',
        gameTime: '18:00',
        gameStatus: 'Scheduled'
      };
  
      const response = await request(app)
        .post('/api/creategame')
        .set('Authorization', `Bearer ${authToken}`)
        .send(gameData);
  
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id'); // or GameID depending on your response
      expect(typeof response.body.id).toBe('number');
      gameId = response.body.id;
    });

    // Test for player joining a game
    it('POST /api/usergames - should allow a user to join a game', async () => {
        expect(userIdFromToken).toBeDefined();

        const response = await request(app)
            .post('/api/usergames')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                GameID: gameId,
                UserID: userIdFromToken,
                teamNumber: 1
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('GameID', gameId);
        expect(response.body).toHaveProperty('UserID', userIdFromToken);
    });

    // Test for viewing players in a game
    it('GET /api/usergames/:gameId/players - should retrieve players in a game', async () => {
        const response = await request(app)
            .get(`/api/usergames/${gameId}/players`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty('firstName');
        expect(response.body[0]).toHaveProperty('lastName');
        expect(response.body[0]).toHaveProperty('teamNumber');
    });

    // Test for player leaving a game
    it('DELETE /api/usergames/:CompositeID - should allow a user to leave a game', async () => {
        const compositeId = `${gameId}-${userIdFromToken}`;

        const deleteResponse = await request(app)
            .delete(`/api/usergames/${compositeId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(deleteResponse.status).toBe(200);
        expect(deleteResponse.body).toHaveProperty('message', 'Record deleted successfully');

    // Confirm the user is no longer in the game
    const confirmResponse = await request(app)
            .get(`/api/usergames/${gameId}/players`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(confirmResponse.body.find(player => player.UserID === userId)).toBeUndefined();
    });
})