const registerModel = require('../../app/register')
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const JWT = require('jsonwebtoken')



const Login = async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      console.log("Field empty:", { email, password });
      return res.status(400).json("field empty");
    }
  
    try {
      // Find the user by email
      const user = await registerModel.findOne({ email });
      if (!user) {
        return res.status(400).json("invalid credentials");
      }
  
      // Compare the provided password with the stored hashed password
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(400).json("invalid credentials");
      }
      const accessToken = JWT.sign(
          { id: user._id, email: user.email },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: '1h' }
      );
      return res.status(201).json({ accessToken });
  
      // Login successful
     /* return res.status(200).json("login successful");*/
    } catch (err) {
      console.error("Error logging in:", err);
      return res.status(500).json("error logging in");
    }
  }


  const Register = async (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      console.log("Field empty:", { username, password, email }); // Debug log
      return res.status(400).json("field empty");
    }
  
    const doesExist = await registerModel.findOne({ email });
    console.log(doesExist);
    if (doesExist) {
      return res.status(400).json("user email already exist");
    }
  
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      console.log("Hashed Password:", hashedPassword); // Debug log
  
      // Save the new user with the hashed password (Replace with actual save logic)
      const newUser = new registerModel({
        username,
        email,
        password: hashedPassword,
      });
      const savedUser = await newUser.save();
      await (savedUser.id);
      /*res.send(savedUser);*/
      
  
      console.log("New User:", newUser); // Debug log
      // Return success response with access token
     
  
      // Return success response
      return res.status(201).json("user registered successfully");
    } catch (err) {
      console.error("Error hashing password:", err);
      return res.status(500).json("error registering user");
    }
  
  
  }


  module.exports = {
    Login,
    Register
  }