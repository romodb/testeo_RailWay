import express from 'express';

import session from 'express-session';
import { fileURLToPath } from 'url'
import path from 'path'
import pool from './models/db.js'

// Creamos la constante express:
const app = express()

// Creamos las constantes de filename y de dirname:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true
}))

const USER = { username: 'maria', password: '1234' }

app.get('/', (req, res) => res.redirect('/login'))

app.get('/login', (req, res) => res.render('login', { error: null }))

app.post('/login', (req, res) => {
  const { username, password } = req.body
  if (username === USER.username && password === USER.password) {
    req.session.user = username
    res.redirect('/dashboard')
  } else {
    res.render('login', { error: 'Credenciales incorrectas' })
  }
})

app.get('/dashboard', (req, res) => {
  if (req.session.user) {
    res.render('dashboard', { user: req.session.user })
  } else {
    res.redirect('/login')
  }
})

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'))
})

// 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuramos EJS:
app.set('view engine', 'ejs')
// Tras esta línea creamos la carpeta view´s
app.set('views', path.join(__dirname, "views"))

app.get('/', (req, res) => {
  res.render('index', {titulo: 'home'})
})

app.get('/contactar', (req, res) => {
  res.render('layout', {titulo:'Página de contacto', body: `<h2>'Bienvenidos a la pagina de contacto'</h2>`})
})
app.get('/servicios', (req, res) => {
  res.render('layout', {titulo:'Página se servicios', body: `<h2>'Bienvenidos a la pagina de servicios'</h2>`})
})

// Creamos la ruta:
app.get('/', (req, res) => {
    res.send('¡Hola mundo!')
})
// Inicializamos el servidor:
app.listen(3000, () => {
  console.log('Servidor corriendo en el puerto 3000')
})
// Probamos con localhost:3000 en el navegador 


app.post('/login', async (req, res) => {
  const { nombre, password } = req.body;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM sparkdb.usuarios WHERE nombre = ? AND password = ?',
      [nombre, password]
    );

    if (rows.length > 0) {
      // Login correcto, redirigimos al dashboard
      console.log("✅ Login correcto:", rows[0].nombre);
      res.redirect('/dashboard');
    } else {
      // Login incorrecto, redirigimos a /login con mensaje de error
      console.warn("❌ Login fallido");
      res.redirect('/login?error=1');
    }
  } catch (err) {
    console.error('❌ Error al consultar la base de datos:', err);
    res.status(500).send('Error del servidor');
  }
});


// Lo siguiente es para configurar la sesion de express:
app.use (session({
  secret: '1234',
  // al poner falso no va a guardarla salvo que haya cambios.
  resave: false, 
  saveUninitialize: false
}));

function requiredLogin(req, res, next){
  IF (! req.session.usuario)
   {return res.redirect('/login')}
   next()
}

// app.get('/', requiredLogin, function res.render('index', {usuario_ req.session.usuario})
//   return res.redirect('/login')})

app.get('/', requiredLogin, (req, res) => {
  res.render('index', { usuario: req.session.usuario })
})



app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('❌ Error al cerrar sesión:', err);
      return res.status(500).send('Error al cerrar sesión');
    }
    res.redirect('/login');
  });
});

