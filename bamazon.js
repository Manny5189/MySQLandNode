
var inquirer = require('inquirer');
var mysql = require('mysql');


var connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,

	// Your username
	user: 'root',

	// Your password
	password: '',
	database: 'bamazon'
});


function promptUserPurchase() {
	

	// Ask the user to pick an item id
	inquirer.prompt([
		{
			type: 'input',
			name: 'item_id',
			message: 'Please enter the Item ID which you would like to purchase.',
			filter: Number
		},
		{
			type: 'input',
			name: 'quantity',
			message: 'Please enter quantity of product you would like to purchase?',
			filter: Number
		}
	]).then(function(input) {

		var item = input.item_id;
		var quantity = input.quantity;

		
		var queryStr = 'SELECT * FROM products WHERE ?';

		connection.query(queryStr, {item_id: item}, function(err, data) {
			if (err) throw err;

			// If wrong item ID is picked, data array will show nothing
			// console.log('data = ' + JSON.stringify(data));

			if (data.length === 0) {
				console.log('Item ID does not exist. Please try again');
				displayInventory();

			} else {
				var productData = data[0];

				

				// If there is enough items in stock
				if (quantity <= productData.stock_quantity) {
					console.log('Enough product is in stock, your order has been placed');

					
					var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity - quantity) + ' WHERE item_id = ' + item;
					// console.log('updateQueryStr = ' + updateQueryStr);

					// Update the inventory
					connection.query(updateQueryStr, function(err, data) {
						if (err) throw err;

						console.log('Your order has been placed! Your total is $' + productData.price * quantity);
						console.log('Thank you for shopping at bamazon!');
						console.log("\n---------------------------------------------------------------------\n");

						// End the database connection
						connection.end();
					})
				} else {
					console.log('Sorry, your order can not be placed, there is not enough product available');
					console.log('Please try to order a lower quantity.');
					console.log("\n---------------------------------------------------------------------\n");

					displayInventory();
				}
			}
		})
	})
}


function displayInventory() {
	

	queryStr = 'SELECT * FROM products';

	
	connection.query(queryStr, function(err, data) {
		if (err) throw err;

		console.log('Existing Inventory: ');
		console.log('...................\n');

		var strOut = '';
		for (var i = 0; i < data.length; i++) {
			strOut = '';
			strOut += 'Item ID: ' + data[i].item_id + '  //  ';
			strOut += 'Product Name: ' + data[i].product_name + '  //  ';
			strOut += 'Department: ' + data[i].department_name + '  //  ';
			strOut += 'Price: $' + data[i].price + '\n';

			console.log(strOut);
		}

	  	console.log("---------------------------------------------------------------------\n");

	  	
	  	promptUserPurchase();
	})
}


function runBamazon() {
	

	// Display the available inventory
	displayInventory();
}

// Run the application logic
runBamazon();
