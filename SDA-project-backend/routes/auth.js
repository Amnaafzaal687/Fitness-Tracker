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

router.post('/fitnessgoals', authenticateUser, authController.fitnessGoals);


router.get('/profile', authenticateUser, (req, res) => {
    res.render('profile', { user: req.user });
});

router.post('/logdailyactivity', authenticateUser, authController.logDailyActivity);

router.get('/progress', authenticateUser, authController.getProgress);



//const { getProgress } = require('../controllers/progressController');

//router.get('/progress', getProgress);

//router.get('/progress', (req, res) => {
 //   res.send('Progress route is working!');
//});

module.exports = router;
