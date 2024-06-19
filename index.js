//1. configuring the server.
const express = require("express");
const app = express();


//cli npm package.
const cli  =require("cli-color")

//dot env. import.
require('dotenv').config()

//database. import mongoose.
const mongoose = require("mongoose");
const { log } = require("console");

//bcrypt.
const bcrypt = require("bcryptjs")
//file import.
const {registrationPageValidation} =require("./utils/authUtil")

//import model.
//import userModel.
const userModel = require("./models/userModel")
//cli npm packaage variable.
const error = cli.red;
const warn = cli.blue;
const notice = cli.yellow.bold;
const apicheck = cli.bgWhiteBright;

//middleware to convert json to JS object.
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//listen server.
app.listen(process.env.PORT, ()=>{
    console.log(notice(`server listen on port number ${process.env.PORT}`));
    console.log(notice(`http://localhost:${process.env.PORT}`));
})


//database connection.
mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.log(notice("database connected successfully..."));
})
.catch((err)=>{
    console.log(error("database conenction failed...",err))
})


//set view engine as the ejs.
app.set("view engine","ejs")


app.get("/",()=>{
    console.log(notice("server is runing"))
})
//makign API for the registraion.
const registrationPageRouter = express.Router();
app.use("/registration", registrationPageRouter);

//makign API for the login.
const loginPageRouter = express.Router();
app.use("/login", loginPageRouter);

registrationPageRouter
.route("/")
.get(getRegistrationPage)
.post(postRegistraionPage)

loginPageRouter
.route("/")
.get(getLoginPage)

//function of getRegistraionPage
function getRegistrationPage(req, res)
{
    return res.render("registrationPage")
}

//  function postRegistraionPage
async function postRegistraionPage(req, res)
{
    console.log(apicheck("post request for registaion"));   
    const {name, email, username, password} = req.body;
    console.log(warn(name, email, username, password));

    //data validation.
    try {
        await registrationPageValidation({name, email, username, password})
    } catch (error) {
        return res.status(400).json({
            status:400,
            "message":error
        });
    }
    //encryption.
    let hashPassword = await bcrypt.hash(password, parseInt(process.env.SALT), function(err, hash) {
        // Store hash in your password DB.
        console.log(err);
        console.log(hash)
    });

    //save to database.
   const userData =  userModel({
    name, 
    email,
    username,
    password:hashPassword
   })

   try {
    let userData = await userData.save();
    return res.status(201).json({
        message:"data saved successfully in database.",
        userData 
    })
   } catch (err) {
        res.status(500).json({
            message:"internal server error",
            error:err
        })
   }


    

}
//function of getLoginPage
function getLoginPage(req, res)
{
    return res.render("loginPage")
}

