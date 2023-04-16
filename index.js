const express = require('express');
const mongoose = require('mongoose')
const path = require('path');
const cookieParser = require('cookie-parser');
require("dotenv/config");

const userRoute = require('./routes/user');
const blogRoute = require('./routes/blog')
const { checkAuthenticationCookie } = require('./middlewares/authentication');
const Blog = require('./model/blog');

const app = express();
const port = process.env.PORT || 3000;

mongoose.connect(process.env.CONNECTION_STRING).then(() => { 
    console.log("DATABASE CONNECTED");
})

app.set("view engine", "ejs");
app.set("views", path.resolve('./views'));

app.use(express.urlencoded({extended:false}))
app.use(cookieParser())
app.use(checkAuthenticationCookie("token"))
app.use(express.static(path.resolve('./public')))

app.use('/user', userRoute)
app.use('/blog', blogRoute)

app.get('/', async(req,res) => {
    const allBlogs = await Blog.find({})
    res.render('home', { 
        user: req.user,
        blogs: allBlogs
    })
})

app.listen(port, () => {
    console.log(`SERVER LISTENING ON PORT: ${port}`);
})