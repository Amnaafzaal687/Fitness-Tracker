const signupService = require('../services/signupService');
const loginService = require('../services/LoginService');
const passwordService = require('../services/passwordService');
const profileService = require('../services/profileService');
const dashboardService = require('../services/dashboardService');
const contactService = require('../services/contactService');
const fitnessGoalsService = require('../services/fitnessGoalsService');
const dailyActivityService = require('../services/dailyActivityService');
const progressService = require('../services/progressService');
const workoutService = require('../services/workoutService');
const workoutPlanService = require('../services/workoutPlanService');

const { validateProfileData } = require('../utils/validators');
const db = require('../db');


// Signup Controller
exports.signup = async (req, res) => {
    try {
        const { username, email, password, confirm_password } = req.body;
        const result = await signupService.handleSignup({ username, email, password, confirm_password });

        if (!result.success) {
            return res.status(400).render('signup', { message: result.message });
        }

        return res.redirect('/login');
    } catch (error) {
        console.error('Signup Error:', error);
        return res.status(500).render('signup', { message: 'An error occurred. Please try again.' });
    }
};

// Login Controller
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await loginService.handleLogin({ email, password });

        if (!result.success) {
            return res.status(result.status).render('login', { message: result.message });
        }

        // Set the JWT token in cookies
        res.cookie('jwt', result.token, result.cookieOptions);

        // Redirect based on profile existence
        if (result.hasProfile) {
            return res.redirect('/auth/dashboard');
        } else {
            return res.redirect('/createprofile');
        }
    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).render('login', { message: 'An error occurred. Please try again.' });
    }
};

exports.forgetPassword = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const result = await passwordService.handleForgetPassword({ name, email, password });

        if (!result.success) {
            return res.status(result.status).render('forget', { message: result.message });
        }

        return res.redirect('/login'); // Redirect to login on success
    } catch (error) {
        console.error('Forget Password Error:', error);
        return res.status(500).render('forget', { message: 'An error occurred. Please try again.' });
    }
};

exports.logout = (req, res) => {
    try {
        // Clear JWT cookie
        res.clearCookie('jwt');

        // Redirect to login
        return res.redirect('/login');
    } catch (error) {
        console.error('Logout Error:', error);
        return res.status(500).render('error', { message: 'An error occurred while logging out.' });
    }
};

exports.createProfile = (req, res) => {
    const { gender, age, height, weight } = req.body;

    if (!req.user || !req.user.id) {
        return res.status(400).render('createprofile', {
            message: 'User not authenticated. Please log in again.'
        });
    }

    const userId = req.user.id;

    // Check if all fields are provided
    if (!gender || !age || !height || !weight) {
        return res.status(400).render('createprofile', {
            message: 'All fields are required.'
        });
    }

    // Check if a profile already exists for the user
    db.query(
        'SELECT * FROM profiles WHERE user_id = ?',
        [userId],
        (error, results) => {
            if (error) {
                console.error('Database Error:', error);
                return res.status(500).render('createprofile', {
                    message: 'An error occurred while checking the profile.'
                });
            }

            if (results.length > 0) {
                // If a profile already exists
                return res.status(400).render('createprofile', {
                    message: 'You have already created a profile.'
                });
            }

            // If no profile exists, insert the new profile
            db.query(
                'INSERT INTO profiles (user_id, gender, age, height, weight) VALUES (?, ?, ?, ?, ?)',
                [userId, gender, age, height, weight],
                (error, results) => {
                    if (error) {
                        console.error('Error inserting profile:', error);
                        return res.status(500).render('createprofile', {
                            message: 'An error occurred while saving the profile.'
                        });
                    }
                    // Redirect to the dashboard after successful profile creation
                    res.redirect('/auth/dashboard');
                }
            );
        }
    );
};

exports.dashboard = async (req, res) => {
    try {
        // Ensure the user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).render('login', {
                message: 'You need to be logged in to access the dashboard.'
            });
        }

        const userId = req.user.id;

        // Fetch profile and goals data
        const profile = await dashboardService.getUserProfile(userId);
        if (profile.length === 0) {
            return res.status(404).render('dashboard', {
                message: 'No profile found. Please create a profile first.'
            });
        }

        const goals = await dashboardService.getAchievedGoals(userId);

        // Render the dashboard with profile and goals
        return res.render('dashboard', {
            profile: profile[0], // Send the first profile record
            goals:goals,
            message: 'Welcome to your dashboard!'
        });
    } catch (error) {
        console.error('Dashboard Error:', error);
        return res.status(500).render('dashboard', {
            message: 'An error occurred while loading your dashboard.'
        });
    }
};

// Update Profile Controller
exports.updateProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).render('updateprofile', {
                message: 'User not authenticated. Please log in again.'
            });
        }

        const userId = req.user.id;
        const { gender, age, height, weight } = req.body;

        // Call service to update profile
        await profileService.updateProfile(userId, { gender, age, height, weight });

        // Redirect after success
        res.redirect('/auth/dashboard');
    } catch (error) {
        console.error('Update Profile Error:', error.message);
        res.status(400).render('updateprofile', {
            message: error.message || 'An error occurred while updating your profile.'
        });
    }
};

