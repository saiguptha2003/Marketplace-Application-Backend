const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ message: 'User not authenticated' });
    }
};

router.post('/add-product', isAuthenticated, async (req, res) => {
    const { name, description, price, imageUrl } = req.body;
    const userId = req.session.userId;

    console.log('User ID:', userId);

    try {
        const product = new Product(name, description, price, imageUrl, userId);
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Error creating product', error });
    }
});

router.get('/products', isAuthenticated, async (req, res) => {
    const userId = req.session.userId;

    try {
        const allProducts = await Product.findAll();
        const userProducts = allProducts.filter(product => product.userId.includes(userId));
        res.status(200).json(userProducts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
});

router.get('/product/:productId', isAuthenticated, async (req, res) => {
    const { productId } = req.params;

    try {
        const product = await Product.findByProductId(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error });
    }
});

router.put('/product/:productId', isAuthenticated, async (req, res) => {
    const { productId } = req.params;
    const updatedFields = req.body;

    try {
        const updatedProduct = await Product.update(productId, updatedFields);
        res.status(200).json(updatedProduct);
    } catch (error) {
        if (error.message === 'Product not found') {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(500).json({ message: 'Error updating product', error });
    }
});

router.delete('/product/:productId', isAuthenticated, async (req, res) => {
    const { productId } = req.params;

    try {
        await Product.delete(productId);
        res.status(204).send(); 
    } catch (error) {
        if (error.message === 'Product not found') {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(500).json({ message: 'Error deleting product', error });
    }
});

router.post('/bulk', isAuthenticated, async (req, res) => {
    const productsData = req.body; 
    const userId = req.session.userId; 

    if (!Array.isArray(productsData) || productsData.length === 0) {
        return res.status(400).json({ message: 'Invalid input: expected an array of products.' });
    }

    try {
        const createdProducts = [];
        for (const productData of productsData) {
            const { name, description, price, imageUrl } = productData;

            const product = new Product(name, description, price, imageUrl, userId);
            const createdProduct = await product.save();
            createdProducts.push(createdProduct);
        }

        res.status(201).json(createdProducts);
    } catch (error) {
        console.error('Error creating products:', error); 
        res.status(500).json({ message: 'Error creating products', error });
    }
});

module.exports = router; 