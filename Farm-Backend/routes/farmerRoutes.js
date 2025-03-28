const router = require('express').Router();
const Farmer = require('../models/Farmer');
const User = require('../models/User');
const upload = require('../config/multer');

// CREATE farmer (by admin)
router.post('/', upload.single('farmPhoto'), async (req, res) => {
  try {
    const { userId, farmName, location } = req.body;
    const existingFarmer = await Farmer.findOne({ user: userId });
    if (existingFarmer) {
      return res.status(400).json({ message: 'This user is already a farmer' });
    }

    let farmPhotoPath = '';
    if (req.file) {
      farmPhotoPath = req.file.path;
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = 'farmer';
    await user.save();

    const newFarmer = new Farmer({
      user: userId,
      farmName,
      location,
      farmPhoto: farmPhotoPath
    });
    await newFarmer.save();

    res.status(201).json({ message: 'Farmer created', farmerId: newFarmer._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all farmers
router.get('/', async (req, res) => {
  try {
    const farmers = await Farmer.find().populate('user', '-password');
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/farms', async (req, res) => {
  try {
    const farmers = await Farmer.find();
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single farmer
router.get('/:id', async (req, res) => {
  try {
    const farmer = await Farmer.find({ user: req.params.id }).populate('user', '-password');
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });
    res.status(200).json(farmer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE farmer details
router.put('/:id', upload.single('farmPhoto'), async (req, res) => {
  try {
    const { farmName, location } = req.body;
    const farmer = await Farmer.findById(req.params.id);

    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });
    if (farmName !== undefined) farmer.farmName = farmName;
    if (location !== undefined) farmer.location = location;

    await farmer.save();
    res.status(200).json({ message: 'Farmer updated', farmer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE farmer
router.delete('/:id', async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });
    await farmer.deleteOne();
    res.status(200).json({ message: 'Farmer deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
