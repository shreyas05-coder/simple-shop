import React, { useEffect, useMemo, useState } from 'react'
import './auth.css'
import AdminDashboard from './AdminDashboard'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const COLLECTION_IMAGES = {
  Linen: 'https://images.unsplash.com/photo-1558171813-4c088753af92?auto=format&fit=crop&w=600&q=80',
  Cotton: 'https://images.unsplash.com/photo-1620799140408-edc6dcb265d4?auto=format&fit=crop&w=600&q=80',
  Silk: 'https://images.unsplash.com/photo-1586105251261-72a756577a11?auto=format&fit=crop&w=600&q=80',
  Decor: 'https://images.unsplash.com/photo-1616046229472-59d6f9b96622?auto=format&fit=crop&w=600&q=80',
  default: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80'
}

const HERO_BANNERS = [
  {
    title: 'New Arrivals',
    subtitle: 'A Story in blocks',
    copy: 'Hand block prints on pure mul crush fabric',
    image: 'https://images.unsplash.com/photo-1616046229472-59d6f9b96622?auto=format&fit=crop&w=1200&q=80',
    cta: 'Shop now'
  },
  {
    title: 'Paro',
    subtitle: 'Finely woven linen suits',
    copy: 'Hand dyed for summers',
    image: 'https://images.unsplash.com/photo-1558171813-4c088753af92?auto=format&fit=crop&w=1200&q=80',
    cta: 'Explore linen'
  },
  {
    title: 'Linen story',
    subtitle: 'Thoughtfully designed prints',
    copy: 'Soft linen fabric for every season',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb265d4?auto=format&fit=crop&w=1200&q=80',
    cta: 'View collection'
  }
]

const TESTIMONIALS = [
  {
    quote: "The cotton linen quality blew me away. I've ordered three times now and every fabric has been exactly as shown on the website.",
    product: 'Cotton Linen · Snow White',
    name: 'Shreya M.',
    location: 'Hyderabad · Verified buyer'
  },
  {
    quote: 'Got my silk saree in 3 days flat. The weave, the finish, the way it drapes — everything is genuine.',
    product: 'Silk Saree · Magenta',
    name: 'Priya K.',
    location: 'Ernakulam · Verified buyer'
  },
  {
    quote: 'Linen is thick and crisp, perfect for formal shirts. Already planning my next order for trousers.',
    product: 'Pure Linen · Slate Grey',
    name: 'Arjun D.',
    location: 'Bengaluru · Verified buyer'
  }
]

const TRUST_BADGES = [
  { title: 'Genuine fabrics, always', detail: 'Quality-checked before every dispatch' },
  { title: 'Free delivery above ₹1,999', detail: 'Pan-India shipping to 500+ cities' },
  { title: '7-day easy exchange', detail: 'No questions, no hassle' },
  { title: '24hr dispatch from Surat', detail: 'Order today, ships tomorrow' }
]

const WHATSAPP_NUMBER = '911234567890'
const WHATSAPP_MESSAGE = encodeURIComponent('Hi Ivory Thread! I have a question about your fabrics.')
const FREE_SHIPPING_THRESHOLD = 199900 // paise = ₹1,999

const IconSearch = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="11" cy="11" r="7" /><path d="M20 20l-3-3" />
  </svg>
)
const IconUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
)
const IconCart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M6 6h15l-1.5 9h-12z" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /><path d="M6 6L5 3H2" />
  </svg>
)
const IconWhatsApp = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

function getSaleInfo(product) {
  const price = Number(product.price) || 0
  const compareAt = Number(product.compareAtPrice) || 0
  if (compareAt > price) {
    return { onSale: true, compareAt, discount: Math.round((1 - price / compareAt) * 100) }
  }
  const id = String(product._id || product.id || product.name || '')
  const hash = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  if (hash % 5 === 0 && price > 0) {
    const compareAtSynthetic = Math.ceil((price * 1.18) / 100) * 100
    return {
      onSale: true,
      compareAt: compareAtSynthetic,
      discount: Math.round((1 - price / compareAtSynthetic) * 100)
    }
  }
  return { onSale: false, compareAt: 0, discount: 0 }
}

function isNewProduct(product) {
  if (!product.createdAt) return false
  const created = new Date(product.createdAt).getTime()
  const thirtyDays = 30 * 24 * 60 * 60 * 1000
  return Date.now() - created < thirtyDays
}

