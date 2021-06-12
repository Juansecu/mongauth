require('dotenv').config();

const { verify } = require('jsonwebtoken');

const { ACCESS_TOKEN_SECRET } = process.env;

exports.checkAuth = (req, res, next) => {
    const header = req.header('Authorization');

    if (!header) throw new Error('Access denied.');

    // Authorization <token>
    const [bearer, token] = header.split(' ');

    if (bearer === 'Bearer' && token) {
        try {
            const payload = verify(token, ACCESS_TOKEN_SECRET);
            req.user = payload.user;
            next();
        } catch (error) {
            console.error(error);

            switch (error.name) {
                case 'TokenExpiredError':
                    throw new Error('Token expired. Please log in again!');
                case 'JsonWebTokenError':
                    throw new Error(
                        'Invalid token. Please check your access token and try again later!'
                    );
            }
        }
    } else throw new Error('Token incorrect.');
};
