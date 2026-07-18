# JEJE Bookstore — Project Report

**Course:** EWA408510 – E-Commerce and Web Application  
**Student:** Jeje Charles Newton  
**Instructor:** Eric Maniraguha  
**Academic Year:** 2025–2026  
**Deployment URL:** https://jeje-bookstore.onrender.com  
**GitHub:** https://github.com/jejenewton0-hash/jeje-bookstore

---

## 1. Introduction

JEJE Bookstore is a full-stack e-commerce web application built for a Rwanda-based online bookstore. The platform allows customers to browse books, manage a shopping cart, place orders, and track purchases. It is built with Node.js and Express on the backend, EJS for server-side templating, NeDB for local development, and MongoDB Atlas for production. The application is containerized with Docker and deployed on Render.com with a CI/CD pipeline via GitHub Actions.

---

## 2. Problem Statement

Many Rwandan bookstores operate exclusively in physical locations, limiting their reach to local foot traffic. Customers have no way to browse inventory, compare prices, or purchase books online. There is a need for a modern, accessible, and mobile-friendly e-commerce platform that allows a local bookstore to sell books online, accept payments, and manage orders efficiently.

---

## 3. Project Objectives

- Build a responsive and professional e-commerce web application
- Implement full product catalog with search, filter, and pagination
- Provide a complete shopping cart and checkout flow
- Integrate MTN Mobile Money and Cash on Delivery payment options
- Implement user authentication with secure password hashing
- Build an admin dashboard for product and order management
- Containerize the application using Docker
- Implement a CI/CD pipeline using GitHub Actions
- Deploy the application live on Render.com

---

## 4. System Features

| Feature | Description |
|---------|-------------|
| Product Catalog | 12+ books across 5 categories with images, prices, and stock |
| Search & Filter | Filter by title, author, category, and price range |
| Pagination | 9 books per page on the products listing page |
| Shopping Cart | Add, remove, update quantities, auto-calculated totals |
| Checkout | Customer info form, order summary, form validation |
| Payment | Cash on Delivery + MTN Mobile Money (simulated) |
| Order Confirmation | Order ID, items, total displayed after successful checkout |
| User Auth | Register, login, logout with session management |
| Admin Dashboard | Manage products (CRUD), view and update orders |
| Analytics View | Admin analytics page for business insights |
| User Dashboard | Customers can view their order history |
| Docker Support | Dockerfile + docker-compose.yml for containerized deployment |
| CI/CD Pipeline | GitHub Actions: build → test → Docker build → deploy |

---

## 5. Technologies Used

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 |
| Framework | Express.js 4.18 |
| Database (dev) | NeDB (embedded, file-based) |
| Database (prod) | MongoDB Atlas via Mongoose |
| Templating | EJS 3.1 |
| Auth | bcryptjs + express-session |
| Validation | express-validator |
| Testing | Jest + Supertest |
| Container | Docker + docker-compose |
| CI/CD | GitHub Actions |
| Deployment | Render.com |
| Styling | Custom CSS (responsive, mobile-first) |

---

## 6. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                  │
│         EJS Templates + CSS + Vanilla JS             │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP
┌──────────────────────▼──────────────────────────────┐
│                  EXPRESS SERVER                      │
│                   (server.js)                        │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │ pages.js │ │products  │ │  cart.js │             │
│  │ (views)  │ │  .js API │ │   API    │             │
│  └──────────┘ └──────────┘ └──────────┘             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │orders.js │ │  auth.js │ │ admin.js │             │
│  │   API    │ │   API    │ │  routes  │             │
│  └──────────┘ └──────────┘ └──────────┘             │
│                                                      │
│              Session Middleware                      │
└──────────────────────┬──────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────▼──────┐             ┌────────▼───────┐
│  NeDB (dev)  │             │ MongoDB Atlas  │
│ File-based   │             │  (production)  │
│  .db files   │             │   Mongoose     │
└──────────────┘             └────────────────┘
```

**Request Flow:**
1. Browser sends HTTP request to Express server
2. Route handler processes the request
3. Database layer (NeDB or MongoDB) is queried
4. EJS template is rendered with data and returned to browser
5. For API routes, JSON is returned and handled by client-side JS

---

## 7. Database Design

### Collections / Tables

**users**
```
{
  _id:       string (auto),
  name:      string,
  email:     string (unique),
  password:  string (bcrypt hash),
  role:      string ('admin' | 'customer'),
  photo:     string (optional),
  createdAt: Date
}
```

**categories**
```
{
  _id:         string (auto),
  name:        string,
  description: string
}
```

**products**
```
{
  _id:         string (auto),
  name:        string,
  description: string,
  price:       number (RWF),
  stock:       number,
  image:       string (URL),
  categoryId:  string (→ categories._id),
  author:      string,
  isbn:        string,
  createdAt:   Date
}
```

**orders**
```
{
  _id:             string (auto),
  userId:          string (→ users._id, nullable),
  customerName:    string,
  customerEmail:   string,
  customerPhone:   string,
  customerAddress: string,
  paymentMethod:   string ('cod' | 'momo'),
  items: [
    {
      productId: string (→ products._id),
      name:      string,
      image:     string,
      quantity:  number,
      price:     number
    }
  ],
  total:     number,
  status:    string ('pending' | 'processing' | 'shipped' | 'delivered'),
  createdAt: Date
}
```

### Entity Relationships
- `products.categoryId` → `categories._id` (Many-to-One)
- `orders.userId` → `users._id` (Many-to-One, optional for guest checkout)
- `orders.items[].productId` → `products._id` (embedded reference)

---

## 8. Screenshots of the Application

> Screenshots are included in the `/docs/screenshots/` folder of the repository.

| Screen | File |
|--------|------|
| Homepage | `docs/screenshots/homepage.png` |
| Products Page | `docs/screenshots/products.png` |
| Product Detail | `docs/screenshots/product-detail.png` |
| Shopping Cart | `docs/screenshots/cart.png` |
| Checkout | `docs/screenshots/checkout.png` |
| Order Confirmation | `docs/screenshots/order-confirmation.png` |
| Admin Dashboard | `docs/screenshots/admin-dashboard.png` |
| CI/CD Pipeline | `docs/screenshots/cicd-pipeline.png` |
| Docker Build | `docs/screenshots/docker-build.png` |

---

## 9. GitHub Repository

**URL:** https://github.com/jejenewton0-hash/jeje-bookstore

The repository contains:
- Full source code with meaningful commit history
- Complete README.md with setup instructions
- `.github/workflows/ci-cd.yml` for CI/CD
- `Dockerfile` and `docker-compose.yml`
- `render.yaml` for deployment configuration
- `tests/app.test.js` for automated testing

---

## 10. Deployment Link

**Live URL:** https://jeje-bookstore.onrender.com

Deployed on **Render.com** using the `render.yaml` configuration file. The app uses:
- `NODE_ENV=production` → switches database to MongoDB Atlas
- `SESSION_SECRET` → auto-generated by Render
- `MONGO_URI` → MongoDB Atlas connection string (set in Render dashboard)

---

## 11. CI/CD Implementation

The CI/CD pipeline is defined in `.github/workflows/ci-cd.yml` and runs automatically on every push to the `main` branch.

### Pipeline Stages

```
Push to main
     │
     ▼
