const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const upload = require('../config/multer');

// REGISTER (default role = 'user')
router.post('/register', upload.single('profilePhoto'), async (req, res) => {
  try {
    const { name, age, gender, email, phone, password, address, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let profilePhotoPath = '';
    if (req.file) {
      profilePhotoPath = req.file.path; 
    }
    
    const newUser = new User({
      name,
      age,
      gender,
      email,
      phone,
      password: hashedPassword,
      profilePhoto: profilePhotoPath,
      address,
      role: role || 'user'
    });

    await newUser.save();

    res.status(201).json({ 
      message: 'User registered successfully', 
      userId: newUser._id 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ message: 'Invalid Password' });

    const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.json({
      message: 'Logged in successfully',
      token,
      role: user.role,
      userId: user._id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
