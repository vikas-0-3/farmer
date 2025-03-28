const router = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const upload = require('../config/multer');



router.post('/', upload.single('profilePhoto'), async (req, res) => {

  try {
    const { name, age, gender, email, phone, password, address, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
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

    const savedUser = await newUser.save();
    const { password: _, ...userData } = savedUser.toObject();

    res.status(201).json({ message: 'New user created successfully', user: userData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }

});




// GET all users (admin only)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/allusers', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// GET a single user by ID (admin or same user)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE user
router.put('/:id', upload.single('profilePhoto'), async (req, res) => {
  try {
    const { name, age, gender, phone, address } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update text fields
    if (name !== undefined) user.name = name;
    if (age !== undefined) user.age = age;
    if (gender !== undefined) user.gender = gender;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    if (req.file) {
      user.profilePhoto = req.file.path;
    }

    await user.save();
    const { password, ...updatedUser } = user.toObject();
    res.status(200).json({ message: 'User updated', user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE user (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
