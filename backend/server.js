const { authenticateToken, generateToken } = require("./authentication/tokenFunc.js");
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/mydatabase.db');
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
const bcrypt = require('bcrypt');
const cors = require('cors');
const app = express();
const PORT = 3000;


//Default Route
app.get('/', (req, res) => {
  res.send('Connected to the server!');
  });
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.listen(PORT, () => { console.log(`Server running on http://localhost:${PORT}`); });

//Middleware
//Ensures that only logged-in users can access protected resources
app.use((req, res, next) => {
  if (["/","/login","/register"].includes(req.path)) {
      return next(); // Authorization is not needed to access the login and registration routes
  }
  authenticateToken(req, res, next);
});

//Test route for accessing protected resources
app.get('/protected', (req,res) => {
  res.status(200).json({ message: `Access to protected resources granted`});
  });


//Creating API endpoints
//User registration functionality
app.post('/register', validateRegistration, async (req, res) => {
  try {
    const { firstName, lastName, email, password, birthDate, gender, heightFeet, heightInches, preferredPosition, dominantFoot } = req.body;
    
    //Ensures that the user is not trying to register under an email that currently has an account
  const checkQuery = 'SELECT * FROM USERS WHERE email = ?'
  db.get(checkQuery, [email], async(err,row) => {
    if (err) return res.status(500).json({ error: 'Database error during email check.' });
    if (row) return res.status(409).json({ error: 'An account has already been created under this email. Please use another email for registration.' });
    
    //Hashing the password using bcrypt
    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(password, salt)

    const query = `INSERT INTO USERS (firstName, lastName, email, password, birthDate, gender, heightFeet, heightInches, preferredPosition, dominantFoot) VALUES (?,?,?,?,?,?,?,?,?,?) `;

    db.run(query, [firstName, lastName, email, hashedPassword, birthDate, gender, heightFeet, heightInches, preferredPosition, dominantFoot], function (err) { if (err) return res.status(500).json({ error: err.message }); res.json({message: `Successful registration for user: ${email}`});
    });
  });
}
catch (err) {
    res.status(500).json({ error: 'Query failed!' });
  }
  });

//Create (POST) a row to GAMES table
app.post('/api/creategame', validateGame, (req, res) => {
  const { gameLocation, gameDate, gameTime, gameStatus } = req.body;
  const query = `INSERT INTO GAMES ( gameLocation, gameDate, gameTime, gameStatus) VALUES (?,?,?,?) `;
  db.run(query, [gameLocation, gameDate, gameTime, gameStatus], function (err) { if (err) return res.status(500).json({ error: err.message }); res.json({ id: this.lastID });
  });
  });
//Create (POST) a row to USERGAMES table
app.post('/api/usergames', validateUserGame, (req, res) => {
  const { GameID, UserID, teamNumber } = req.body;
  const query = `INSERT INTO USERGAMES ( GameID, UserID, teamNumber ) VALUES (?,?,?) `;
  db.run(query, [GameID, UserID, teamNumber], function (err) { if (err) return res.status(500).json({ error: err.message }); res.json({GameID,UserID});
  });
  });


//Read (GET) from USERS table
//Returns all fields from the USER table with the exception of the password
app.get('/api/mydatabase/users', (req, res) => {
  db.all('SELECT firstName, lastName, email, birthDate, gender, heightFeet, heightInches, preferredPosition, dominantFoot FROM USERS', (err, rows) => {
  if (err) return res.status(500).json({ error: err.message });
  res.json(rows);
  });
  });
//Read (GET) from GAMES table
app.get('/api/games', (req, res) => {
  db.all('SELECT * FROM GAMES', (err, rows) => {
  if (err) return res.status(500).json({ error: err.message });
  res.json(rows);
  });
  });
//Get the players from a certain game
app.get("/api/usergames/:gameId/players", (req, res) => {
  const { gameId } = req.params;
  const query = `
    SELECT USERS.firstName, USERS.lastName, USERGAMES.teamNumber
    FROM USERGAMES
    JOIN USERS ON USERGAMES.UserID = USERS.UserID
    WHERE USERGAMES.GameID = ?
  `;

  db.all(query, [gameId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows); // array of { name, teamNumber }
  });
});
//Read (GET) from USERGAMES table
app.get('/api/mydatabase/usergames', (req, res) => {
  db.all('SELECT * FROM USERGAMES', (err, rows) => {
  if (err) return res.status(500).json({ error: err.message });
  res.json(rows);
  });
  });
