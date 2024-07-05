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
const checkAuthentication = require("./middleware/isAuth");
const todoModel = require("./models/todoModel");
const todoValidation = require("./utils/todoUtil");
const rateLimiting = require("./middleware/rateLimiting");

//cli npm packaage variable.

//constant.
const bug = cli.red;
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



// console.log("mongo URL ", process.env.MONGO_URL)
// console.log("secret key", process.env.SECRETE_KEY)
//middleware to convert json to JS object.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
//middleware for the seesion.
//this is used to create session
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

//making API for the Logout.
const logoutRouter = express.Router();
app.use("/logout", logoutRouter);

// Making Router for the 'todos',
const todoRouter = express.Router();
app.use("/todos", todoRouter);

//Home page routers.
homeRouter
    .route("/")
    .get(getHomePage)


// function getHomePage
function getHomePage(req, res) {
    // console.log(check("home"))
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

//  function postRegistraionPage is done 
async function postRegistraionPage(req, res) {
    // console.log(apicheck("post request for registaion"));
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

        // console.log(err);
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
    // console.log(apicheck("post request for login page is running fine..."));

    // console.log(req.session);
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
            // console.log(check("email"))
            //that means loginId is email.
            userLoginIdCheckFromDB = await userModel.findOne({ email: loginId });
        }
        else {
            // console.log(check("usename"))
            //that means loginId is usename.
            userLoginIdCheckFromDB = await userModel.findOne({ username: loginId });
        }

        // console.log("user data ", userLoginIdCheckFromDB)
        //if userLoginCheckFromDb.
        if (!userLoginIdCheckFromDB) {
            return res.status(400).json({
                message: "Enter Wrong login Id"
            })
        }



        //now we decrypt the passoword and check the enter password is correct or not.
        // console.log("username and psss", password, userLoginIdCheckFromDB.password)
        const decryptPassword = await bcrypt.compare(password, userLoginIdCheckFromDB.password)

        // console.log(check("decrypt pass ", decryptPassword))


        //here we not create the model for  to store the session in database.
        //we modify the session and it created automatically.
        req.session.isAuth = true;
        req.session.user = {
            userId: userLoginIdCheckFromDB._id,
            username: userLoginIdCheckFromDB.username,
            email: userLoginIdCheckFromDB.email,
        }

        // console.log(req.session)

        // return res.status(200).json({
        //     message : "done"
        // })

        //redirect to the dashboard page.
        return res.redirect("/dashboard");
        // console.log(check("last line of login api"));
    } catch (err) {
        // console.log(bug("from client side blunder happen===>", err));
        return res.status(400).json({
            message: err
        })
    }



}

//dashboard page mini route.
dashboardRouter
    .route("/")
    .get(checkAuthentication, getDashboardPage)

//function for the getDashboard page.
function getDashboardPage(req, res) {
    // console.log(check("dashboardd pageee"));
    return res.render("dashboardPage.ejs");
}

//mini app for logout.
logoutRouter
    .route("/")
    .post(checkAuthentication, postLogout)

// function postLogout
function postLogout(req, res) {

    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                message: "logout unsuccessful... ( this is from server side error)"
            })
        }
        else {
        
            return res.redirect('/login')
        }
    })
}

//mini app for todo.
todoRouter
    .route("/create-todo")
    .post(checkAuthentication, rateLimiting, createTodo);

todoRouter
    .route("/read-todo")
    .get(checkAuthentication, readTodo)

todoRouter
    .route("/update-todo")
    .post(checkAuthentication, updateTodo)

todoRouter
    .route("/delete-todo")
    .post(checkAuthentication, deleteTodo)


//THIS BELOW ROUTE ARE SEPERATE HENCE WE NOT CREATE THE MINI APP FOR THAT.
//function post todo.
async function createTodo(req, res) {
    // console.log(req.session)
    // console.log(check("post todo"));

    //required data collect from req. object.
    const { todo } = (req.body);
    // console.log(todo)


    //todo validation.
    try {
        await todoValidation({ todo })
    } catch (error) {
        return res.status(400).json({
            "message": "todo is invalid",
            "error": error
        })
    }
    // console.log(req.session)

    //creating todo object to store in database.
    const todoObjToStoreInDB = new todoModel({
        todo: todo,
        username: req.session.user.username
    })

    //save in the database.
    try {
        const todoDataFromDb = await todoObjToStoreInDB.save();
        // console.log("todo data from database.", todoDataFromDb);
        return res.status(201).json({
            message: "Todo created successfully",
            data: todoDataFromDb,
        });
    } catch (error) {
        return res.status(500).json({
            "message": "data not saved in database  internal server error",
            error
        })
    }
    return res.send('done')
}

