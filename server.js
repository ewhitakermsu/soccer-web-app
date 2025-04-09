const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('mydatabase.db');
//Create the USERS table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS USERS (
  UserID INTEGER PRIMARY KEY AUTOINCREMENT,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  birthDate TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')) DEFAULT 'Other',
  heightFeet INTEGER CHECK (heightFeet BETWEEN 3 AND 8),
  heightInches INTEGER CHECK (heightInches BETWEEN 0 AND 11),
  preferredPosition TEXT,
  dominantFoot TEXT CHECK (dominantFoot IN ('Right', 'Left')) DEFAULT 'Right' )
  `);

//Create the GAMES table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS GAMES (
  GameID INTEGER PRIMARY KEY AUTOINCREMENT,
  gameLocation TEXT NOT NULL,
  gameDate TEXT NOT NULL,
  gameTime TEXT NOT NULL,
  gameStatus TEXT NOT NULL )
  `);

//Create the USERGAME table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS USERGAMES (
  GameID INTEGER NOT NULL,
  UserID INTEGER NOT NULL,
  teamNumber INTEGER NOT NULL,
  PRIMARY KEY (GameID,UserID),
  FOREIGN KEY (GameID) REFERENCES GAMES (GameID),
  FOREIGN KEY (UserID) REFERENCES USERS (UserID))
  `);

//Setting up Express
const express = require('express');
const app = express();
const PORT = 3000;
app.get('/', (req, res) => {
  res.send('Welcome to the Pickup Soccer Match Organizer!');
  });
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.listen(PORT, () => { console.log(`Server running on http://localhost:${PORT}`); });

//Creating API endpoints
//Create (POST) a row to USERS table
app.post('/api/mydatabase/users', (req, res) => {
  const { firstName, lastName, email, password, birthDate, gender, heightFeet, heightInches, preferredPosition, dominantFoot } = req.body;
  const query = `INSERT INTO USERS (firstName, lastName, email, password, birthDate, gender, heightFeet, heightInches, preferredPosition, dominantFoot) VALUES (?,?,?,?,?,?,?,?,?,?) `;
  db.run(query, [firstName, lastName, email, password, birthDate, gender, heightFeet, heightInches, preferredPosition, dominantFoot], function (err) { if (err) return res.status(500).json({ error: err.message }); res.json({ id: this.lastID });
  });
  });
//Create (POST) a row to GAMES table
app.post('/api/mydatabase/games', (req, res) => {
  const { gameLocation, gameDate, gameTime, gameStatus } = req.body;
  const query = `INSERT INTO GAMES ( gameLocation, gameDate, gameTime, gameStatus) VALUES (?,?,?,?) `;
  db.run(query, [gameLocation, gameDate, gameTime, gameStatus], function (err) { if (err) return res.status(500).json({ error: err.message }); res.json({ id: this.lastID });
  });
  });
//Create (POST) a row to USERGAMES table
app.post('/api/mydatabase/usergames', (req, res) => {
  const { GameID, UserID, teamNumber } = req.body;
  const query = `INSERT INTO USERGAMES ( GameID, UserID, teamNumber ) VALUES (?,?,?) `;
  db.run(query, [GameID, UserID, teamNumber], function (err) { if (err) return res.status(500).json({ error: err.message }); res.json({GameID,UserID});
  });
  });

//Read (GET) from USERS table
app.get('/api/mydatabase/users', (req, res) => {
  db.all('SELECT * FROM USERS', (err, rows) => {
  if (err) return res.status(500).json({ error: err.message });
  res.json(rows);
  });
  });
//Read (GET) from GAMES table
app.get('/api/mydatabase/games', (req, res) => {
  db.all('SELECT * FROM GAMES', (err, rows) => {
  if (err) return res.status(500).json({ error: err.message });
  res.json(rows);
  });
  });
//Read (GET) from USERGAMES table
app.get('/api/mydatabase/usergames', (req, res) => {
  db.all('SELECT * FROM USERGAMES', (err, rows) => {
  if (err) return res.status(500).json({ error: err.message });
  res.json(rows);
  });
  });

//Update (PUT) on USERS table
app.put('/api/mydatabase/users/:UserID', (req, res) => {
  const { UserID } = req.params;
  const { firstName, lastName, email, password, birthDate, gender, heightFeet, heightInches, preferredPosition, dominantFoot } = req.body;
  const query = `
  UPDATE USERS SET firstName = ?, lastName = ?, email = ?, password = ?, birthDate = ?, gender = ?, heightFeet = ?, heightInches = ?, preferredPosition = ?, dominantFoot = ?
  WHERE UserID = ?
  `;
  db.run(query, [firstName, lastName, email, password, birthDate, gender, heightFeet, heightInches, preferredPosition, dominantFoot, UserID], function (err) { if (err) return res.status(500).json({ error: err.message }); res.json({ message: 'Record updated successfully' });
  });
  });
//Update (PUT) on GAMES table
app.put('/api/mydatabase/games/:GameID', (req, res) => {
  const { GameID } = req.params;
  const { gameLocation, gameDate, gameTime, gameStatus } = req.body;
  const query = `
  UPDATE GAMES SET gameLocation = ?, gameDate = ?, gameTime = ?, gameStatus = ?
  WHERE GameID = ?
  `;
  db.run(query, [gameLocation, gameDate, gameTime, gameStatus, GameID], function (err) { if (err) return res.status(500).json({ error: err.message }); res.json({ message: 'Record updated successfully' });
  });
  });
//Update (PUT) on USERGAMES table
app.put('/api/mydatabase/usergames/:CompositeID', (req, res) => {
  const { CompositeID } = req.params;
  const [GameID, UserID] = CompositeID.split('-');
  const { teamNumber } = req.body;
  const query = `
  UPDATE USERGAMES SET teamNumber = ?
  WHERE GameID = ? AND UserID = ?
  `;
  db.run(query, [teamNumber, GameID, UserID], function (err) { if (err) return res.status(500).json({ error: err.message }); res.json({ message: 'Record updated successfully' });
  });
  });

//Delete (DELETE) a row from USERS table
app.delete('/api/mydatabase/users/:UserID', (req, res) => {
  const { UserID } = req.params;
  db.run('DELETE FROM USERS WHERE UserID = ?', UserID, function (err) {
  if (err) return res.status(500).json({ error: err.message });
  res.json({ message: 'Record deleted successfully' });
  });
  });
//Delete (DELETE) a row from GAMES table
app.delete('/api/mydatabase/games/:GameID', (req, res) => {
  const { GameID } = req.params;
  db.run('DELETE FROM GAMES WHERE GameID = ?', GameID, function (err) {
  if (err) return res.status(500).json({ error: err.message });
  res.json({ message: 'Record deleted successfully' });
  });
  });
//Delete (DELETE) a row from USERGAMES table
app.delete('/api/mydatabase/usergames/:CompositeID', (req, res) => {
  const { CompositeID } = req.params;
  const [GameID, UserID] = CompositeID.split('-');
  db.run('DELETE FROM USERGAMES WHERE GameID = ? AND UserID = ?', [GameID, UserID], function (err) {
  if (err) return res.status(500).json({ error: err.message });
  res.json({ message: 'Record deleted successfully' });
  });
  });