┌─────────────────┐
│  Build & Test   │  → npm ci → mkdir data → npm test (Jest)
└────────┬────────┘
         │ (on success)
         ▼
┌─────────────────┐
│  Docker Build   │  → docker build -t jeje:latest .
└────────┬────────┘
         │ (on success, main branch only)
         ▼
┌─────────────────┐
│  Deploy         │  → curl Render deploy hook URL
└─────────────────┘
```

### Test Coverage
- `GET /api/products` — returns product array
- `GET /api/products/categories` — returns categories
- `GET /api/products?search=Achebe` — search filter works
- `GET /api/products/:id` — invalid ID returns 404
- `GET /api/cart` — returns cart object with items and total
- `POST /api/cart/add` — invalid product returns 404
- `POST /api/auth/register` — invalid data returns 400
- `POST /api/auth/login` — wrong credentials return 401
- `POST /api/orders` — empty cart returns 400
- `GET /` — homepage returns 200
- `GET /products` — products page returns 200
- `GET /cart` — cart page returns 200
- `GET /login` — login page returns 200

---

## 12. Docker Implementation

### Dockerfile
The application uses a multi-stage-friendly `node:20-alpine` base image for a minimal production image.

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN mkdir -p data
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "server.js"]
```

### docker-compose.yml
```yaml
services:
  app:
    build: .
    ports: ["3000:3000"]
    environment:
      - NODE_ENV=production
      - SESSION_SECRET=jeje-super-secret-2025
    volumes:
      - jeje_data:/app/data
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000"]
```

### Running with Docker
```bash
# Build and run
docker-compose up --build

# Access at http://localhost:3000

# Stop
docker-compose down
```

---

## 13. Challenges Encountered

1. **NeDB vs MongoDB dual support** — The app needed to work with NeDB locally and MongoDB Atlas in production. This was solved by using an environment-based conditional in `database.js` that initializes the correct database layer based on `NODE_ENV`.

2. **Session persistence in Docker** — Express sessions are stored in memory by default, which resets on container restart. This was mitigated by using a persistent Docker volume for the NeDB data files.

3. **Cart state without login** — The cart is session-based, meaning guest users can add items without registering. This required careful session management to ensure cart data persists across page navigations.

4. **Stock management on order** — When an order is placed, stock must be decremented atomically. This was handled by looping through cart items and using `$inc` updates on each product after order creation.

5. **CI/CD deploy hook** — The Render deploy hook URL must be stored as a GitHub secret (`RENDER_DEPLOY_HOOK_URL`) to avoid exposing it in the workflow file.

---

## 14. Future Enhancements

- **Real payment gateway** — Integrate actual MTN Mobile Money API or Stripe for live payments
- **Email notifications** — Send order confirmation emails using Nodemailer
- **Product reviews & ratings** — Allow customers to rate and review books
- **Wishlist** — Let users save books for later
- **Advanced search** — Full-text search with relevance ranking
- **PWA support** — Add service worker and manifest for offline capability
- **Real-time order tracking** — Use WebSockets to push order status updates
- **Multi-vendor support** — Allow multiple sellers to list books
- **Recommendation engine** — Suggest books based on browsing/purchase history

---

## 15. Conclusion

The JEJE Bookstore e-commerce application successfully meets all the project requirements. It provides a complete online shopping experience from product browsing to order confirmation, with a secure authentication system, admin management tools, and MTN Mobile Money payment simulation. The application is fully containerized with Docker, tested with Jest, deployed on Render.com, and automated with a GitHub Actions CI/CD pipeline. The dual-database architecture (NeDB for development, MongoDB Atlas for production) ensures a smooth developer experience while maintaining production-grade reliability.
