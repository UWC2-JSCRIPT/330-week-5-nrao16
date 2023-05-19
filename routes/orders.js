const { Router } = require("express");
const router = Router();

const orderDAO = require('../daos/order');
const itemDAO = require('../daos/item');

const { isAuthorized } = require('./middleware/auth');

router.use(isAuthorized);

// create an item
router.post("/", async (req, res, next) => {
    try {
        const orderItems = req.body;
        if (!orderItems || !orderItems.length === 0 ||
            orderItems.some(id => id === null)) {
            res.status(400).send('Item id is required and has to be valid.');
        } else {
            let totalPrice = 0;
            const mappedIds = [];
            for (const itemId of orderItems) {
                const existingItem = await itemDAO.getById(itemId);
                if (existingItem) {
                    totalPrice += existingItem?.price;
                    mappedIds.push(existingItem._id);
                } else {
                    res.status(400).send(`Item id ${itemId} not found.`);
                }

            }
            const orderObj = { userId: req.user._id, items: mappedIds, total: totalPrice }
            const savedOrder = await orderDAO.create(orderObj);
            res.json(savedOrder);
        }
    } catch (e) {
        next(e);
    }
});

// Get single order for given order id
router.get("/:id", async (req, res, next) => {
    try {
        let order = {};
        if (req?.user?.roles?.includes('admin')) {
            order = await orderDAO.getById(req.params.id);
        } else {
            order = await orderDAO.getByUserAndId(req.user._id, req.params.id);
        }
        if (order[0]) {
            res.json(order[0]);
        } else {
            res.sendStatus(404);
        }
    } catch (e) {
        console.log(e);
        next(e);
    }
});

//  Get all items 
router.get("/", async (req, res, next) => {
    try {
        let orders = [];
        if (req?.user?.roles?.includes('admin')) {
            orders = await orderDAO.getAll();
        } else {
            orders = await orderDAO.getAllByUserId(req.user._id);
        }
        res.json(orders);
    } catch (e) {
        next(e);
    }
});


module.exports = router;