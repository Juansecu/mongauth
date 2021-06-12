const { Router } = require('express');
const createError = require('http-errors');

const User = require('../models/user.model');

// ------ MIDDLEWARES ------
const { checkAuth } = require('../auth/auth.middleware');

// ------ UTILITIES ------
const { jsonResponse } = require('../lib/json-response');

const router = Router();

/* GET users listing. */
router.get('/', checkAuth, async function (req, res, next) {
    let results = {};

    try {
        results = await User.find({}, '_id username password');
    } catch (error) {
        console.error(error);
    }

    res.json(results);
});

router.post('/', checkAuth, async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password)
        next(createError(400, 'Missing username and/or password.'));
    else {
        const user = new User({ username, password });
        const userExists = await user.checkUsernameExistence(username);

        if (userExists) {
            next();

            res.json(
                jsonResponse(400, {
                    message: `User ${username} already exists!`
                })
            );
        } else {
            await user.save();

            res.json({
                message: 'User registered successfuly!'
            });
        }
    }
});

module.exports = router;
