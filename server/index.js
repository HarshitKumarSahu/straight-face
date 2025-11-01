const { createServer: createViteServer } = require("vite")
const dotenv = require("dotenv")
dotenv.config()

const isDev = process.env.NODE_ENV !== "production"

const express = require("express")
const { connection } = require("./io")

/**
 * Server
 */
const app = express()
const server = require("http").createServer(app)
const io = require("socket.io")(server)


/**
 * Handle socket connection
 */
io.on("connection", connection)
io.on('error', (err) => {
    console.log("Caught Socket err:", err);
    
})

/**
 * Start Server
 */
;(async () => {
    // If running dev..
    if(isDev) {
        // Create vite server in middleware mode
        const vite = await createViteServer({
            server: {
                middlewareMode: "html"
            }
        })

        // use vite connection instance as middleware
        app.use(vite.middlewares)

    } else {
        // assume app has been build and serve static 
        app.use(express.static("dist"))
    }

    const port = process.env.PORT || 3000
    server.listen(port, () => {
        console.log(`Server Started listing at ${port} port`);
        
    })

})()