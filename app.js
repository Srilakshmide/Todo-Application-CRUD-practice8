const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//API 1
// Scenario 1 Return a list of all todos whose status is 'TO DO'

app.get("/todos/", async (request, response) => {
  const { status = "" } = request.query;
  const getStatusQuery = `select * from todo where status like '%${status}%';`;
  const statusQueryResponse = await database.all(getStatusQuery);
  response.send(statusQueryResponse);
});

//Scenario 2 Return a list of all todos whose priority is 'HIGH'

app.get("/todos/", async (request, response) => {
  const { priority = "" } = request.query;
  const getPriorityQuery = `select * from todo where priority like '%${priority}%';`;
  const priorityQueryResponse = await database.all(getPriorityQuery);
  response.send(priorityQueryResponse);
});

//Scenario 3 priority is 'HIGH' and status is 'IN PROGRESS'

app.get("/todos/", async (request, response) => {
  const { status = "", priority = "" } = request.query;
  const getPriorityStatusQuery = `SELECT * FROM todo WHERE 
  priority LIKE '%${priority}%' AND status LIKE '%${status}%';`;
  const priorityStatusResponse = await database.all(getPriorityStatusQuery);
  response.send(priorityStatusResponse);
});

//Scenario 4 Returns a list of all todos whose todo contains 'Play' text

app.get("/todos/", async (request, response) => {
  const { search_q = "" } = request.query;
  const getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
  const todoQueryResponse = await database.all(getTodoQuery);
  response.send(todoQueryResponse);
});

//API 2 Returns a specific todo based on the todo ID

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoDetailsQuery = `SELECT * FROM todo WHERE id=${todoId};`;
  const todoArray = await database.get(getTodoDetailsQuery);
  response.send(todoArray);
});

// API 3 Create a todo in the todo table
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const addTodoQuery = `INSERT INTO todo(id, todo, priority, status)
    VALUES('${id}', '${todo}', "${priority}", "${status}");`;
  const AddTodoResponse = await database.run(addTodoQuery);
  response.send("Todo Successfully Added");
});

//API 4 Updates details of a specific todo based on todo ID

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
  }
  const previousTodoQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
  const previousTodo = await database.run(previousTodoQuery);
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;

  //Scenario 1
  const updateStatusQuery = `UPDATE todo SET 
    todo = '${todo}', priority = '${priority}', status = '${status}'
    WHERE id = ${todoId};`;
  await database.run(updateStatusQuery);
  response.send(`${updateColumn} Updated`);

  //Scenario 2
  const updatePriorityQuery = `UPDATE todo SET 
    todo = '${todo}', priority = '${priority}', status = '${status}'
    WHERE id = ${todoId};`;
  await database.run(updatePriorityQuery);
  response.send(`${updateColumn} Updated`);

  //Scenario 3

  const updateTodoQuery = `UPDATE todo SET 
    todo = '${todo}', priority = '${priority}', status = '${status}'
    WHERE id = ${todoId};`;
  await database.run(updateTodoQuery);
  response.send(`${updateColumn} Updated`);
});

//API 5 Deletes a todo from todo table based on todo ID

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `DELETE FROM todo WHERE id=${todoId};`;
  await database.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
