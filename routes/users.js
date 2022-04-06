const express = require('express');
const router = express.Router();
const User = require('../models').User;
const Balance = require('../models').Balance;
const TransactionModel = require('../models').Transaction;
const { sequelize } = require('../models');
router.get('/', (req, res) => {
  User.findAll().then(
    (users) => {
      res.json(users);
    },
    (error) => {
      res.json(error);
    }
  );
});
router.post('/', (req, res) => {
  const { username, email, password } = req.body;
  User.create({ username, email, password }).then(
    (user) => {
      res.json(user);
    },
    (error) => {
      res.json(error);
    }
  );
});
router.get('/balances', (req, res) => {
  Balance.findAll({ include: User }).then(
    (balances) => {
      res.json(balances);
    },
    (error) => {
      res.json(error);
    }
  );
});
router.post('/balances', (req, res) => {
  const { balance, userId } = req.body;
  Balance.create({ balance, userId }).then(
    (balance) => {
      res.json(balance);
    },
    (err) => {
      res.json(err);
    }
  );
});
router.get('/transactions', (req, res) => {
  TransactionModel.findAll().then(
    (transactions) => {
      res.json(transactions);
    },
    (error) => {
      res.json(error);
    }
  );
});
router.post('/transactions', (req, res) => {
  const { amount, userId } = req.body;
  TransactionModel.create({ amount, userId }).then(
    (transaction) => {
      res.json(transaction);
    },
    (error) => {
      res.json(error);
    }
  );
});
router.put('/', async (req, res) => {
  const { senderName, recieverName, trans_amount } = req.body;
  let transaction;
  const sender = await User.findOne({
    where: { username: senderName },
  });
  console.log(sender);
  if (sender === null) {
    res.json({ status: 0, data: 'sender doesnt exist' });
  } else {
    const reciever = await User.findOne({
      where: { username: recieverName },
    });
    if (reciever === null) {
      res.json({ status: 0, data: 'reciever doesnt exist' });
    } else {
      try {
        transaction = await sequelize.transaction();
        const sender_balance = await Balance.findOne({
          where: { userId: sender.id },
        });
        if (sender_balance.balance - trans_amount < 0) {
          res.json({ status: 0, data: 'sender has less balance' });
        } else {
          const reciever_balance = await Balance.findOne({
            where: { userId: reciever.id },
          });
          await Balance.update(
            {
              balance: Number(sender_balance.balance) - Number(trans_amount),
            },
            { where: { userId: sender.id } },
            { transaction }
          );
          await Balance.update(
            {
              balance: Number(reciever_balance.balance) + Number(trans_amount),
            },
            { where: { userId: reciever.id } },
            { transaction }
          );
          await TransactionModel.create(
            { amount: trans_amount, userId: sender.id },
            { transaction }
          );
          console.log('success');
          await transaction.commit();
          res.json({ status: 1, data: 'transaction successfull' });
        }
      } catch (error) {
        console.log('error');
        if (transaction) {
          await transaction.rollback();
        }
        res.json(error);
      }
    }
  }
});
router.put('/hh', async (req, res) => {
  Balance.findOne({
    include: User,
    where: { User: { username: 'user1' } },
  }).then(
    (user) => {
      res.json(user);
    },
    (err) => {
      res.json(err);
    }
  );
});

module.exports = router;
