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
            // console.log(allTodos)

            //now we target the 'unorder-list' in UI.
            //hrere we adding id to edit and delete button.
            document.getElementById("item-list").insertAdjacentHTML("beforeend",

                allTodos.map((item) => {
                    return `  <li 
                    class="list-group-item list-group-item-secondary d-flex justify-content-between align-items-center">${item.todo}          
                         <div class="ml-auto">
                            <button id=${item._id} type="button" class="btn btn-edit btn-info">Edit</button>
                            <button id=${item._id} type="button" class="btn btn-delete btn-danger">Delete</button>
                        </div>
                    </li>`

                }).join("")
            )



        })
        .catch((err) => {
            console.log(err)
        })


}

//adding listener to the all button using concept of 'event-delegation'.
window.addEventListener("click",(event)=>{

    //we click on the add todo button.
    if(event.target.classList.contains("add_item"))
        {
            //extract value from input.
            const todo = document.getElementById("create_field").value;
            // console.log(todo)

            //now we post data backend using axios.
            axios.post("/todos/create-todo",{todo : todo})
            .then((res)=>{
                console.log("Response",res)
                if(res.status != 201)
                    {
                        alert(res.data.message)
                    }
                console.log("d")
            })
            .catch((err)=>{
                alert(err.response.data.error)
            })
        }

    //now working for the edit functionality.
    else if(event.target.classList.contains("btn-edit"))
        {
            // console.log("edit button")
            const toBeEdited = prompt();    

            //extract ID from 'id' attribute from 'edit' button.
            const id = event.target.id;
            console.log("id ",id)
            
            axios.post("/todos/update-todo",{newTodo : toBeEdited, todoId : id})
            .then((res)=>{
                console.log("response ",res.data);
                if(res.data.status != 200)
                    {
                        alert(res.data.message)
                    }
            })
            .catch((err)=>{
                console.log("error ",err)
            })
        }

    else if(event.target.classList.contains("btn-delete"))
        {
            // console.log("button delete")
            
        }
})