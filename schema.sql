DROP DATABASE IF EXISTS amazon_db;
CREATE DATABASE amazon_db;
USE amazon_db;

CREATE TABLE products(
  id INT AUTO_INCREMENT NOT NULL,
  product_name VARCHAR(50),
  department_name VARCHAR(50),
  price DECIMAL,
  stock_quantity INT(3),
    PRIMARY KEY (id)
);

INSERT INTO products(product_name, department_name, price, stock_quantity)
VALUES ("pizza", "food", 10, 9),
("t-shirt", "clothing", 11, 50),
("jeans", "clothing", 18, 30),
("playing cards", "games", 6, 12),
("monopoly", "games", 15, 7),
("frozen pizza", "food", 9, 20),
("jacket", "clothing", 25, 17),
("hat", "clothing", 13, 10),
("ps4", "games", 300, 3),
("toilet paper", "misc", 2, 100),
("shampoo", "misc", 7, 30);