//function that read todo.
async function readTodo(req, res) {
    // console.log(check("in get request todo done done...."));

    const SKIP = Number(req.query.skip) || 0;
    const LIMIT = 5;
    // console.log("query ", SKIP)
    //we have identify the unique identifire to search.
    const username = req.session.user.username;
    // console.log(check("username ", username));

    //search the todo in the database.
    try {
        const allTodosFromDb = await todoModel.aggregate(
            [
                {
                    $match : {username : username},
                },
                {
                    $skip : SKIP,
                },
                {
                    $limit : LIMIT,
                }
            ]
        );
        // console.log("all entires", allTodosFromDb)

        if (allTodosFromDb.length == 0) {
            return res.send({
                status: 204,
                message: "No entry within the database.",
                userTodo: []

            })
        }
        else {
            return res.send({
                status: 200,
                message: "extract todo data from database successfully...",
                userTodo: allTodosFromDb

            })
        }

    } catch (error) {
        return res.send({
            status: 500,
            message: "extract todo data from database is not successfully... ( server side error) ",
            error: error,

        })
    }

}

//function that update todo.
async function updateTodo(req, res) {
    // console.log(check("update todo"))

    const { newTodo, todoId } = req.body;

    // console.log("nto ", newTodo, "todo ID", todoId)


    //if todo is not present.
    if (!todoId) {
        return res.send({
            status: 400,
            message: "todo id is missing."
        })
    }
    //todo validateion
    try {
        await todoValidation({ todo: newTodo })
    } catch (error) {
        return res.send({
            status: 400,
            message:error,
            error: error
        })
    }

    //finding this todo in the database.

    try {
        const isTodoPresent = await todoModel.findOne({ _id: todoId });
        // console.log("is todo present ", isTodoPresent); 

        //if todo id not present in database.
        if (!isTodoPresent) {
            return res.send({
                status: 400,
                message: `Todo is not present with ID ${todoId}`,

            })
        }

        //if here another user try to edit this todo , we use below condition.
        // console.log(isTodoPresent.username, req.session.user.username) 

        if (isTodoPresent.username !== req.session.user.username) {
            // console.log(check("not valid"));
            return res.send({
                status: 403,
                message: "unautorized access...",
                data: isTodoPresent
            })
        }


    } catch (error) {
        return res.send({
            status: 400,
            message: `internal server error (may be id is wrong)`,
            error: error
        })
    }





    //now from actual edit logic start.
    try {
        const todoPrev = await todoModel.findOneAndUpdate({ _id: todoId }, { todo: newTodo });

        //this when we successfully update the todo.
        return res.send({
            status: 200,
            message: "todo updated successfully...",
            data: todoPrev
        })
    } catch (error) {
        return res.send({
            status: 400,
            message: "server side error...",
            error: error
        })
    }

}

//function that delete todo.
async function deleteTodo(req, res) {
    // console.log(check("in delete"))
    // console.log("body ", req.body);

    const { todoId } = req.body;
    const username = req.session.user.username;

    // console.log(check("username ",username));

    //if todoID is missing 
    if (!todoId) {
        return res.send({
            status: 400,
            message: "todoId is missing"
        })
    }

    //finding todo ID in the database.
    try {
        const isTodoIdPresentInDB = await todoModel.findOne({ _id: todoId });
        // console.log("todo id in database", isTodoIdPresentInDB);

        //if todo id is not present in database.
        if (isTodoIdPresentInDB === null) {
            return res.send({
                status: 400,
                message: `in database not todoId present with ${todoId}`,
            })
        }
        //extract the user name of todoId.
        const usernameFromTodoId = isTodoIdPresentInDB.username;
        // console.log("username from database ",usernameFromTodoId);

        //now we check this username with session based authentication id 
        //if not match then we return error.
        if (usernameFromTodoId !== username) {
            return res.send({
                status: 403,
                message: "unautorized access",
            })
        }

        const deletedItemPrev = await todoModel.findOneAndDelete({ _id: todoId });
        // console.log(deletedItemPrev);

        return res.send({
            status: 200,
            message: "todo deleted successfully....",
            data: deletedItemPrev,
        })
        // console.log(check("before catch"))
    } catch (error) {
        return res.send({
            status: 500,
            message: "server side error",
            error: error
        })
    }

}



//listen server.
app.listen(process.env.PORT, () => {
    console.log(notice(`server listen on port number ${process.env.PORT}`));
    console.log(notice(`http://localhost:${process.env.PORT}`));
})