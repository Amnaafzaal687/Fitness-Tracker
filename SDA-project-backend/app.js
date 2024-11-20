//app.js
const express = require('express');
const path = require('path');
const mysql = require('mysql');
const dotenv=require("dotenv");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser'); 


dotenv.config({ path: './.env'});
const app=express();

const db=mysql.createConnection({
  host:process.env.DATABASE_HOST,
  user:process.env.DATABASE_USER,
  password:process.env.DATABASE_PASSWORD,
  database:process.env.DATABASE
});
const publicDirectory = path.join(__dirname,'./public');
app.use(express.static(publicDirectory))
//Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({extended: false }));
//Parse json bodies (as sent by API clients)
app.use(express.json());

app.use(cookieParser());
// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//for html files to hbs running
app.set('view engine','hbs');

db.connect((error)=>{
  if(error){
    console.log(error)
  }
  else{
    console.log("MySQL connected...")
  }
});
//define routes
app.use('/',require('./routes/pages'));
app.use('/auth',require('./routes/auth'));

//listen
app.listen(5001,()=>{
  console.log("listening")
})