CREATE DATABASE FitStride;

USE FitStride;


CREATE TABLE profiles (
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT NOT NULL,
gender ENUM('Male', 'Female','Other';) NOT NULL,
age INT NOT NULL,
height DECIMAL(5, 2) NOT NULL,
weight DECIMAL(5, 2) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE
CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE daily_activities (
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT NOT NULL,
calories_burn INT NOT NULL,
water_intake INT NOT NULL, -- Measured in milliliters (or relevant unit)
steps INT NOT NULL,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Timestamp for the activity
entry
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE
CURRENT_TIMESTAMP, -- Timestamp for updates
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE fitness_goals (
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT NOT NULL,
activity VARCHAR(255) NOT NULL,
steps_goals INT NOT NULL,
calories_goals INT NOT NULL,
water_goals INT NOT NULL,
achieved BOOLEAN DEFAULT 0, -- Tracks whether the goal is achieved
achieved_at DATETIME DEFAULT NULL, -- Timestamp for when the goal is achieved
created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Timestamp for when the goal
was created
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE
CURRENT_TIMESTAMP, -- Timestamp for updates
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE workout_sessions (
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT NOT NULL,
workoutname VARCHAR(255) NOT NULL,
duration VARCHAR(50) NOT NULL,
sets VARCHAR(10) NOT NULL,
date DATE NOT NULL,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE contact_queries (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(255) NOT NULL,
email VARCHAR(255) NOT NULL,
message TEXT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(20) NOT NULL,
email VARCHAR(30) NOT NULL,
password VARCHAR(255) NOT NULL,
);