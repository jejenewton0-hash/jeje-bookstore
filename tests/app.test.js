const request = require('supertest');
const app = require('../server');

afterAll(done => {
  done();
});

describe('Products API', () => {
  test('GET /api/products returns array', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/products/categories returns categories', async () => {
    const res = await request(app).get('/api/products/categories');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/products with search filter works', async () => {
    const res = await request(app).get('/api/products?search=Achebe');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/products/:id with invalid id returns 404', async () => {
    const res = await request(app).get('/api/products/nonexistentid123');
    expect(res.statusCode).toBe(404);
  });
});

describe('Cart API', () => {
  test('GET /api/cart returns cart object', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(res.body).toHaveProperty('total');
  });

  test('POST /api/cart/add with invalid productId returns 404', async () => {
    const res = await request(app)
      .post('/api/cart/add')
      .send({ productId: 'nonexistentid123', quantity: 1 });
    expect(res.statusCode).toBe(404);
  });
});

describe('Auth API', () => {
  test('POST /api/auth/register with invalid data returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: '', email: 'bad-email', password: '123' });
    expect(res.statusCode).toBe(400);
  });

  test('POST /api/auth/login with wrong credentials returns 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrong@test.com', password: 'wrongpass' });
    expect(res.statusCode).toBe(401);
  });
});

describe('Orders API', () => {
  test('POST /api/orders with empty cart returns 400', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ name: 'Test User', email: 'test@test.com', phone: '0788000000', address: 'Kigali' });
    expect(res.statusCode).toBe(400);
  });
});

describe('Page Routes', () => {
  test('GET / returns homepage', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('JEJE');
  });

  test('GET /products returns products page', async () => {
    const res = await request(app).get('/products');
    expect(res.statusCode).toBe(200);
  });

  test('GET /cart returns cart page', async () => {
    const res = await request(app).get('/cart');
    expect(res.statusCode).toBe(200);
  });

  test('GET /login returns login page', async () => {
    const res = await request(app).get('/login');
    expect(res.statusCode).toBe(200);
  });
});
