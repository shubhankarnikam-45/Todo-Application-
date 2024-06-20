//1. configuring the server.
const express = require("express");
//bcrypt.
const bcrypt = require("bcryptjs")
//dot env. import.
require('dotenv').config()
//cli npm package.
const cli = require("cli-color")
//database. import mongoose.
const mongoose = require("mongoose");
//import for the session based authentication.
const session = require("express-session");
const mongodbSession = require("connect-mongodb-session")(session);
//store required for the seesion.


//file import.
const { registrationPageValidation, loginPageValidation, isEmailAddress } = require("./utils/authUtil")
//import model.
//import userModel.
const userModel = require("./models/userModel");
const checkAuthorization = require("./middleware/isAuth");

//cli npm packaage variable.

//constant.
const bug= cli.red;
const warn = cli.blue;
const notice = cli.yellow.bold;
const apicheck = cli.bgWhiteBright;
const check = cli.bgCyan;

const app = express();
const store = new mongodbSession({
    uri: process.env.MONGO_URL,
    collection: "sessions",
})





//database connection.
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log(notice("database connected successfully..."));
    })
    .catch((err) => {
        console.log(error("database conenction failed...", err))
    })



console.log("mongo URL ", process.env.MONGO_URL)
console.log("secret key", process.env.SECRETE_KEY)
//middleware to convert json to JS object.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//middleware for the seesion.


app.use(session({
    secret: process.env.SECRETE_KEY,
    store: store,
    resave: false,
    saveUninitialized: false,
}))


//set view engine as the ejs.
app.set("view engine", "ejs")


// app.get("/", () => {
//     console.log(notice("server is runing"))
// })
//making API for the registraion.
const registrationPageRouter = express.Router();
app.use("/registration", registrationPageRouter);

//making API for the login.
const loginPageRouter = express.Router();
app.use("/login", loginPageRouter);

//making API for the dashboard
const dashboardRouter = express.Router();
app.use("/dashboard", dashboardRouter);

//making API for the home page.
const homeRouter = express.Router();
app.use("/", homeRouter);

//Home page routers.
homeRouter
.route("/")
.get(getHomePage)

// function getHomePage
function getHomePage(req, res)
{
    console.log(check("home")
    )
    return res.render("homePage.ejs")
}
registrationPageRouter
    .route("/")
    .get(getRegistrationPage)
    .post(postRegistraionPage)

    //function of getRegistraionPage
function getRegistrationPage(req, res) {
    return res.render("registrationPage")
}

//  function postRegistraionPage
async function postRegistraionPage(req, res) {
    console.log(apicheck("post request for registaion"));
    const { name, email, username, password } = req.body;
    // console.log(check(name, email, username, password));

    //data validation.
    try {
        await registrationPageValidation({ name, email, username, password })
    } catch (error) {
        return res.status(400).json({
            status: 400,
            "message": error
        });
    }
    //encryption.
    let hashPassword = await bcrypt.hash(password, parseInt(process.env.SALT));

    //save to database.
    // console.log("hased password ", hashPassword);
    const userData = userModel({
        name: name,
        email: email,
        username: username,
        password: hashPassword,
    })

    //    console.log(error("error is found ", userData))

    try {
        const userDataFromDB = await userData.save();
        return res.status(201).json({
            message: "data saved successfully in database.",
            userDataFromDB
        })
    } catch (err) {

        console.log(err);
        res.status(500).json({
            message: "internal server error",
            error: err
        })
    }




}

//login page mini app.
loginPageRouter
    .route("/")
    .get(getLoginPage)
    .post(postLoginPage)

//function of getLoginPage
function getLoginPage(req, res) {
    return res.render("loginPage")
}

// function postLoginPage
async function postLoginPage(req, res) {
    console.log(apicheck("post request for login page is running fine..."));

    console.log(req.session);
    //destructuring the user data.
    const { loginId, password } = req.body;
    // console.log(check(loginId, passsword))

    //data validation.
    try {
        await loginPageValidation({ loginId, password })

        //check the loginId is email or username.
        //and then find in the database.
        //if from database is null means we return some error message
        let userLoginIdCheckFromDB;

        if (isEmailAddress(loginId)) {
            console.log(check("email"))
            //that means loginId is email.
            userLoginIdCheckFromDB = await userModel.findOne({ email: loginId });
        }
        else {
            console.log(check("usename"))
            //that means loginId is usename.
            userLoginIdCheckFromDB = await userModel.findOne({ username: loginId });
        }

        console.log("user data ", userLoginIdCheckFromDB)
        //if userLoginCheckFromDb.
        if (!userLoginIdCheckFromDB) {
            return res.status(400).json({
                message: "Enter Wrong login Id"
            })
        }



        //now we decrypt the passoword and check the enter password is correct or not.
        console.log("username and psss", password, userLoginIdCheckFromDB.password)
        const decryptPassword = await bcrypt.compare(password, userLoginIdCheckFromDB.password)

        console.log(check("decrypt pass ", decryptPassword))


        //here we not create the model for  to store the session in database.
        //we modify the session and it created automatically.
        req.session.isAuth = true;
        req.session.user = {
            userId : userLoginIdCheckFromDB._id,
            username : userLoginIdCheckFromDB.username,
            email : userLoginIdCheckFromDB.email,
        }

        console.log(req.session)

        // return res.status(200).json({
        //     message : "done"
        // })

        //redirect to the dashboard page.
        res.redirect("/dashboard");
        console.log(check("last line of login api"));
    } catch (err) {
        console.log(but("from client side blunder happen===>", err));
        return res.status(400).json({
            message: err
        })
    }

    

}

//dashboard page mini route.
dashboardRouter
.route("/")
.get(checkAuthorization, getDashboardPage)

//function for the getDashboard page.
function getDashboardPage(req, res)
{
        console.log(check("dashboard pageee"));
}

//listen server.
app.listen(process.env.PORT, () => {
    console.log(notice(`server listen on port number ${process.env.PORT}`));
    console.log(notice(`http://localhost:${process.env.PORT}`));
})