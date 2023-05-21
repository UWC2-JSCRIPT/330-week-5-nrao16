const { Router } = require("express");
const router = Router();

const itemDAO = require('../daos/item');
const { isAuthorized, isAdmin } = require('./middleware/auth');

router.use(isAuthorized);

// create an item
router.post("/", isAdmin, async (req, res, next) => {
    try {
        const item = req.body;
        if (!item || !item.title || !item.price) {
            res.status(400).send('Item title and price is required');
        } else {
            const savedItem = await itemDAO.create(item);
            res.json(savedItem);
        }
    } catch (e) {
        next(e);
    }
});

//  Get all items 
router.get("/", async (req, res, next) => {
    try {
        let items = [];
        items = await itemDAO.getAll();
        res.json(items);
    } catch (e) {
        next(e);
    }
});

// Get single item for given item id
router.get("/:id", async (req, res, next) => {
    try {
        const item = await itemDAO.getById(req.params.id);
        if (item) {
            res.json(item);
        } else {
            res.sendStatus(404);
        }
    } catch (e) {
        next(e);
    }
});

// Update single item for given item id 
router.put("/:id", isAdmin, async (req, res, next) => {
    const itemId = req.params.id;
    const item = req.body;
    if (!item || JSON.stringify(item) === '{}' || !item.title || !item.price) {
        res.status(400).send('Item title and price are required');
    } else {
        const isItemFound = await itemDAO.getById(itemId);
        if (!isItemFound) {
            res.status(400).send(`Item with id ${itemId} not found.`);
        }
        const updatedItem = await itemDAO.updateById(itemId, item);
        updatedItem ? res.json(updatedItem) : res.status(404).send(`item id ${itemId} not found.`)
    }
});

module.exports = router;