//init
require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const port = process.env.PORT;
const host = process.env.HOST;
const db = require('./database');
const routes = require('./routes');

//EJS Stuff
app.set('view engine', 'ejs');

//Middleware
app.use(morgan('dev'));

//routes
app.get('/', routes);
app.post('/register', routes);
app.get('/login', routes);
app.post('/login', routes);
app.get('/success', routes);
app.get('/logout', routes);
app.post('/addmsg', routes);

//Server Listen
app.listen(port, host, () => {
    console.log(`Server is runnig at host ${host} and at port ${port}`)
})