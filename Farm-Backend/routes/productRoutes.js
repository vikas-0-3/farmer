const router = require('express').Router();
const Product = require('../models/Product');
const User = require('../models/User');
const upload = require('../config/multer');


// CREATE product (farmer only)
router.post('/', upload.single('productImage'), async (req, res) => {
  try {
    const {
      farmerId,
      productName,
      category,
      productQuantity,
      mrp,
      sellingPrice
    } = req.body;
    
    const farmer = await User.findById(farmerId);
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });
    
    const productImage = req.file ? req.file.path : "";

    const product = new Product({
      productName,
      productImage,
      productQuantity,
      mrp,
      sellingPrice,
      category,
      farmer: farmerId
    });
    
    await product.save();
    
    res.status(201).json({ message: 'Product created', product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// READ all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('farmer', 'name email');
    
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// get all products and their farmer
// GET users orders
router.get('/allproducts', async (req, res) => {
      const products = await Product.find().populate('farmer');
      return res.status(200).json(products);
    }
);

// READ single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('farmer', 'name email');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all farmer product
router.get('/farmer/:id', async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.params.id }).populate('farmer', 'name email');
    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No products found for this farmer' });
    }
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// UPDATE product
router.put('/:id', upload.single('productImage'), async (req, res) => {
  try {
    const { 
      productName, 
      description, 
      category, 
      productQuantity, 
      mrp, 
      sellingPrice, 
      status,
      farmerId 
    } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Update fields only if provided
    if (productName !== undefined) product.productName = productName;
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;
    if (productQuantity !== undefined) product.productQuantity = productQuantity;
    if (mrp !== undefined) product.mrp = mrp;
    if (sellingPrice !== undefined) product.sellingPrice = sellingPrice;
    if (status !== undefined) product.status = status;
    // Only update the farmer field if a non-empty farmerId is provided
    if (farmerId && farmerId.trim() !== "") {
      product.farmer = farmerId;
    }

    // Update product image if a new file is provided
    if (req.file) {
      product.productImage = req.file.path;
    }

    await product.save();
    res.json({ message: 'Product updated', product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    // Check permission as above
    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
