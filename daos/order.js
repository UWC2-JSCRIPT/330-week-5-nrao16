const mongoose = require('mongoose');

const Order = require('../models/order');

module.exports = {};

module.exports.create = async (orderObj) => {
    try {
        console.log(`orderObj - ${orderObj}`);
        return await Order.create(orderObj);
    } catch (e) {
        if (e.message.includes('validation failed') || e.message.includes('dup key')) {
            throw new BadDataError(e.message);
        }
        throw e;
    }
}
