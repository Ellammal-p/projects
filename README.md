# AI-Based Depression Risk Analysis and Mental Wellness Support System

A comprehensive educational Django, Machine Learning, and Bootstrap web application designed to demonstrate PHQ-9 depression risk screening, ML risk classification, daily mood tracking, NLP journal sentiment analysis, and emergency mental health helpline integration.

---

## ⚠️ Important Educational & Medical Disclaimer

> **This application is strictly an educational project demonstration tool.**
> It **DOES NOT** provide clinical medical diagnosis, clinical treatment, or psychological therapy.
> 
> - **Standard Screening Tool**: Utilizes standard educational PHQ-9 (Patient Health Questionnaire-9) scoring framework (0–27).
> - **Language Compliance**: Results display screening indicators such as *"Your responses indicate a level of depressive symptoms that may be worth discussing with a qualified mental-health professional."* instead of diagnostic declarations like *"You have depression"*.
> - **Emergency Helplines**: Integrates 24/7 national and international helpline numbers (Tele-MANAS 14416 / 1800-599-0019, KIRAN 1800-599-0019, AASRA +91-9820466726, 988 Crisis Line) for immediate crisis support.

---

## 🚀 Key Features

1. **Modern Landing & Home Page**: Responsive Bootstrap 5 interface with hero section, project workflow diagram, safety disclaimers, feature overview, and call-to-action buttons.
2. **User Authentication & Privacy Isolation**: Django Auth system supporting registration, login, logout, profile management, and strict user-level data isolation.
3. **Interactive PHQ-9 Assessment Tool**: Structured 9-item questionnaire with dynamic progress tracking, card navigation, required validation, and automated score calculation (0–27).
4. **Machine Learning Pipeline (Scikit-Learn)**:
   - Trained offline on PHQ-9 item response distributions.
   - Evaluates **Logistic Regression**, **Random Forest**, **Decision Tree**, and **SVM** algorithms.
   - Saves model artifacts (`model.pkl` & `scaler.pkl`) for real-time inference without retraining on every web request.
5. **Assessment History & Analytics**: Visual score trajectory line graphs rendered via Chart.js along with detailed past assessment logs.
6. **Daily Mood Tracker**: Log daily mood levels (Very Low to Very Good) paired with reflections, tracked over time using dynamic Chart.js bar graphs.
7. **Private Journal with NLTK Sentiment Analysis**: NLP sentiment engine (NLTK VADER) that automatically evaluates journal entry text for Positive, Neutral, or Negative polarity scores.
8. **Mental Wellness Tips Library**: Categorized evidence-informed self-care recommendations (sleep, physical activity, social connection, mindfulness, micro-routines).
9. **Verified Helplines Directory**: Direct telephone links to official 24/7 mental health helplines.
10. **Django Admin Panel**: Full administrative interface for managing questions, support resources, and user records.

---

## 🛠️ Technology Stack

- **Backend Framework**: Python 3.11, Django 4.2
- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5, Bootstrap Icons
- **Data Visualization**: Chart.js
- **Machine Learning**: Scikit-Learn, Pandas, NumPy, Joblib
- **Natural Language Processing (NLP)**: NLTK (VADER SentimentIntensityAnalyzer)
- **Database**: SQLite (default zero-config) / MySQL (supported via PyMySQL & Environment Variables)

---

## 📁 System Architecture & Directory Structure

```
d:\mini_project\DEPRESSION\
├── manage.py                # Django CLI utility
├── seed_demo.py             # One-click demo database seeder
├── requirements.txt         # Dependency declarations
├── .env.example             # Environment variable template
├── .gitignore               # Git exclusion rules
├── README.md                # Project documentation
│
├── config/                  # Django project configuration (settings, urls, wsgi)
├── dataset/                 # PHQ-9 dataset generation script & CSV
├── ml_model/                # Model training, preprocessing & inference engine
├── accounts/                # Authentication, User Profiles, Dashboard views
├── assessment/              # Questionnaire, PHQ-9 scoring & ML integration
├── mood_tracker/            # Mood logger & analytics views
├── journal/                 # Private journal & NLTK sentiment analysis
├── wellness/                # Wellness tips library & crisis helplines
├── static/                  # Custom CSS (style.css), JS (main.js, charts.js)
└── templates/               # Modular Bootstrap 5 HTML templates
```

