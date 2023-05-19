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
    console.log(`getById`);
    const ordersWithItems = Order.aggregate([{
        $match: { _id: new mongoose.Types.ObjectId(orderId) }
    },
    {
        $lookup:
        {
            from: "items",
            localField: "items",
            foreignField: "_id",
            as: "items"
        }
    },
    { $project: { "_id": 0, "__v": 0, "items._id": 0, "items.__v": 0 } }
    ]);

    console.log(`orderWithItems - ${JSON.stringify(ordersWithItems)}`);
    return ordersWithItems;
}

module.exports.getByUserAndId = async (userId, orderId) => {
    console.log(`getByUserAndId`);

    const ordersWithItemsForUser = Order.aggregate([{
        $match: {
            _id: new mongoose.Types.ObjectId(orderId),
            userId: new mongoose.Types.ObjectId(userId)
        }
    },
    {
        $lookup:
        {
            from: "items",
            localField: "items",
            foreignField: "_id",
            as: "items"
        }
    },
    { $project: { "_id": 0, "__v": 0, "items._id": 0, "items.__v": 0 } }
    ]);

    return ordersWithItemsForUser;
}

module.exports.getAllByUserId = async (userId) => {
    console.log(`getByUserId`);
    return Order.find({ userId: userId }).lean();
}

module.exports.getAll = async () => {
    console.log(`getAll`);
    return Order.find().lean();
}

class BadDataError extends Error { };
module.exports.BadDataError = BadDataError;