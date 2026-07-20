# ShopSphere

ShopSphere is a full-stack e-commerce website built as an internship-ready project. It demonstrates authentication, protected routes, product catalog management, shopping cart flows, checkout, order history, admin analytics, and a responsive frontend using the requested stack.

- Frontend: HTML, CSS, JavaScript, Fetch API
- Backend: Node.js, Express.js
- Database: MongoDB, Mongoose
- Authentication: JWT, bcrypt-compatible hashing
- Utilities: Multer, Cookie Parser, dotenv, Morgan, Express Validator

## Features

- Authentication: register, login, logout, profile, protected routes
- Products: CRUD, search, category filter, price range, sorting, pagination
- Cart: add item, update quantity, remove item, price calculation
- Wishlist: save products from listing/detail pages
- Orders: checkout, stock reduction, order history, cancellation
- Reviews: add and fetch product reviews
- Admin dashboard: catalog overview, product list, revenue, inventory value, low-stock summary
- Frontend pages: home, login, register, products, cart, checkout, orders, profile
- UI extras: dark mode, skeleton states, responsive layout, recently viewed products, coupons, comparison tray
- Seed data: 24 products across 6 categories and demo login accounts

## Demo Credentials

After running `npm run seed`, use:

```text
User: demo@shopsphere.com / demo123
Admin: admin@shopsphere.com / admin123
```

## Project Highlights

- JWT token is stored after successful login/register and required before accessing store pages.
- MongoDB product seed includes realistic INR prices, stock counts, ratings, discounts, brands, and images.
- Product listing supports search, category filter, price range, sort, and product detail pages.
- Cart and checkout show practical e-commerce flow with coupon support and order tracking.
- Admin page summarizes product count, orders, users, revenue, inventory value, low stock, and category counts.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create or update `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/shopsphere
JWT_SECRET=replace_this_with_a_long_secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

3. Start MongoDB locally, then seed demo data:

```bash
npm run seed
```

4. Run the server:

```bash
npm run dev
```

5. Open:

```text
http://localhost:5001
```

The terminal prints the exact website and login links when the server starts.