//GET the profile information for the logged-in user
app.get('/api/user/profile', authenticateToken, (req, res) => {
  const userId = req.user.id;  // The user ID is extracted from the JWT

  console.log('User ID from token:', userId);
  const query = `
    SELECT firstName, lastName, email, birthDate, gender, heightFeet, heightInches, preferredPosition, dominantFoot
    FROM USERS
    WHERE UserID = ?
  `;

  db.get(query, [userId], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching user data', error: err.message });
    }

    if (!row) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(row);  // Send the user profile data as the response
  });
});
//Get the information for a specific game
app.get('/api/games/:GameID', (req, res) => {
  const { GameID } = req.params;
  db.get('SELECT * FROM GAMES WHERE GameID = ?', [GameID], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(row);
  });
});


//Update (PUT) on USERS table
app.put('/api/mydatabase/users/:UserID', validateRegistration, async (req, res) => {
  const { UserID } = req.params;
  const { firstName, lastName, email, password, birthDate, gender, heightFeet, heightInches, preferredPosition, dominantFoot } = req.body;

  //Hashes the updated password for storage using bcrypt
  const salt = await bcrypt.genSalt()
  const hashedPassword = await bcrypt.hash(password, salt)

  const query = `
  UPDATE USERS SET firstName = ?, lastName = ?, email = ?, password = ?, birthDate = ?, gender = ?, heightFeet = ?, heightInches = ?, preferredPosition = ?, dominantFoot = ?
  WHERE UserID = ?
  `;
  db.run(query, [firstName, lastName, email, hashedPassword, birthDate, gender, heightFeet, heightInches, preferredPosition, dominantFoot, UserID], function (err) { if (err) return res.status(500).json({ error: err.message }); res.json({ message: 'Record updated successfully' });
  });
  });
//Update (PUT) on GAMES table
app.put('/api/games/:GameID', validateGame, (req, res) => {
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
app.put('/api/mydatabase/usergames/:CompositeID', validateUserGame, (req, res) => {
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
app.delete('/api/usergames/:CompositeID', (req, res) => {
  const { CompositeID } = req.params;
  const [GameID, UserID] = CompositeID.split('-');
  db.run('DELETE FROM USERGAMES WHERE GameID = ? AND UserID = ?', [GameID, UserID], function (err) {
  if (err) return res.status(500).json({ error: err.message });
  res.json({ message: 'Record deleted successfully' });
  });
  });



  //Login functionality
//I have adjusted a previously developed endpoint to account for registration purposes.
app.post('/login', (req,res) => {
  //Stores the provided information into the request body
  const { email, password } = req.body;

  //Data validation to ensure that the fields are not left empty
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required!'});
  }

  //Searches the USERS table for a row where the email matches the one passed above
    const query = 'SELECT * FROM USERS WHERE email = ?';
    db.get(query, [email], async (err,row) => {

      if (!row) {
        return res.status(404).json({ message: 'User is not found. Please register for access.' });
      }

  //Validation to ensure that the password is correct using bcrypt
  try {
    const isMatch = await bcrypt.compare(password, row.password);
    if (isMatch) {
      //Generates a token for the user information to allow access to protected resources
      const token = generateToken({id: row.UserID, email: row.email});
      res.status(200).json({ message: `Access granted for user: ${row.email}`, token});
    }
    else {
      res.status(401).json({ message: 'Incorrect password. Please try another password.' });
    }
  } catch {
    res.status(500).json({ error: 'Error during authentication!' });
  }
  });
});


//Validate Registration function. This is going to be called in the user registration and update user endpoints.
function validateRegistration(req,res,next) {
  const { firstName, lastName, email, password, birthDate, gender, heightFeet, heightInches, preferredPosition, dominantFoot } = req.body;

  //Ensures that none of the required fields are blank
  if (!firstName || !lastName || !email || !password || !birthDate || !gender) {
    return res.status(400).json({ error: 'Missing required fields!'});
  }

  //Ensures that the first name and last name are both at least two characters long
  if (firstName.length < 2 || lastName.length < 2) {
    return res.status(400).json({ error: 'First and last name must be at least two characters long'});
  }

  //Ensures that the email provided is in the appropriate email format (example@example.123)
  const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: 'Email must be provided in an appropriate format'});
  }

  //Ensures that the password is at least eight characters long and contains at least one uppercase letter and number
  const passwordPattern = /^(?=.*[A-Z])(?=.*\d)/;
  if (password.length < 8 || !passwordPattern.test(password)) {
    return res.status(400).json({ error: 'Password must be at least eight characters long and contain at least one uppercase letter and number.'});
  }
  
  //Ensures that the birthdate is provided in this format (DD-MM-YYYY)
  const birthDatePattern = /^(\d{2})-(\d{2})-(\d{4})$/;
  if (!birthDatePattern.test(birthDate)) {
    return res.status(400).json({ error: 'Date of birth must be entered in this format: (DD-MM-YYYY)'});
  }

  //Ensures that the birthdate is a valid date. A valid day in the given month and a month no greater than 12
  let dateObj = new Date(birthDate);

  if (isNaN(dateObj)) {
    return res.status(400).json({ error: 'Date of birth provided is not a valid date'});
  }
  
  //Ensures that the birthdate is realistic for a currently living person
  const today = new Date();
  const earliest = new Date(1900, 0, 1);

  if (dateObj > today || dateObj < earliest) {
    return res.status(400).json({ error: 'The date of birth provided is unrealistic for a living person.'});
  } 

  //Ensures that the gender is either Male or Female or Other
  if (gender !== 'Male' && gender !== 'Female' && gender !== 'Other') {
    return res.status(400).json({ error: 'Gender must be listed as either Male, Female, or Other.'});
  } 

  //Ensures that the height in feet is between four and seven
  if (heightFeet <=3 || heightFeet >= 8) {
    return res.status(400).json({ error: 'The height expressed in feet must be between four and seven'});
  }

  //Ensures that the height expressed in inches is between zero and eleven
  if (heightInches < 0 || heightInches >= 12) {
    return res.status(400).json({ error: 'The height expressed in inches must be between zero and eleven'});
  }

  //Ensures that the dominant foot of the user is listed as either Right or Left
  if (dominantFoot != "Right" && dominantFoot != "Left") {
    return res.status(400).json({ error: 'The dominant foot must be expressed as either Right or Left'});
  } 

  next();
}


