const mongoose = require("mongoose");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");

exports.transferMoney = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { fromAccountId, toAccountId, amount } = req.body;

    if (!fromAccountId || !toAccountId || !amount) {
      throw new Error("Missing required fields");
    }

    const fromAccount = await Account.findById(fromAccountId).session(session);
    const toAccount = await Account.findById(toAccountId).session(session);

    if (!fromAccount || !toAccount) {
      throw new Error("Account not found");
    }

    if (fromAccount.balance < amount) {
      throw new Error("Insufficient balance");
    }

    // Debit
    fromAccount.balance -= amount;
    await fromAccount.save({ session });

    // Credit
    toAccount.balance += amount;
    await toAccount.save({ session });

    // Log success
    await Transaction.create(
      [
        {
          fromAccount: fromAccountId,
          toAccount: toAccountId,
          amount,
          status: "SUCCESS",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Transaction successful" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    await Transaction.create({
      fromAccount: req.body.fromAccountId,
      toAccount: req.body.toAccountId,
      amount: req.body.amount,
      status: "FAILED",
    });

    res.status(400).json({
      message: "Transaction failed",
      error: error.message,
    });
  }
};