// const { createServer: createViteServer } = require('vite')
// const dotenv = require('dotenv')
// dotenv.config()

// const isDev = process.env.NODE_ENV !== 'production'

// const express = require('express')
// const { connection } = require('./io')

// // create server
// const app = express()
// const server = require('http').createServer(app)
// const io = require('socket.io')(server)

// // handle socket connections
// io.on('connection', connection)
// io.on('error', (err) => {
//     console.log('Caught Socket ERR:', err)
// })

// // Start server
// ;(async () => {
//     // If running dev...
//     if (isDev) {
//         // Create Vite server in middleware mode.
//         const vite = await createViteServer({
//             server: { middlewareMode: 'html' },
//         })

//         // Use vite's connect instance as middleware
//         app.use(vite.middlewares)

//         // If production...
//     } else {
//         // assume the app has been built, and serve static
//         app.use(express.static('dist'))
//     }

//     const port = process.env.PORT || 3000
//     server.listen(port, () => {
//         console.log(`listening on port ${port}...`)
//     })
// })()

const { createServer: createViteServer } = require('vite')
const dotenv = require('dotenv')
dotenv.config()

const isDev = process.env.NODE_ENV !== 'production'

const express = require('express')
const path = require('path')
const { connection } = require('./io')

// create server
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
})

// handle socket connections
io.on('connection', connection)
io.on('error', (err) => {
    console.log('Caught Socket ERR:', err)
})

// Start server
;(async () => {
    // If running dev...
    if (isDev) {
        // Create Vite server in middleware mode.
        const vite = await createViteServer({
            server: { middlewareMode: 'html' },
        })

        // Use vite's connect instance as middleware
        app.use(vite.middlewares)

        // If production...
    } else {
        // Serve static assets from the built Vite app
        const distDir = path.join(__dirname, '..', 'dist')
        app.use(express.static(distDir))

        // Serve index.html for SPA routes
        app.get('*', (req, res) => {
            res.sendFile(path.join(distDir, 'index.html'))
        })
    }

    const port = process.env.PORT || 3000
    server.listen(port, () => {
        console.log(`listening on port ${port}...`)
    })
})()