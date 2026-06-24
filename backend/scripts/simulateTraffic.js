import 'dotenv/config';
import { faker } from "@faker-js/faker"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const categories = [
  "Electronics",
  "Books",
  "Clothing",
  "Sports",
  "Home"
];

async function addProduct() {
  try {
    const name = faker.commerce.productName();
    const category =
      categories[Math.floor(Math.random() * categories.length)];
    const price = faker.number.int({ min: 100, max: 100000 });

    await pool.query(
      `
      INSERT INTO products (name, category, price)
      VALUES ($1, $2, $3)
      `,
      [name, category, price]
    );

    console.log("Added new product");
  } catch (error) {
    console.error(error);
  }
}

async function updateRandomProduct() {
  try {
    const result = await pool.query(`
      SELECT id
      FROM products
      ORDER BY RANDOM()
      LIMIT 1
    `);

    if (!result.rows.length) return;

    const id = result.rows[0].id;
    const newPrice = faker.number.int({ min: 100, max: 100000 });

    await pool.query(
      `
      UPDATE products
      SET price = $1
      WHERE id = $2
      `,
      [newPrice, id]
    );

    console.log(`Updated product ${id}`);
  } catch (error) {
    console.error(error);
  }
}

function startSimulation() {
  setInterval(async () => {
    const action = Math.random();

    if (action < 0.5) {
      await addProduct();
    } else {
      await updateRandomProduct();
    }
  }, 3000);
}

startSimulation();

export {addProduct , updateRandomProduct , startSimulation};