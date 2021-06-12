require('dotenv').config();

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

const { compare, hash } = require('bcrypt');
const { sign } = require('jsonwebtoken');
const { Schema, model } = require('mongoose');

const Token = require('./token.model');

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: String,
    lastName: String
});

userSchema.pre('save', function (next) {
    if (this.isModified('password') || this.isNew) {
        hash(this.password, 10, (error, encrypted) => {
            if (error) next(error);
            else {
                this.password = encrypted;
                next();
            }
        });
    } else next();
});

userSchema.methods.checkPassword = async (password, hash) => {
    const same = await compare(password, hash);
    return same;
};

userSchema.methods.checkUsernameExistence = async username => {
    const result = await model('User').find({ username });
    return result.length > 0;
};

userSchema.methods.createAccessToken = function () {
    const { _id, username } = this;
    const accessToken = sign({ user: { _id, username } }, ACCESS_TOKEN_SECRET, {
        expiresIn: '1d'
    });

    return accessToken;
};

userSchema.methods.createRefreshToken = async function () {
    const { _id, username } = this;
    const refreshToken = sign(
        { user: { _id, username } },
        REFRESH_TOKEN_SECRET,
        { expiresIn: '30d' }
    );

    try {
        await new Token({ token: refreshToken }).save();
        return refreshToken;
    } catch (error) {
        console.error(error);
    }
};

module.exports = model('User', userSchema);
