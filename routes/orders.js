const { Router } = require("express");
const router = Router();

const orderDAO = require('../daos/order');
const itemDAO = require('../daos/item');

const { isAuthorized, isAdmin } = require('./auth');

router.use(isAuthorized);

// create an item
router.post("/", async (req, res, next) => {
    try {
        const orderItems = req.body;
        if (!orderItems || !orderItems.length === 0) {
            res.status(400).send('At least one item id is required');
        } else {
            console.log(`orderItems - ${JSON.stringify(orderItems)}`);

            let totalPrice = 0;
            const mappedIds = [];
            for (const itemId of orderItems) {
                console.log(`itemId - ${itemId._id}`)
                const existingItem = await itemDAO.getById(itemId._id);
                console.log(`existingItem - ${JSON.stringify(existingItem)}`)
                if (existingItem) {
                    totalPrice += existingItem?.price;
                    mappedIds.push(existingItem._id);
                }

            }

            const orderObj = { userId: req.user._id, items: mappedIds, total: totalPrice }
            console.log(`orderObj--${JSON.stringify(orderObj)}`);
            const savedOrder = await orderDAO.create(orderObj);
            res.json({ savedOrder });
        }
    } catch (e) {
        next(e);
    }
});

module.exports = router;