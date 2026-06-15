import React, { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function AdminDashboard({ token, user, onLogout }) {
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    color: '',
    material: '',
    image: '',
    stock: ''
  })
  const [status, setStatus] = useState('')
  const formatMoney = (amountInCents) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format((amountInCents || 0) / 100)
  const formatRupees = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0)

  // Fetch all admin data on mount
  useEffect(() => {
    if (token) {
      fetchStats()
      fetchProducts()
      fetchOrders()
    }
  }, [token])

  async function fetchStats() {
    try {
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setStats(data)
    } catch (error) {
      setStatus('Failed to fetch stats')
    }
  }

  async function fetchProducts() {
    try {
      const response = await fetch(`${API_URL}/products`)
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      setStatus('Failed to fetch products')
    }
  }

  async function fetchOrders() {
    try {
      const response = await fetch(`${API_URL}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      setStatus('Failed to fetch orders')
    }
  }

  async function handleCreateProduct(e) {
    e.preventDefault()
    if (!newProduct.name || !newProduct.description || !newProduct.category) {
      setStatus('All fields are required')
      return
    }
    try {
      const response = await fetch(`${API_URL}/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newProduct)
      })
      const data = await response.json()
      if (data.success) {
        setStatus('Product created successfully!')
        setNewProduct({
          name: '',
          description: '',
          category: '',
          price: '',
          color: '',
          material: '',
          image: '',
          stock: ''
        })
        fetchProducts()
      } else {
        setStatus(data.error || 'Failed to create product')
      }
    } catch (error) {
      setStatus('Failed to create product')
    }
  }

  async function handleUpdateProduct(e) {
    e.preventDefault()
    if (!editingProduct._id) return
    try {
      const response = await fetch(`${API_URL}/admin/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...editingProduct, price: editingProduct.price / 100 })
      })
      const data = await response.json()
      if (data.success) {
        setStatus('Product updated successfully!')
        setEditingProduct(null)
        fetchProducts()
      } else {
        setStatus(data.error || 'Failed to update product')
      }
    } catch (error) {
      setStatus('Failed to update product')
    }
  }

  async function handleDeleteProduct(id) {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      const response = await fetch(`${API_URL}/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setStatus('Product deleted successfully!')
        fetchProducts()
      } else {
        setStatus(data.error || 'Failed to delete product')
      }
    } catch (error) {
      setStatus('Failed to delete product')
    }
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Ivory Thread Admin</h1>
        <div className="admin-user">
          <span>{user?.name}</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <nav className="admin-tabs">
        <button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>
          Overview
        </button>
        <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>
          Products
        </button>
        <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>
          Orders
        </button>
      </nav>

      {status && <div className="admin-status">{status}</div>}

      {/* Overview Tab */}
      {tab === 'overview' && (
        <section className="admin-overview">
          <h2>Dashboard Overview</h2>
          {stats ? (
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Orders</h3>
                <p className="stat-value">{stats.totalOrders}</p>
              </div>
              <div className="stat-card">
                <h3>Total Revenue</h3>
                <p className="stat-value">{formatRupees(stats.totalRevenue)}</p>
              </div>
              <div className="stat-card">
                <h3>Products</h3>
                <p className="stat-value">{stats.totalProducts}</p>
              </div>
              <div className="stat-card">
                <h3>Users</h3>
                <p className="stat-value">{stats.totalUsers}</p>
              </div>
            </div>
          ) : (
            <p>Loading stats...</p>
          )}

          {stats?.recentOrders && (
            <div className="recent-orders">
              <h3>Recent Orders</h3>
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer Email</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td>{order.orderId}</td>
                      <td>{order.customer?.email}</td>
                      <td>{formatMoney(order.total)}</td>
                      <td><span className={`status ${order.paymentStatus}`}>{order.paymentStatus}</span></td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Products Tab */}
      {tab === 'products' && (
        <section className="admin-products">
          <h2>Product Management</h2>

          <div className="products-container">
            {/* Create/Edit Form */}
            <div className="product-form-section">
              <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="product-form">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={editingProduct ? editingProduct.name : newProduct.name}
                  onChange={(e) => editingProduct 
                    ? setEditingProduct({ ...editingProduct, name: e.target.value })
                    : setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  required
                />
                <textarea
                  placeholder="Description"
                  value={editingProduct ? editingProduct.description : newProduct.description}
                  onChange={(e) => editingProduct
                    ? setEditingProduct({ ...editingProduct, description: e.target.value })
                    : setNewProduct({ ...newProduct, description: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={editingProduct ? editingProduct.category : newProduct.category}
                  onChange={(e) => editingProduct
                    ? setEditingProduct({ ...editingProduct, category: e.target.value })
                    : setNewProduct({ ...newProduct, category: e.target.value })
                  }
                  required
                />
                <input
                  type="number"
                  placeholder="Price (Rs)"
                  value={editingProduct ? (editingProduct.price / 100 || '') : newProduct.price}
                  onChange={(e) => editingProduct
                    ? setEditingProduct({ ...editingProduct, price: Number(e.target.value) * 100 })
                    : setNewProduct({ ...newProduct, price: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Color"
                  value={editingProduct ? editingProduct.color : newProduct.color}
                  onChange={(e) => editingProduct
                    ? setEditingProduct({ ...editingProduct, color: e.target.value })
                    : setNewProduct({ ...newProduct, color: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Material"
                  value={editingProduct ? editingProduct.material : newProduct.material}
                  onChange={(e) => editingProduct
                    ? setEditingProduct({ ...editingProduct, material: e.target.value })
                    : setNewProduct({ ...newProduct, material: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Image URL"
                  value={editingProduct ? editingProduct.image : newProduct.image}
                  onChange={(e) => editingProduct
                    ? setEditingProduct({ ...editingProduct, image: e.target.value })
                    : setNewProduct({ ...newProduct, image: e.target.value })
                  }
                  required
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={editingProduct ? editingProduct.stock : newProduct.stock}
                  onChange={(e) => editingProduct
                    ? setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })
                    : setNewProduct({ ...newProduct, stock: e.target.value })
                  }
                />
                <div className="form-buttons">
                  <button type="submit" className="btn-primary">
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                  {editingProduct && (
                    <button type="button" className="btn-secondary" onClick={() => setEditingProduct(null)}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Products List */}
            <div className="products-list">
              <h3>All Products ({products.length})</h3>
              <div className="products-table">
                {products.map((product) => (
                  <div key={product._id} className="product-row">
                    <img src={product.image} alt={product.name} className="product-thumb" />
                    <div className="product-details">
                      <h4>{product.name}</h4>
                      <p className="category">{product.category} - {product.color} - {product.material}</p>
                      <p className="price">{formatMoney(product.price)}</p>
                      <p className="stock">Stock: {product.stock}</p>
                    </div>
                    <div className="product-actions">
                      <button className="btn-edit" onClick={() => setEditingProduct(product)}>
                        Edit
                      </button>
                      <button className="btn-delete" onClick={() => handleDeleteProduct(product._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Orders Tab */}
      {tab === 'orders' && (
        <section className="admin-orders">
          <h2>Order Management</h2>
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order.orderId}</td>
                  <td>
                    <div>
                      <strong>{order.customer?.name}</strong>
                      <br />
                      <small>{order.customer?.email}</small>
                    </div>
                  </td>
                  <td>{order.items.length} item(s)</td>
                  <td>{formatMoney(order.total)}</td>
                  <td>
                    <span className={`status ${order.paymentStatus}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}
