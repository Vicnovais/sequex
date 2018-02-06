# sequex

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Express based API made with Sequelize.JS as ORM and Passport.JS as authenticator.

## Warning
- This is a work in progress project, not recommended to be run at production

## Considerations
- This project was intended as a server-side framework with a ready-to-use API. The client side present here contains only two simple pages: index and login, but you can attach any client-side framework of your choice, for Express is serving statically the files included inside 'client' folder.

## Requirements
- Node.JS
- NPM
- Express.JS
- Database (here I'm using MySQL, but you can use any dialect supported by [Sequelize.JS](http://docs.sequelizejs.com))
- Passport.JS

## Get Started

- Make sure you have **NodeJS** installed
- For this example, make sure you have an instance of **MySQL** active and running (https://www.mysql.com)
- Download or clone this repository
- Enter in the **'server'** directory and run:
```shell
npm install
```

## Database
- You may set up your own connection settings on this file: **'DAL/database.config.js'**
- NOTE: If you have trouble, follow Sequelize.JS instructions accordingly with your chosen database
- Run the following statements to build our schema in your MySQL instance:
```sql
CREATE TABLE User (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  createdAt DATETIME,
  updatedAt DATETIME
);

CREATE TABLE Task (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  description TEXT,
  done TINYINT(1),
  createdAt DATETIME,
  updatedAt DATETIME
);

ALTER TABLE Task ADD CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);
```
- **NOTE**: Databases associations are declared inside file 'DAL/db.js', for more information, read about Sequelize's associations. 

- Now you may start the server running the command **node server** and then enter in the website:
```
http://localhost:3000
```

## Model
- Our database is mapped to objects through Sequelize.JS
- The models must be inside 'models' folder
- A base model was created to wrap Sequelize's model. You can see it in 'arch/BaseModel'. Hence, every model must return a new instance of BaseModel accordingly (you may see this in the shipped models, Task and User).

## Authentication

- The authentication here is handled by Passport.JS (http://www.passportjs.org) with the JWT strategy.
- To get the user token, there is an POST endpoint to /token, which is responsible to get the request body parameters (username and password), as show in the file 'app_start/auth.route.builder'.
- To test the token service, you may use an API test app, like PostMan.
- Example:
  > Open PostMan, select POST, and enter the URL http://localhost:3000/token, and set in the request body a JSON containing two parameters: (for the sake of simplicity, there is an user array fixed in the same file aforementioned, but you can easily switch to a database check)
    ```
    {
      "username": "Victor",
      "password:": "123"
    }
    ```
  > As response, you'll be redirected to '/', and, hence, will receive index.html, which indicates that a token was generated. Besides this, two cookies will be added, one named 'user', which contains the user's name, and other named 'auth', which contains the generated token.
- Now, if you try to make a GET request to localhost:3000, you'll get a Unauthorized response. To overcome this, you need to set the request's 'Authentication' header accordingly:
  ```
  Authentication: Bearer <token>
  ```
- All endpoints are intercepted by jwt's authentication, so for every request you need to set the aforementioned authentication header.
- You may set your preferred JWT's secret inside 'authentication/config.js' file, and you may set express' session secret inside 'app_start/middleware.js'
- To sign out an user, you may send a POST request to '/signout'. In response, the session will be destroyed together with the created tokens. After that, you'll be redirected to '/' with the login page;

## API
- To register a new endpoint you need a model and a controller

- Adding a model:
  * Navigate to the folder 'models'
  * Add a new .js file with your model name, you can use as basis the Task or User model already created in this project
  * Map your database's properties to the new model
  * Export the module's variables accordingly
  * If your model has any association, register it inside 'DAL/db.js' file

- Adding a controller:
  * Navigate to the folder 'controllers'
  * Add a new .js file with your controller name. Note that you have to follow this rule for a new controller file name:
  ```
  NAMEController.js
  That is if your model has the name 'Employee', your controller name should be EmployeeController.js
  ```
  * As you can see there are two controllers in this project, **UserController.js** and **TaskController.js**.
  * Every controller must return an instance of BaseController.js file. This base controller has all the methods required by an API, such as get, getById, update, create, etc.
  * It's important to note that you can override the base controller's behavior. You can see this happening inside **TaskController.js**
  * If you need an extra action that does not exist inside the Base Controller, you need to pass an array as the last argument to the Base Controller, as seen in **TaskController.js**:
  ```
  var TaskController = class TaskController extends BaseController { };
  var _TaskController = new TaskController('Task', 'task', Task.model, ['setDone']);
  ```
  
  > Here we have a custom action named 'setDone', so your controller may register it. Consequently, the API engine will automatically build a POST route to this custom action (task/setDone):
  
  ```
  _TaskController.setDone = function (req, res) { ... }
  ```
  
  * If you want that your JSON response contains the model's association object, you need to override the get/getById methods and pass as last argument the sequelize's include configuration, as shown inside **TaskController.js** to retrieve the user associated to a task:
  
  ```
  var oldGet = _TaskController.get;
  _TaskController.get = function (req, res, next) {
      oldGet.apply(_TaskController, [req, res, next, 
          { 
              include: [
                  { model: User.sequelizeModel, as: 'User', required: true }
              ] 
          }
      ]);
  };
  ```
  
  * It's important to note that this API comes with some options to paginate, sort and filter your data:
    > Paging: to page your data, you must set a query string containing the page size and the page index
    ```
    localhost:3000/api/task?pagesize=10&pageindex=1
    ```
    > Sorting: to sort your data, you must set a query string containg the sort field and the sort order
    ```
    localhost:3000/api/task?sortfield=description&sortorder=ASC
    ```
    > Filtering: to filter your data, you must set a query string containg the filter type and the term
    ```
    localhost:3000/api/task?filter=global&term=job
    ```
    > All these functionalities are coded inside 'BaseController.js' file
    
  * That's it. All API routes are automagically created when you restart the project, and then you'll have access to the following routes:
  ```
  [GET] localhost:8080/api/ControllerName -> retrieve all registers
  Example: localhost:8080/api/task
  
  [GET] localhost:8080/api/ControllerName/id -> retrieve a single register based on id
  Example: localhost:8080/api/user/58c454fc43c3c01ca8fb03ff
  
  [POST] localhost:8080/api/ControllerName -> post a new register using JSON format
  [POST] localhost:8080/api/ControllerName/id -> update a register using JSON format
  [DELETE] localhost:8080/api/ControllerName/id -> delete a single register based on id
  ```

  * Note that these routes are secured, which means you must be authenticated to be able to access them.
  
  ## Final Considerations
  - As said, this is a work in progress, which means it has bugs and not suitable for production
  - Feel free to contribute, may it be solving bugs, emitting issues or adding new features
  - Enjoy!
