const mongoose = require('mongoose');

const Item = require('../models/item');

module.exports = {};

module.exports.create = async (itemObj) => {
    try {
        return await Item.create(itemObj);
    } catch (e) {
        if (e.message.includes('validation failed') || e.message.includes('dup key')) {
            throw new BadDataError(e.message);
        }
        throw e;
    }
}

module.exports.getById = async (itemId) => {
    return Item.findOne({ _id: itemId }).lean();
}

module.exports.getListOfIds = async (itemIdList) => {
    return await Item.find( { _id: { $in: itemIdList } } );
};

module.exports.updateById = async (itemId, newObj) => {
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
        return false;
    }
    await Item.updateOne({ _id: itemId }, newObj);
    return true;
}

module.exports.getAll = async () => {
    return await Item.find().lean();
};

class BadDataError extends Error { };
module.exports.BadDataError = BadDataError;