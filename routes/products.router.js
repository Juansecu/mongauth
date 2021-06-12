const { Router } = require('express');
const createError = require('http-errors');

const Product = require('../models/product.model');

// ------ MIDDLEWARES ------
const { checkAuth } = require('../auth/auth.middleware');

// ------ UTILITIES ------
const { jsonResponse } = require('../lib/json-response');

const router = Router();

router.delete('/:_id', checkAuth, async (req, res, next) => {
    const { _id } = req.params;

    try {
        await Product.findByIdAndDelete(_id);
    } catch (error) {
        console.error(error);
        next(
            createError(
                500,
                `Error trying to fetch the product with ID ${_id}. Check the product ID is correct and try again later!`
            )
        );
    }

    res.json(
        jsonResponse(200, {
            message: `Product ${_id} was deleted successfully.`
        })
    );
});

router.get('/', checkAuth, async (req, res, next) => {
    let results = {};

    try {
        results = await Product.find({}, 'title price');
    } catch (error) {
        console.error(error);
        next(createError(500, 'Error fetching the results. Try again later!'));
    }

    res.json(jsonResponse(200, { results }));
});

router.get('/:_id', checkAuth, async (req, res, next) => {
    let result = {};

    const { _id } = req.params;

    if (!_id) next(createError(400, 'No ID provided. Try again!'));

    try {
        result = await Product.findById(_id, 'title price');
    } catch (error) {
        console.error(error);
        next(
            createError(
                500,
                `Error trying to fetch the product with ID ${_id}. Check the product ID is correct and try again later!`
            )
        );
    }

    res.json(jsonResponse(200, { result }));
});

router.post('/', checkAuth, async (req, res, next) => {
    const { title, price } = req.body;

    if (!title || !price)
        next(
            createError(
                400,
                'There are some missing parameters. Please, try again!'
            )
        );
    else {
        try {
            const product = new Product({ title, price });
            await product.save();
        } catch (error) {
            console.error(error);
            next(
                createError(
                    500,
                    'Error trying to register the given product. Try again later!'
                )
            );
        }

        res.json(
            jsonResponse(200, {
                message: `The product ${title} has been added successfully!`
            })
        );
    }
});
router.patch('/:_id', checkAuth, async (req, res, next) => {
    const update = {};

    const { _id } = req.params;
    const { title, price } = req.body;

    if (!_id) next(createError(400, 'No ID provided. Try again!'));

    if (!title && !price)
        next(
            createError(
                400,
                'No product information available to update. Please ensure you are sending all needed values and try again!'
            )
        );

    if (title) update['title'] = title;
    if (price) update['price'] = price;

    try {
        await Product.findByIdAndUpdate(_id, update);
    } catch (error) {
        console.error(error);
        next(
            createError(
                500,
                `Error trying to fetch the product with ID ${_id}. Check the product ID is correct and try again later!`
            )
        );
    }

    res.json(
        jsonResponse(200, {
            message: `Product ${_id} updated successfully.`
        })
    );
});

module.exports = router;
