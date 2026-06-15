const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  items: [{
    id: String,
    name: String,
    price: Number,
    qty: Number
  }],
  total: { type: Number, required: true },
  customer: {
    name: String,
    email: { type: String, required: true }
  },
  paymentMethod: { type: String, enum: ['card', 'qr', 'stripe'], default: 'card' },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  stripePaymentIntentId: String,
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Order', orderSchema)
