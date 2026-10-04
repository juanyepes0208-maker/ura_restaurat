const mysql = require("mysql2/promise") // I am calling the package that I just installed,
// It is the translator it knows how to package the node.js queries and send them to MySQL and I use promise
// because it will use modern syntax async/await on my express routes

const pool = mysql.createPool({
    uri: process.env.DATABASE_URL, 
    ssl: { rejectUnauthorized: false },
    waitForConnections: true, 
    connectionLimit: 10, 
    queueLimit: 0 
});



// Prueba rápida de conexión (puedes borrarla después)
pool.query("SELECT 1")
    .then(() => console.log("🟢 ¡Conexión exitosa a la base de datos 'restaurant'!"))
    .catch(err => console.error("🔴 Error conectando a MySQL:", err.message))

module.exports = pool// When I use promise, I want to work with asynchronous code (async/await), so this connection 
// group could be used in other files of my project



