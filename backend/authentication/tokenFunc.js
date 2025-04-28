/* These functions deal with ensuring that only logged-in users can access
protected resources. Upon log-in, a user is assigned a token that will
stay with them until they are logged out or the session expires.
*/

const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
//Loads the SECRET_KEY from the .env file
dotenv.config();

//Assigns the SECRET_KEY variable with the SECRET_KEY that I generated in the .env file
const SECRET_KEY = process.env.SECRET_KEY;

if (!process.env.SECRET_KEY) {
    throw new Error('SECRET_KEY is not set in the environment variables');
  }  

function generateToken(user) {
    // Payload can include user data, in this case it is the email
    const payload = {
        user: user,
    };
    
    // Sign the token with the secret key and set an expiration time
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '2h' }); // Token expires in 2 hours
}

//token authentication function
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer <token>
  
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded.user;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
}
module.exports = { authenticateToken, generateToken };