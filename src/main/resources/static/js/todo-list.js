const taskAdd = document.getElementById("add-button");
const taskContent = document.getElementById("task-content");
const dateElement = document.getElementById("date");
const tasksList = document.getElementById("tasks-list");
const buttonRemove = document.getElementById("button-remove-all");
const taskCategory = document.getElementById("list-category");
const counterDone = document.getElementById("counter-done-task");
const HTTP_RESPONSE_SUCCESS = 200;
const REST_API_ENDPOINT = 'http://localhost:8080';

/**
 * questa funzione aggiorna la select delle categorie interrogando il server attraverso ajax
 * verrà invocata subito dopo il completo caricamento della pagina
 */
function updateCategoriesList() {
    //crea un oggetto di tipo XMLHttpRequest x gestire chiamata ajax al server
    let ajaxRequest = new XMLHttpRequest();

    //gestisco l'onload: ovvero quello che succede dopo che il server mi risponde
    ajaxRequest.onload = function () {
        //salvo tutte le categorie ritornate dal server in una variabile categories parsando il contenuto
        //della response attraverso l'utility JSON.parse()
        let categoriesDB = JSON.parse(ajaxRequest.response);

        //Scorro ogni categoria dell'array categoriesDB...
        categoriesDB.forEach(category => {
            //creo la option
            let option = document.createElement("option");
            //setto il value e il text
            option.innerText = category.name;
            option.value = category.id;
            //la appendo
            taskCategory.appendChild(option);
        });
    }
    //imposto metodo e url a cui fare la richiesta
    ajaxRequest.open("GET", REST_API_ENDPOINT + "/categories/");

    //invio la richiesta al server
    ajaxRequest.send();
}

updateCategoriesList();

const option = {
    weekday: "long",
    month: "long",
    day: "numeric"
};
const today = new Date();
dateElement.innerHTML = today.toLocaleDateString("it-EU", option);

//aggiungere lo span con il nome della categoria (oppure il colore)
function createTask(task) {
    let newTaskLine = document.createElement("div");

    // assegno class="task" a newTaskLine
    newTaskLine.setAttribute("class", "task");

    // se task.category è true
    if (task.category) {

        // aggiungo classi task category color
        newTaskLine.classList.add(task.category.color);
    }

    //Creo un elemento di tipo input 
    let doneCheck = document.createElement("input");
    //Assegno alla variabile donecheck l'attributo checkbox
    doneCheck.setAttribute("type", "checkbox");
    //Assegno la classe checkBox all'elemento
    doneCheck.classList.add("checkbox");

    let countTaskDone = counterDone.innerHTML;

    //aggiungiamo l'evento al click della doneCheck
    doneCheck.addEventListener("click", function () {
        //Aggiorno lo stato del campo done nell'oggetto in memoria
        task.done = !task.done;
        let taskContent = {
            done: task.done
        };
        setDone(task.id, taskContent, () => {
            // aggiungiamo la linea sugli elementi spuntati
            newTaskLine.classList.toggle("task-done");
            penIcon.style.visibility = task.done ? "hidden" : "visible";
            counterDone.innerHTML = task.done ? ++countTaskDone : --countTaskDone;
        });

        // svuoto il contenuto del taskContent dopo l'aggiunta del task
        taskContent.value = "";
    });
    //Se la task è stata fatta...
    if (task.done) {

        counterDone.innerHTML = ++countTaskDone;
        //...aggiungiamo la classe done all'elemento
        newTaskLine.classList.add("done");
        //Se la variabile doneCheck è spuntata(checked) allora è true
        doneCheck.checked = true;
    }

    //Appendiamo la doneCheck alla task creata
    newTaskLine.appendChild(doneCheck);
    //Creiamo un elemento di tipo Span chiamato nameSpan
    let nameSpan = document.createElement("span");

    nameSpan.innerText = task.name;
    //Appendiamo nameSpan alla nuova task creata
    newTaskLine.appendChild(nameSpan);
    //Creiamo un elemento di tipo Span chiamato dateSpan
    let dateSpan = document.createElement("span");

    //Creiamo la data a ogni task aggiunto
    let date = new Date(task.created);
    dateSpan.innerText = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    newTaskLine.appendChild(dateSpan);

    //Creiamo un elemento di tipo span chiamato trashSpan
    let trashSpan = document.createElement("span");
    //Assegniamo a trashSpan l'icona del cestino
    trashSpan.innerHTML = '<i class="fas fa-trash"></i>';
    trashSpan.setAttribute("class", "trash");
    //Aggiungiamo l'evento sul click del cestino
    trashSpan.addEventListener("click", function () {
        //richiamiamo la funzione deleteTask che prende in input task.id e newTaskLine
        deleteTask(task.id, newTaskLine);
    });
    //Appendiamo il cestino alla nuova task creata
    newTaskLine.appendChild(trashSpan)
    //Appendiamo la nuova task alla lista delle altre task
    tasksList.appendChild(newTaskLine);

    let penIcon = document.createElement("button");
    penIcon.style.visibility = task.done ? "hidden" : "visible";
    penIcon.setAttribute("class", "pen");
    penIcon.innerHTML = '<i class="fas fa-edit"></i>';
    newTaskLine.appendChild(penIcon);

    penIcon.addEventListener("click", function () {
        let newInput = document.createElement("input");
        newInput.setAttribute("id", "edit-input-" + task.id);
        if (newTaskLine.classList.contains("editing")) {
            let editInput = document.getElementById("edit-input-" + task.id);
            console.log(editInput);
            let taskContent = {
                name: editInput.value
            };
            updateTask(task.id, taskContent, () => {
                //aggiorno l'attributo name dell'oggetto task su cui sto lavorando
                task.name = editInput.value;

                //sostituisco l'input con uno span contenente il testo aggiornato
                nameSpan.innerText = task.name;
                editInput.replaceWith(nameSpan);

                //sostituisco il dischetto con la pennina 
                penIcon.innerHTML = '<i class="fas fa-edit"></i>';

                //rimuovo la classe editing 
                newTaskLine.classList.remove("editing");

                doneCheck.style.visibility = "visible";
            });
        } else {
            newInput.value = task.name;
            nameSpan.replaceWith(newInput);
            penIcon.innerHTML = '<i class="fas fa-save"></i>';
            newTaskLine.classList.add("editing");
            doneCheck.style.visibility = "hidden";
        }
    });
}

