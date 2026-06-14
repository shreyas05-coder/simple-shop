import React, { useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [allCategories, setAllCategories] = useState(['All'])
  const [checkoutMode, setCheckoutMode] = useState(false)
  const [customer, setCustomer] = useState({ name: '', email: '', card: '', expiry: '', cvc: '' })
  const [orderEmail, setOrderEmail] = useState('')
  const [orderHistory, setOrderHistory] = useState([])

  useEffect(() => {
    fetchProducts()
  }, [search, category])

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch(`${API_URL}/products`)
        const all = await response.json()
        const unique = ['All', ...Array.from(new Set(all.map((item) => item.category))).sort()]
        setAllCategories(unique)
      } catch (error) {
        setAllCategories(['All'])
      }
    }
    loadCategories()
  }, [])

  async function fetchProducts() {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category && category !== 'All') params.set('category', category)
    const url = `${API_URL}/products?${params.toString()}`
    try {
      const response = await fetch(url)
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      setProducts([])
    }
  }

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart]
  )

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty, 0),
    [cart]
  )

  const categories = allCategories

  const filteredProducts = useMemo(
    () => [...products].sort((a, b) => a.name.localeCompare(b.name)),
    [products]
  )

  function addToCart(product) {
    setCart((previous) => {
      const existing = previous.find((item) => item.id === product.id)
      if (existing) {
        return previous.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [...previous, { ...product, qty: 1 }]
    })
  }

  function updateQty(id, delta) {
    setCart((previous) =>
      previous
        .map((item) =>
          item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
        )
        .filter((item) => item.qty > 0)
    )
  }

  function removeFromCart(id) {
    setCart((previous) => previous.filter((item) => item.id !== id))
  }

  function handleInputChange(event) {
    const { name, value } = event.target
    setCustomer((current) => ({ ...current, [name]: value }))
  }

  async function submitOrder(event) {
    event.preventDefault()
    if (!customer.name || !customer.email || !customer.card || !customer.expiry || !customer.cvc) {
      setStatus('Please complete all checkout fields.')
      return
    }
    if (cart.length === 0) {
      setStatus('Add something to your cart before checkout.')
      return
    }
    setStatus('Submitting your order...')
    const items = cart.map(({ id, name, price, qty }) => ({ id, name, price, qty }))
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, total: cartTotal, customer })
      })
      const data = await response.json()
      setCart([])
      setCheckoutMode(false)
      setStatus(`Order confirmed! Order #${data.orderId} has been received.`)
    } catch (error) {
      setStatus('Checkout failed. Please try again.')
    }
  }

  async function findOrders() {
    if (!orderEmail) {
      setStatus('Enter an email to view order history.')
      return
    }
    setStatus('Loading your order history...')
    try {
      const response = await fetch(`${API_URL}/orders?email=${encodeURIComponent(orderEmail)}`)
      const data = await response.json()
      setOrderHistory(data)
      setStatus(data.length ? 'Order history loaded.' : 'No orders found for that email.')
    } catch (error) {
      setStatus('Could not load order history.')
    }
  }

  return (
    <div className="container">
      <div className="top-bar">
        Complimentary fabric swatches on orders above ₹ 5,000 · Worldwide shipping
      </div>

      <header className="site-header">
        <nav className="nav-links">
          <a href="#fabrics">Fabrics</a>
          <a href="#colors">Colors</a>
          <a href="#apparel">Apparel</a>
          <a href="#heritage">Heritage</a>
        </nav>

        <div className="brand-logo">
          <span>Ivory</span>
          <span>·</span>
          <span>Thread</span>
        </div>

        <nav className="nav-actions">
          <button type="button" className="nav-button">Search</button>
          <button type="button" className="nav-button">Account</button>
          <button type="button" className="nav-button">Bag ({cartCount})</button>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy-block">
          <p className="hero-eyebrow">Crafting excellence</p>
          <h1>
            Crafting excellence
            <br />
            <span>through every thread.</span>
          </h1>
          <p className="hero-copy-text">
            Thirty years of textile manufacturing. Premium fabrics and luxury fashion, delivered to ateliers,
            designers, and discerning homes worldwide.
          </p>
          <div className="hero-buttons">
            <button type="button" className="primary-button">Shop fabrics</button>
            <button type="button" className="secondary-button">Explore collections</button>
          </div>
        </div>
      </section>

      <div className="search-bar">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search the Ivory Thread collection"
        />
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          {categories.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="layout">
        <section className="catalog">
          <div className="section-header">
            <div>
              <h2>Signature pieces</h2>
              <p>Handpicked products designed to feel luxurious and calm.</p>
            </div>
            <span className="badge">{filteredProducts.length} items</span>
          </div>
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <article key={product.id} className="product-card">
                <img src={product.image} alt={product.name} />
                <div className="product-card-body">
                  <div>
                    <span className="product-tag">{product.category}</span>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                  </div>
                  <div className="product-meta">
                    <span className="price">${(product.price / 100).toFixed(2)}</span>
                    <button onClick={() => addToCart(product)}>Add to cart</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="cart">
          <div className="section-header">
            <div>
              <h2>Cart</h2>
              <p>{cart.length ? 'Ready for checkout.' : 'Your cart is empty.'}</p>
            </div>
            <span className="badge cart-badge">{cartCount}</span>
          </div>

          <div className="cart-list">
            {cart.length === 0 ? (
              <div className="empty-state">Collect your favorite pieces and complete your space.</div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.qty} × ${(item.price / 100).toFixed(2)}</p>
                  </div>
                  <div className="cart-actions">
                    <div className="qty-controls">
                      <button onClick={() => updateQty(item.id, -1)}>-</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)}>+</button>
                    </div>
                    <button className="text-button" onClick={() => removeFromCart(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="cart-footer">
            <div>
              <span className="label">Subtotal</span>
              <strong>${(cartTotal / 100).toFixed(2)}</strong>
            </div>
            <button className="checkout-button" onClick={() => setCheckoutMode(true)} disabled={!cart.length}>
              Proceed to payment
            </button>
          </div>

          {checkoutMode && (
            <form className="checkout-form" onSubmit={submitOrder}>
              <h3>Secure checkout</h3>
              <label>
                Name
                <input name="name" value={customer.name} onChange={handleInputChange} placeholder="Full name" />
              </label>
              <label>
                Email
                <input name="email" value={customer.email} onChange={handleInputChange} placeholder="you@example.com" />
              </label>
              <label>
                Card number
                <input name="card" value={customer.card} onChange={handleInputChange} placeholder="4242 4242 4242 4242" />
              </label>
              <div className="card-row">
                <label>
                  Expiry
                  <input name="expiry" value={customer.expiry} onChange={handleInputChange} placeholder="MM/YY" />
                </label>
                <label>
                  CVC
                  <input name="cvc" value={customer.cvc} onChange={handleInputChange} placeholder="123" />
                </label>
              </div>
              <button type="submit" className="checkout-button">
                Pay ${((cartTotal || 0) / 100).toFixed(2)}
              </button>
            </form>
          )}

          <div className="history-panel">
            <h3>Purchase history</h3>
            <div className="history-search">
              <input
                value={orderEmail}
                onChange={(event) => setOrderEmail(event.target.value)}
                placeholder="Email to search orders"
              />
              <button type="button" onClick={findOrders}>
                Search
              </button>
            </div>
            {orderHistory.length > 0 && (
              <div className="history-list">
                {orderHistory.map((order) => (
                  <div key={order.id} className="history-order">
                    <div>
                      <strong>Order #{order.id}</strong>
                      <p>{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div>${(order.total / 100).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {status && <div className="status-message">{status}</div>}
        </aside>
      </div>
    </div>
  )
}
