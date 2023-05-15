const { Router } = require("express");
const router = Router();
router.use("/login", require('./login'));
router.use("/items", require('./items'));
router.use("/orders", require('./orders'));

router.use((err, req, res, next) => {
    if (err.message.includes('Cast to ObjectId failed') || err.message.includes('Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer')) {
       res.status(400).send('Invalid id provided');
    } else {
       res.status(500).send('Something broke!');
    }
 });

module.exports = router;