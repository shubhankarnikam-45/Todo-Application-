
//regex.


function isEmailAddress(str) {
    var pattern = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";
    return str.match(pattern);
}

function registrationPageValidation({ name, email, username, password }) {

    console.log("in functoin ", name, email)
    return new Promise((resolve, reject) => {

        if (!name) {
            reject("name field is empty");
        }
        else if (!email) {
            reject("email field is empty");
        }
        else if (!username) {
            reject("username field is empty")
        }
        else if (!password) {
            reject("password field is empty.")
        }

        //check the type of field.
        if (typeof name !== "string") {
            reject("name is not in string format")
        }
        else if (typeof email !== "string") {
            reject("email is not in string format")
        }
        else if (typeof username !== "string") {
            reject("username is not in string format")
        }
        else if (typeof password !== "string") {
            reject("password is not in string format")
        }

        //check the length of the username.
        if (username.length < 3 || username.length > 50) {
            reject("username size is not between the 3 - 50")
        }

        //regex.
        if (!isEmailAddress(email)) {
            reject("Email format is wrong");
        }


        resolve("Data submitted successfylly");
    })
}

module.exports = { registrationPageValidation };