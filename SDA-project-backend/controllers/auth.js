const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Database connection setup
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

const Validateemail = (email) =>{
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
};

const Validatepassword = (password) =>{
    return password.length>=6;
};

// Signup Function
exports.signup = async (req, res) => {
    const { username, email, password, confirm_password } = req.body;

    try {
        if (!username || !email || !password || !confirm_password) {
            return res.status(400).render('signup', {
                message: 'All fields are required.'
            });
        }
        
        if(!Validatepassword(password)){
            return res.status(400).render('signup', {
                message: 'Password must be at least six characters long.'
            });
        }

        if(!Validateemail(email)){
            return res.status(400).render('signup', {
                message: 'Invalid email format.'
            });
        }

        if (password !== confirm_password) {
            return res.status(400).render('signup', {
                message: 'Passwords do not match.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 8);

        db.query(
            'INSERT INTO users SET ?',
            { name: username, email: email, password: hashedPassword }, 
            (error, results) => {
                if (error) {
                    console.error(error);
                    return res.status(500).render('signup', {
                        message: 'An error occurred. Please try again.'
                    });
                }

                res.redirect('/login'); // Redirect to login after successful registration
            }
        );
    } catch (err) {
        console.error(err);
        res.status(500).render('signup', {
            message: 'Unexpected error occurred.'
        });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validate email and password
        if (!email || !password) {
            return res.status(400).render('login', {
                message: 'Please provide both email and password'
            });
        }

        if (!Validateemail(email)) {
            return res.status(400).render('login', {
                message: 'Invalid email format.'
            });
        }

        if (!Validatepassword(password)) {
            return res.status(400).render('login', {
                message: 'Password must be at least six characters long.'
            });
        }

        // Check if user exists in the database
        const user = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
                if (error) {
                    reject(error);
                } else if (results.length === 0) {
                    resolve(null);  // User not found
                } else {
                    resolve(results[0]);  // Found user
                }
            });
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).render('login', {
                message: 'Invalid email or password'
            });
        }

        // Create JWT token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN  // Expires in the time set in your .env file
        });

        // Set the JWT token in the cookie
        const cookieOptions = {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),  // Set expiration
            httpOnly: true,  // Prevents JavaScript from accessing the cookie
        };

        // Send JWT token as a cookie
        res.cookie('jwt', token, cookieOptions);

        // Check if the user has a profile
        const profile = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM profiles WHERE user_id = ?', [user.id], (error, profileResults) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(profileResults);
                }
            });
        });

        // If profile exists, redirect to dashboard, else redirect to create profile page
        if (profile.length > 0) {
            return res.redirect('/auth/dashboard');
        } else {
            return res.redirect('/createprofile');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).render('login', {
            message: 'An error occurred. Please try again later.'
        });
    }
};


// Reset Password by Username
exports.forgetPassword = async (req, res) => {
    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).render('forget', {
            message: 'Username and password are required.'
        });
    }

    // Validate password length
    if(!Validatepassword(password)){
        return res.status(400).render('forget', {
            message: 'Password must be at least 6 characters long.'
        });
    }
      // Check if the username exists in the database
    db.query('SELECT * FROM users WHERE name = ?', [name], async (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).render('forget', {
                message: 'An error occurred. Please try again later.'
            });
        }

        if (results.length === 0) {
            return res.status(404).render('forget', {
                message: 'No user found with that username.'
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 8);

        // Update the password in the database
        db.query('UPDATE users SET password = ? WHERE name = ?', [hashedPassword, name], (error) => {
            if (error) {
                console.error(error);
                return res.status(500).render('forget', {
                    message: 'Error updating password.'
                });
            }

            res.redirect('/login'); // Redirect to login page after successful password reset
        });
    });
};

// Logout Route
exports.logout = (req, res) => {
    // Clear the cookie that stores the JWT
    res.clearCookie('jwt');

    // Redirect to the login page after logging out
    res.redirect('/login');
};

//Create Profile
exports.createProfile = (req, res) => {
    console.log('req.user:', req.user); // Check if req.user is populated
    const { gender, age, height, weight } = req.body;

    if (!req.user || !req.user.id) {
        return res.status(400).render('createprofile', {
            message: 'User not authenticated. Please log in again.'
        });
    }

    const userId = req.user.id;

    if (!gender || !age || !height || !weight) {
        return res.status(400).render('createprofile', {
            message: 'All fields are required.'
        });
    }

    db.query(
        'INSERT INTO profiles SET ?',
        { user_id: userId, gender, age, height, weight },
        (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).render('createprofile', {
                    message: 'An error occurred. Please try again.'
                });
            }
            res.redirect('/auth/dashboard');
        }
    );
};

