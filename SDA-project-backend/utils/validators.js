exports.validateEmail = (email) =>{
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
};

exports.validatePassword = (password) =>password.length>=6;

// utils/validators.js
exports.validateProfileData = ({ gender, age, height, weight }) => {
    if (!gender || !['male', 'female', 'other'].includes(gender.toLowerCase())) {
        return 'Invalid gender. Please select "male", "female", or "other".';
    }
    if (!age || isNaN(age) || age < 0 || age > 120) {
        return 'Invalid age. Age must be a number between 0 and 120.';
    }
    if (!height || isNaN(height) || height <= 0) {
        return 'Invalid height. Height must be a positive number.';
    }
    if (!weight || isNaN(weight) || weight <= 0) {
        return 'Invalid weight. Weight must be a positive number.';
    }
    return null;
};