function updateTasksList() {
    //Svuotiamo la taskList
    tasksList.innerHTML = "";
    //recupero i dati dal server
    let ajaxRequest = new XMLHttpRequest();
    //gestisco l'onload: ovvero quello che succede dopo che il server mi risponde
    ajaxRequest.onload = function () {
        //salvo tutte i task ritornati dal server in una variabile tasks parsando il contenuto
        //della response attraverso l'utility JSON.parse()
        let tasks = JSON.parse(ajaxRequest.response);
        //cicliamo ogni task all'interno dell'array tasks
        for (let task of tasks) {
            //richiamiamo la funzione createTask
            createTask(task);
        }
    }
    //Imposto un metodo url a cui fare la richiesta
    ajaxRequest.open("GET", REST_API_ENDPOINT + "/tasks/");
    //invio la richiesta al server
    ajaxRequest.send();
}

//per invocare una funzione, quindi esegue quello che c'è nella "scatola"
updateTasksList();

function saveTask(taskToSave, successFullCallback) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = function () {
        if (ajaxRequest.status == HTTP_RESPONSE_SUCCESS) {
            let savedTask = JSON.parse(ajaxRequest.response);

            createTask(savedTask);
            successFullCallback();
        }
    }
    ajaxRequest.open("POST", REST_API_ENDPOINT + "/tasks/add");
    //dal momento che il server è di tipo REST-full utilizza il tipo json per scambiare informazioni con il front-end.
    //per tanto il server si aspetterà dei dati in formato json e NON considererà richieste
    // in cui il formato non è specificato nella header della richiesta stessa.
    ajaxRequest.setRequestHeader("content-type", "application/json");

    let body = {
        name: taskToSave.name,
        category: {
            id: taskToSave.categoryId
        },
        created: new Date()

    };
    ajaxRequest.send(JSON.stringify(body));
}

function updateTask(taskId, taskContent, successfulCallback) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        taskHtmlElement.classList.toggle("done")
        if (ajaxRequest.status == HTTP_RESPONSE_SUCCESS) {
            successfulCallback();
        }
    }
    ajaxRequest.open("PUT", REST_API_ENDPOINT + "/tasks/" + taskId);
    ajaxRequest.setRequestHeader("content-type", "application/json");
    ajaxRequest.send(JSON.stringify(taskContent));
}

function setDone(taskId, taskContent, successfulCallback) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        if (ajaxRequest.status == HTTP_RESPONSE_SUCCESS) {
            successfulCallback();
        }
    }

    ajaxRequest.open("PUT", REST_API_ENDPOINT + "/tasks/" + taskId + "/set-done");
    ajaxRequest.setRequestHeader("content-type", "application/json");
    ajaxRequest.send(JSON.stringify(taskContent));
}

function deleteTask(taskId, taskElement) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        if (ajaxRequest.response == "ok") {
            taskElement.remove();
        }
    }
    ajaxRequest.open("DELETE", REST_API_ENDPOINT + "/tasks/" + taskId);
    ajaxRequest.send();
}

function deleteAllTasks(successfulCallback) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        if (ajaxRequest.response == "ok!") {
            successfulCallback();
        }
    }

    ajaxRequest.open("DELETE", REST_API_ENDPOINT + "/tasks/delete-all");
    ajaxRequest.send();
}

deleteAllTasks();

//Questa funzione viene eseguita al click del bottone
taskAdd.addEventListener("click", function () {
    //creo una variabile const che contiene il valore inserito nell'input del task es: comprare latte
    let taskContentValue = taskContent.value;

    //se il valore inserito è vuoto.... 
    if (taskContentValue == "") {

        //lancio un messaggio all'utente che deve inserire qualcosa
        alert("Insert something!!!");

        //ed esco dalla funzione con return
        return;
    }
    //creo un ogg che rappresenta il task da aggiungere
    let task = {
        name: taskContentValue,
        categoryId: taskCategory.value
    };

    //se esiste un valore lo passo alla funzione save task che si occuperà di salvarlo nel database
    saveTask(task, () => {
        taskContent.value = "";
    });
});

// aggiungo un evento al click del bottone che rimuove tutti gli elementi e lascia la lista vuota
buttonRemove.addEventListener("click", function () {

    deleteAllTasks(() => {
        tasksList.innerHTML = "";
        counterDone.innerHTML = 0;
    });
});

function sendTaskToServer(taskContentValue, taskHtmlElement, done, remove, edit) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        if (ajaxRequest.response == "ok") {
            taskHtmlElement.classList.remove("unconfirmed");
            done.removeAttribute("disabled", "disabled");
            remove.removeAttribute("disabled", "disabled");
            edit.removeAttribute("disabled", "disabled");
        }
    };

    ajaxRequest.open("POST", "https://webhook.site/b2216fb0-2af7-4693-930e-f539626cf0cc");
    let body = {
        text: taskContentValue
    };
    ajaxRequest.send(JSON.stringify(body));
}