const request = require('supertest');
const {app,db} = require('../server'); // this exports my app

describe('Game Creation, Retrieval, and Update', () => {
    let authToken;
    let gameId;

    afterAll((done) => {
        // Ensure gameId exists before trying to delete it
        if (gameId) {
          db.run('DELETE FROM GAMES WHERE GameID = ?', [gameId], done);
        } else {
          done(); // If no game was created, just finish the test
        }
      });
  
    beforeAll(async () => {
      // Register a user (or use login route)
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'testuser@example.com',
        password: 'Password123',
        birthDate: '01-01-2000',
        gender: 'Other',
        heightFeet: 5,
        heightInches: 10,
        preferredPosition: 'Midfielder',
        dominantFoot: 'Right'
      };
  
      await request(app)
        .post('/register')
        .send(userData);
  
      const loginResponse = await request(app)
        .post('/login')
        .send(userData);
  
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

    // Unit test for game retrieval
    it('GET /api/games/:GameID - should retrieve the game by GameID', async () => {
        const response = await request(app)
      .get(`/api/games/${gameId}`)
      .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('GameID', gameId);
        expect(response.body).toHaveProperty('gameLocation', 'Murray State Soccer Field');
        expect(response.body).toHaveProperty('gameDate', '05-15-2025');
        expect(response.body).toHaveProperty('gameTime', '18:00');
        expect(response.body).toHaveProperty('gameStatus', 'Scheduled');
    });

    // Unit test for non-existent game retrieval
    it('GET /api/games/:GameID - should return 404 if the game does not exist', async () => {
        const nonExistentGameId = 9999999; // ID that does not exist
        const response = await request(app)
      .get(`/api/games/${nonExistentGameId}`)
      .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Game not found');
    });

    // Game Update Test
    it('PUT /api/games/:GameID - should update the game and return success message', async () => {
        const updatedGameData = {
            gameLocation: 'Updated Soccer Field',
            gameDate: '05-20-2025',
            gameTime: '20:00',
            gameStatus: 'Updated'
        };

        const updateResponse = await request(app)
            .put(`/api/games/${gameId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(updatedGameData);

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body).toHaveProperty('message', 'Record updated successfully');

      // Confirm update
      const confirmResponse = await request(app)
        .get(`/api/games/${gameId}`)
        .set('Authorization', `Bearer ${authToken}`);

        expect(confirmResponse.status).toBe(200);
        expect(confirmResponse.body).toHaveProperty('GameID', gameId);
        expect(confirmResponse.body).toHaveProperty('gameLocation', 'Updated Soccer Field');
        expect(confirmResponse.body).toHaveProperty('gameDate', '05-20-2025');
        expect(confirmResponse.body).toHaveProperty('gameTime', '20:00');
        expect(confirmResponse.body).toHaveProperty('gameStatus', 'Updated');
      }); 

      // Game Deletion Test
      it('DELETE /api/mydatabase/games/:GameID - should delete the game and return success message', async () => {
        const deleteResponse = await request(app)
          .delete(`/api/mydatabase/games/${gameId}`)
          .set('Authorization', `Bearer ${authToken}`);

          expect(deleteResponse.status).toBe(200);
          expect(deleteResponse.body).toHaveProperty('message', 'Record deleted successfully');

      // Confirm deletion
       const confirmResponse = await request(app)
        .get(`/api/games/${gameId}`)
        .set('Authorization', `Bearer ${authToken}`);

        expect(confirmResponse.status).toBe(404);
        expect(confirmResponse.body).toHaveProperty('error', 'Game not found');

        // Since the game is deleted, prevent afterAll from trying again
        gameId = null;
    });

  });