const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || '0.0.0.0'
const port = process.env.PORT || 3000

// Initialise l'application Next.js
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Analyse l'URL de la requête
      const parsedUrl = parse(req.url, true)
      
      // Laisse Next.js gérer la requête
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Erreur lors du traitement de', req.url, err)
      res.statusCode = 500
      res.end('Internal Server Error')
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Serveur prêt sur http://${hostname}:${port} (mode: ${dev ? 'développement' : 'production'})`)
  })
})
