const express = require('express');
const app = express();
require('dotenv/config');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');
const CategoriesRouter = require('./routers/categoriesRouter');
const OrdersRouter = require ('./routers/ordersRouter');
const ProductsRouter = require('./routers/productsRouter');
const UsersRouter= require('./routers/usersRouter');

app.use(cors());
app.options('*',cors());

//middlewares
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'))
app.use(errorHandler);



//routes
const apiBaseUrl = process.env.API_URL;

app.use(`${apiBaseUrl}/categories`, CategoriesRouter );
app.use(`${apiBaseUrl}/orders`, OrdersRouter );
app.use(`${apiBaseUrl}/products`, ProductsRouter );
app.use(`${apiBaseUrl}/users`, UsersRouter );




mongoose.connect(process.env.DATABASE_STRING_CONNECTION)
.then(()=>{
    console.log('Database is succesfully reached');
})
.catch((err)=>{
    console.log(err);
});

app.listen(3000,()=>{
    console.log("sur le port 3000");
})


