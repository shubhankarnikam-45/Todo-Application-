const accessRateLimitingModel = require("../models/accessRateLimitingModel");


const rateLimiting = async (req, res, next) => {


    //session ID 
    const sessionId = req.session.id;
    console.log("in rate limiting middleware ", sessionId)

    //check session ID present in datbase or not 
    //if yes then check time limit 
    //if no then create.

    try {
        const accessRateLimingSchemaDb = await accessRateLimitingModel.findOne({sessionId})

        if(!accessRateLimingSchemaDb)
        {
            //creating new instance.
            const accessDbObject = new accessRateLimitingModel({
                sessionId : sessionId,
                time : Date.now()
            })

            //save in database.
            await accessDbObject.save();
            next();
            return;

            // console.log("data in datbase", accessDbObject)
        }

        // console.log("acces db", accessRateLimingSchemaDb)
        
        //it's like a else condition.
        const diff = (Date.now() - accessRateLimingSchemaDb.time)/1000
        // console.log('diff ', diff)

        if(diff < 1)
        {
            return res.send({
                status : 400, 
                message :"too many request please wait ..."
            })
        }

        //update the time in database
        await accessRateLimitingModel.findOneAndUpdate({sessionId: sessionId}, {time : Date.now()});

        next();




    } catch (error) {
        return res.send({
            status: 500,
            message: "server side error",
            error: error
        })
    }


}

module.exports = rateLimiting;