require("dotenv").config({ path: `${__dirname}/.env` });
const mongoose = require("mongoose");
const Product = require("./models/Product");
const User = require("./models/User");
const products = require("./data/products");

const demoUsers = [
  {
    name: "Demo User",
    email: "demo@shopsphere.com",
    password: "demo123",
    phone: "9876543210",
    role: "user"
  },
  {
    name: "Admin User",
    email: "admin@shopsphere.com",
    password: "admin123",
    phone: "9876500000",
    role: "admin"
  }
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const operations = products.map((product) => ({
      updateOne: {
        filter: { name: product.name },
        update: { $set: product },
        upsert: true
      }
    }));

    const result = await Product.bulkWrite(operations);
    for (const demoUser of demoUsers) {
      const exists = await User.findOne({ email: demoUser.email });
      if (!exists) {
        await User.create(demoUser);
      }
    }
    const total = await Product.countDocuments();

    console.log(`Products seeded successfully.`);
    console.log(`Inserted: ${result.upsertedCount}, updated: ${result.modifiedCount}, total products: ${total}`);
    console.log("Demo accounts ready:");
    console.log("User: demo@shopsphere.com / demo123");
    console.log("Admin: admin@shopsphere.com / admin123");
  } catch (error) {
    console.error(`Product seeding failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedProducts();
