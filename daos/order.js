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
    const ordersWithItems = Order.aggregate([{
        $match: { _id: new mongoose.Types.ObjectId(orderId) }
    },
    { $unwind: '$items' },
    {
        $lookup:
        {
            from: "items",
            localField: "items",
            foreignField: "_id",
            as: "items"
        }
    },
    { $unwind: "$items" },
    { $project: { "items._id": 0, "items.__v": 0 } },
    {
        $group: {
            _id: "$_id",
            userId: { $first: "$userId" },
            total: { $first: "$total" },
            items: { $push: "$items" }
        }
    }
    ]);

    return ordersWithItems;
}

module.exports.getByUserAndId = async (userId, orderId) => {

    const ordersWithItemsForUser = Order.aggregate([{
        $match: {
            _id: new mongoose.Types.ObjectId(orderId),
            userId: new mongoose.Types.ObjectId(userId)
        }
    },
    { $unwind: { path: '$items' } },
    {
        $lookup:
        {
            from: "items",
            localField: "items",
            foreignField: "_id",
            as: "items"
        }
    },
    { $unwind: "$items" },
    { $project: { "items._id": 0, "items.__v": 0 } },
    {
        $group:
        {
            _id: "$_id",
            userId: { $first: "$userId" },
            total: { $first: "$total" },
            items: { $push: "$items" }
        }
    }
    ]);

    return ordersWithItemsForUser;
}

module.exports.getAllByUserId = async (userId) => {
    return Order.find({ userId: userId }).lean();
}

module.exports.getAll = async () => {
    return Order.find().lean();
}

class BadDataError extends Error { };
module.exports.BadDataError = BadDataError;