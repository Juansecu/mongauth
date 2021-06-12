const { Schema, model } = require('mongoose');

const Product = require('./product.model');
const User = require('./user.model');

const orderSchema = new Schema({
    products: [{ _id: String, title: String, price: Number, quantity: Number }],
    total: {
        type: Number,
        default: 0
    },
    userId: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

orderSchema.pre('save', async function (next) {
    if (this.isModified('products' || this.isNew)) {
        let user;
        let promises = [];

        const { products, userId } = this;

        try {
            user = await User.findById(userId);
        } catch (error) {
            console.error(error);
            next(
                new Error(
                    `User with ID ${userId} does not exist. Please try again later!`
                )
            );
        }

        try {
            if (!products.length)
                next(
                    new Error(
                        `No products found in the order with ID ${this._id}. Add some products before continuing with this process.`
                    )
                );

            let resultPromises;

            for (const product of products) {
                promises.push(await Product.findById(product._id));
            }

            resultPromises = await Promise.all(promises);

            resultPromises.forEach((product, index) => {
                this.total += product.price * products[index].quantity;
                products[index].title = product.title;
                products[index].price = product.price;
            });
        } catch (error) {
            console.error(error);
            next(new Error('Missing information. Please try again later!'));
        }
    } else next();
});

module.exports = model('Order', orderSchema);