---

## ⚡ Quick Setup & Running on Windows (VS Code)

### Step 1: Open Terminal in VS Code & Navigate to Project Directory
```powershell
cd d:\mini_project\DEPRESSION
```

### Step 2: Create & Activate Virtual Environment
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```
*Note: If PowerShell script execution policy blocks activation, run commands directly using `.\.venv\Scripts\python.exe`.*

### Step 3: Install Required Dependencies
```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### Step 4: Train Machine Learning Model Pipeline
```powershell
.\.venv\Scripts\python.exe ml_model/train_model.py
```

### Step 5: Run Database Migrations & Initial Demo Seeding
```powershell
.\.venv\Scripts\python.exe manage.py makemigrations accounts assessment mood_tracker journal wellness
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe seed_demo.py
```

### Step 6: Start Django Local Development Server
```powershell
.\.venv\Scripts\python.exe manage.py runserver
```

Open your browser and navigate to: **[http://127.0.0.1:8000/](http://127.0.0.1:8000/)**

---

## 🔑 Pre-Configured Demo Superuser Credentials

- **Username**: `student`
- **Password**: `password123`

---

## 🗄️ MySQL Database Setup (Optional Presentation Mode)

To run the application with MySQL instead of SQLite:
1. Ensure MySQL Server (or XAMPP/WAMP MySQL) is running.
2. Create database in MySQL:
   ```sql
   CREATE DATABASE depression_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Copy `.env.example` to `.env` and configure:
   ```ini
   DB_ENGINE=mysql
   DB_NAME=depression_db
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_HOST=127.0.0.1
   DB_PORT=3306
   ```
4. Run migrations & seeding:
   ```powershell
   .\.venv\Scripts\python.exe manage.py migrate
   .\.venv\Scripts\python.exe seed_demo.py
   ```

---

## 🧪 Machine Learning Workflow & Dataset Information

1. **Dataset**: Synthetic PHQ-9 item response dataset (`dataset/phq9_depression_data.csv`) generated based on empirical item-response theory distributions.
2. **Preprocessing**: Feature vector extraction (`q1` through `q9`, `total_score`, `age`, `gender`) and standard scaling.
3. **Training & Evaluation**: Stratified 80/20 train-test split evaluating Accuracy, Precision, Recall, and F1-Score across Logistic Regression, Random Forest, Decision Tree, and SVM.
4. **Inference Flow**: `predict_risk()` loads `.pkl` artifacts and executes real-time prediction when a user submits an assessment.

---

## 🎓 College Expo Demonstration Sequence

1. **Landing Page (`/`)**: Explain problem statement, educational purpose, and system architecture.
2. **Login (`/accounts/login/`)**: Login with `student` / `password123`.
3. **Dashboard (`/accounts/dashboard/`)**: Review metric cards, latest screening score, current mood status, and Chart.js historical trend.
4. **Take Assessment (`/assessment/take/`)**: Demonstrate interactive PHQ-9 questionnaire and real-time progress bar.
5. **Result View (`/assessment/result/<id>/`)**: Show calculated score, ML prediction category, safety disclaimer, and recommended next steps.
6. **Mood Tracker (`/mood/`)**: Log daily mood and observe Chart.js bar chart updates.
7. **Private Journal (`/journal/`)**: Write a reflection entry and demonstrate automated NLTK VADER sentiment classification.
8. **Wellness Tips & Support (`/wellness/tips/`, `/wellness/support/`)**: Show self-care guidelines and verified crisis helplines.
