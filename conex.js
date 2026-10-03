const mysql = require("mysql2/promise") // I am calling the package that I just installed,
// It is the translator it knows how to package the node.js queries and send them to MySQL and I use promise
// because it will use modern syntax async/await on my express routes

const pool = mysql.createPool({ // pool is a group of connections, instead of creating one per user
    host: "localhost", // Database in my computer
    user: "root", // Administrator user for default
    password: "1023523235", // My password created in WorkBench
    database: "restaurant", // The database name
    waitForConnections: true, // If the 10 lines are busy for clients, it won´t go down the requests will wait for milliseconds
    connectionLimit: 10, // The maximiun connections that the Pool will have open, it is the standard in the development
    queueLimit: 0 // Without limit of line, none will be rejected, it will be like a virtual line
})

// Prueba rápida de conexión (puedes borrarla después)
pool.query("SELECT 1")
    .then(() => console.log("🟢 ¡Conexión exitosa a la base de datos 'restaurant'!"))
    .catch(err => console.error("🔴 Error conectando a MySQL:", err.message))

module.exports = pool// When I use promise, I want to work with asynchronous code (async/await), so this connection 
// group could be used in other files of my project