function collectionImage(category) {
  if (!category) return COLLECTION_IMAGES.default
  const key = Object.keys(COLLECTION_IMAGES).find((k) =>
    category.toLowerCase().includes(k.toLowerCase())
  )
  return COLLECTION_IMAGES[key] || COLLECTION_IMAGES.default
}

export default function App() {
  const [products, setProducts] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
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
  const [authMode, setAuthMode] = useState(null)
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [showAuth, setShowAuth] = useState(false)
  const [productDetail, setProductDetail] = useState(null)
  const [page, setPage] = useState('home')
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [checkoutMode, setCheckoutMode] = useState(false)
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '', street: '', city: '', state: '', zip: '', country: 'India', card: '', expiry: '', cvc: '' })
  const [paymentMethod, setPaymentMethod] = useState('qr')
  const [qrPaymentUrl, setQrPaymentUrl] = useState(null)
  const [currentOrderId, setCurrentOrderId] = useState(null)
  const [orderEmail, setOrderEmail] = useState('')
  const [orderHistory, setOrderHistory] = useState([])
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [checkoutErrors, setCheckoutErrors] = useState({})
  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const [heroIndex, setHeroIndex] = useState(0)
  const [heroPaused, setHeroPaused] = useState(false)

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
    async function loadFeatured() {
      try {
        const response = await fetch(`${API_URL}/products`)
        const data = await response.json()
        if (response.ok && Array.isArray(data)) setFeaturedProducts(data)
      } catch {
        setFeaturedProducts([])
      }
    }
    loadFeatured()
  }, [])

  useEffect(() => {
    const t = localStorage.getItem('ivory_token')
    if (t) {
      setToken(t)
      try {
        const parts = t.split('.')
        const payload = JSON.parse(atob(parts[1]))
        setUser(payload)
      } catch {
        setUser(null)
      }
    }
  }, [])

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch(`${API_URL}/products`)
        const all = await response.json()
        if (!response.ok || !Array.isArray(all)) throw new Error('Invalid product response')
        const unique = ['All', ...Array.from(new Set(all.map((item) => item.category))).sort()]
        setAllCategories(unique)
        setColors(Array.from(new Set(all.map((p) => p.color).filter(Boolean))))
        setMaterials(Array.from(new Set(all.map((p) => p.material).filter(Boolean))))
      } catch {
        setAllCategories(['All'])
      }
    }
    loadCategories()
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen || cartOpen || showAuth || productDetail ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen, cartOpen, showAuth, productDetail])

  useEffect(() => {
    if (heroPaused || page !== 'home') return undefined
    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % HERO_BANNERS.length)
    }, 5500)
    return () => window.clearInterval(timer)
  }, [heroPaused, page])

  useEffect(() => {
    if (page !== 'home') return undefined
    const timer = window.setInterval(() => {
      setTestimonialIndex((current) => (current + 1) % TESTIMONIALS.length)
    }, 7000)
    return () => window.clearInterval(timer)
  }, [page])

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
      if (!response.ok || !Array.isArray(data)) throw new Error(data.error || 'Invalid product response')
      setProducts(data)
    } catch (error) {
      if (error.name === 'AbortError') return
      setProducts([])
    }
  }

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.qty, 0), [cart])
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart])
  const categories = allCategories
  const visibleCategories = categories.filter((value) => value !== 'All')
  const filteredProducts = useMemo(() => [...products].sort((a, b) => a.name.localeCompare(b.name)), [products])
  const newArrivals = useMemo(() => [...featuredProducts].slice(0, 6), [featuredProducts])
  const bestSellers = useMemo(() => [...featuredProducts].slice(0, 8), [featuredProducts])

  const formatMoney = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format((amount || 0) / 100)

  function goTo(nextPage) {
    setPage(nextPage)
    setMenuOpen(false)
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
    setCheckoutErrors((current) => ({ ...current, [name]: '' }))
  }

  function fieldError(name) {
    return checkoutErrors[name] ? <span className="field-error">{checkoutErrors[name]}</span> : null
  }

  function validateCheckout() {
    const nextErrors = {}
    const values = Object.fromEntries(
      Object.entries(customer).map(([key, value]) => [key, String(value || '').trim()])
    )
    const digits = (value) => value.replace(/\D/g, '')

    if (!values.name) nextErrors.name = 'Enter the customer name.'
    if (!values.email) {
      nextErrors.email = 'Enter an email address.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (!values.phone) {
      nextErrors.phone = 'Enter a WhatsApp or phone number.'
    } else if (digits(values.phone).length < 10) {
      nextErrors.phone = 'Enter at least 10 phone digits.'
    }
    if (!values.street) nextErrors.street = 'Enter the full shipping address.'
    if (!values.city) nextErrors.city = 'Enter the city.'
    if (!values.state) nextErrors.state = 'Enter the state.'
    if (!values.zip) {
      nextErrors.zip = 'Enter the PIN code.'
    } else if (!/^\d{6}$/.test(digits(values.zip))) {
      nextErrors.zip = 'Enter a valid 6-digit PIN code.'
    }
    if (!values.country) nextErrors.country = 'Enter the country.'

    if (paymentMethod === 'card') {
      if (!values.card) nextErrors.card = 'Enter card number.'
      if (!values.expiry) nextErrors.expiry = 'Enter expiry.'
      if (!values.cvc) nextErrors.cvc = 'Enter CVC.'
    }

    setCheckoutErrors(nextErrors)
    const firstErrorField = Object.keys(nextErrors)[0]
    if (firstErrorField) {
      setStatus(nextErrors[firstErrorField])
      window.setTimeout(() => document.querySelector(`[name="${firstErrorField}"]`)?.focus(), 0)
      return false
    }
    return true
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
        setShowAuth(false)
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
        setShowAuth(false)
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
    if (isSubmittingOrder) return
    if (qrPaymentUrl) {
      setStatus('QR payment is already created for this order. Scan it or refresh checkout to start again.')
      return
    }
    if (cart.length === 0) {
      setStatus('Add something to your cart before checkout.')
      return
    }
    if (!validateCheckout()) return
    setIsSubmittingOrder(true)
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
      if (!response.ok) throw new Error(data.error || 'Checkout failed')
      if (paymentMethod === 'qr' && data.paymentUrl) {
        setQrPaymentUrl(data.paymentUrl)
        setCurrentOrderId(data.orderId)
        setStatus('Scan the QR code with your payment app to complete the order.')
        window.setTimeout(() => {
          document.querySelector('.qr-panel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }, 50)
        return
      }
      setCart([])
      setCheckoutMode(false)
      setQrPaymentUrl(null)
      setCurrentOrderId(null)
      await fetchProducts()
      setStatus(`Order confirmed! Order #${data.orderId} has been received.`)
    } catch (error) {
      setStatus(error.message || 'Checkout failed. Please try again.')
    } finally {
      setIsSubmittingOrder(false)
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
    } catch {
      setStatus('Could not load order history.')
    }
  }

  function renderProductCard(product, compact = false) {
    const productId = product._id || product.id
    const inStock = product.stock > 0
    const sale = getSaleInfo(product)
    const isNew = isNewProduct(product)
    return (
      <article key={productId} className={`fp-product-card${compact ? ' compact' : ''}`}>
        <div className="fp-product-media">
          {sale.onSale && <span className="fp-badge fp-badge-sale">Sale</span>}
          {!sale.onSale && isNew && <span className="fp-badge fp-badge-new">New</span>}
          <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
          <div className="fp-product-actions">
            <button type="button" className="fp-btn-add" disabled={!inStock} onClick={() => addToCart(product)}>
              Add
            </button>
            <button type="button" className="fp-btn-choose" onClick={() => setProductDetail(product)}>
              Choose
            </button>
          </div>
        </div>
        <div className="fp-product-info">
          <h3>
            <button type="button" className="fp-product-link" onClick={() => setProductDetail(product)}>
              {product.name}
            </button>
          </h3>
          <div className="fp-price-row">
            <p className="fp-price">{formatMoney(product.price)}<span className="fp-per">/mtr</span></p>
            {sale.onSale && (
              <p className="fp-price-compare">{formatMoney(sale.compareAt)}<span className="fp-per">/mtr</span></p>
            )}
          </div>
          {sale.onSale && sale.discount > 0 && (
            <span className="fp-discount-tag">{sale.discount}% off</span>
          )}
          {!inStock && <span className="fp-sold-out">Sold out</span>}
        </div>
      </article>
    )
  }

  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal)
  const freeShippingProgress = Math.min(100, (cartTotal / FREE_SHIPPING_THRESHOLD) * 100)

  if (page === 'admin' && user?.isAdmin) {
    return <AdminDashboard token={token} user={user} onLogout={logout} />
  }

  return (
    <div className="fp-app">
      <div className="fp-announcement">
        <div className="fp-announcement-track">
          <span>Free delivery above ₹1,999 · 24hr dispatch · Pan-India shipping · WhatsApp support · Honest pricing every day</span>
          <span aria-hidden="true">Free delivery above ₹1,999 · 24hr dispatch · Pan-India shipping · WhatsApp support · Honest pricing every day</span>
        </div>
      </div>

      <header className="fp-header">
        <div className="fp-header-row">
          <button
            type="button"
            className="fp-menu-btn"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <span /><span /><span />
          </button>

          <button type="button" className="fp-brand" onClick={() => goTo('home')}>
            <span className="fp-brand-main">Ivory Thread</span>
            <span className="fp-brand-sub">India&apos;s loved fabrics</span>
          </button>

          <div className="fp-header-icons">
            {user?.isAdmin && (
              <button type="button" className="fp-icon-btn" onClick={() => goTo('admin')} aria-label="Admin">
                ⚙
              </button>
            )}
            <button type="button" className="fp-icon-btn" onClick={() => goTo('shop')} aria-label="Search">
              <IconSearch />
            </button>
            <button
              type="button"
              className="fp-icon-btn"
              onClick={() => { setShowAuth(true); setAuthMode(authMode || 'login') }}
              aria-label="Account"
            >
              <IconUser />
            </button>
            <button type="button" className="fp-icon-btn fp-cart-btn" onClick={() => setCartOpen(true)} aria-label="Cart">
              <IconCart />
              {cartCount > 0 && <span className="fp-cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>

        <nav className="fp-desktop-nav" aria-label="Main">
          {['home', 'shop', 'about', 'contact', 'policies'].map((item) => (
            <button
              key={item}
              type="button"
              className={page === item ? 'active' : ''}
              onClick={() => goTo(item)}
            >
              {item === 'home' ? 'Home' : item === 'shop' ? 'Shop' : item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </nav>
      </header>

      {menuOpen && (
        <div className="fp-sidebar-overlay" onClick={() => setMenuOpen(false)} role="presentation">
          <aside className="fp-sidebar" onClick={(e) => e.stopPropagation()} aria-label="Navigation menu">
            <div className="fp-sidebar-head">
              <strong>Menu</strong>
              <button type="button" className="fp-sidebar-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">×</button>
            </div>
            <nav className="fp-sidebar-nav">
              <button type="button" onClick={() => goTo('home')}>Home</button>
              <button type="button" onClick={() => goTo('shop')}>Shop all fabrics</button>
              {visibleCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => { setCategory(cat); goTo('shop') }}
                >
                  {cat}
                </button>
              ))}
              <button type="button" onClick={() => goTo('about')}>About us</button>
              <button type="button" onClick={() => goTo('contact')}>Contact</button>
              <button type="button" onClick={() => goTo('policies')}>Policies</button>
              {user ? (
                <button type="button" onClick={logout}>Log out ({user.name || user.email})</button>
              ) : (
                <button type="button" onClick={() => { setShowAuth(true); setAuthMode('login'); setMenuOpen(false) }}>Sign in</button>
              )}
            </nav>
          </aside>
        </div>
      )}

      {status && <div className="fp-toast">{status}</div>}

      <main className="fp-main">
        {page === 'home' && (
          <>
            <section className="fp-stats">
              <div><strong>9L+</strong><span>Happy customers</span></div>
              <div><strong>4.5★</strong><span>Avg rating</span></div>
              <div><strong>500+</strong><span>Cities delivered</span></div>
              <div><strong>24hr</strong><span>Dispatch</span></div>
            </section>

            <section
              className="fp-hero-carousel"
              aria-roledescription="carousel"
              aria-label="Featured collections"
              onMouseEnter={() => setHeroPaused(true)}
              onMouseLeave={() => setHeroPaused(false)}
              onFocus={() => setHeroPaused(true)}
              onBlur={() => setHeroPaused(false)}
            >
              <div className="fp-hero-viewport">
                <div className="fp-hero-track" style={{ transform: `translateX(-${heroIndex * 100}%)` }}>
                  {HERO_BANNERS.map((banner) => (
                    <article key={banner.title} className="fp-hero-slide" style={{ backgroundImage: `url(${banner.image})` }}>
                      <div className="fp-hero-card-content">
                        <p className="fp-hero-label">{banner.title}</p>
                        <h2>{banner.subtitle}</h2>
                        <p>{banner.copy}</p>
                        <button type="button" className="fp-cta" onClick={() => goTo('shop')}>{banner.cta}</button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
              <button
                type="button"
                className="fp-hero-arrow fp-hero-prev"
                aria-label="Previous slide"
                onClick={() => setHeroIndex((i) => (i - 1 + HERO_BANNERS.length) % HERO_BANNERS.length)}
              >
                ‹
              </button>
              <button
                type="button"
                className="fp-hero-arrow fp-hero-next"
                aria-label="Next slide"
                onClick={() => setHeroIndex((i) => (i + 1) % HERO_BANNERS.length)}
              >
                ›
              </button>
              <div className="fp-hero-dots" role="tablist" aria-label="Hero slides">
                {HERO_BANNERS.map((banner, i) => (
                  <button
                    key={banner.title}
                    type="button"
                    role="tab"
                    aria-selected={i === heroIndex}
                    aria-label={`Slide ${i + 1}: ${banner.subtitle}`}
                    className={i === heroIndex ? 'active' : ''}
                    onClick={() => setHeroIndex(i)}
                  />
                ))}
              </div>
              <div className="fp-hero-thumbs">
                {HERO_BANNERS.map((banner, i) => (
                  <button
                    key={`thumb-${banner.title}`}
                    type="button"
                    className={i === heroIndex ? 'active' : ''}
                    onClick={() => setHeroIndex(i)}
                    style={{ backgroundImage: `url(${banner.image})` }}
                    aria-label={`Go to ${banner.subtitle}`}
                  />
                ))}
              </div>
            </section>

            {visibleCategories.length > 0 && (
              <section className="fp-section">
                <h2 className="fp-section-title">Shop by collection</h2>
                <div className="fp-collections">
                  {visibleCategories.slice(0, 5).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className="fp-collection-card"
                      onClick={() => { setCategory(cat); goTo('shop') }}
                    >
                      <img src={collectionImage(cat)} alt={cat} loading="lazy" />
                      <span>{cat}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {newArrivals.length > 0 && (
              <section className="fp-section">
                <div className="fp-section-head">
                  <h2 className="fp-section-title">New Arrivals</h2>
                  <button type="button" className="fp-view-all" onClick={() => goTo('shop')}>View all</button>
                </div>
                <div className="fp-product-row">
                  {newArrivals.map((p) => renderProductCard(p))}
                </div>
              </section>
            )}

            <section className="fp-promise">
              <p className="fp-promise-label">Our promise to you</p>
              <blockquote>&ldquo;Honest pricing, every day. No inflated MRPs. No fake discounts.&rdquo;</blockquote>
              <p>
                Every fabric you see here was curated with care. From yarn selection to the final metre on the roll.
                Ivory Thread brings premium textiles straight to your doorstep — no middlemen, just quality you can trust.
              </p>
            </section>

            {bestSellers.length > 0 && (
              <section className="fp-section">
                <div className="fp-section-head">
                  <h2 className="fp-section-title">Our Best Sellers</h2>
                  <button type="button" className="fp-view-all" onClick={() => goTo('shop')}>View all</button>
                </div>
                <div className="fp-product-grid">
                  {bestSellers.map((p) => renderProductCard(p, true))}
                </div>
              </section>
            )}

            <section className="fp-testimonials">
              <p className="fp-testimonials-eyebrow">Real customers, real words</p>
              <h2>What Our Customers Say</h2>
              <div className="fp-testimonial-card">
                <p>&ldquo;{TESTIMONIALS[testimonialIndex].quote}&rdquo;</p>
                <span className="fp-testimonial-product">{TESTIMONIALS[testimonialIndex].product}</span>
                <strong>{TESTIMONIALS[testimonialIndex].name}</strong>
                <span className="fp-testimonial-loc">{TESTIMONIALS[testimonialIndex].location}</span>
              </div>
              <div className="fp-testimonial-dots">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={i === testimonialIndex ? 'active' : ''}
                    aria-label={`Testimonial ${i + 1}`}
                    onClick={() => setTestimonialIndex(i)}
                  />
                ))}
              </div>
            </section>

            <section className="fp-trust">
              {TRUST_BADGES.map((badge) => (
                <div key={badge.title}>
                  <strong>{badge.title}</strong>
                  <span>{badge.detail}</span>
                </div>
              ))}
            </section>
          </>
        )}

        {page === 'about' && (
          <section className="fp-page">
            <h1>About Ivory Thread</h1>
            <p>Ivory Thread is a beacon of premium craftsmanship, blending textile excellence with modern luxury. We curate exceptional fabrics and home goods, each piece selected to bring elegance and comfort to discerning spaces.</p>
            <h2>Our Heritage</h2>
            <p>Founded on the principle that quality and beauty should be accessible, Ivory Thread has grown to serve ateliers, designers, and homes worldwide. We believe in the power of premium materials to transform spaces.</p>
          </section>
        )}

        {page === 'contact' && (
          <section className="fp-page">
            <h1>Get in Touch</h1>
            <h2>Contact Information</h2>
            <p><strong>Phone:</strong> +91 12345 67890</p>
            <p><strong>Email:</strong> hello@ivorythread.example</p>
            <p><strong>WhatsApp:</strong> +91 12345 67890</p>
            <h2>Visit Us</h2>
            <p>We&apos;d love to hear from you. Reach out with any inquiries about our collections, custom orders, or partnerships.</p>
          </section>
        )}

        {page === 'policies' && (
          <section className="fp-page">
            <h1>Shipping, Returns & Policies</h1>
            <h2>Shipping</h2>
            <p>Orders are packed after payment confirmation and dispatched within 2-4 business days. Delivery timelines depend on the destination and courier availability.</p>
            <h2>Returns</h2>
            <p>Fabric cut to custom length is not returnable unless it arrives damaged or incorrect. Eligible ready products can be requested for return within 7 days of delivery.</p>
            <h2>Privacy & Terms</h2>
            <p>Customer details are used only for account access, order fulfilment, payment confirmation, and service communication.</p>
          </section>
        )}

        {page === 'shop' && (
          <>
            <section className="fp-shop-hero">
              <h1>Shop fabrics</h1>
              <p>Find the right fabric faster with category chips and filters.</p>
              {visibleCategories.length > 0 && (
                <div className="fp-chips">
                  <button type="button" className={category === 'All' ? 'active' : ''} onClick={() => setCategory('All')}>All</button>
                  {visibleCategories.map((value) => (
                    <button
                      type="button"
                      key={value}
                      className={category === value ? 'active' : ''}
                      onClick={() => setCategory(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              )}
            </section>

            <div className="fp-filters">
              <label className="fp-filter-search">
                <span>Search fabrics</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search cotton, linen, silk..."
                />
              </label>
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                {categories.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
              <select value={colorFilter} onChange={(e) => setColorFilter(e.target.value)}>
                <option value="">All colors</option>
                {colors.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={materialFilter} onChange={(e) => setMaterialFilter(e.target.value)}>
                <option value="">All materials</option>
                {materials.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <input value={minPriceFilter} onChange={(e) => setMinPriceFilter(e.target.value)} placeholder="Min ₹" />
              <input value={maxPriceFilter} onChange={(e) => setMaxPriceFilter(e.target.value)} placeholder="Max ₹" />
            </div>

            <div className="fp-filter-tags">
              <span>Ready stock only</span>
              <span>Price in INR / metre</span>
              <span>{filteredProducts.length} items</span>
            </div>

            <section className="fp-section">
              <div className="fp-product-grid shop-grid">
                {filteredProducts.map((p) => renderProductCard(p))}
              </div>
              {filteredProducts.length === 0 && (
                <p className="fp-empty">No fabrics match your filters. Try clearing a filter or search term.</p>
              )}
            </section>
          </>
        )}
      </main>

      <footer className="fp-footer">
        <div className="fp-footer-brand">
          <strong>Ivory Thread</strong>
          <p>Premium fabrics · Honest pricing · Fast dispatch</p>
        </div>
        <div className="fp-footer-links">
          <button type="button" onClick={() => goTo('shop')}>Shop</button>
          <button type="button" onClick={() => goTo('about')}>About</button>
          <button type="button" onClick={() => goTo('contact')}>Contact</button>
          <button type="button" onClick={() => goTo('policies')}>Policies</button>
        </div>
        <p className="fp-footer-copy">© {new Date().getFullYear()} Ivory Thread. All rights reserved.</p>
      </footer>

      {cartOpen && (
        <div className="fp-cart-overlay" role="dialog" aria-modal="true" aria-label="Shopping cart">
          <div className="fp-cart-backdrop" onClick={closeCart} role="presentation" />
          <aside className="fp-cart-drawer">
            <div className="fp-cart-head">
              <div>
                <h2>Your bag</h2>
                <p>{cart.length ? `${cartCount} item${cartCount === 1 ? '' : 's'}` : 'Your cart is empty'}</p>
              </div>
              <button type="button" className="fp-sidebar-close" onClick={closeCart} aria-label="Close cart">×</button>
            </div>

            {cart.length > 0 && (
              <div className="fp-shipping-bar">
                {freeShippingRemaining > 0 ? (
                  <p>Add <strong>{formatMoney(freeShippingRemaining)}</strong> more for free delivery</p>
                ) : (
                  <p>🎉 You&apos;ve unlocked <strong>free delivery</strong></p>
                )}
                <div className="fp-shipping-progress">
                  <span style={{ width: `${freeShippingProgress}%` }} />
                </div>
              </div>
            )}

            <div className="fp-cart-items">
              {cart.length === 0 ? (
                <div className="fp-empty-cart">
                  <p>Your bag is empty</p>
                  <button type="button" className="fp-cta" onClick={() => { closeCart(); goTo('shop') }}>Continue shopping</button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="fp-cart-item">
                    <div>
                      <h3>{item.name}</h3>
                      <p>{formatMoney(item.price)}/mtr · {item.qty} × {formatMoney(item.price * item.qty)}</p>
                    </div>
                    <div className="fp-cart-item-actions">
                      <div className="fp-qty">
                        <button type="button" onClick={() => updateQty(item.id, -1)}>−</button>
                        <span>{item.qty}</span>
                        <button type="button" onClick={() => updateQty(item.id, 1)} disabled={item.qty >= item.stock}>+</button>
                      </div>
                      <button type="button" className="fp-remove" onClick={() => removeFromCart(item.id)}>Remove</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="fp-cart-foot">
                <div className="fp-cart-subtotal">
                  <span>Subtotal</span>
                  <strong>{formatMoney(cartTotal)}</strong>
                </div>
                <button type="button" className="fp-cta fp-cta-full" onClick={() => setCheckoutMode(true)}>
                  Proceed to checkout
                </button>
              </div>
            )}

            {checkoutMode && cart.length > 0 && (
              <form className="fp-checkout" onSubmit={submitOrder} noValidate>
                <h3>Checkout</h3>
                <label>
                  Name
                  <input name="name" value={customer.name} onChange={handleInputChange} placeholder="Full name" required aria-invalid={!!checkoutErrors.name} />
                  {fieldError('name')}
                </label>
                <label>
                  Email
                  <input type="email" name="email" value={customer.email} onChange={handleInputChange} placeholder="you@example.com" required aria-invalid={!!checkoutErrors.email} />
                  {fieldError('email')}
                </label>
                <label>
                  Phone / WhatsApp
                  <input name="phone" value={customer.phone} onChange={handleInputChange} placeholder="+91 98765 43210" required aria-invalid={!!checkoutErrors.phone} />
                  {fieldError('phone')}
                </label>
                <label>
                  Shipping address
                  <input name="street" value={customer.street} onChange={handleInputChange} placeholder="House, street, area" required aria-invalid={!!checkoutErrors.street} />
                  {fieldError('street')}
                </label>
                <div className="fp-row">
                  <label>
                    City
                    <input name="city" value={customer.city} onChange={handleInputChange} placeholder="City" required aria-invalid={!!checkoutErrors.city} />
                    {fieldError('city')}
                  </label>
                  <label>
                    State
                    <input name="state" value={customer.state} onChange={handleInputChange} placeholder="State" required aria-invalid={!!checkoutErrors.state} />
                    {fieldError('state')}
                  </label>
                </div>
                <div className="fp-row">
                  <label>
                    PIN code
                    <input name="zip" value={customer.zip} onChange={handleInputChange} placeholder="110001" inputMode="numeric" required aria-invalid={!!checkoutErrors.zip} />
                    {fieldError('zip')}
                  </label>
                  <label>
                    Country
                    <input name="country" value={customer.country} onChange={handleInputChange} placeholder="India" required aria-invalid={!!checkoutErrors.country} />
                    {fieldError('country')}
                  </label>
                </div>

                <div className="fp-payment-methods">
                  <label>
                    <input type="radio" name="payment" value="qr" checked={paymentMethod === 'qr'} onChange={() => setPaymentMethod('qr')} />
                    QR / UPI pay
                  </label>
                  <label>
                    <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                    Card (demo)
                  </label>
                </div>

                {paymentMethod === 'card' && (
                  <>
                    <label>
                      Card number
                      <input name="card" value={customer.card} onChange={handleInputChange} placeholder="4242 4242 4242 4242" aria-invalid={!!checkoutErrors.card} />
                      {fieldError('card')}
                    </label>
                    <div className="fp-row">
                      <label>
                        Expiry
                        <input name="expiry" value={customer.expiry} onChange={handleInputChange} placeholder="MM/YY" aria-invalid={!!checkoutErrors.expiry} />
                        {fieldError('expiry')}
                      </label>
                      <label>
                        CVC
                        <input name="cvc" value={customer.cvc} onChange={handleInputChange} placeholder="123" aria-invalid={!!checkoutErrors.cvc} />
                        {fieldError('cvc')}
                      </label>
                    </div>
                  </>
                )}

                <button type="submit" className="fp-cta fp-cta-full" disabled={isSubmittingOrder || !!qrPaymentUrl}>
                  {isSubmittingOrder
                    ? 'Creating payment...'
                    : paymentMethod === 'card'
                      ? `Pay ${formatMoney(cartTotal)}`
                      : `Create QR payment · ${formatMoney(cartTotal)}`}
                </button>

                {qrPaymentUrl && currentOrderId && (
                  <div className="qr-panel">
                    <h4>Scan to pay</h4>
                    <img
                      src={qrPaymentUrl}
                      alt="QR code to pay"
                      width={220}
                      height={220}
                      onError={(event) => {
                        const encoded = qrPaymentUrl.split('data=')[1]
                        if (encoded) {
                          event.currentTarget.src = `https://chart.googleapis.com/chart?cht=qr&chs=260x260&chl=${encoded}`
                        }
                      }}
                    />
                    <p>Order #{currentOrderId}</p>
                    <button
                      type="button"
                      className="fp-cta fp-cta-full"
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
                            closeCart()
                            await fetchProducts()
                            setStatus(`Payment received. Order #${json.orderId} confirmed.`)
                          } else {
                            setStatus('Could not confirm payment.')
                          }
                        } catch {
                          setStatus('Payment confirmation failed.')
                        }
                      }}
                    >
                      I have completed payment
                    </button>
                  </div>
                )}
              </form>
            )}

            <div className="fp-order-history">
              <h3>Order history</h3>
              <div className="fp-history-search">
                <input
                  value={orderEmail}
                  onChange={(event) => setOrderEmail(event.target.value)}
                  placeholder="Email to search orders"
                />
                <button type="button" onClick={findOrders}>Search</button>
              </div>
              {orderHistory.length > 0 && (
                <div className="fp-history-list">
                  {orderHistory.map((order) => (
                    <div key={order.id} className="fp-history-item">
                      <div>
                        <strong>Order #{order.id}</strong>
                        <p>{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <span>{formatMoney(order.total)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {productDetail && (
        <div className="fp-modal-overlay" role="dialog" aria-modal="true">
          <div className="fp-modal-backdrop" onClick={() => setProductDetail(null)} role="presentation" />
          <div className="fp-modal">
            <button type="button" className="fp-sidebar-close" onClick={() => setProductDetail(null)} aria-label="Close">×</button>
            <div className="fp-modal-grid">
              <img src={productDetail.image} alt={productDetail.name} />
              <div>
                <p className="fp-modal-meta">{productDetail.category} · {productDetail.color} · {productDetail.material}</p>
                <h2>{productDetail.name}</h2>
                <p>{productDetail.description}</p>
                {(() => {
                  const sale = getSaleInfo(productDetail)
                  return (
                    <div className="fp-modal-pricing">
                      {sale.onSale && <span className="fp-badge fp-badge-sale">Sale</span>}
                      <div className="fp-price-row">
                        <p className="fp-price large">{formatMoney(productDetail.price)}<span className="fp-per">/mtr</span></p>
                        {sale.onSale && (
                          <p className="fp-price-compare large">{formatMoney(sale.compareAt)}<span className="fp-per">/mtr</span></p>
                        )}
                      </div>
                      {sale.onSale && sale.discount > 0 && (
                        <span className="fp-discount-tag">{sale.discount}% off</span>
                      )}
                    </div>
                  )
                })()}
                <p className="fp-stock">{productDetail.stock > 0 ? `${productDetail.stock} in stock` : 'Sold out'}</p>
                <div className="fp-modal-actions">
                  <button
                    type="button"
                    className="fp-cta"
                    disabled={productDetail.stock <= 0}
                    onClick={() => { addToCart(productDetail); setProductDetail(null) }}
                  >
                    Add to bag
                  </button>
                  <button type="button" className="fp-btn-choose outline" onClick={() => setProductDetail(null)}>Close</button>
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
              <button type="button" className="auth-close" onClick={() => setShowAuth(false)}>×</button>
            </header>
            <div className="auth-toggle">
              <button type="button" className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>Login</button>
              <button type="button" className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>Register</button>
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

      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
        className="fp-whatsapp-fab"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <IconWhatsApp />
        <span className="fp-whatsapp-label">Chat with us</span>
      </a>
    </div>
  )
}
