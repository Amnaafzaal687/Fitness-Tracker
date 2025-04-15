# 🏃‍♂️ FitStride - Your Personal Fitness Companion

## 📝 About
FitStride is an innovative fitness tracking platform that empowers users to take control of their health journey through comprehensive activity monitoring, goal setting, and progress tracking.

## ✨ Key Features

### 📊 Activity Tracking Hub
- **Step Tracking**
  - Daily/weekly milestone tracking

- **Calorie Management System**
  - Daily Calorie Count Record

- **Hydration Monitoring**
  - Customizable water intake goals
  - Drink logging

### 🎯 Goal Management System
- **Intelligent Goal Setting**
  - Progressive goal adaptation
  - Achievement tracking


### 🔄 Daily Routines
- **Activity Scheduling**
  - workout plans
  - Progress tracking
  

## 🛠 Technical Stack
- **Backend**: Node.js + Express.js
- **Database**: MySQL
- **Authentication**: JWT
- **API**: RESTful architecture

## ⚙️ Installation

1. **Clone Repository**
```bash
git clone https://github.com/your-username/FitStride.git
cd FitStride
```

2. **Environment Setup**
```bash
npm install
cp .env.example .env
```

3. **Database Configuration**
```bash
# Update .env with your database credentials
DB_HOST=localhost
DB_USER=your_username
DB_PASS=your_password
DB_NAME=fitstride_db
```

4. **Start Application**
```bash
npm run start
```

## 🔌 API Endpoints

### Activity Management
```
POST   /api/activities/log      - Log daily activities
GET    /api/activities/today    - Fetch today's summary
GET    /api/activities/history  - Get activity history
```

### Goal Management
```
POST   /api/goals              - Create new goal
GET    /api/goals/active       - Get active goals
PUT    /api/goals/:id         - Update goal progress
```

### User Management
```
POST   /api/users/register    - Register new user
POST   /api/users/login      - User login
GET    /api/users/profile    - Get user profile
```

## 🤝 Contributing
Contributions are welcome! Please read our contributing guidelines for details.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
