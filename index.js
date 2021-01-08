const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// const { Pool, Client } = require('pg');

const Item = require('./Item');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/acid-test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

// const pool = new Pool();

// (async () => {
//   await pool.query(`
//     CREATE TABLE IF NOT EXISTS products (
//       id serial PRIMARY KEY,
//       name varchar(50),
//       qty int,
//       price NUMERIC(6,2)
//     )
//   `);
// })();

// app.get('/', async (req, res) => {
//   const result = await pool.query('SELECT *, xmin, xmax FROM products');

//   return res.status(200).send(result.rows);
// });

// app.post('/items', async (req, res) => {
//   const { name, qty, price } = req.body;

//   const query = `
//     INSERT INTO products(name, qty, price) VALUES('${name}', ${qty}, ${price}) RETURNING *
//   `;

//   const result = await pool.query(query);

//   res.send(result.rows[0]);
// });

// app.put('/items/:id', async (req, res) => {
//   const { qty } = req.body;
//   const { id } = req.params;

//   const client = await pool.connect();
//   try {
//     await client.query('BEGIN;');
//     await client.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;');

//     // get item first
//     let item = await client.query(
//       `SELECT xmin, * FROM products WHERE id = ${id}`,
//     );

//     item = item.rows[0];

//     console.log(item.qty, qty);

//     if (item.qty - qty < 0) {
//       await client.query('ROLLBACK;');
//       console.log('No items to buy');
//       return res.status(500).json({ message: 'no item to buy' });
//     }

//     const query = `
//     UPDATE products
//     SET qty = qty - ${qty}
//     WHERE id = ${id} and xmin = ${item.xmin} and qty = ${item.qty} RETURNING *;
//   `;

//     const result = await client.query(query);

//     await client.query('COMMIT;');

//     res.send(result.rows[0]);
//   } catch (e) {
//     console.log('error', e.message);
//     await client.query('ROLLBACK;');
//     res.status(500).json({ error: e.message });
//   }
// });

const findItem = async (id) => {
  return Item.findById(id);
};

app.get('/items', async function (req, res) {
  console.log('Hello', Date.now());
  const result = await Item.find();

  res.status(200).send({ items: result });
});

app.get('/items/:id', async (req, res) => {
  const item = await findItem(req.params.id);
  res.status(200).send({ item });
});

app.post('/items', async (req, res) => {
  let newItem = new Item();
  newItem.name = req.body.name;
  newItem.qty = Number(req.body.qty);

  newItem = await newItem.save();

  res.send(newItem);
});

app.put('/items/:id', async (req, res) => {
  const qty = Number(req.body.qty);
  const session = await db.startSession();
  try {
    await session.startTransaction();
    let item = await findItem(req.params.id);

    if (item.qty - qty < 0) {
      await session.abortTransaction();
      return res.status(500).json('Outdated item');
    }

    item.qty = item.qty - qty;

    await item.save();
    await session.commitTransaction();

    await session.endSession();
    return res.status(200).json(item);
  } catch (e) {
    console.log(e.message);
    return res.status(500).json(e.message);
  }
});

app.listen(3000);
