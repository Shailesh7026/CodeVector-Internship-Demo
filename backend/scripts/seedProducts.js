import 'dotenv/config';
import {faker} from "@faker-js/faker"
import {Pool} from "pg"

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

const TOTAL_PRODUCTS = 200000;
const BATCH_SIZE = 5000;

async function seedProducts() {
  try {
    console.log("Starting seed...");

    for (let i = 0; i < TOTAL_PRODUCTS; i += BATCH_SIZE) {
      const values = [];
      const placeholders = [];

      for (let j = 0; j < BATCH_SIZE; j++) {
        const index = i + j;

        const name = faker.commerce.productName();
        const category =
          categories[Math.floor(Math.random() * categories.length)];
        const price = faker.number.int({ min: 100, max: 100000 });

        const createdAt = faker.date.past();
        const updatedAt = faker.date.between({
          from: createdAt,
          to: new Date()
        });

        const offset = j * 5;

        placeholders.push(
          `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`
        );

        values.push(name, category, price, createdAt, updatedAt);
      }

      const query = `
        INSERT INTO products (name, category, price, created_at, updated_at)
        VALUES ${placeholders.join(",")}
      `;

      await pool.query(query, values);
      console.log(`Inserted ${Math.min(i + BATCH_SIZE, TOTAL_PRODUCTS)} products`);
    }

    console.log("Seeding completed");
    process.exit(0);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seedProducts();