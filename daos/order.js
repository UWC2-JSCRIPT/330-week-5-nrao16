const mongoose = require('mongoose');

const Order = require('../models/order');

module.exports = {};

module.exports.create = async (orderObj) => {
    try {
        return await Order.create(orderObj);
    } catch (e) {
        if (e.message.includes('validation failed') || e.message.includes('dup key')) {
            throw new BadDataError(e.message);
        }
        throw e;
    }
}

module.exports.getById = async (orderId) => {
    return Order.findOne({ _id: orderId }).lean();
    // const _id = orderId;
    // const orderWithITems = Order.aggregate([
    //     {$match: { _id } },
    //     { $lookup: {from: 'items', 
    //     localField: '',
    //     foreignField: '_id', 
    //     as: 'item'} }
    // ]);
    // return orderWithUser;
}

module.exports.getByUserAndId = async (userId, orderId) => {
    return Order.findOne({ userId: userId, _id: orderId }).lean();
}

module.exports.getByUserId = async (userId) => {
    return Order.find({ userId: userId }).lean();
}

module.exports.getAll = async () => {
    return Order.find().lean();
}

class BadDataError extends Error { };
module.exports.BadDataError = BadDataError;