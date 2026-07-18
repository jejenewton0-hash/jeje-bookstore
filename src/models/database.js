const bcrypt = require('bcryptjs');
const isProd = process.env.NODE_ENV === 'production';

let Category, Product, User, Order;
let find, findOne, insert, update, count;

if (isProd) {
  // ── MongoDB Atlas (production) ──────────────────────────────────────────────
  const mongoose = require('mongoose');

  const mongoUri = (process.env.MONGO_URI || '').replace(/&amp;/g, '&');
  mongoose.connect(mongoUri).then(() => {
    console.log('MongoDB Atlas connected');
    seedMongo();
  }).catch(err => console.error('MongoDB connection error:', err));

  const categorySchema = new mongoose.Schema({ name: String, description: String });
  const productSchema  = new mongoose.Schema({
    name: String, description: String, price: Number, stock: Number,
    categoryId: String, author: String, isbn: String, image: String, createdAt: Date
  });
  const userSchema = new mongoose.Schema({
    name: String, email: { type: String, unique: true },
    password: String, role: String, createdAt: Date
  });
  const orderSchema = new mongoose.Schema({
    customerName: String, customerEmail: String, customerPhone: String,
    customerAddress: String, items: Array, total: Number,
    status: String, paymentMethod: String, createdAt: Date
  });

  Category = mongoose.model('Category', categorySchema);
  Product  = mongoose.model('Product', productSchema);
  User     = mongoose.model('User', userSchema);
  Order    = mongoose.model('Order', orderSchema);

  find    = (Model, query = {}) => Model.find(query).lean();
  findOne = (Model, query)       => Model.findOne(query).lean();
  insert  = (Model, data)        => Model.create(data);
  update  = (Model, query, upd)  => Model.updateOne(query, upd);
  count   = (Model, query = {})  => Model.countDocuments(query);

  async function seedMongo() {
    const adminExists = await User.findOne({ email: 'admin@jeje.rw' });
    if (adminExists) return;

    const cats = await Category.insertMany([
      { name: 'Fiction' }, { name: 'Non-Fiction' },
      { name: 'Science' }, { name: 'History' }, { name: 'Children' }
    ]);
    const catMap = {};
    cats.forEach(c => { catMap[c.name] = c._id.toString(); });

    await Product.insertMany([
      { name: 'Things Fall Apart', author: 'Chinua Achebe', isbn: '9780385474542', price: 8500, stock: 20, categoryId: catMap['Fiction'], description: 'A classic African novel.', image: 'https://covers.openlibrary.org/b/isbn/9780385474542-M.jpg', createdAt: new Date() },
      { name: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '9780553380163', price: 12000, stock: 15, categoryId: catMap['Science'], description: 'Exploring the universe.', image: 'https://covers.openlibrary.org/b/isbn/9780553380163-M.jpg', createdAt: new Date() },
      { name: 'Sapiens', author: 'Yuval Noah Harari', isbn: '9780062316097', price: 14000, stock: 18, categoryId: catMap['History'], description: 'A brief history of humankind.', image: 'https://covers.openlibrary.org/b/isbn/9780062316097-M.jpg', createdAt: new Date() },
      { name: 'The Alchemist', author: 'Paulo Coelho', isbn: '9780062315007', price: 9500, stock: 25, categoryId: catMap['Fiction'], description: 'A journey of self-discovery.', image: 'https://covers.openlibrary.org/b/isbn/9780062315007-M.jpg', createdAt: new Date() },
      { name: 'Educated', author: 'Tara Westover', isbn: '9780399590504', price: 13000, stock: 12, categoryId: catMap['Non-Fiction'], description: 'A memoir about education.', image: 'https://covers.openlibrary.org/b/isbn/9780399590504-M.jpg', createdAt: new Date() },
      { name: 'The Little Prince', author: 'Antoine de Saint-Exupéry', isbn: '9780156012195', price: 7000, stock: 30, categoryId: catMap['Children'], description: 'A timeless children\'s classic.', image: 'https://covers.openlibrary.org/b/isbn/9780156012195-M.jpg', createdAt: new Date() },
      { name: 'Purple Hibiscus', author: 'Chimamanda Ngozi Adichie', isbn: '9781616202415', price: 9000, stock: 20, categoryId: catMap['Fiction'], description: 'A story of faith and family in Nigeria.', image: 'https://covers.openlibrary.org/b/isbn/9781616202415-M.jpg', createdAt: new Date() },
      { name: 'The Origin of Species', author: 'Charles Darwin', isbn: '9780140432053', price: 11000, stock: 10, categoryId: catMap['Science'], description: 'The foundation of evolutionary biology.', image: 'https://covers.openlibrary.org/b/isbn/9780140432053-M.jpg', createdAt: new Date() },
      { name: 'Guns, Germs, and Steel', author: 'Jared Diamond', isbn: '9780393317558', price: 13500, stock: 14, categoryId: catMap['History'], description: 'Why some societies dominate others.', image: 'https://covers.openlibrary.org/b/isbn/9780393317558-M.jpg', createdAt: new Date() },
      { name: 'Becoming', author: 'Michelle Obama', isbn: '9781524763138', price: 15000, stock: 16, categoryId: catMap['Non-Fiction'], description: 'Memoir of the former First Lady.', image: 'https://covers.openlibrary.org/b/isbn/9781524763138-M.jpg', createdAt: new Date() },
      { name: 'Charlotte\'s Web', author: 'E.B. White', isbn: '9780061124952', price: 6500, stock: 22, categoryId: catMap['Children'], description: 'A beloved story of friendship.', image: 'https://covers.openlibrary.org/b/isbn/9780061124952-M.jpg', createdAt: new Date() },
      { name: 'Half of a Yellow Sun', author: 'Chimamanda Ngozi Adichie', isbn: '9781400095209', price: 10500, stock: 18, categoryId: catMap['Fiction'], description: 'Nigeria\'s civil war through three lives.', image: 'https://covers.openlibrary.org/b/isbn/9781400095209-M.jpg', createdAt: new Date() }
    ]);

    await User.create({ name: 'Admin', email: 'admin@jeje.rw', password: bcrypt.hashSync('admin123', 10), role: 'admin', createdAt: new Date() });
    console.log('MongoDB seed complete');
  }

} else {
  // ── NeDB (local development) ────────────────────────────────────────────────
  const Datastore = require('@seald-io/nedb');
  const path = require('path');
  const dbDir = path.join(__dirname, '../../data');

  Category = new Datastore({ filename: path.join(dbDir, 'categories.db'), autoload: true });
  Product  = new Datastore({ filename: path.join(dbDir, 'products.db'),  autoload: true });
  User     = new Datastore({ filename: path.join(dbDir, 'users.db'),     autoload: true });
  Order    = new Datastore({ filename: path.join(dbDir, 'orders.db'),    autoload: true });

  find    = (db, query = {}) => new Promise((res, rej) => db.find(query, (e, d) => e ? rej(e) : res(d)));
  findOne = (db, query)      => new Promise((res, rej) => db.findOne(query, (e, d) => e ? rej(e) : res(d)));
  insert  = (db, data)       => new Promise((res, rej) => db.insert(data, (e, d) => e ? rej(e) : res(d)));
  update  = (db, q, upd)     => new Promise((res, rej) => db.update(q, upd, {}, (e, n) => e ? rej(e) : res(n)));
  count   = (db, query = {}) => new Promise((res, rej) => db.count(query, (e, n) => e ? rej(e) : res(n)));

  (async () => {
    const admin = await findOne(User, { email: 'admin@jeje.rw' });
    if (admin) return;

    const cats = await Promise.all([
      insert(Category, { name: 'Fiction' }), insert(Category, { name: 'Non-Fiction' }),
      insert(Category, { name: 'Science' }), insert(Category, { name: 'History' }),
      insert(Category, { name: 'Children' })
    ]);
    const [fiction, nonFiction, science, history, children] = cats;

    await Promise.all([
      insert(Product, { name: 'Things Fall Apart', author: 'Chinua Achebe', isbn: '9780385474542', price: 8500, stock: 20, categoryId: fiction._id, description: 'A classic African novel.', image: 'https://covers.openlibrary.org/b/isbn/9780385474542-M.jpg', createdAt: new Date() }),
      insert(Product, { name: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '9780553380163', price: 12000, stock: 15, categoryId: science._id, description: 'Exploring the universe.', image: 'https://covers.openlibrary.org/b/isbn/9780553380163-M.jpg', createdAt: new Date() }),
      insert(Product, { name: 'Sapiens', author: 'Yuval Noah Harari', isbn: '9780062316097', price: 14000, stock: 18, categoryId: history._id, description: 'A brief history of humankind.', image: 'https://covers.openlibrary.org/b/isbn/9780062316097-M.jpg', createdAt: new Date() }),
      insert(Product, { name: 'The Alchemist', author: 'Paulo Coelho', isbn: '9780062315007', price: 9500, stock: 25, categoryId: fiction._id, description: 'A journey of self-discovery.', image: 'https://covers.openlibrary.org/b/isbn/9780062315007-M.jpg', createdAt: new Date() }),
      insert(Product, { name: 'Educated', author: 'Tara Westover', isbn: '9780399590504', price: 13000, stock: 12, categoryId: nonFiction._id, description: 'A memoir about education.', image: 'https://covers.openlibrary.org/b/isbn/9780399590504-M.jpg', createdAt: new Date() }),
      insert(Product, { name: 'The Little Prince', author: 'Antoine de Saint-Exupéry', isbn: '9780156012195', price: 7000, stock: 30, categoryId: children._id, description: "A timeless children's classic.", image: 'https://covers.openlibrary.org/b/isbn/9780156012195-M.jpg', createdAt: new Date() }),
      insert(Product, { name: 'Purple Hibiscus', author: 'Chimamanda Ngozi Adichie', isbn: '9781616202415', price: 9000, stock: 20, categoryId: fiction._id, description: 'A story of faith and family in Nigeria.', image: 'https://covers.openlibrary.org/b/isbn/9781616202415-M.jpg', createdAt: new Date() }),
      insert(Product, { name: 'The Origin of Species', author: 'Charles Darwin', isbn: '9780140432053', price: 11000, stock: 10, categoryId: science._id, description: 'The foundation of evolutionary biology.', image: 'https://covers.openlibrary.org/b/isbn/9780140432053-M.jpg', createdAt: new Date() }),
      insert(Product, { name: 'Guns, Germs, and Steel', author: 'Jared Diamond', isbn: '9780393317558', price: 13500, stock: 14, categoryId: history._id, description: 'Why some societies dominate others.', image: 'https://covers.openlibrary.org/b/isbn/9780393317558-M.jpg', createdAt: new Date() }),
      insert(Product, { name: 'Becoming', author: 'Michelle Obama', isbn: '9781524763138', price: 15000, stock: 16, categoryId: nonFiction._id, description: 'Memoir of the former First Lady.', image: 'https://covers.openlibrary.org/b/isbn/9781524763138-M.jpg', createdAt: new Date() }),
      insert(Product, { name: "Charlotte's Web", author: 'E.B. White', isbn: '9780061124952', price: 6500, stock: 22, categoryId: children._id, description: 'A beloved story of friendship.', image: 'https://covers.openlibrary.org/b/isbn/9780061124952-M.jpg', createdAt: new Date() }),
      insert(Product, { name: 'Half of a Yellow Sun', author: 'Chimamanda Ngozi Adichie', isbn: '9781400095209', price: 10500, stock: 18, categoryId: fiction._id, description: "Nigeria's civil war through three lives.", image: 'https://covers.openlibrary.org/b/isbn/9781400095209-M.jpg', createdAt: new Date() })
    ]);

    await insert(User, { name: 'Admin', email: 'admin@jeje.rw', password: bcrypt.hashSync('admin123', 10), role: 'admin', createdAt: new Date() });
    console.log('NeDB seed complete');
  })();
}

module.exports = { Category, Product, User, Order, find, findOne, insert, update, count };
