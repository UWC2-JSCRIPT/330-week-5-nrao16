const { Router } = require("express");
const router = Router();
router.use("/login", require('./login'));
router.use("/items", require('./items'));
router.use("/orders", require('./orders'));

const { errorHandler } = require("./middleware/error");

router.use(errorHandler);

module.exports = router;