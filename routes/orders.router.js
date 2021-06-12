const { Router } = require('express');
const createError = require('http-errors');

const Order = require('../models/order.model');

// ------ MIDDLEWARES ------
const { checkAuth } = require('../auth/auth.middleware');

// ------ UTILITIES ------
const { jsonResponse } = require('../lib/json-response');

const router = Router();

router.get('/', checkAuth, async (req, res, next) => {
    let results;

    try {
        results = await Order.find({}, 'products total userId date');
    } catch (error) {
        console.error(error);
        next(
            createError(500, 'Error trying to fetch orders. Try again later!')
        );
    }

    res.json(jsonResponse(200, { results }));
});

router.post('/', checkAuth, async (req, res, next) => {
    const { products, userId } = req.body;

    if (!products || !userId)
        next(
            createError(
                400,
                'Missing some needed information. Please provide the all necessary information and try again.'
            )
        );

    if (products.length) {
        const order = new Order({ products, userId });

        try {
            await order.save();
        } catch (error) {
            console.error(error);
            return next(createError(500, error));
        }

        res.json(jsonResponse(200, { message: 'Order created successfully.' }));
    }
});

module.exports = router;