exports.dashboard = (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(400).render('login', {
            message: 'You need to be logged in to access the dashboard.'
        });
    }

    const userId = req.user.id;

    console.log('User ID:', userId);

    // Query to fetch both user and profile data from the users and profiles tables
    const query = `
        SELECT users.name, users.email, profiles.gender, profiles.age, profiles.height, profiles.weight
        FROM profiles
        JOIN users ON profiles.user_id = users.id
        WHERE profiles.user_id = ?;
    `;

    db.query(query, [userId], (error, result) => {
        if (error) {
            console.error('Database Error:', error); // Log the error to debug
            return res.status(500).render('dashboard', {
                message: 'An error occurred while fetching your profile data.'
            });
        }

        console.log('Query Result:', result);  // Log the result of the query to check if it returns both user and profile data

        if (result.length === 0) {
            // This indicates no profile found in the database
            return res.status(404).render('dashboard', {
                message: 'No profile found. Please create a profile first.'
            });
        }

        const profile = result[0];  // Get the first result (as we expect only one profile per user)

        // Render the dashboard view and pass the profile data to the template
        return res.render('dashboard', {
            profile: profile, // Pass profile and user data to the view
            message: 'Welcome to your dashboard!'
        });
    });
};

// Update Profile
exports.updateProfile = (req, res) => {
    const { gender, age, height, weight } = req.body;

    if (!req.user || !req.user.id) {
        return res.status(400).render('updateprofile', {
            message: 'User not authenticated. Please log in again.'
        });
    }

    const userId = req.user.id;

    // Validation: Check if all fields are filled
    if (!gender || !age || !height || !weight) {
        return res.status(400).render('updateprofile', {
            message: 'All fields are required.'
        });
    }

    // Query to update profile data in the database
    db.query(
        'UPDATE profiles SET gender = ?, age = ?, height = ?, weight = ? WHERE user_id = ?',
        [gender, age, height, weight, userId],
        (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).render('updateprofile', {
                    message: 'An error occurred while updating your profile.'
                });
            }

            res.redirect('/auth/dashboard'); // Redirect to the dashboard after successful update
        }
    );
};
exports.contact = (req, res) => {
    const { name, email, message } = req.body;

    // Validate inputs
    if (!name || !email || !message) {
        return res.status(400).render('contact', {
            message: 'All fields are required.'
        });
    }
    if (!Validateemail(email)) {
        return res.status(400).render('contact', {
            message: 'Invalid email format.'
        });
    }

    // Use an object for the `SET ?` query
    const queryData = { name, email, message };

    db.query('INSERT INTO contact_queries SET ?', queryData, (error, results) => {
        if (error) {
            console.error('Error inserting into database:', error);
            return res.status(500).render('contact', {
                message: 'Failed to insert into database.'
            });
        }

        // Respond with success and redirect
        console.log('Data inserted successfully:', results);
        return res.status(200).send(`
            <style>
                body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
                .success {
                    color: brown;
                    font-size: 36px;
                    font-weight: bold;
                    text-shadow: 1px 1px 2px #000;
                }
                .back-button {
                display: inline-block;
                color: white;
                background-color: #0a0505;
                padding: 15px 20px; /* Increase width and height by adjusting padding */
                border-radius: 7px;
                text-decoration: none;
                margin-top: 20px; /* Adds space below the success message */
                width: 150px; /* Ensures button width is consistent */
                text-align: center; /* Center the text within the button */
                }
            </style>
            <div class="success">Thank you for your message!</div>
            <a href="/" class="back-button">Back</a>
        `);
    });
};

// Save Fitness Goals
exports.fitnessGoals = (req, res) => {
    const { activity, goaltype, goaltarget,waterintake } = req.body;

    if (!req.user || !req.user.id) {
        return res.status(400).render('fitnessgoals', {
            message: 'You need to be logged in to set fitness goals.'
        });
    }

    const userId = req.user.id;

    // Validate required fields
    if (!activity || !goaltype || !goaltarget || !waterintake) {
        return res.status(400).render('fitnessgoals', {
            message: 'All fields are required to save your fitness goals.'
        });
    }

    const query = `
        INSERT INTO fitness_goals (user_id, activity, steps_goals, calories_goals,water_goals)
        VALUES (?, ?, ?, ?,?)
    `;

    db.query(
        query,
        [userId, activity, goaltype, goaltarget,waterintake],
        (error, results) => {
            if (error) {
                console.error('Database Error:', error);
                return res.status(500).render('fitnessgoals', {
                    message: 'An error occurred while saving your fitness goals.'
                });
            }

            res.redirect('/auth/dashboard'); // Redirect to dashboard after successful save
        }
    );
};


