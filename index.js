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
const {registrationPageValidation, loginPageValidation, isEmailAddress} =require("./utils/authUtil")

//import model.
//import userModel.
const userModel = require("./models/userModel")
//cli npm packaage variable.
const error = cli.red;
const warn = cli.blue;
const notice = cli.yellow.bold;
const apicheck = cli.bgWhiteBright;
const check = cli.bgCyan;

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
.post(postLoginPage)

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
    // console.log(check(name, email, username, password));

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
    let hashPassword = await bcrypt.hash(password, parseInt(process.env.SALT));

    //save to database.
    // console.log("hased password ", hashPassword);
   const userData =  userModel({
    name: name, 
    email: email,
    username: username,
    password:hashPassword,
   })

//    console.log(error("error is found ", userData))

   try {
    const userDataFromDB = await userData.save();
    return res.status(201).json({
        message:"data saved successfully in database.",
        userDataFromDB 
    })
   } catch (err) {

        console.log(err);
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

// function postLoginPage
async function postLoginPage(req, res)
{
    console.log(apicheck("post request for login page is running fine..."));

    //destructuring the user data.
    const{loginId, password} = req.body;
    // console.log(check(loginId, passsword))
    
    //data validation.
    try {
        await loginPageValidation({loginId, password})

        //check the loginId is email or username.
        //and then find in the database.
        //if from database is null means we return some error message
        let userLoginIdCheckFromDB;

        if(isEmailAddress(loginId))
            {
                console.log(check("email"))
                //that means loginId is email.
                userLoginIdCheckFromDB = await userModel.findOne({email: loginId});
            }
        else
            {
                console.log(check("usename"))
                //that means loginId is usename.
                userLoginIdCheckFromDB = await userModel.findOne({username: loginId});
            }
        
        console.log("user data ", userLoginIdCheckFromDB)
        //if userLoginCheckFromDb.
        if(!userLoginIdCheckFromDB)
            {
                return res.status(400).json({
                    message:"Enter Wrong login Id"
                })
            }
        
            
            
        //now we decrypt the passoword and check the enter password is correct or not.
        console.log("username and psss", password, userLoginIdCheckFromDB.password)
        const decryptPassword = await bcrypt.compare(password, userLoginIdCheckFromDB.password)

        console.log(check("decrypt pass ", decryptPassword))
        


        console.log(check("last line of login api"));
    } catch (err) {
        console.log(error("from client side blunder happen===>", err));
        return res.status(400).json({
            message :err
        })
    }

}

