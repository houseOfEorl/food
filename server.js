const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = 'food_ordering_platform';
let db;

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Connect to MongoDB and insert sample data if needed
MongoClient.connect(mongoUrl, { useUnifiedTopology: true })
  .then(client => {
    db = client.db(dbName);
    insertSampleData();
    app.listen(PORT, () => {
      console.log(`🚀 Food Ordering API server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

async function insertSampleData() {
  // Sample restaurants
  const restaurants = [
    {
      id: 'rest-1',
      name: 'Mario\'s Pizza Palace',
      show_type: 'Squid Game',
      delivery_platform: 'UberEats',
      rating: 4.5,
      delivery_time: '25-35 min',
      delivery_fee: 2.99,
      image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300',
      address: '123 Main St, City, State',
      phone: '(555) 123-4567'
    },
    {
      id: 'rest-2',
      name: 'Sakura Sushi',
      show_type: 'Alien',
      delivery_platform: 'DoorDash',
      rating: 4.8,
      delivery_time: '30-40 min',
      delivery_fee: 3.49,
      image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300',
      address: '456 Oak Ave, City, State',
      phone: '(555) 234-5678'
    },
    {
      id: 'rest-3',
      name: 'Burger Barn',
      show_type: 'The Matrix',
      delivery_platform: 'Grubhub',
      rating: 4.2,
      delivery_time: '20-30 min',
      delivery_fee: 1.99,
      image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300',
      address: '789 Elm St, City, State',
      phone: '(555) 345-6789'
    }
  ];


  const restaurantCol = db.collection('restaurants');
  for (const restaurant of restaurants) {
    await restaurantCol.updateOne(
      { id: restaurant.id },
      { $setOnInsert: restaurant },
      { upsert: true }
    );
  }

  // Sample menu items
  const menuItems = [
    // Mario's Pizza Palace
    { id: 'item-1', restaurant_id: 'rest-1', name: 'Margherita Pizza', description: 'Fresh tomatoes, mozzarella, basil', price: 16.99, category: 'Pizza', image_url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300' },
    { id: 'item-2', restaurant_id: 'rest-1', name: 'Pepperoni Pizza', description: 'Classic pepperoni with mozzarella cheese', price: 18.99, category: 'Pizza', image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300' },
    { id: 'item-3', restaurant_id: 'rest-1', name: 'Caesar Salad', description: 'Romaine lettuce, parmesan, croutons', price: 12.99, category: 'Salad', image_url: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300' },
    
    // Sakura Sushi
    { id: 'item-4', restaurant_id: 'rest-2', name: 'California Roll', description: 'Crab, avocado, cucumber', price: 8.99, category: 'Sushi', image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300' },
    { id: 'item-5', restaurant_id: 'rest-2', name: 'Salmon Teriyaki', description: 'Grilled salmon with teriyaki sauce', price: 22.99, category: 'Entree', image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300' },
    { id: 'item-6', restaurant_id: 'rest-2', name: 'Miso Soup', description: 'Traditional Japanese soup', price: 4.99, category: 'Soup', image_url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300' },
    
    // Burger Barn
    { id: 'item-7', restaurant_id: 'rest-3', name: 'Classic Cheeseburger', description: 'Beef patty, cheese, lettuce, tomato', price: 13.99, category: 'Burger', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300' },
    { id: 'item-8', restaurant_id: 'rest-3', name: 'BBQ Bacon Burger', description: 'Beef patty, bacon, BBQ sauce, onion rings', price: 16.99, category: 'Burger', image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=300' },
    { id: 'item-9', restaurant_id: 'rest-3', name: 'French Fries', description: 'Crispy golden fries', price: 5.99, category: 'Sides', image_url: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=300' }
  ];

  const menuCol = db.collection('menu_items');
  for (const item of menuItems) {
    await menuCol.updateOne(
      { id: item.id },
      { $setOnInsert: item },
      { upsert: true }
    );
  }
}

// Routes

// Base API route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Food Ordering API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      restaurants: '/api/restaurants',
      restaurant: '/api/restaurants/:id',
      menu: '/api/restaurants/:id/menu',
      orders: '/api/orders',
      search: '/api/search'
    }
  });
});

// Get all restaurants
app.get('/api/restaurants', (req, res) => {
  (async () => {
    try {
      console.log('Fetching all restaurants');
      const restaurants = await db.collection('restaurants').find({}).sort({ rating: -1 }).toArray();
      console.log('Restaurants fetched:', restaurants.length);
      console.log('Restaurants:', restaurants); 
      res.json({ restaurants });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  })();
});

// Get restaurant by ID
app.get('/api/restaurants/:id', (req, res) => {
  const { id } = req.params;
  (async () => {
    try {
      const restaurant = await db.collection('restaurants').findOne({ id });
      if (!restaurant) {
        res.status(404).json({ error: 'Restaurant not found' });
        return;
      }
      res.json({ restaurant });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  })();
});

// Get menu for a restaurant
app.get('/api/restaurants/:id/menu', (req, res) => {
  const { id } = req.params;
  (async () => {
    try {
      const items = await db.collection('menu_items').find({ restaurant_id: id, available: true }).sort({ category: 1, name: 1 }).toArray();
      
      // Group items by category
      const menuByCategory = items.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      }, {});
      
      res.json({ menu: menuByCategory });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  })();
});

// Create new order
app.post('/api/orders', (req, res) => {
  const { customer, items, delivery_platform } = req.body;
  
  if (!customer || !items || !delivery_platform) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const orderId = uuidv4();
  let totalAmount = 0;
  let deliveryFee = 2.99; // Default delivery fee

  // Calculate total amount
  const itemPromises = items.map(item => {
    return new Promise((resolve, reject) => {
      db.get('SELECT price FROM menu_items WHERE id = ?', [item.menu_item_id], (err, row) => {
        if (err) reject(err);
        else {
          totalAmount += row.price * item.quantity;
          resolve();
        }
      });
    });
  });

  Promise.all(itemPromises)
    .then(() => {
      // Create order
      db.run(`INSERT INTO orders (id, customer_name, customer_email, customer_phone, customer_address, 
                                 total_amount, delivery_fee, delivery_platform) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, customer.name, customer.email, customer.phone, customer.address, 
         totalAmount, deliveryFee, delivery_platform], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        // Add order items
        const orderItemPromises = items.map(item => {
          return new Promise((resolve, reject) => {
            db.get('SELECT price FROM menu_items WHERE id = ?', [item.menu_item_id], (err, row) => {
              if (err) reject(err);
              else {
                db.run(`INSERT INTO order_items (id, order_id, menu_item_id, quantity, price) 
                        VALUES (?, ?, ?, ?, ?)`,
                  [uuidv4(), orderId, item.menu_item_id, item.quantity, row.price], (err) => {
                  if (err) reject(err);
                  else resolve();
                });
              }
            });
          });
        });

        Promise.all(orderItemPromises)
          .then(() => {
            res.json({ 
              order_id: orderId, 
              total_amount: totalAmount, 
              delivery_fee: deliveryFee,
              status: 'pending',
              message: 'Order created successfully' 
            });
          })
          .catch(err => {
            res.status(500).json({ error: err.message });
          });
      });
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
});