exports.logDailyActivity = (req, res) => {
    const { caloriesburn, waterintake, steps } = req.body;

    if (!req.user || !req.user.id) {
        return res.status(400).render('logdailyactivity', {
            message: 'You need to be logged in to log your daily activity.'
        });
    }

    const userId = req.user.id;

    // Validate input fields
    if (!caloriesburn || !waterintake || !steps) {
        return res.status(400).render('logdailyactivity', {
            message: 'All fields are required.'
        });
    }

    // Insert the daily activity into the database
    const query = `
        INSERT INTO daily_activities (user_id, calories_burn, water_intake, steps)
        VALUES (?, ?, ?, ?)
    `;
    db.query(
        query,
        [userId, caloriesburn, waterintake, steps],
        (error, results) => {
            if (error) {
                console.error('Database Error:', error);
                return res.status(500).render('logdailyactivity', {
                    message: 'An error occurred while saving your daily activity.'
                });
            }

            // Redirect to the dashboard after successful logging
            res.redirect('/auth/dashboard');
        }
    );
};


exports.getProgress = (req, res) => {
    const userId = req.user.id;

    const fetchFitnessGoals = `
        SELECT steps_goals, calories_goals, water_goals
        FROM fitness_goals
        WHERE user_id = ?
    `;

    const fetchDailyActivity = `
        SELECT SUM(steps) AS total_steps, SUM(calories_burn) AS total_calories, SUM(water_intake) AS total_water
        FROM daily_activities
        WHERE user_id = ? AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    `;
    db.query(fetchFitnessGoals, [userId], (goalError, goalResults) => {
        if (goalError) {
            console.error("Error fetching fitness goals:", goalError);
            return res.status(500).send("Error fetching fitness goals.");
        }
        //const goals = goalResults;
        console.log(goalResults)
        const goals = goalResults[0] || { steps_goals: 0, calories_goals: 0, water_goals: 0 };

        db.query(fetchDailyActivity, [userId], (activityError, activityResults) => {
            if (activityError) {
                console.error("Error fetching daily activity:", activityError);
                return res.status(500).send("Error fetching daily activity.");
            }
            console.log(activityResults[0])
            console.log(activityResults)
            const activity = activityResults[0] || { total_steps: 0, total_calories: 0, total_water: 0 };

           const progressData = {
                steps: { completed: activity.total_steps, missed: Math.max(goals.steps_goals - activity.total_steps, 0) },
                calories: { completed: activity.total_calories, missed: Math.max(goals.calories_goals - activity.total_calories, 0) },
                water: { completed: activity.total_water, missed: Math.max(goals.water_goals - activity.total_water, 0) },
            };
            console.log(progressData)
            res.render("progress", { progressData });
        });
    });
};


// Save a workout session
exports.logWorkoutSession = async (req, res) => {
    const { workoutname, duration, sets, date } = req.body;
    const userId = req.user.id; // Assuming `req.user` contains authenticated user data

    try {
        // Insert workout session details into the database
        await db.query(
            'INSERT INTO workout_sessions (user_id, workoutname, duration, sets, date) VALUES (?, ?, ?, ?, ?)',
            [userId, workoutname, duration, sets, date]
        );
       
        res.redirect('/successful');
    } catch (error) {
        console.error('Error logging workout session:', error);
        res.status(500).send('An error occurred while logging your workout session.');
    }
};
//Get user history
exports.history = async (req, res) => {
    const userId = req.user.id;

    const query = 'SELECT workoutname, duration, sets, date FROM workout_sessions WHERE user_id = ? ORDER BY date DESC';

    db.query(query, [userId], (error, result) => {
        if (error) {
            console.error('Database Error:', error);
            return res.status(500).render('history', {
                message: 'Error fetching workout history'
            });
        }

        if (result.length === 0) {
            return res.status(404).render('history', {
                message: 'No history found. Please log a workout session.'
            });
        }

        console.log('Workouts Data:', result); // Debugging
        return res.render('history', {workouts: result});
    });
};