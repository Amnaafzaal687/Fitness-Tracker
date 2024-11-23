const express = require('express');
const authController = require('../controllers/auth');
const authenticateUser = require('../middleware/authenticateUser'); // Import the middleware

const router = express.Router();

// Signup Route
router.post('/signup', authController.signup);

// Login Route
router.post('/login', authController.login);

// Forget Password
router.post('/forget', authController.forgetPassword); 

// Logout Route
router.post('/logout', authController.logout);

// Create Profile Route (with authentication middleware)
router.post('/createprofile', authenticateUser, authController.createProfile);

router.get('/dashboard', authenticateUser, authController.dashboard);  

router.post('/updateprofile', authenticateUser, (req, res) => {
    authController.updateProfile(req, res);
});

// Define the contact route
router.post('/contact', authController.contact);

router.get('/checkGoalStatus', authenticateUser, authController.checkGoalStatus);

router.post('/fitnessgoals', authenticateUser, authController.fitnessGoals);

router.post('/logdailyactivity', authenticateUser, authController.logDailyActivity);


router.get('/progress', authenticateUser, authController.getProgress);

// Suggested Plan Route
router.post('/suggestedplan', authenticateUser, (req, res) => {
    const { fitnesslevel, workouttype } = req.body;

    // Logic to determine which view to render
    let viewToRender = '';
    if (fitnesslevel === 'begineer' && workouttype === 'arms') {
        viewToRender = 'suggestedplan2';
    } else if (fitnesslevel === 'advance' && workouttype === 'arms') {
        viewToRender = 'suggestedplan1';
    } else if (fitnesslevel === 'begineer' && workouttype === 'legs') {
        viewToRender = 'suggestedplan4';
    } else if (fitnesslevel === 'advance' && workouttype === 'legs') {
        viewToRender = 'suggestedplan3';
    } else {
        return res.status(400).send('Invalid fitness level or workout type');
    }

    // Render the appropriate view
    res.render(viewToRender);
});


router.post('/logaworkoutsession', authenticateUser, authController.logWorkoutSession);

// Route to view workout history
router.get('/history', authenticateUser, authController.history);


module.exports = router;
