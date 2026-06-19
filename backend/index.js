require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const User = require('./models/User')
const Product = require('./models/Product')
const Order = require('./models/Order')
const { authMiddleware, requireAuth, requireAdmin } = require('./middleware/auth')

try {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock')
  global.stripe = stripe
} catch (e) {
  console.warn('Stripe not configured yet')
}

const app = express()
const PORT = process.env.PORT || 4000
const SECRET = process.env.SECRET || 'dev-secret-key-change-in-production'
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ivory-thread'
const UPI_ID = process.env.UPI_ID || 'ivorythread@upi'
const UPI_NAME = process.env.UPI_NAME || 'Ivory Thread'

const initialProducts = [
  {
    _id: 'demo-linen-throw',
    name: 'Ivory Linen Throw',
    description: 'A luxurious, handwoven throw with airy texture and soft drape.',
    category: 'Home',
    price: 4299,
    color: 'Ivory',
    material: 'Linen',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=400&q=80',
    stock: 50
  },
  {
    _id: 'demo-thread-candle',
    name: 'Ivory Thread Candle',
    description: 'Soft floral candle with a warm, creamy scent and simple glass vessel.',
    category: 'Fragrance',
    price: 2399,
    color: 'Cream',
    material: 'Wax',
    image: 'https://images.unsplash.com/photo-1488593080620-401f29059e0c?auto=format&fit=crop&w=400&q=80',
    stock: 100
  },
  {
    _id: 'demo-portrait-pillow',
    name: 'Portrait Throw Pillow',
    description: 'A soft pillow in muted ivory tones with a subtle woven pattern.',
    category: 'Home',
    price: 3199,
    color: 'Beige',
    material: 'Cotton',
    image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=400&q=80',
    stock: 75
  },
  {
    _id: 'demo-ceramic-vase',
    name: 'Signature Ceramic Vase',
    description: 'An elegant neutral vase finished in matte glaze for modern interiors.',
    category: 'Decor',
    price: 3399,
    color: 'Sand',
    material: 'Ceramic',
    image: 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?auto=format&fit=crop&w=400&q=80',
    stock: 60
  },
  {
    _id: 'demo-textured-journal',
    name: 'Textured Journal',
    description: 'Fine paper journal wrapped in neutral linen cover for thoughtful notes.',
    category: 'Stationery',
    price: 2799,
    color: 'Cream',
    material: 'Paper',
    image: 'https://images.unsplash.com/photo-1507842217343-583f20270319?auto=format&fit=crop&w=400&q=80',
    stock: 80
  }
]

// Middleware
app.use(helmet())
app.use(morgan('tiny'))
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }))
app.use(express.json({ limit: '10mb' }))
app.use(authMiddleware)

// MongoDB Connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected')).catch(err => console.error('MongoDB error:', err))

// Seed initial products if empty
async function seedProducts() {
  try {
    const count = await Product.countDocuments()
    if (count === 0) {
      await Product.insertMany(initialProducts.map(({ _id, ...product }) => product))
      console.log('Seeded initial products')
    }
  } catch (err) {
    console.error('Seed error:', err)
  }
}

seedProducts()

// ============ AUTH ENDPOINTS ============
app.post('/auth/register', async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password required' })
  }
  try {
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' })
    }
    const user = new User({ name, email, password, isAdmin: false })
    await user.save()
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, isAdmin: false },
      SECRET,
      { expiresIn: '30d' }
    )
    res.json({ success: true, token, user: { id: user._id, email: user.email, name: user.name, isAdmin: false } })
  } catch (error) {
    console.error('Registration failed:', error.message)
    res.status(500).json({ error: 'Registration failed' })
  }
})

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' })
  }
  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }
    const valid = await user.comparePassword(password)
    if (!valid) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, isAdmin: user.isAdmin },
      SECRET,
      { expiresIn: '30d' }
    )
    res.json({ success: true, token, user: { id: user._id, email: user.email, name: user.name, isAdmin: user.isAdmin } })
  } catch (error) {
    console.error('Login failed:', error.message)
    res.status(500).json({ error: 'Login failed' })
  }
})