exports.contact = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Call service to save contact query
        await contactService.saveContactQuery({ name, email, message });

        // Success message
        res.status(200).send(`
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
                    padding: 15px 20px;
                    border-radius: 7px;
                    text-decoration: none;
                    margin-top: 20px;
                    width: 150px;
                    text-align: center;
                }
            </style>
            <div class="success">Thank you for your message!</div>
            <a href="/" class="back-button">Back</a>
        `);
    } catch (error) {
        console.error('Contact Form Error:', error.message);
        res.status(400).render('contact', {
            message: error.message || 'An error occurred while submitting your query.'
        });
    }
};

// Set Fitness Goals Controller
exports.fitnessGoals = async (req, res) => {
    try {
        const { activity, steps_goals, calories_goals, water_goals } = req.body;

        if (!req.user || !req.user.id) {
            return res.status(401).render('fitnessgoals', {
                message: 'You need to be logged in to set fitness goals.'
            });
        }

        const userId = req.user.id;

        // Check if all required fields are filled
        if (!activity || !steps_goals || !calories_goals || !water_goals) {
            return res.status(400).render('fitnessgoals', {
                message: 'All fields are required to save your fitness goals.'
            });
        }

        // Check if the user already has an active goal
        const hasActiveGoal = await fitnessGoalsService.hasActiveGoal(userId);
        if (hasActiveGoal) {
            return res.status(400).render('fitnessgoals', {
                message: 'You already have an active goal. Complete or wait until it expires before setting a new one.'
            });
        }

        // Save the new fitness goal
        const goalId = await fitnessGoalsService.saveFitnessGoal(userId, {
            activity,
            steps_goals,
            calories_goals,
            water_goals
        });

        // Fetch and display the saved goal
        const goal = await fitnessGoalsService.fetchGoalById(goalId);
        res.render('viewgoal', {
            message: 'Your current goal!',
            goal
        });
    } catch (error) {
        console.error('Error saving fitness goals:', error);
        res.status(500).render('fitnessgoals', {
            message: 'An error occurred while saving your fitness goals.'
        });
    }
};

// Check Goal Status Controller
exports.checkGoalStatus = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).render('error', {
                message: 'User not authenticated. Please log in.'
            });
        }

        const userId = req.user.id;
        const goal = await fitnessGoalsService.fetchLatestGoal(userId);

        if (goal) {
            // Check if the goal has expired
            const goalEndDate = new Date(goal.created_at);
            goalEndDate.setDate(goalEndDate.getDate() + 7); // Goals expire in 7 days
            const isGoalExpired = goalEndDate < new Date();

            if (isGoalExpired && goal.achieved === 0) {
                // Expire the goal
                await fitnessGoalsService.expireGoal(goal.id);
                return res.render('goalexpired', {
                    message: 'Your previous goal has expired. Set a new one to keep going!',
                    goal
                });
            }

            // Render appropriate view based on goal status
            if (goal.achieved === 1) {
                return res.render('goalcompleted', {
                    message: 'Congratulations! You achieved your fitness goal!',
                    goal
                });
            } else {
                return res.render('viewgoal', {
                    message: 'Your Current Goal',
                    goal
                });
            }
        } else {
            // No goals found
            res.render('fitnessgoals', {
                message: 'Set your new fitness goal to get started!'
            });
        }
    } catch (error) {
        console.error('Error checking goal status:', error);
        res.status(500).render('error', {
            message: 'An error occurred while checking your goal status.'
        });
    }
};

// Log Daily Activity Controller
exports.logDailyActivity = async (req, res) => {
    try {
        const { caloriesburn, waterintake, steps } = req.body;

        if (!req.user || !req.user.id) {
            return res.status(401).render('logdailyactivity', {
                message: 'You need to be logged in to log your daily activity.'
            });
        }

        const userId = req.user.id;

        // Log the activity
        await dailyActivityService.logActivity(userId, {
            caloriesBurn: caloriesburn,
            waterIntake: waterintake,
            steps
        });

        // Fetch cumulative activity for the day
        const cumulativeData = await dailyActivityService.getCumulativeActivity(userId);
        const activities = {
            total_water_intake: cumulativeData.total_water || 0,
            total_steps: cumulativeData.total_steps || 0,
            total_calories_burn: cumulativeData.total_calories || 0
        };

        // Fetch active goal
        const activeGoal = await dailyActivityService.getActiveGoal(userId);

        if (activeGoal) {
            const goalEndDate = new Date(activeGoal.created_at);
            goalEndDate.setDate(goalEndDate.getDate() + 7);

            const goalActivityData = await dailyActivityService.getGoalActivityData(
                userId,
                activeGoal.created_at,
                goalEndDate
            );

            const isStepsAchieved = goalActivityData.total_steps >= activeGoal.steps_goals;
            const isCaloriesAchieved = goalActivityData.total_calories >= activeGoal.calories_goals;
            const isWaterAchieved = goalActivityData.total_water >= activeGoal.water_goals;

            if (isStepsAchieved && isCaloriesAchieved && isWaterAchieved) {
                await dailyActivityService.markGoalAchieved(activeGoal.id);
                return res.render('viewdailyactivity', {
                    message: 'Daily activity logged successfully! Goal achieved!',
                    activities,
                    goal: null
                });
            }
        }

        return res.render('viewdailyactivity', {
            message: 'Daily activity logged successfully. Keep going to achieve your goal!',
            activities,
            goal: null
        });
    } catch (error) {
        console.error('Error logging daily activity:', error);
        res.status(500).render('logdailyactivity', {
            message: 'An error occurred while saving your daily activity.'
        });
    }
};

