const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
app.use(cors())
app.use(express.json())

const ordersFile = path.join(__dirname, 'orders.json')

const products = [
  {
    id: 1,
    name: 'Ivory Linen Throw',
    description: 'A luxurious, handwoven throw with airy texture and soft drape.',
    price: 4299,
    category: 'Home',
    image:
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 2,
    name: 'Signature Ceramic Vase',
    description: 'An elegant neutral vase finished in matte glaze for modern interiors.',
    price: 3399,
    category: 'Decor',
    image:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 3,
    name: 'Ivory Thread Candle',
    description: 'Soft floral candle with a warm, creamy scent and simple glass vessel.',
    price: 2399,
    category: 'Fragrance',
    image:
      'https://images.unsplash.com/photo-1520880867055-1e30d1cb001c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 4,
    name: 'Textured Journal',
    description: 'Fine paper journal wrapped in neutral linen cover for thoughtful notes.',
    price: 2799,
    category: 'Stationery',
    image:
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 5,
    name: 'Portrait Throw Pillow',
    description: 'A soft pillow in muted ivory tones with a subtle woven pattern.',
    price: 3199,
    category: 'Home',
    image:
      'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=600&q=80'
  }
]

function readOrders() {
  if (!fs.existsSync(ordersFile)) {
    fs.writeFileSync(ordersFile, '[]', 'utf8')
  }
  const json = fs.readFileSync(ordersFile, 'utf8')
  return JSON.parse(json)
}

function writeOrders(orders) {
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2), 'utf8')
}

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Simple Shop backend is running' })
})

app.get('/products', (req, res) => {
  const search = (req.query.search || '').toLowerCase()
  const category = (req.query.category || '').toLowerCase()
  let filtered = products
  if (search) {
    filtered = filtered.filter(
      (product) =>
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search)
    )
  }
  if (category && category !== 'all') {
    filtered = filtered.filter((product) => product.category.toLowerCase() === category)
  }
  res.json(filtered)
})

app.get('/orders', (req, res) => {
  const email = (req.query.email || '').toLowerCase()
  const orders = readOrders()
  if (email) {
    const matches = orders.filter(
      (order) => order.customer?.email?.toLowerCase() === email
    )
    return res.json(matches)
  }
  res.json(orders)
})

app.post('/orders', (req, res) => {
  const items = req.body.items || []
  const total = req.body.total || 0
  const customer = req.body.customer || {}
  const order = {
    id: Date.now(),
    items,
    total,
    customer,
    createdAt: new Date().toISOString()
  }
  const orders = readOrders()
  orders.push(order)
  writeOrders(orders)
  console.log('New order received:', order)
  res.status(201).json({ orderId: order.id })
})

const port = process.env.PORT || 4000
app.listen(port, () => console.log(`Backend listening on ${port}`))
