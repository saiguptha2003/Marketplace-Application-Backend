const express = require('express');
const Product = require('../models/Product'); // Import Product model
const router = express.Router()


router.get('/', async (req, res) => {
    try {
        const allProducts = await Product.findAll();
        res.status(200).json(allProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products', error });
    }
});
module.exports = router;