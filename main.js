var inquirer = require("inquirer");
var mysql = require("mysql");
var Table = require("cli-table");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "2zstfkctt4j1",
  database: "amazon_db"
})

connection.connect(function(err) {
  if (err) throw err
  console.log("connected");
})


function loginPrompt() {
  inquirer.prompt([
    {
      message: "login",
      type: "list",
      choices: ["customer", "manager", "supervisor (doesn't work)", "exit"],
      name: "login"
    }
  ]).then(function(resp) {
    switch (resp.login) {
      case "customer":
        customerPrompt();
        break;
      case "manager":
        managerPrompt();
        break;
      case "supervisor (doesn't work)":
        // supervisorPrompt();
        console.log("Work in progress!");
        loginPrompt();
        break;
      case "exit":
        connection.end();
    }
  })
}

function displayItems() {
  var table = new Table({
    head: ["Id", "Product Name", "Department", "Price", "Quantity"],
    colWidths: [5, 25, 20, 10, 10]
  })

  connection.query("SELECT * FROM products", function(err, resp) {
    resp.forEach(function(e, i ,arr) {
      var temp = [];
      temp.push(e.id, e.product_name, e.department_name, e.price, e.stock_quantity);
      table.push(temp);
    })
  console.log("")
  console.log(table.toString());
  })
}

function customerPrompt() {
  displayItems();
  inquirer.prompt([
    {
      message: "What is the Id of the item you want to buy? (Enter a number)",
      name: "itemid"
    }, {
      message: "How many units would you like to buy? (Enter a number)",
      name: "quantity"
    }
  ]).then(function(resp) {
    if (isNaN(resp.itemid) || isNaN(resp.quantity)) {
      console.log("Please enter numbers only");
      setTimeout(function(){ customerPrompt() }, 100);
    } else {
      connection.query("SELECT stock_quantity, price FROM products WHERE id = ?", resp.itemid, function(err, data) {
        var stock = data[0].stock_quantity
        if (stock < resp.quantity) {
          console.log("~~~~~~~");
          console.log("Not enough items in stock! Try again!");
          customerPrompt();
        } else {
          var newStock = stock - resp.quantity;
          connection.query('UPDATE products SET stock_quantity = ? WHERE id = ?', [newStock, resp.itemid], function(err, response) {
            console.log("~~~~~~~");
            console.log("Thanks for your purchase!");
            console.log("Your total is " + (resp.quantity * data[0].price));
            console.log("~~~~~~~");
            loginPrompt();
          })
        }
      })
    }
  })
}

function managerDisplay() {
  var table = new Table({
    head: ["Id", "Product Name", "Price", "Quantity"],
    colWidths: [5, 25, 10, 10]
  })

  connection.query("SELECT * FROM products", function(err, resp) {
    resp.forEach(function(e, i ,arr) {
      var temp = [];
      temp.push(e.id, e.product_name, e.price, e.stock_quantity);
      table.push(temp);
    })
  console.log("")
  console.log(table.toString());
  })
}

function managerDisplayLow() {
  var table = new Table({
    head: ["Id", "Product Name", "Price", "Quantity"],
    colWidths: [5, 25, 10, 10]
  })

  connection.query("SELECT * FROM products WHERE stock_quantity < 5", function(err, resp) {
    resp.forEach(function(e, i ,arr) {
      var temp = [];
      temp.push(e.id, e.product_name, e.price, e.stock_quantity);
      table.push(temp);
    })
  console.log("")
  console.log(table.toString());
  })
}

function managerAdd() {
  managerDisplay();
  inquirer.prompt([
    {
      message: "Id of product to add?",
      name: "idadd"
    }, {
      message: "Quantity to add?",
      name: "quantity"
    }
  ]).then(function(resp) {
    connection.query("SELECT stock_quantity FROM products WHERE id = ?", resp.idadd, function(err, data) {
      console.log(data.stock_quantity)
      console.log(resp.quantity)
      var oldStock = data[0].stock_quantity;
      var newStock = parseInt(oldStock) + parseInt(resp.quantity);
      console.log(newStock)
      connection.query("UPDATE products SET stock_quantity = ? WHERE id = ?", [newStock, resp.idadd], function(err, data) {
        console.log("Updated Stock!");
      })
      setTimeout(function() {managerPrompt()}, 100);
    })
  })
}

function managerAddNew() {
  inquirer.prompt([
    {
      message: "Name of Product?",
      name: "name"
    }, {
      message: "Department?",
      name: "dept"
    }, {
      message: "Price?",
      name: "price"
    }, {
      message: "Quantity?",
      name: "quantity"
    }
  ]).then(function(resp) {
    var query = connection.query("INSERT INTO products SET ?",
      {
        product_name: resp.name,
        department_name: resp.dept,
        price: resp.price,
        stock_quantity: resp.quantity
      },
      function(err, resp) {
        console.log("Product Added!");
    })
    console.log(query.sql);
    setTimeout(function() {managerPrompt()}, 100);
  })
}

function managerPrompt() {
  inquirer.prompt([
    {
      type: "list",
      choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Back"],
      message: "Choose an Action",
      name: "action"
    }
  ]).then(function(resp) {
    switch (resp.action) {
      case "View Products for Sale":
        managerDisplay();
        setTimeout(function() {managerPrompt()}, 100);
        break;
      case "View Low Inventory":
        managerDisplayLow();
        setTimeout(function(){ managerPrompt()}, 100);
        break;
      case "Add to Inventory":
        managerAdd();
        break;
      case "Add New Product":
        managerAddNew();
        break;
      case "Back":
        loginPrompt();
        break;
    }
  })
}

loginPrompt();