app.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// ============ PRODUCT ENDPOINTS ============
app.get('/products', async (req, res) => {
  try {
    const { search, category, color, material, minPrice, maxPrice } = req.query
    if (mongoose.connection.readyState !== 1) {
      const filtered = initialProducts.filter((product) => {
        const matchesSearch = !search || `${product.name} ${product.description}`.toLowerCase().includes(String(search).toLowerCase())
        const matchesCategory = !category || category === 'All' || product.category === category
        const matchesColor = !color || product.color === color
        const matchesMaterial = !material || product.material === material
        const matchesMin = !minPrice || product.price >= Number(minPrice) * 100
        const matchesMax = !maxPrice || product.price <= Number(maxPrice) * 100
        return matchesSearch && matchesCategory && matchesColor && matchesMaterial && matchesMin && matchesMax
      })
      return res.json(filtered.sort((a, b) => a.name.localeCompare(b.name)))
    }
    let query = {}
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }
    if (category && category !== 'All') query.category = category
    if (color) query.color = color
    if (material) query.material = material
    if (minPrice) query.price = { $gte: Number(minPrice) * 100 }
    if (maxPrice) {
      query.price = query.price || {}
      query.price.$lte = Number(maxPrice) * 100
    }
    const products = await Product.find(query).sort({ name: 1 })
    res.json(products)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json(product)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

// ADMIN: Create Product
app.post('/admin/products', requireAdmin, async (req, res) => {
  const { name, description, category, price, compareAtPrice, color, material, image, stock } = req.body
  if (!name || !description || !category || price === undefined || !color || !material || !image) {
    return res.status(400).json({ error: 'All fields required' })
  }
  try {
    const product = new Product({
      name,
      description,
      category,
      price: Number(price) * 100,
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) * 100 : null,
      color,
      material,
      image,
      stock: stock || 100
    })
    await product.save()
    res.json({ success: true, product })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' })
  }
})

// ADMIN: Update Product
app.put('/admin/products/:id', requireAdmin, async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: new Date() }
    if (updates.price) updates.price = Number(updates.price) * 100
    if (updates.compareAtPrice !== undefined) {
      updates.compareAtPrice = updates.compareAtPrice
        ? Number(updates.compareAtPrice) * 100
        : null
    }
    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true })
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json({ success: true, product })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' })
  }
})

