const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

const { Router } = require('express');
const createError = require('http-errors');
const { sign, verify } = require('jsonwebtoken');

const Token = require('../models/token.model');
const User = require('../models/user.model');

const { jsonResponse } = require('../lib/json-response');

const router = Router();

router.post('/login', async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password)
        next(createError(400, 'Missing username and/or password.'));
    else {
        try {
            let user = new User({ username, password });

            const userExists = user.checkUsernameExistence(username);

            if (userExists) {
                let correctPassword;

                user = await User.findOne({ username });
                correctPassword = user.checkPassword(password, user.password);

                if (correctPassword) {
                    const accessToken = user.createAccessToken();
                    const refreshToken = await user.createRefreshToken();

                    res.json(
                        jsonResponse(200, {
                            accessToken,
                            refreshToken,
                            message: 'User information correct.'
                        })
                    );
                } else next(createError(400, 'Wrong password. Try again!'));
            } else
                next(createError(400, `Username ${username} does not exist.`));
        } catch (error) {
            console.error(error);
        }
    }
});

router.post('/logout', async (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) next(createError(400, 'No token provided!'));

    try {
        await Token.findOneAndRemove({ token: refreshToken });
        res.json(jsonResponse(200, { message: 'Log out successfully!' }));
    } catch (error) {
        console.error(error);
        next(createError(400, 'No token found!'));
    }
});

router.post('/refresh-token', async (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) next(createError(400, 'No token provided!'));

    try {
        const documentToken = await Token.findOne({ token: refreshToken });

        if (!documentToken) next(createError(400, 'No token found!'));
        else {
            const payload = verify(documentToken.token, REFRESH_TOKEN_SECRET);
            const accessToken = sign({ user: payload }, ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });

            res.json(
                jsonResponse(200, {
                    message: 'Access token updated successfully!',
                    accessToken
                })
            );
        }
    } catch (error) {
        console.error(error);
        next(
            createError(
                500,
                'An internal error has ocurred. Please try again later!'
            )
        );
    }
});

router.post('/signup', async (req, res, next) => {
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
            const accessToken = user.createAccessToken();
            const refreshToken = await user.createRefreshToken();

            await user.save();

            res.json({
                accessToken,
                refreshToken,
                message: 'User registered successfuly!'
            });
        }
    }
});

module.exports = router;
