try{
const express=require('express')
const app=express()
const mongoose=require('mongoose');
const path=require('path')
app.use(express.static('public'));
app.use(express.json());
const ejs = require("ejs");
const ifsc=require('ifsc');
const viewsPath = path.join(__dirname, 'views'); // Append 'views' to the path

app.set('view engine', 'ejs');
app.set('views', viewsPath);



const bodyParser = require('body-parser');



app.use(bodyParser.urlencoded({ extended: true }));

const UserController=require('./controller/UserController');

app.use('/',UserController)
console.log("woriking")

app.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
  })

}catch(error){
    console.log("here is app.js error",error.message);
}
