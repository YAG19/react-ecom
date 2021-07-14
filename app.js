require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");

const app = express();
const bodyParser = require("body-parser");  // anything that coming in json we can handle 
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");

const DB_USER = process.env.DB_USER;
const PASSWORD = encodeURIComponent(process.env.PASSWORD); 
const DB_URL = `mongodb://${DB_USER}:${PASSWORD}@localhost:27017/myDB`;


mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(() => {
    console.log("DB CONNECTED");
  });

//Middlewares
app.use(bodyParser.json());
app.use(cookieParser()); // add or delete value from cookies
app.use(cors());

//My Routes
app.use("/api", authRoutes);
app.use("/api", userRoutes)
app.use("/api", categoryRoutes);  
app.use("/api", productRoutes);  
//PORT
const port = process.env.PORT || 8000;

//Starting a server
app.listen(port, () => {
  console.log(`app is running at ${port}`);
});

