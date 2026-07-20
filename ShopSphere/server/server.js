require("dotenv").config({ path: `${__dirname}/.env` });
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log("========================================");
  console.log("ShopSphere server is running");
  console.log(`Website: http://localhost:${PORT}`);
  console.log(`Login page: http://localhost:${PORT}/pages/login.html`);
  console.log("========================================");
});
