const mongoose = require('mongoose');
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
        if (!orderItems || !orderItems.length === 0 ||
            orderItems.some(id => id === null)) {
            res.status(400).send('Item id is required and has to be valid.');
        } else {
            //console.log(`orderItems - ${JSON.stringify(orderItems)}`);

            let totalPrice = 0;
            const mappedIds = [];
            for (const itemId of orderItems) {
                //console.log(`itemId - ${itemId}`)
                const existingItem = await itemDAO.getById(itemId);
                //console.log(`existingItem - ${JSON.stringify(existingItem)}`)
                if (existingItem) {
                    totalPrice += existingItem?.price;
                    mappedIds.push(existingItem._id);
                } else {
                    res.status(400).send(`Item id ${itemId} not found.`);
                }

            }
            //console.log(`mappedIds - ${mappedIds}`);

            const orderObj = { userId: req.user._id, items: mappedIds, total: totalPrice }
            console.log(`orderObj--${JSON.stringify(orderObj)}`);
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
        console.log(`order -- ${JSON.stringify(order)}`);
        if (order) {
            res.json(order);
        } else {
            res.sendStatus(404);
        }
    } catch (e) {
        next(e);
    }
});

//  Get all items 
router.get("/", async (req, res, next) => {
    try {
        console.log(`req.user._id: ${req.user._id}`);
        let orders = [];
        if (req?.user?.roles?.includes('admin')) {
            orders = await orderDAO.getAll();
        } else {
            orders = await orderDAO.getByUserId(req.user._id);
        }
        console.log(`orders-${JSON.stringify(orders)}`);
        res.json(orders);
    } catch (e) {
        next(e);
    }
});


module.exports = router;