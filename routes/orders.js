const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const router = express.Router();

const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ message: 'User not authenticated' });
    }
};

router.get('/user-orders', isAuthenticated, async (req, res) => {
    const userId = req.session.userId;
    console.log(`Fetching orders for userId: ${userId}`);

    try {
        const allOrders = await Order.findAll();
        console.log(`All Orders: ${JSON.stringify(allOrders)}`);
        const userOrders = allOrders.filter(order => order.userId === userId);
        console.log(`User Orders: ${JSON.stringify(userOrders)}`);

        const ordersWithProductDetails = await Promise.all(userOrders.map(async (order) => {
            const product = await Product.findByProductId(order.productId);
            return {
                ...order,
                productDetails: product,
            };
        }));

        res.status(200).json(ordersWithProductDetails);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user orders', error });
    }
});

router.get('/all-orders', async (req, res) => {
    try {
        const allOrders = await Order.findAll();
        res.status(200).json(allOrders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all orders', error });
    }
});

router.post('/create-order', isAuthenticated, async (req, res) => {
    const { productId } = req.body; 
    const userId = req.session.userId;

    try {

        const product = await Product.findByProductId(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const order = new Order(productId, userId);
        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Error creating order', error });
    }
});

router.get('/:orderId', isAuthenticated, async (req, res) => {
    const { orderId } = req.params; 

    try {
        const order = await Order.findByOrderId(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        const product = await Product.findByProductId(order.productId);
        const orderWithProductDetails = {
            ...order,
            productDetails: product,
        };

        res.status(200).json(orderWithProductDetails);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Error fetching order', error });
    }
});

router.delete('/:orderId', isAuthenticated, async (req, res) => {
    const { orderId } = req.params; 

    try {
        await Order.delete(orderId);
        res.status(204).send();
    } catch (error) {
        if (error.message === 'Order not found') {
            return res.status(404).json({ message: 'Order not found' });
        }
        console.error('Error deleting order:', error);
        res.status(500).json({ message: 'Error deleting order', error });
    }
});
module.exports = router; 