//Validate game creation function. This is going to be called in the game creation and game update endpoints
function validateGame(req,res,next) {
  const { gameLocation, gameDate, gameTime, gameStatus } = req.body;

  //Ensures that required fields are not left empty
  if (!gameLocation || !gameDate || !gameTime || !gameStatus) {
    return res.status(400).json({ error: 'Missing required fields!'});
  }

  //Ensures that the game date is entered in the appropriate format (DD-MM-YYYY)
  const gameDatePattern = /^(\d{2})-(\d{2})-(\d{4})$/;
  if (!gameDatePattern.test(gameDate)) {
    return res.status(400).json({ error: 'Date of game must be entered in this format: (DD-MM-YYYY)'});
  }

  //Ensures that the game date is a valid date. A valid day in the given month and no month greater than 12
  let dateObj = new Date(gameDate);

  if (isNaN(dateObj)) {
    return res.status(400).json({ error: 'Date of game provided is not a valid date'});
  }

  //Ensures that the game date is not in the past
  const currentDate = new Date();

  if (dateObj < currentDate) {
    return res.status(400).json({ error: 'Date of game cannot be in the past'});
  }

  //Ensures that game time is a valid time in military format (00:00)
  const gameTimePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!gameTimePattern.test(gameTime)) {
    return res.status(400).json({ error: 'Time of game must be entered in military format: (00:00)'});
  }

  //Ensures that the game status matches one of these values: "Scheduled", "Updated", "Finished", "Cancelled"
  if (gameStatus !== "Scheduled" && gameStatus !== "Updated" && gameStatus !== "Finished" && gameStatus !== "Cancelled") {
    return res.status(400).json({ error: 'Game status must be listed as one of these values: Scheduled, Updated, Finished, or Cancelled.'});
  }

  next();
}

//Validate usergame creation function. This is going to be called in the usergame creation and usergame update endpoints
function validateUserGame(req,res,next) {

  const { GameID, UserID, teamNumber } = req.body;

  //Ensures that the team number is either one or two
  if (teamNumber !== 1 && teamNumber !== 2) {
    return res.status(400).json({ error: 'Team number must be listed as either 1 or 2.'});
  }

next();
}