// Get order by ID
app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  
  (async () => {
    try {
      const order = await db.collection('orders').findOne({ id });
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      // Get order items with menu item details using aggregation
      const items = await db.collection('order_items').aggregate([
        { $match: { order_id: id } },
        { $lookup: {
            from: 'menu_items',
            localField: 'menu_item_id',
            foreignField: 'id',
            as: 'menu_item'
          }
        },
        { $unwind: '$menu_item' },
        { $addFields: {
            name: '$menu_item.name',
            description: '$menu_item.description',
            image_url: '$menu_item.image_url'
          }
        },
        { $project: { menu_item: 0 } }
      ]).toArray();

      res.json({ 
        order: {
          ...order,
          items: items
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  })();
});

// Search restaurants
app.get('/api/search', (req, res) => {
  const { q, show, platform } = req.query;
  
  (async () => {
    try {
      let filter = {};
      
      console.log('Search parameters:', { q, show, platform });

      if (q) {
        filter.$or = [
          { name: { $regex: q, $options: 'i' } },
          { show_type: { $regex: q, $options: 'i' } }
        ];
      }

      if (show) {
        filter.show_type = show;
      }

      if (platform) {
        filter.delivery_platform = platform;
      }

      const restaurants = await db.collection('restaurants').find(filter).sort({ rating: -1 }).toArray();
      res.json({ restaurants });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  })();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Food Ordering API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ...existing code...

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n📴 Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('💾 Database connection closed.');
    process.exit(0);
  });
});