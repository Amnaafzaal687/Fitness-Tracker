const express = require('express');
const authController = require('../controllers/authControllers');
//const authController = require('../controllers/auth');
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

router.get('/logdailyactivity', authenticateUser, authController.logDailyActivity);

router.post('/logdailyactivity', authenticateUser, authController.logDailyActivity);

router.get('/viewdailyactivity', authenticateUser, authController.viewDailyActivity);

router.post('/logaworkoutsession', authenticateUser, authController.logWorkoutSession);

router.get('/progress', authenticateUser, authController.getProgress);

// Route to view workout history
router.get('/history', authenticateUser, authController.history);

router.post('/suggestedplan', authenticateUser, authController.getSuggestedPlan);

module.exports = router;
