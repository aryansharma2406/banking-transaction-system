const express = require("express");
const router = express.Router();
const { transferMoney } = require("../controllers/transactionController");

router.post("/transfer", transferMoney);

module.exports = router;