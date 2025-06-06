const addButton = document.getElementById("addTaskButton");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const clearButton = document.getElementById("clearTasksButton");

const completedCounter = document.getElementById("completed-counter");
const uncompletedCounter = document.getElementById("uncompleted-counter");

function updateCounters() {
    const completedTasks = document.querySelectorAll(".completed").length;
    const uncompletedTasks =
        document.querySelectorAll("li:not(.completed)").length;

    completedCounter.textContent = completedTasks;
    uncompletedCounter.textContent = uncompletedTasks;
}

function addTask() {
    const task = taskInput.value.trim();
    if (!task) {
        alert("Please write down a task");
        console.log("no task added");

        return;
    }
    const li = document.createElement("li");
    li.innerHTML = `
    <label>
      <input type="checkbox">
      <span>${task}</span>
    </label>
    <span class="edit-btn" style="cursor: pointer;">Edit</span>
    <span class="delete-btn" style="cursor: pointer;">Delete</span>
    `;

    taskList.appendChild(li);
    taskInput.value = "";

    updateCounters();

    const checkbox = li.querySelector("input");
    const editBtn = li.querySelector(".edit-btn");
    const taskSpan = li.querySelector("span");
    const deleteBtn = li.querySelector(".delete-btn");

    // strike out the completed task
    checkbox.addEventListener("click", function () {
        li.classList.toggle("completed", checkbox.checked);
        updateCounters();
    });

    editBtn.addEventListener("click", function () {
        const update = prompt("Edit task:", taskSpan.textContent);
        if (update !== null) {
            taskSpan.textContent = update;
            li.classList.remove("completed");
            checkbox.checked = false;
            updateCounters();
        }
    });

    deleteBtn.addEventListener("click", function () {
        if (confirm("Are you sure you want to delete this task?")) {
            li.remove();
            updateCounters();
        }
    });
    updateCounters();
}

addButton.addEventListener("click", addTask)

clearButton.addEventListener("click", function () {
    if (confirm("Are you sure you want to delete all tasks?")) {
        taskList.innerHTML = "";
        updateCounters();
    }
});

taskInput.addEventListener("keypress", (event) => {
    if (event.key == "Enter") {
        addTask();
    }
});