// ADMIN: Delete Product
app.delete('/admin/products/:id', requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json({ success: true, message: 'Product deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

// ============ ORDER ENDPOINTS ============
app.post('/orders', async (req, res) => {
  const { items, total, customer, paymentMethod, shippingAddress } = req.body
  const allowedPaymentMethods = ['qr', 'card', 'stripe']
  const digits = (value) => String(value || '').replace(/\D/g, '')
  const email = String(customer?.email || '').trim()
  const phone = digits(customer?.phone)
  const zip = digits(shippingAddress?.zip)
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items required' })
  }
  if (!allowedPaymentMethods.includes(paymentMethod)) {
    return res.status(400).json({ error: 'Choose a valid payment method' })
  }
  if (!customer?.name || !customer?.email || !customer?.phone || !shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.zip) {
    return res.status(400).json({ error: 'Complete customer and shipping details are required' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Enter a valid email address' })
  }
  if (phone.length < 10) {
    return res.status(400).json({ error: 'Enter a valid phone number' })
  }
  if (!/^\d{6}$/.test(zip)) {
    return res.status(400).json({ error: 'Enter a valid 6-digit PIN code' })
  }
  try {
    const orderId = 'ORD-' + Date.now()
    let paymentIntentId = null
    const normalizedItems = []
    let calculatedTotal = 0

    if (mongoose.connection.readyState === 1) {
      for (const item of items) {
        const qty = Number(item.qty)
        if (!item.id || !Number.isInteger(qty) || qty < 1) {
          return res.status(400).json({ error: 'Invalid cart item quantity' })
        }

        const product = await Product.findById(item.id)
        if (!product) {
          return res.status(404).json({ error: `${item.name || 'Product'} is no longer available` })
        }
        const availableStock = Number(product.stock) || 0
        if (availableStock < qty) {
          return res.status(400).json({ error: `Only ${availableStock} unit(s) of ${product.name} are available` })
        }

        normalizedItems.push({
          id: product._id.toString(),
          name: product.name,
          price: product.price,
          qty
        })
        calculatedTotal += product.price * qty
      }
    } else {
      for (const item of items) {
        const qty = Number(item.qty)
        const product = initialProducts.find((p) => p._id === item.id)
        if (!product || !Number.isInteger(qty) || qty < 1) {
          return res.status(400).json({ error: 'Invalid cart item' })
        }
        const availableStock = Number(product.stock) || 0
        if (availableStock < qty) {
          return res.status(400).json({ error: `Only ${availableStock} unit(s) of ${product.name} are available` })
        }
        normalizedItems.push({ id: product._id, name: product.name, price: product.price, qty })
        calculatedTotal += product.price * qty
      }
    }

    // Handle Stripe payment
    if (paymentMethod === 'stripe' && global.stripe) {
      const paymentIntent = await global.stripe.paymentIntents.create({
        amount: calculatedTotal,
        currency: 'inr',
        metadata: { orderId, email: customer.email }
      })
      paymentIntentId = paymentIntent.id
    }

    const order = new Order({
      orderId,
      userId: req.user?.id || null,
      items: normalizedItems,
      total: calculatedTotal,
      customer,
      paymentMethod,
      paymentStatus: paymentMethod === 'qr' || paymentMethod === 'stripe' ? 'pending' : 'completed',
      stripePaymentIntentId: paymentIntentId,
      shippingAddress
    })
    await order.save()

    if (mongoose.connection.readyState === 1) {
      for (const item of normalizedItems) {
        await Product.findByIdAndUpdate(item.id, { $inc: { stock: -item.qty }, updatedAt: new Date() })
      }
    }

    if (paymentMethod === 'qr') {
      const upi = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_NAME)}&am=${(calculatedTotal / 100).toFixed(2)}&cu=INR&tn=${encodeURIComponent(orderId)}`
      const paymentUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upi)}`
      return res.json({ success: true, orderId: order._id, publicOrderId: order.orderId, paymentUrl })
    }

    // For Stripe, return client secret for frontend
    if (paymentMethod === 'stripe' && global.stripe) {
      const paymentIntent = await global.stripe.paymentIntents.retrieve(paymentIntentId)
      res.json({ success: true, orderId: order._id, clientSecret: paymentIntent.client_secret })
    } else {
      res.json({ success: true, orderId: order._id })
    }
  } catch (error) {
    console.error('Failed to create order:', error.message)
    res.status(500).json({ error: 'Failed to create order' })
  }
})

app.get('/orders', async (req, res) => {
  try {
    let query = {}
    if (req.user) {
      query.userId = req.user.id
    } else if (req.query.email) {
      query['customer.email'] = req.query.email
    } else {
      return res.status(400).json({ error: 'Email or auth required' })
    }
    const orders = await Order.find(query).sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

app.post('/orders/:id/pay', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: 'completed', updatedAt: new Date() },
      { new: true }
    )
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json({ ok: true, orderId: order.orderId })
  } catch (error) {
    res.status(500).json({ error: 'Failed to confirm payment' })
  }
})

app.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ error: 'Order not found' })
    if (req.user && order.userId && order.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' })
    }
    res.json(order)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' })
  }
})

// ADMIN: Get all orders
app.get('/admin/orders', requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// ADMIN: Update order status
app.put('/admin/orders/:id', requireAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: new Date() }, { new: true })
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json({ success: true, order })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' })
  }
})

// ============ STRIPE WEBHOOK ============
app.post('/webhooks/stripe', async (req, res) => {
  if (!global.stripe) return res.json({ received: true })
  const sig = req.headers['stripe-signature']
  let event
  try {
    event = global.stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return res.status(400).json({ error: 'Webhook verification failed' })
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object
    try {
      await Order.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id },
        { paymentStatus: 'completed', updatedAt: new Date() }
      )
    } catch (error) {
      console.error('Failed to update order:', error)
    }
  }
  res.json({ received: true })
})

// ============ ADMIN STATS ============
app.get('/admin/stats', requireAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments()
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ])
    const totalProducts = await Product.countDocuments()
    const totalUsers = await User.countDocuments()
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5)

    res.json({
      totalOrders,
      totalRevenue: (totalRevenue[0]?.total || 0) / 100,
      totalProducts,
      totalUsers,
      recentOrders
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// ============ HEALTH CHECK ============
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Ivory Thread API v2 - MongoDB + Admin' })
})

app.get('/health/db', (req, res) => {
  res.json({
    mongoReadyState: mongoose.connection.readyState,
    mongoStatus: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
    database: mongoose.connection.name || null
  })
})

app.listen(PORT, () => {
  console.log(`\nIvory Thread Backend v2`)
  console.log(`Listening on port ${PORT}`)
  console.log(`MongoDB integration enabled`)
  console.log(`Admin endpoints active`)
  console.log(`QR payments configured for ${UPI_ID}\n`)
})

