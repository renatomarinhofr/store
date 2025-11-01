import jsonServer from 'json-server'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, 'db.json')

const server = jsonServer.create()
const router = jsonServer.router(dbPath)
const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(jsonServer.bodyParser)

const db = router.db

function getProductsCollection(role) {
  if (role !== 'admin' && role !== 'tenant') {
    return null
  }
  return db.get(role).get('products')
}

function nextId(collection) {
  const data = collection.value() ?? []
  if (data.length === 0) {
    return 1
  }
  return Math.max(...data.map((item) => item.id)) + 1
}

server.post('/login', (req, res) => {
  const { email, password } = req.body ?? {}

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }

  const user = db.get('login').find({ email, password }).value()

  if (!user) {
    return res.status(401).json({ message: 'Credenciais inválidas.' })
  }

  return res.json({
    token: user.token,
    role: user.role,
  })
})

server.get('/:role/products', (req, res) => {
  const products = getProductsCollection(req.params.role)

  if (!products) {
    return res.status(404).json({ message: 'Role not found.' })
  }

  return res.json(products.value())
})

server.get('/:role/products/:id', (req, res) => {
  const products = getProductsCollection(req.params.role)

  if (!products) {
    return res.status(404).json({ message: 'Role not found.' })
  }

  const product = products.find({ id: Number(req.params.id) }).value()

  if (!product) {
    return res.status(404).json({ message: 'Product not found.' })
  }

  return res.json(product)
})

server.post('/:role/products', (req, res) => {
  const products = getProductsCollection(req.params.role)

  if (!products) {
    return res.status(404).json({ message: 'Role not found.' })
  }

  const product = req.body ?? {}
  const newProduct = { ...product, id: nextId(products) }

  products.push(newProduct).write()

  return res.status(201).json(newProduct)
})

server.put('/:role/products/:id', (req, res) => {
  const products = getProductsCollection(req.params.role)

  if (!products) {
    return res.status(404).json({ message: 'Role not found.' })
  }

  const productId = Number(req.params.id)
  const existing = products.find({ id: productId }).value()

  if (!existing) {
    return res.status(404).json({ message: 'Product not found.' })
  }

  const updatedProduct = { ...existing, ...req.body, id: productId }

  products.find({ id: productId }).assign(updatedProduct).write()

  return res.json(updatedProduct)
})

server.patch('/:role/products/:id', (req, res) => {
  const products = getProductsCollection(req.params.role)

  if (!products) {
    return res.status(404).json({ message: 'Role not found.' })
  }

  const productId = Number(req.params.id)
  const existing = products.find({ id: productId }).value()

  if (!existing) {
    return res.status(404).json({ message: 'Product not found.' })
  }

  products.find({ id: productId }).assign(req.body).write()

  const updated = products.find({ id: productId }).value()

  return res.json(updated)
})

server.delete('/:role/products/:id', (req, res) => {
  const products = getProductsCollection(req.params.role)

  if (!products) {
    return res.status(404).json({ message: 'Role not found.' })
  }

  const productId = Number(req.params.id)
  const existing = products.find({ id: productId }).value()

  if (!existing) {
    return res.status(404).json({ message: 'Product not found.' })
  }

  products.remove({ id: productId }).write()

  return res.status(204).end()
})

server.use(router)

const port = Number(process.env.PORT ?? 3333)
const host = process.env.HOST ?? '127.0.0.1'

server.listen(port, host, () => {
  console.log(`JSON Server is running on http://${host}:${port}`)
})
