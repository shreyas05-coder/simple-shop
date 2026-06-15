import React, { useEffect, useMemo, useState } from 'react'
import './auth.css'
import AdminDashboard from './AdminDashboard'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [allCategories, setAllCategories] = useState(['All'])
  const [colors, setColors] = useState([])
  const [materials, setMaterials] = useState([])
  const [colorFilter, setColorFilter] = useState('')
  const [materialFilter, setMaterialFilter] = useState('')
  const [minPriceFilter, setMinPriceFilter] = useState('')
  const [maxPriceFilter, setMaxPriceFilter] = useState('')
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [authMode, setAuthMode] = useState(null) // 'login' | 'register'
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [showAuth, setShowAuth] = useState(false)
  const [productDetail, setProductDetail] = useState(null)
  const [page, setPage] = useState('home')
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutMode, setCheckoutMode] = useState(false)
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '', street: '', city: '', state: '', zip: '', country: 'India', card: '', expiry: '', cvc: '' })
  const [paymentMethod, setPaymentMethod] = useState('qr')
  const [qrPaymentUrl, setQrPaymentUrl] = useState(null)
  const [currentOrderId, setCurrentOrderId] = useState(null)
  const [orderEmail, setOrderEmail] = useState('')
  const [orderHistory, setOrderHistory] = useState([])
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => window.clearTimeout(timeoutId)
  }, [search])

  useEffect(() => {
    const controller = new AbortController()
    fetchProducts(controller.signal)
    return () => controller.abort()
  }, [debouncedSearch, category, colorFilter, materialFilter, minPriceFilter, maxPriceFilter])

  useEffect(() => {
    // load token from localStorage
    const t = localStorage.getItem('ivory_token')
    if (t) {
      setToken(t)
      try {
        const parts = t.split('.')
        const payload = JSON.parse(atob(parts[1]))
        setUser(payload)
      } catch (e) {
        setUser(null)
      }
    }
  }, [])

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch(`${API_URL}/products`)
        const all = await response.json()
        if (!response.ok || !Array.isArray(all)) {
          throw new Error(all.error || 'Invalid product response')
        }
        const unique = ['All', ...Array.from(new Set(all.map((item) => item.category))).sort()]
        setAllCategories(unique)
        setColors(Array.from(new Set(all.map((p) => p.color).filter(Boolean))))
        setMaterials(Array.from(new Set(all.map((p) => p.material).filter(Boolean))))
      } catch (error) {
        setAllCategories(['All'])
      }
    }
    loadCategories()
  }, [])

  async function fetchProducts(signal) {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (category && category !== 'All') params.set('category', category)
    if (colorFilter) params.set('color', colorFilter)
    if (materialFilter) params.set('material', materialFilter)
    if (minPriceFilter) params.set('minPrice', String(Number(minPriceFilter) || ''))
    if (maxPriceFilter) params.set('maxPrice', String(Number(maxPriceFilter) || ''))
    const url = `${API_URL}/products?${params.toString()}`
    try {
      const response = await fetch(url, { signal })
      const data = await response.json()
      if (!response.ok || !Array.isArray(data)) {
        throw new Error(data.error || 'Invalid product response')
      }
      setProducts(data)
    } catch (error) {
      if (error.name === 'AbortError') return
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

  const formatMoney = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format((amount || 0) / 100)

  function goTo(nextPage) {
    setPage(nextPage)
    if (nextPage === 'shop') setCartOpen(false)
    window.scrollTo(0, 0)
  }

  function addToCart(product) {
    const productId = product._id || product.id
    const stock = Number(product.stock) || 0
    if (stock <= 0) {
      setStatus(`${product.name} is currently out of stock.`)
      return
    }
    setCart((previous) => {
      const existing = previous.find((item) => item.id === productId)
      if (existing) {
        if (existing.qty >= stock) {
          setStatus(`Only ${stock} unit(s) of ${product.name} are available.`)
          return previous
        }
        return previous.map((item) =>
          item.id === productId ? { ...item, qty: item.qty + 1 } : item
        )
      }
      setStatus(`${product.name} added to cart.`)
      setCartOpen(true)
      return [...previous, { ...product, id: productId, stock, qty: 1 }]
    })
  }

  function updateQty(id, delta) {
    setCart((previous) =>
      previous.map((item) => {
        if (item.id !== id) return item
        const stock = Number(item.stock) || 0
        const nextQty = Math.max(1, Math.min(stock, item.qty + delta))
        if (delta > 0 && item.qty >= stock) {
          setStatus(`Only ${stock} unit(s) of ${item.name} are available.`)
        }
        return { ...item, qty: nextQty }
      })
    )
  }

  function removeFromCart(id) {
    setCart((previous) => previous.filter((item) => item.id !== id))
  }

  function closeCart() {
    setCartOpen(false)
    setCheckoutMode(false)
  }

  function handleInputChange(event) {
    const { name, value } = event.target
    setCustomer((current) => ({ ...current, [name]: value }))
  }

  function handleAuthChange(e) {
    const { name, value } = e.target
    setAuthForm((s) => ({ ...s, [name]: value }))
  }

  async function submitAuth(e) {
    e.preventDefault()
    if (authMode === 'register') {
      const resp = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      })
      const json = await resp.json()
      if (resp.ok) {
        setToken(json.token)
        localStorage.setItem('ivory_token', json.token)
        setUser(json.user)
        setAuthMode(null)
        setAuthForm({ name: '', email: '', password: '' })
        setStatus('Registered and logged in.')
      } else {
        setStatus(json.error || 'Registration failed')
      }
      return
    }
    if (authMode === 'login') {
      const resp = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authForm.email, password: authForm.password })
      })
      const json = await resp.json()
      if (resp.ok) {
        setToken(json.token)
        localStorage.setItem('ivory_token', json.token)
        setUser(json.user)
        setAuthMode(null)
        setAuthForm({ name: '', email: '', password: '' })
        setStatus('Logged in.')
      } else {
        setStatus(json.error || 'Login failed')
      }
    }
  }

  function logout() {
    setToken(null)
    setUser(null)
    localStorage.removeItem('ivory_token')
    setStatus('Logged out')
  }

  async function submitOrder(event) {
    event.preventDefault()
    if (qrPaymentUrl) {
      setStatus('QR payment is already created for this order. Scan it or refresh checkout to start again.')
      return
    }
    if (!customer.name || !customer.email || !customer.phone || !customer.street || !customer.city || !customer.state || !customer.zip) {
      setStatus('Please complete your contact and shipping details.')
      return
    }
    if (cart.length === 0) {
      setStatus('Add something to your cart before checkout.')
      return
    }
    // If paymentMethod is card, require card fields (this demo does not process real cards)
    if (paymentMethod === 'card') {
      if (!customer.card || !customer.expiry || !customer.cvc) {
        setStatus('Please complete all card fields for card payment.')
        return
      }
    }
    setStatus('Submitting your order...')
    const items = cart.map(({ id, name, price, qty }) => ({ id, name, price, qty }))
    const shippingAddress = {
      street: customer.street,
      city: customer.city,
      state: customer.state,
      zip: customer.zip,
      country: customer.country
    }
    try {
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ items, total: cartTotal, customer, paymentMethod, shippingAddress })
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed')
      }
      // If QR flow, backend returns a paymentUrl we should display
      if (paymentMethod === 'qr' && data.paymentUrl) {
        setQrPaymentUrl(data.paymentUrl)
        setCurrentOrderId(data.orderId)
        setStatus('Scan the QR code with your payment app to complete the order.')
        // Keep cart until user confirms payment
        return
      }
      // For card/demo flows treat as complete
      setCart([])
      setCheckoutMode(false)
      setQrPaymentUrl(null)
      setCurrentOrderId(null)
      await fetchProducts()
      setStatus(`Order confirmed! Order #${data.orderId} has been received.`)
    } catch (error) {
      setStatus(error.message || 'Checkout failed. Please try again.')
    }
  }

  async function findOrders() {
    setStatus('Loading your order history...')
    try {
      const headers = {}
      let url = `${API_URL}/orders`
      if (token) {
        headers.Authorization = `Bearer ${token}`
      } else if (orderEmail) {
        url = `${API_URL}/orders?email=${encodeURIComponent(orderEmail)}`
      } else {
        setStatus('Enter an email or log in to view orders.')
        return
      }
      const response = await fetch(url, { headers })
      const data = await response.json()
      setOrderHistory(data)
      setStatus(data.length ? 'Order history loaded.' : 'No orders found for that email.')
    } catch (error) {
      setStatus('Could not load order history.')
    }
  }

  if (page === 'admin' && user?.isAdmin) {
    return <AdminDashboard token={token} user={user} onLogout={logout} />
  }

  return (
    <div className="container">
      <div className="top-bar">
        Complimentary fabric swatches on orders above Rs 5,000 - worldwide shipping
      </div>

      <header className="site-header">
        <nav className="nav-links">
          <a href="#" onClick={(e) => { e.preventDefault(); goTo('home') }} className={page === 'home' ? 'active' : ''}>Home</a>
          <a href="#" onClick={(e) => { e.preventDefault(); goTo('shop') }} className={page === 'shop' ? 'active' : ''}>Shop</a>
          <a href="#" onClick={(e) => { e.preventDefault(); goTo('about') }} className={page === 'about' ? 'active' : ''}>About</a>
          <a href="#" onClick={(e) => { e.preventDefault(); goTo('contact') }} className={page === 'contact' ? 'active' : ''}>Contact</a>
          <a href="#" onClick={(e) => { e.preventDefault(); goTo('policies') }} className={page === 'policies' ? 'active' : ''}>Policies</a>
        </nav>

        <div className="brand-logo">
          <span>Ivory</span>
          <span>·</span>
          <span>Thread</span>
        </div>

        <nav className="nav-actions">
          {user?.isAdmin && <button type="button" className="nav-button" onClick={() => goTo('admin')}>Admin</button>}
          <button type="button" className="nav-button" onClick={() => goTo('shop')}>Search</button>
          <button type="button" className="nav-button" onClick={() => { setShowAuth(true); setAuthMode(authMode || 'login') }}>
            {user ? `${user.name || user.email}` : 'Account'}
          </button>
          <button type="button" className="nav-button cart-trigger" onClick={() => setCartOpen(true)}>Bag ({cartCount})</button>
        </nav>
      </header>

      {status && <div className="status-message global-status">{status}</div>}

      <div className="page-transition">
        {page === 'home' && (
          <>
            <section className="hero">
              <div className="hero-copy-block">
                <p className="hero-eyebrow">Ivory Thread atelier</p>
                <h1>
                  Premium fabrics for refined spaces.
                </h1>
                <p className="hero-copy-text">
                  Curated textiles, honest stock, QR checkout, and a quiet luxury shopping experience for designers, boutiques, and homes.
                </p>
                <div className="hero-buttons">
                  <button type="button" className="primary-button" onClick={() => goTo('shop')}>Shop fabrics</button>
                  <button type="button" className="secondary-button" onClick={() => goTo('about')}>Our story</button>
                </div>
              </div>
            </section>
            <section className="feature-strip">
              <div>
                <strong>Verified stock</strong>
                <span>Products stop at available quantity.</span>
              </div>
              <div>
                <strong>QR checkout</strong>
                <span>Scan to pay and confirm your order.</span>
              </div>
              <div>
                <strong>Admin managed</strong>
                <span>Fresh products can be added anytime.</span>
              </div>
            </section>
          </>
        )}

        {page === 'about' && (
          <section className="static about page-content">
            <h1>About Ivory Thread</h1>
            <p>Ivory Thread is a beacon of premium craftsmanship, blending three decades of textile excellence with modern luxury. We curate exceptional fabrics and home goods, each piece selected to bring elegance and comfort to discerning spaces.</p>
            <h2>Our Heritage</h2>
            <p>Founded on the principle that quality and beauty should be accessible, Ivory Thread has grown to serve ateliers, designers, and homes worldwide. We believe in the power of premium materials to transform spaces.</p>
          </section>
        )}

        {page === 'contact' && (
          <section className="static contact page-content">
            <h1>Get in Touch</h1>
            <h2>Contact Information</h2>
            <p><strong>Phone:</strong> +91 12345 67890</p>
            <p><strong>Email:</strong> hello@ivorythread.example</p>
            <p><strong>WhatsApp:</strong> +91 12345 67890</p>
            <h2>Visit Us</h2>
            <p>We'd love to hear from you. Reach out with any inquiries about our collections, custom orders, or partnerships.</p>
          </section>
        )}

        {page === 'policies' && (
          <section className="static page-content">
            <h1>Shipping, Returns & Policies</h1>
            <h2>Shipping</h2>
            <p>Orders are packed after payment confirmation and dispatched within 2-4 business days. Delivery timelines depend on the destination and courier availability.</p>
            <h2>Returns</h2>
            <p>Fabric cut to custom length is not returnable unless it arrives damaged or incorrect. Eligible ready products can be requested for return within 7 days of delivery.</p>
            <h2>Privacy & Terms</h2>
            <p>Customer details are used only for account access, order fulfilment, payment confirmation, and service communication. By placing an order, customers agree to provide accurate shipping and payment information.</p>
          </section>
        )}

        {page === 'shop' && (
          <section className="shop-hero">
            <p className="hero-eyebrow">Shop</p>
            <h1>Choose fabric with confidence.</h1>
            <p>Filter by material, color, and price. Your cart opens only when you need it, so browsing stays focused.</p>
          </section>
        )}
      </div>

      {page === 'shop' && (
      <>
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
            <select value={colorFilter} onChange={(e) => setColorFilter(e.target.value)}>
              <option value="">All colors</option>
              {colors.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select value={materialFilter} onChange={(e) => setMaterialFilter(e.target.value)}>
              <option value="">All materials</option>
              {materials.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <input value={minPriceFilter} onChange={(e) => setMinPriceFilter(e.target.value)} placeholder="Min Rs" style={{ width: 80 }} />
            <input value={maxPriceFilter} onChange={(e) => setMaxPriceFilter(e.target.value)} placeholder="Max Rs" style={{ width: 80 }} />
      </div>

      <div className="layout shop-layout">
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
              <article key={product._id || product.id} className="product-card">
                <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
                <div className="product-card-body">
                  <div>
                    <span className="product-tag">{product.category}</span>
                    <h3>
                      <a href="#" onClick={(e) => { e.preventDefault(); setProductDetail(product) }}>{product.name}</a>
                    </h3>
                    <p>{product.description}</p>
                  </div>
                  <div className="product-meta">
                    <span className="price">{formatMoney(product.price)}</span>
                    <span className={`stock-note ${product.stock > 0 ? '' : 'sold-out'}`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Sold out'}
                    </span>
                    <button onClick={() => addToCart(product)} disabled={product.stock <= 0}>
                      {product.stock > 0 ? 'Add to cart' : 'Sold out'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
      </>
      )}

      {cartOpen && (
        <div className="cart-overlay" role="dialog" aria-modal="true" aria-label="Shopping cart">
        <aside className="cart cart-drawer">
          <div className="section-header">
            <div>
              <h2>Cart</h2>
              <p>{cart.length ? 'Ready for checkout.' : 'Your cart is empty.'}</p>
            </div>
            <button type="button" className="drawer-close" onClick={closeCart}>Close</button>
          </div>

          <div className="cart-list">
            {cart.length === 0 ? (
              <div className="empty-state">Collect your favorite pieces and complete your space.</div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.qty} x {formatMoney(item.price)}</p>
                  </div>
                  <div className="cart-actions">
                    <div className="qty-controls">
                      <button onClick={() => updateQty(item.id, -1)}>-</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} disabled={item.qty >= item.stock}>+</button>
                    </div>
                    <small className="stock-note">{item.stock} available</small>
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
              <strong>{formatMoney(cartTotal)}</strong>
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
                Phone / WhatsApp
                <input name="phone" value={customer.phone} onChange={handleInputChange} placeholder="+91 98765 43210" />
              </label>
              <label>
                Shipping address
                <input name="street" value={customer.street} onChange={handleInputChange} placeholder="House, street, area" />
              </label>
              <div className="card-row">
                <label>
                  City
                  <input name="city" value={customer.city} onChange={handleInputChange} placeholder="City" />
                </label>
                <label>
                  State
                  <input name="state" value={customer.state} onChange={handleInputChange} placeholder="State" />
                </label>
              </div>
              <div className="card-row">
                <label>
                  PIN code
                  <input name="zip" value={customer.zip} onChange={handleInputChange} placeholder="110001" />
                </label>
                <label>
                  Country
                  <input name="country" value={customer.country} onChange={handleInputChange} placeholder="India" />
                </label>
              </div>

              <div className="payment-methods">
                <label>
                  <input type="radio" name="payment" value="qr" checked={paymentMethod === 'qr'} onChange={() => setPaymentMethod('qr')} /> QR / Scan to pay
                </label>
                <label>
                  <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} /> Card placeholder
                </label>
              </div>

              {paymentMethod === 'card' && (
                <>
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
                </>
              )}

              <button type="submit" className="checkout-button">
                {paymentMethod === 'card' ? `Record card order for ${formatMoney(cartTotal)}` : `Create QR payment for ${formatMoney(cartTotal)}`}
              </button>

              {qrPaymentUrl && currentOrderId && (
                <div className="qr-panel">
                  <h4>Scan to pay</h4>
                  <img src={qrPaymentUrl} alt="QR code to pay" style={{ width: 220, height: 220 }} />
                  <p>Order #{currentOrderId} - Scan this QR code with your payment app to complete payment.</p>
                  <button
                    type="button"
                    className="checkout-button"
                    onClick={async () => {
                      setStatus('Confirming payment...')
                      try {
                        const resp = await fetch(`${API_URL}/orders/${currentOrderId}/pay`, { method: 'POST' })
                        const json = await resp.json()
                        if (json.ok) {
                          setCart([])
                          setCheckoutMode(false)
                          setQrPaymentUrl(null)
                          setCurrentOrderId(null)
                          await fetchProducts()
                          setStatus(`Payment received. Order #${json.orderId} confirmed.`)
                        } else {
                          setStatus('Could not confirm payment.')
                        }
                      } catch (err) {
                        setStatus('Payment confirmation failed.')
                      }
                    }}
                  >
                    I have paid - mark as paid
                  </button>
                </div>
              )}
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
                    <div>{formatMoney(order.total)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {productDetail && (
            <div className="modal detail-modal">
              <div className="modal-inner">
                <button className="modal-close" onClick={() => setProductDetail(null)}>x</button>
                <div className="detail-grid">
                  <div className="detail-image">
                    <img src={productDetail.image} alt={productDetail.name} />
                  </div>
                  <div className="detail-info">
                    <h2>{productDetail.name}</h2>
                    <p className="muted">{productDetail.category} - {productDetail.color} - {productDetail.material}</p>
                    <p>{productDetail.description}</p>
                    <div className="detail-actions">
                      <strong className="price">{formatMoney(productDetail.price)}</strong>
                      <button disabled={productDetail.stock <= 0} onClick={() => { addToCart(productDetail); setProductDetail(null) }}>
                        {productDetail.stock > 0 ? `Add to cart (${productDetail.stock} left)` : 'Sold out'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showAuth && (
            <div className="auth-panel">
              <div className="auth-card">
                <header>
                  <h3>{authMode === 'register' ? 'Create an account' : 'Sign in'}</h3>
                  <button className="auth-close" onClick={() => setShowAuth(false)}>x</button>
                </header>
                <div className="auth-toggle">
                  <button className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>Login</button>
                  <button className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>Register</button>
                </div>
                <form onSubmit={submitAuth}>
                  {authMode === 'register' && (
                    <label>
                      Name
                      <input name="name" value={authForm.name} onChange={handleAuthChange} />
                    </label>
                  )}
                  <label>
                    Email
                    <input name="email" value={authForm.email} onChange={handleAuthChange} />
                  </label>
                  <label>
                    Password
                    <input type="password" name="password" value={authForm.password} onChange={handleAuthChange} />
                  </label>
                  <button type="submit" className="submit-button">
                    {authMode === 'register' ? 'Create account' : 'Login'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </aside>
        </div>
      )}
    </div>
  )
}
