require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const {notFound,errorHandler} = require('./middleware/errorHandler')
const connectDB = require('./configuration/dbConn');
const app = express()
const PORT = process.env.PORT || 3500;
// Connect to MongoDB
connectDB();

// built-in middleware to handle urlencoded form data
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ extended: true }));
// built-in middleware for json 
app.use(express.json());
// built middleware for cookies 
app.use(cookieParser());

app.use(morgan('dev'))
app.use('/auth', require('./routes/auth'));
app.use('/user', require('./routes/user'));
app.use('/product',require('./routes/product'))
app.use('/blog',require('./routes/blog'))
app.use('/category',require('./routes/category'))
app.use('/blog-category',require('./routes/blogCat'))
app.use('/brand',require('./routes/brand'))
app.use('/coupon',require('./routes/coupon'))
app.use(notFound);
app.use(errorHandler);
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});