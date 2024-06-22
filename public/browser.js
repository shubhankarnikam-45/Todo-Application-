console.log("browser")

//this function run when browser is load.
window.onload = loadTodos;

function loadTodos() {
    // console.log("in loadTodo() function")
    //to use axios first user 'cdn' link.
    axios
        .get("/todos/read-todo")
        .then((res) => {

            // console.log(res)
            // console.log("response ",res.data.status);
            const statusCode = res.data.status;
            if(statusCode !== 200)
                {
                    const message = res.data.message
                    alert(message);
                    return;
                }

            //here we get all todos to the respective user who login.
            const allTodos = res.data.userTodo;

            //now we target the 'unorder-list' in UI.
            document.getElementById("item-list").insertAdjacentHTML("beforeend",

                allTodos.map((item) => {
                    return `  <li 
                    class="list-group-item list-group-item-secondary d-flex justify-content-between align-items-center">${item.todo}          
                         <div class="ml-auto">
                            <button type="button" class="btn btn-info">Edit</button>
                            <button type="button" class="btn btn-danger">Delete</button>
                        </div>
                    </li>`

                }).join("")
            )



        })
        .catch((err) => {
            console.log(err)
        })


}