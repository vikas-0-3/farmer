const router = require('express').Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// CREATE an cart
router.post('/', async (req, res) => {
  try {
    const { user, products, totalAmount } = req.body;
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'No products provided' });
    }

    let cart = await Cart.findOne({ user: user });
    if (cart) {
      products.forEach(newProd => {
        const existingIndex = cart.products.findIndex(
          (p) => p.product.toString() === newProd.product
        );
        if (existingIndex !== -1) {
          cart.products[existingIndex].quantity += newProd.quantity;
        } else {
          cart.products.push(newProd);
        }
      });
      cart.totalAmount += totalAmount;
      await cart.save();
      return res.status(200).json({ message: 'Cart updated', order: cart });
    } else {
      const newCart = new Cart({
        user: user,
        products: products,
        totalAmount: totalAmount
      });
      await newCart.save();
      return res.status(201).json({ message: 'Cart saved', order: newCart });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET users cart
router.get('/:userId', async (req, res) => {
  const userCart = await Cart.find({ user: req.params.userId })
    .populate('products.product');
  return res.status(200).json(userCart);
}
);


// update cart
router.put('/:id', async (req, res) => {
  try {
    const { products, totalAmount } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Products must be a non-empty array' });
    }

    const cart = await Cart.findById(req.params.id);
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.products = products;
    cart.totalAmount = totalAmount;

    await cart.save();

    res.status(201).json({ message: 'Cart updated', cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});




router.delete('/:id', async (req, res) => {
  try {
    const userCart = await Cart.findById(req.params.id);
    await userCart.deleteOne();
    res.status(200).json({ message: 'cart deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.put('/:cartId/products/:productId', async (req, res) => {
  try {
    const { quantity } = req.body;
    const { cartId, productId } = req.params;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Invalid quantity provided' });
    }

    const cart = await Cart.findById(cartId).populate('products.product');
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const productIndex = cart.products.findIndex(
      (item) => item._id.toString().trim() === productId.toString().trim()
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    const oldQuantity = cart.products[productIndex].quantity;
    let productPrice = 0;
    productPrice = cart.products[productIndex].product.sellingPrice;


    const diff = (oldQuantity - quantity) * productPrice;
    cart.totalAmount = cart.totalAmount - diff;


    cart.products[productIndex].quantity = quantity;
    await cart.save();
    res.json({ message: 'Cart product updated', cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove a specific product from the cart
router.delete('/:cartId/products/:productId', async (req, res) => {
  try {
    const { cartId, productId } = req.params;

    const cart = await Cart.findById(cartId).populate('products.product');
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.products = cart.products.filter(
      (item) => item._id.toString().trim() !== productId.toString().trim()
    );

    let newTotal = 0;
    cart.products.forEach(item => {
      let price = 0;
      if (item.product && item.product.sellingPrice) {
        if (typeof item.product.sellingPrice === 'number') {
          price = item.product.sellingPrice;
        } else {
          price = parseFloat(item.product.sellingPrice.toString()) || 0;
        }
      }
      let quantity = parseInt(item.quantity.toString()) || 0;
      newTotal += price * quantity;
    });
    cart.totalAmount = newTotal;

    await cart.save();
    res.json({ message: 'Product removed from cart', cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;