// View Daily Activity Controller
exports.viewDailyActivity = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).render('viewdailyactivity', {
                message: 'You need to be logged in to view your daily activity.'
            });
        }

        const userId = req.user.id;

        // Fetch cumulative activity for the day
        const cumulativeData = await dailyActivityService.getCumulativeActivity(userId);

        if (!cumulativeData.total_calories && !cumulativeData.total_water && !cumulativeData.total_steps) {
            return res.render('viewdailyactivity', {
                message: 'Start by logging your daily activity.',
                activities: null,
                goal: null
            });
        }

        const activityData = {
            total_water_intake: cumulativeData.total_water || 0,
            total_steps: cumulativeData.total_steps || 0,
            total_calories_burn: cumulativeData.total_calories || 0
        };

        res.render('viewdailyactivity', {
            message: 'Here is your logged activity for today.',
            activities: activityData,
            goal: null
        });
    } catch (error) {
        console.error('Error fetching daily activity:', error);
        res.status(500).render('viewdailyactivity', {
            message: 'An error occurred while fetching your daily activity.'
        });
    }
};

// Track user progress
exports.getProgress = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch the active fitness goal
        const activeGoal = await progressService.getActiveFitnessGoal(userId);

        if (!activeGoal) {
            return res.render('progress', {
                message: 'No active fitness goals found. Set a new goal to start tracking your progress!',
                progress: null
            });
        }

        // Fetch daily activity data
        const activity = await progressService.getDailyActivity(userId, activeGoal.created_at);
        const progressData = {
            steps: { completed: activity.total_steps, missed: Math.max(activeGoal.steps_goals - activity.total_steps, 0) },
            calories: { completed: activity.total_calories, missed: Math.max(activeGoal.calories_goals - activity.total_calories, 0) },
            water: { completed: activity.total_water, missed: Math.max(activeGoal.water_goals - activity.total_water, 0) }
        };

        const isGoalAchieved = progressData.steps.missed === 0 &&
                               progressData.calories.missed === 0 &&
                               progressData.water.missed === 0;

        return res.render('progress', {
            message: isGoalAchieved 
                ? 'Congratulations! You have achieved your goal!' 
                : 'Keep going! You are making progress towards your goal.',
            progress: progressData
        });
    } catch (error) {
        console.error('Error tracking progress:', error);
        res.status(500).render('error', {
            message: 'An error occurred while tracking your progress.'
        });
    }
};
// Log a workout session
exports.logWorkoutSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const { workoutname, duration, sets, date } = req.body;

        await workoutService.logWorkoutSession(userId, { workoutName: workoutname, duration, sets, date });

        res.redirect('/successful');
    } catch (error) {
        console.error('Error logging workout session:', error);
        res.status(500).send('An error occurred while logging your workout session.');
    }
};

// Get workout history
exports.history = async (req, res) => {
    try {
        const userId = req.user.id;

        const history = await workoutService.getWorkoutHistory(userId);

        if (history.length === 0) {
            return res.status(404).render('history', {
                message: 'No history found. Please log a workout session.'
            });
        }

        // Format dates for the history
        const formattedHistory = history.map((session) => ({
            ...session,
            date: session.date
                ? new Date(session.date).toLocaleDateString('en-GB') // Format as "dd/mm/yyyy"
                : null
        }));

        return res.render('history', { workouts: formattedHistory });
    } catch (error) {
        console.error('Error fetching workout history:', error);
        res.status(500).render('history', {
            message: 'Error fetching workout history.'
        });
    }
};

//for suggestedplan 
exports.getSuggestedPlan = (req, res) => {
    const { fitnesslevel, workouttype } = req.body;

    try {
        // Use the service to get the view based on the user's input
        const viewToRender = workoutPlanService.getSuggestedPlan(fitnesslevel, workouttype);
        
        // Render the appropriate view
        res.render(viewToRender);
    } catch (error) {
        return res.status(400).send(error.message);  // Handle invalid input gracefully
    }
};