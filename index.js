const express = require('express'); // I called the framework
const bcrypt = require('bcryptjs'); // I called the security library
const conex = require('./conex.js'); // Tu archivo de conexión a MySQL
const session = require('express-session') // I called the library that remember the user logged in
const multer = require('multer')
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage})

const app = express(); // It creates an instance of Express, where app I will use to set up all
const path = require('path');

const PORT = 3000; // 3000 is the standard in node.js development

// Configuración de Middlewares (Herramientas de soporte)
app.use(express.json()); // It lets that my server understand data in JSON format
app.use(express.urlencoded({ extended: true })); // It allows to read sent data from HTML forms
app.use(session({
    secret: 'doris@_34', // Una frase para firmar la sesión
    resave: false,                             // No guarda la sesión si no hubo cambios
    saveUninitialized: false,                  // No crea sesiones vacías
    cookie: { maxAge: 3600000 }                // Tiempo de vida: 1 hora (en milisegundos)
}));


// 1. Servir el archivo CSS desde la carpeta public
app.use("/css", express.static(path.join(__dirname, 'css'))); // __dirname is a global variable that store the whole route and absolute
// that lives in my project into my hard drive
app.use("/js", express.static(path.join(__dirname, 'js')));
app.use("/imgs", express.static(path.join(__dirname, 'imgs'))); 
app.use("/uploads", express.static(path.join(__dirname, 'uploads')))

// 2. Servir tu HTML que está guardado en la raíz
app.get('/login', (req, res) => { // When someone clicks on ingresar, point to ingreso.html
    res.sendFile(path.join(__dirname, "html", 'ingreso.html'));
});

// --- NUEVA RUTA PROTEGIDA: PANEL DE ADMINISTRACIÓN ---
app.get('/html/admin.html', (req, res) => {
    // SINTAXIS: Condicional if (si se cumple la condición) { haz esto } else { si no, haz esto otro }
    // EXPLICACIÓN: Preguntamos al servidor si existe la sesión y si la marca 'adminLogueado' es estrictamente true.
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private'); // res.set helps me to set it up the headers
    res.set('Pragma', 'no-cache'); // It should not store the cache, even if the browser is old
    res.set('Expires', '0'); // It will expire at that same millisecond forcing to take a new version 
    if (req.session && req.session.adminLogueado === true) {
        // LÓGICA: Si el usuario inició sesión, Express le envía el archivo visual en la pantalla.
        res.sendFile(path.join(__dirname, "html", 'admin.html'));
    } else {
        // LÓGICA: Si no está logueado (es decir, adminLogueado es undefined o falso), 
        // usamos res.redirect() para "rebotarlo" automáticamente a la URL del login.
        res.redirect('/login');
    }
});

// --- NUEVA RUTA: PROCESAR EL CIERRE DE SESIÓN (LOG OUT) ---
app.get('/logout', (req, res) => {
    // SINTAXIS: Objeto.función( funciónCallback )
    // EXPLICACIÓN: destroy() borra toda la información de este usuario en el servidor.
    req.session.destroy((err) => {
        if (err) {
            console.error("Error al cerrar sesión:", err);
            return res.send("No se pudo cerrar la sesión.");
        }
        // LÓGICA: Tras borrar con éxito la sesión, mandamos al usuario de vuelta a la pantalla de login.
        // Si intenta dar clic al botón de "Atrás" de su navegador, la ruta de arriba verá que ya no tiene
        // la sesión activa y lo volverá a botar al login.
        res.redirect('/login');
    });
});

// --- RUTA 1: BIENVENIDA GENERAL ---
app.get('/', (req, res) => { // Get is used to read or request information
    // req contains all the information that comes from the user
    // respon is the object that I use to response to the client
    res.sendFile(path.join(__dirname, 'index.html'));
    // res.send I am sending a piece of HTML what the browser draws it on the screen
});

// --- RUTA 2: PROCESAR EL INICIO DE SESIÓN (LOG IN) ---

app.post('/api/agregar/menu', upload.single("image"), async (req, res) => {
    const {menuName, type, dayOfWeek, description} = req.body

    // It verifies if multer stored the file with success
    if (!req.file) {
        return res.status(400).json({error: "Porfavor, selecciona una imagen para el plato"})
    }
    try {
        const imageRoute = `/uploads/${req.file.filename}`

        const query = 'INSERT INTO menu (menuName, type, dayOfWeek, description, image) VALUES (?, ?, ?, ?, ?)'
        await conex.query(query, [menuName, type, dayOfWeek, description, image])

        return res.json({
            success: true,
            message: "El plato ha sido guardado con exito"
        })
    }catch(error) {
        console.error("Error al guardar el plato", error)
        return res.status(500).json({error: "Hubo un error interno en el servidor al guardar el plato"})
    }
})

app.post('/api/login', async (req, res) => { // We used post because the user sent confidential information as their password
    const { user, password } = req.body; // We catch the user and password that the user typed, it matches with the name in HTML

    try {
        // 1. Buscamos al administrador en MySQL usando tu columna 'user'
        const query = 'SELECT * FROM admins WHERE user = ?'; // It gives to MySQL look for in this table if the user is equal
        // what user typed, ? means stores me this empty space, after I will pass the real value to avoid SQL injection
        const [rows] = await conex.query(query, [user]); // rows destroy the MySQL answer to take the data that we want, and
        // this will take some milliseconds, it pauses it to find the real user going on, because [rows] gives to me the table
        // with the data that I need, and another with metadata, where query is like I would type const [rows] = await 
        // conex.query(query, [userSimulado]); userSimulado replaces the ? for the real value


        // If the database does not return any row, the user does not exist
        if (rows.length === 0) {
            return res.status(401).json({ error: "Usuario o contraseña incorrectos." }); // res i sthe HTTP method that express 
            // uses and .status it sets up the official code status from the WEB architecture, in this case 401 means unauthorized
        }

        const admin = rows[0]; // If it was found something, it will be stored into admin, as it gave 2 rows, I am taking the first
        // one that is when my information is

        const match = await bcrypt.compare(password, admin.password); // We compare the password in plain text with the hashed it

        if (!match) { // If it is different to match
            return res.status(401).json({ error: "Usuario o contraseña incorrectos." }); // Something it is wrong
        }

        req.session.adminLogueado = true;

        // 3. ¡Autenticación exitosa!
        return res.json({ 
            success: true, // If the user exits
            message: "¡Inicio de sesión exitoso! Bienvenido al panel de administración." // The user will have a response in format JSON
        });

    } catch (error) { // I cacth the error with technical details
        console.error("Error en el login:", error); // console.error is used to print errors
        return res.status(500).json({ error: "Hubo un error interno en el servidor." });
    }
});

// We trun on the engine what the server listens the request in the 3000 port, without it, the server won´t listen and the browser
// or test tools couldn´t communicate with my code
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor del restaurante corriendo en http://localhost:${PORT}`);

});
