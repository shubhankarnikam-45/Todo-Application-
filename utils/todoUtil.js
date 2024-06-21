

const todoValidation = ({ todo }) => {

    // console.log("in the todo validation")
    return new Promise((resolve, reject) => {
        if (!todo) {
            reject("todo field is empty");
        }

        //check the type of field.
        if (typeof todo !== "string") {
            reject("todo is not in string format")
        }

        //check the length of the username.
        if (todo.length < 3 || todo.length > 50) {
            reject("todo size is not between the 3 - 50")
        }

        resolve("Data is in correct format");

    })

}

module.exports = todoValidation;