const express = require("express");
const bodyParser = require("body-parser");
 const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require('path')
const dotenv = require("dotenv")
const mongoose = require("mongoose");
const connect = require('./config/db')



const app = express();
dotenv.config({ path: "./config/.env" });



connect()

const categoryRoute = require('./routes/category')
const productRoute = require('./routes/product')




app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());




app.use('/api', categoryRoute)
app.use('/api', productRoute)

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is working on http://localhost:${port}`);
 
});


