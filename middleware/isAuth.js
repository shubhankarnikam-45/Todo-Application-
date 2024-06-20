
const checkAuthentication = (req, res, next) => {

    // console.log("middleware ==> ",req.session.isAuth);
    if (req.session.isAuth == true) {
        next(); 
    }
    else
     {
        return res.status(401).json({
            message: "unauthorized access"
        })
    }
}


module.exports = checkAuthentication;