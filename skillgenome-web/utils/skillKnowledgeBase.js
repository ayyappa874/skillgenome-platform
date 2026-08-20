// ─── Skill-Specific Knowledge Base ──────────────────────────────────────────
// Real topics and real lesson content for popular skills.
// Each skill has 25 specific subtopics (5 days × 5 topics) with detailed lessons.

const SKILL_ROADMAPS = {
  // ═══════════════════════════════════════════════════════════════════════════
  // PYTHON DEVELOPER
  // ═══════════════════════════════════════════════════════════════════════════
  "Python Developer": [
    // Day 1 — Fresher
    { id:1, day:1, dayTitle:"Python Setup & Basics", level:"Fresher",
      subtopicTitle:"Installing Python & pip",
      subtopicDesc:"Download Python from python.org, set up pip package manager, and verify your installation works.",
      lesson:`WHAT IT IS:
Python is a programming language, and pip is Python's package manager that lets you install third-party libraries. Before you can write any Python code, you need both installed on your machine.

HOW IT WORKS:
1. Go to python.org/downloads and download the latest Python 3.x for your OS (Windows/Mac/Linux).
2. During Windows installation, CHECK the box "Add Python to PATH" — this is critical.
3. Open your terminal (Command Prompt on Windows, Terminal on Mac) and type: python --version
4. You should see something like "Python 3.12.1". If you get an error, Python is not on your PATH.
5. pip comes bundled with Python. Verify by typing: pip --version
6. Try installing a package: pip install requests — this downloads the "requests" library for making HTTP calls.

HOW IT HELPS:
Every Python project starts here. Without a working Python + pip setup, you cannot run scripts, install libraries like pandas or flask, or follow any tutorial. Companies expect you to set this up independently on Day 1 of any Python job.

KEY THINGS TO REMEMBER:
• Always check "Add to PATH" during installation — without this, your terminal won't find Python
• Use python3 and pip3 on Mac/Linux if python points to Python 2
• pip install <package> is how you add any third-party library
• python --version and pip --version are your two verification commands

PRACTICE TASK:
Install Python 3 on your computer. Open terminal and run: python --version, then pip --version. Then run: pip install requests. Finally, open Python by typing python, then type: import requests; print(requests.__version__) and hit Enter. If it prints a version number, your setup is complete.` },

    { id:2, day:1, dayTitle:"Python Setup & Basics", level:"Fresher",
      subtopicTitle:"Variables & Data Types",
      subtopicDesc:"Learn how Python stores data using variables, and understand the core types: int, float, str, bool, list, dict.",
      lesson:`WHAT IT IS:
Variables are named containers that hold data in your program. Data types tell Python what kind of data a variable holds — a number, text, true/false, or a collection.

HOW IT WORKS:
In Python, you don't need to declare types — Python figures it out automatically:

name = "Ayyappa"          # str (string — text)
age = 22                  # int (integer — whole number)
gpa = 8.5                 # float (decimal number)
is_student = True         # bool (boolean — True or False)
skills = ["Python", "SQL"] # list (ordered collection)
info = {"name": "Ayyappa", "age": 22}  # dict (key-value pairs)

You can check a variable's type with type():
print(type(name))   → <class 'str'>
print(type(age))    → <class 'int'>

You can convert between types:
str(age)    → "22"  (number to text)
int("42")   → 42    (text to number)
float(age)  → 22.0  (integer to decimal)

HOW IT HELPS:
Every single Python program uses variables and data types. Whether you're building a web app, analyzing data, or automating tasks — you're storing values in variables and operating on them. Understanding types prevents bugs like trying to add a number to a string.

KEY THINGS TO REMEMBER:
• Python is dynamically typed — you don't write "int x = 5", just "x = 5"
• Strings use quotes ("hello" or 'hello'), numbers don't
• Lists use [] and are ordered, dicts use {} and store key-value pairs
• Use type(variable) whenever you're unsure what type something is

PRACTICE TASK:
Open Python and create these variables: your name (str), your age (int), your height in meters (float), whether you're a student (bool), your top 3 skills (list), and your full info (dict with name, age, city). Print each one with its type using: print(variable, type(variable)).` },

    { id:3, day:1, dayTitle:"Python Setup & Basics", level:"Fresher",
      subtopicTitle:"Print, Input & Comments",
      subtopicDesc:"Use print() to display output, input() to get user data, and # comments to document your code.",
      lesson:`WHAT IT IS:
print() displays information on screen, input() asks the user to type something, and comments (#) are notes in your code that Python ignores. These three are the most basic tools for interacting with users and writing readable code.

HOW IT WORKS:
Printing:
print("Hello, World!")              # Simple text
print("Name:", name, "Age:", age)   # Multiple values
print(f"My name is {name}")         # f-string (formatted — best way)

Getting input:
user_name = input("What is your name? ")   # Always returns a string
user_age = int(input("Your age? "))         # Convert to int if needed

Comments:
# This is a single-line comment
x = 10  # This is an inline comment

# Multi-line comments use triple quotes:
"""
This function calculates
the total price with tax.
"""

HOW IT HELPS:
print() is your primary debugging tool — when something goes wrong, you print values to see what's happening. input() lets you build interactive programs. Comments make your code readable for yourself (in 3 months) and for your teammates.

KEY THINGS TO REMEMBER:
• f-strings (f"text {variable}") are the modern, preferred way to format output
• input() ALWAYS returns a string — wrap it in int() or float() for numbers
• Comment WHY you did something, not WHAT the code does (the code shows what)
• Use print() liberally when debugging — it's faster than any debugger for beginners

PRACTICE TASK:
Write a Python script that asks the user for their name, age, and favorite language. Then print a formatted sentence like: "Hi Ayyappa! You are 22 years old and love Python." Use f-strings. Add comments explaining each section of your code. Save it as intro.py and run it with: python intro.py` },

    { id:4, day:1, dayTitle:"Python Setup & Basics", level:"Fresher",
      subtopicTitle:"IDE Setup: VS Code",
      subtopicDesc:"Install VS Code, add the Python extension, and configure it for productive Python development.",
      lesson:`WHAT IT IS:
VS Code (Visual Studio Code) is a free, lightweight code editor by Microsoft. With the Python extension, it becomes a full Python development environment with autocomplete, debugging, linting, and integrated terminal.

HOW IT WORKS:
1. Download VS Code from code.visualstudio.com and install it.
2. Open VS Code → click the Extensions icon (left sidebar, looks like 4 squares).
3. Search "Python" → install the one by Microsoft (it has millions of downloads).
4. Create a new file: File → New File → save it as hello.py
5. Type: print("Hello from VS Code!")
6. Click the ▶ Run button (top-right) or press Ctrl+F5 to run.
7. The integrated terminal at the bottom shows your output.

Useful VS Code features for Python:
• IntelliSense: As you type, it suggests completions (press Tab to accept)
• Error underlines: Red/yellow squiggles show errors before you run
• Integrated terminal: Ctrl+\` opens terminal right inside VS Code
• Python interpreter selector: Bottom-left shows which Python version you're using

HOW IT HELPS:
Professional Python developers use VS Code or PyCharm. Writing Python in Notepad is possible but painfully slow — you get no autocomplete, no error detection, and no debugging tools. VS Code catches mistakes as you type and makes you 3-5x faster.

KEY THINGS TO REMEMBER:
• Always install the official Microsoft Python extension — it enables everything
• Check the Python interpreter (bottom-left) — make sure it points to your installed Python 3
• Use Ctrl+\` to toggle the terminal, Ctrl+Shift+P for the command palette
• Create a project folder and open it in VS Code (File → Open Folder) instead of opening individual files

PRACTICE TASK:
Install VS Code and the Python extension. Create a folder called "python_learning" on your Desktop. Open it in VS Code. Create a file called day1.py, write a program that prints your name and today's date (use: from datetime import date; print(date.today())). Run it using the ▶ button. Take a screenshot of your working setup.` },

    { id:5, day:1, dayTitle:"Python Setup & Basics", level:"Fresher",
      subtopicTitle:"Your First Python Script",
      subtopicDesc:"Write, save, and run a complete Python script that takes input, processes it, and displays formatted output.",
      lesson:`WHAT IT IS:
A Python script is a .py file containing Python code that you run from the terminal or IDE. Unlike typing in the Python shell line-by-line, a script runs all your code at once and can be saved, shared, and reused.

HOW IT WORKS:
Create a file called calculator.py with this code:

# Simple Calculator — Your First Script
print("=== Simple Calculator ===")

num1 = float(input("Enter first number: "))
operator = input("Enter operator (+, -, *, /): ")
num2 = float(input("Enter second number: "))

if operator == "+":
    result = num1 + num2
elif operator == "-":
    result = num1 - num2
elif operator == "*":
    result = num1 * num2
elif operator == "/":
    if num2 != 0:
        result = num1 / num2
    else:
        result = "Error: Cannot divide by zero"
else:
    result = "Error: Unknown operator"

print(f"Result: {num1} {operator} {num2} = {result}")

Run it: python calculator.py

HOW IT HELPS:
Every Python project — from data analysis to web apps — is a collection of .py scripts. Knowing how to structure a script, handle input, use conditionals (if/elif/else), and produce output is the absolute minimum skill for any Python role.

KEY THINGS TO REMEMBER:
• Save your file with .py extension — Python won't run .txt files
• Run from terminal with: python filename.py (not from inside the Python shell)
• Indentation matters in Python — use 4 spaces (VS Code does this automatically)
• if/elif/else blocks must end with a colon (:) and the next line must be indented

PRACTICE TASK:
Create a file called bmi.py that asks for a person's weight (kg) and height (m), calculates BMI (weight / height^2), and prints the category: Underweight (<18.5), Normal (18.5-24.9), Overweight (25-29.9), Obese (30+). Use if/elif/else. Run it and test with different inputs.` },

    // Day 2 — Beginner
    { id:6, day:2, dayTitle:"Core Python Concepts", level:"Beginner",
      subtopicTitle:"Lists, Tuples & Loops",
      subtopicDesc:"Master Python's list and tuple data structures, and iterate over them using for and while loops.",
      lesson:`WHAT IT IS:
Lists are ordered, changeable collections (use square brackets). Tuples are ordered but unchangeable (use parentheses). Loops let you repeat code for each item in a collection or while a condition is true.

HOW IT WORKS:
Lists:
fruits = ["apple", "banana", "mango"]
fruits.append("grape")       # Add to end
fruits.remove("banana")      # Remove by value
print(fruits[0])             # Access by index → "apple"
print(len(fruits))           # Length → 3

Tuples (immutable — cannot change after creation):
coordinates = (10, 20)
x, y = coordinates           # Unpacking

For loop:
for fruit in fruits:
    print(f"I like {fruit}")

# With index:
for i, fruit in enumerate(fruits):
    print(f"{i+1}. {fruit}")

While loop:
count = 0
while count < 5:
    print(count)
    count += 1

List comprehension (shortcut):
squares = [x**2 for x in range(10)]  # [0, 1, 4, 9, 16, ...]

HOW IT HELPS:
Almost every real program processes collections of data — lists of users, rows from a database, items in a cart. You need loops to process each item. List comprehensions are used heavily in data science and are a Python interview favourite.

KEY THINGS TO REMEMBER:
• Lists are mutable (changeable), tuples are immutable (fixed after creation)
• Use for loops when you know how many iterations; while loops when you don't
• enumerate() gives you both the index and value in a for loop
• List comprehensions are faster and more Pythonic than for loops for simple operations

PRACTICE TASK:
Create a list of 10 numbers. Using a for loop, print only the even numbers. Then create a new list using list comprehension that contains the squares of all odd numbers. Print both results.` },

    { id:7, day:2, dayTitle:"Core Python Concepts", level:"Beginner",
      subtopicTitle:"Functions & Parameters",
      subtopicDesc:"Define reusable functions with def, use parameters, return values, and understand scope.",
      lesson:`WHAT IT IS:
A function is a reusable block of code that performs a specific task. You define it once with def, then call it whenever you need it. Functions take inputs (parameters) and can return outputs.

HOW IT WORKS:
Basic function:
def greet(name):
    return f"Hello, {name}!"

print(greet("Ayyappa"))  # → "Hello, Ayyappa!"

Default parameters:
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(greet("Ayyappa"))            # → "Hello, Ayyappa!"
print(greet("Ayyappa", "Hey"))     # → "Hey, Ayyappa!"

Multiple return values:
def get_stats(numbers):
    return min(numbers), max(numbers), sum(numbers)/len(numbers)

low, high, avg = get_stats([10, 20, 30, 40])
print(f"Min: {low}, Max: {high}, Avg: {avg}")

*args and **kwargs:
def flexible(*args, **kwargs):
    print("Positional:", args)    # Tuple of unnamed args
    print("Keyword:", kwargs)     # Dict of named args

flexible(1, 2, 3, name="Ayyappa", age=22)

HOW IT HELPS:
Functions are the building blocks of all software. Without functions, you'd copy-paste the same code everywhere. In interviews, you're always asked to write functions. In real projects, every feature is a collection of functions that call each other.

KEY THINGS TO REMEMBER:
• Every function should do ONE thing well — keep them short and focused
• Always add a return statement — a function without return gives None
• Use descriptive names: calculate_tax() not ct() or func1()
• Variables inside a function are local — they don't exist outside it (scope)

PRACTICE TASK:
Write three functions: (1) calculate_area(length, width) that returns the area, (2) is_prime(n) that returns True if n is prime, (3) filter_names(names, min_length=3) that returns only names longer than min_length from a list. Test all three.` },

    { id:8, day:2, dayTitle:"Core Python Concepts", level:"Beginner",
      subtopicTitle:"Dictionaries & String Methods",
      subtopicDesc:"Work with key-value pairs using dictionaries, and process text using Python's built-in string methods.",
      lesson:`WHAT IT IS:
Dictionaries store data as key-value pairs (like a real dictionary: word → definition). String methods are built-in functions for manipulating text — splitting, joining, searching, replacing, formatting.

HOW IT WORKS:
Dictionaries:
student = {
    "name": "Ayyappa",
    "age": 22,
    "skills": ["Python", "SQL"],
    "active": True
}

print(student["name"])             # → "Ayyappa"
student["city"] = "Hyderabad"      # Add new key
student["age"] = 23                # Update value
del student["active"]              # Remove key

# Safe access (no error if key missing):
print(student.get("email", "N/A"))  # → "N/A"

# Loop through:
for key, value in student.items():
    print(f"{key}: {value}")

String methods:
text = "  Hello, World! Python is Great  "
text.strip()          # Remove whitespace → "Hello, World! Python is Great"
text.lower()          # → "hello, world! python is great"
text.upper()          # → "HELLO, WORLD! PYTHON IS GREAT"
text.split(",")       # → ["  Hello", " World! Python is Great  "]
text.replace("World", "Python")  # → "  Hello, Python! Python is Great  "
text.startswith("  He")  # → True
"Python" in text      # → True

HOW IT HELPS:
Dictionaries are everywhere in Python — API responses are JSON (which becomes dicts), database rows are dicts, configuration files become dicts. String methods are essential for cleaning data, parsing files, and processing user input.

KEY THINGS TO REMEMBER:
• Dict keys must be unique and immutable (strings, numbers, tuples — not lists)
• Use .get(key, default) instead of dict[key] to avoid KeyError crashes
• String methods return NEW strings — they don't modify the original
• f-strings (f"text {var}") are the most readable way to build strings

PRACTICE TASK:
Create a dictionary for a movie (title, director, year, genres list, rating). Write a function that takes the movie dict and returns a formatted string like: "The Dark Knight (2008) directed by Christopher Nolan - Rating: 9.0/10 - Genres: Action, Thriller". Use string methods and f-strings.` },

    { id:9, day:2, dayTitle:"Core Python Concepts", level:"Beginner",
      subtopicTitle:"File Reading & Writing",
      subtopicDesc:"Read data from text/CSV files and write output to files using Python's open() and the csv module.",
      lesson:`WHAT IT IS:
File I/O (Input/Output) lets your Python programs read data from files on disk and write results back. This is how you process datasets, save logs, generate reports, and persist data between program runs.

HOW IT WORKS:
Reading a text file:
with open("data.txt", "r") as f:
    content = f.read()           # Read entire file as one string
    # OR
    lines = f.readlines()       # Read as list of lines

# Line by line (memory efficient for large files):
with open("data.txt", "r") as f:
    for line in f:
        print(line.strip())      # strip() removes newline characters

Writing to a file:
with open("output.txt", "w") as f:    # "w" = write (overwrites)
    f.write("Line 1\\n")
    f.write("Line 2\\n")

with open("output.txt", "a") as f:    # "a" = append (adds to end)
    f.write("Line 3\\n")

CSV files:
import csv

# Reading CSV:
with open("students.csv", "r") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row["name"], row["grade"])

# Writing CSV:
with open("results.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["Name", "Score"])
    writer.writerow(["Ayyappa", 95])

HOW IT HELPS:
Real-world Python work almost always involves files — reading CSVs for data analysis, writing logs, processing JSON configs, generating reports. File I/O is used in every Python job role from backend dev to data science.

KEY THINGS TO REMEMBER:
• Always use "with open()" — it automatically closes the file even if an error occurs
• "r" = read, "w" = write (overwrites!), "a" = append, "r+" = read+write
• Use csv.DictReader for CSV files — it gives you column names as dictionary keys
• Always handle FileNotFoundError with try/except when reading files

PRACTICE TASK:
Create a text file called "contacts.csv" with columns: Name, Phone, Email. Add 5 contacts manually. Then write a Python script that reads this CSV, prints all contacts formatted nicely, and writes a filtered list (only contacts with @gmail.com emails) to a new file called "gmail_contacts.csv".` },

    { id:10, day:2, dayTitle:"Core Python Concepts", level:"Beginner",
      subtopicTitle:"Error Handling: try/except",
      subtopicDesc:"Handle runtime errors gracefully using try/except blocks instead of letting your program crash.",
      lesson:`WHAT IT IS:
Errors (exceptions) happen when Python encounters something it can't handle — dividing by zero, opening a missing file, converting invalid text to a number. try/except lets you catch these errors and respond gracefully instead of crashing.

HOW IT WORKS:
Basic try/except:
try:
    number = int(input("Enter a number: "))
    result = 100 / number
    print(f"Result: {result}")
except ValueError:
    print("That's not a valid number!")
except ZeroDivisionError:
    print("Cannot divide by zero!")
except Exception as e:
    print(f"Unexpected error: {e}")
finally:
    print("This always runs — cleanup code goes here")

Common exceptions:
• ValueError — wrong type of value (int("hello"))
• TypeError — wrong type in operation ("hello" + 5)
• KeyError — dict key doesn't exist
• FileNotFoundError — file doesn't exist
• IndexError — list index out of range
• ZeroDivisionError — dividing by zero

Real-world pattern:
def safe_divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return None

HOW IT HELPS:
Production Python code MUST handle errors. If your web app crashes because someone entered a letter instead of a number, that's unprofessional. Error handling is tested in every Python interview and is required in every real project.

KEY THINGS TO REMEMBER:
• Catch specific exceptions (ValueError, KeyError) — avoid bare "except:" which hides bugs
• The "finally" block always runs — use it for cleanup (closing files, connections)
• Use "except Exception as e:" to log the actual error message
• Don't use try/except to hide logic errors — fix the bug instead

PRACTICE TASK:
Write a program that asks the user for a filename and reads it. Handle FileNotFoundError (print "File not found"). Then ask for two numbers and divide them. Handle ValueError (non-numeric input) and ZeroDivisionError. Make sure the program never crashes no matter what the user types.` },

    // Day 3 — Intermediate
    { id:11, day:3, dayTitle:"Intermediate Python Skills", level:"Intermediate",
      subtopicTitle:"OOP: Classes & Objects",
      subtopicDesc:"Design and implement classes with attributes, methods, constructors, and inheritance in Python.",
      lesson:`WHAT IT IS:
Object-Oriented Programming (OOP) organizes code into classes (blueprints) and objects (instances of those blueprints). A class bundles data (attributes) and behavior (methods) together. This is how most real-world Python applications are structured.

HOW IT WORKS:
class Student:
    def __init__(self, name, age, grade):    # Constructor
        self.name = name
        self.age = age
        self.grade = grade
        self.courses = []                    # Default attribute

    def enroll(self, course):                # Method
        self.courses.append(course)
        print(f"{self.name} enrolled in {course}")

    def get_info(self):
        return f"{self.name} (Age: {self.age}, Grade: {self.grade})"

    def __str__(self):                       # String representation
        return self.get_info()

# Creating objects:
s1 = Student("Ayyappa", 22, "A")
s1.enroll("Python 101")
s1.enroll("Data Science")
print(s1)                                   # → "Ayyappa (Age: 22, Grade: A)"

Inheritance:
class GradStudent(Student):
    def __init__(self, name, age, grade, thesis):
        super().__init__(name, age, grade)   # Call parent constructor
        self.thesis = thesis

    def get_info(self):                      # Override parent method
        return f"{super().get_info()} — Thesis: {self.thesis}"

gs = GradStudent("Ravi", 25, "A+", "Machine Learning")
print(gs)

HOW IT HELPS:
Django, Flask, pandas, pygame — all major Python libraries use OOP. When you see pd.DataFrame() or request.get(), you're using objects. Job interviews for Python roles always include OOP questions. Understanding classes lets you read and contribute to any Python codebase.

KEY THINGS TO REMEMBER:
• __init__ is the constructor — called automatically when you create an object
• "self" refers to the current object — always the first parameter in methods
• Inheritance lets you extend existing classes without rewriting code
• Use __str__ so print(object) shows something meaningful instead of memory address

PRACTICE TASK:
Create a BankAccount class with: owner name, balance (default 0). Methods: deposit(amount), withdraw(amount) with insufficient funds check, get_balance(). Then create a SavingsAccount that inherits BankAccount and adds an interest_rate attribute and a method add_interest() that adds (balance * rate) to the balance. Test both.` },

    { id:12, day:3, dayTitle:"Intermediate Python Skills", level:"Intermediate",
      subtopicTitle:"Modules & Virtual Environments",
      subtopicDesc:"Organize code into modules, install packages with pip, and isolate projects using virtual environments.",
      lesson:`WHAT IT IS:
Modules are Python files (.py) that you import into other files to reuse code. Virtual environments (venv) are isolated Python installations for each project so packages from one project don't conflict with another.

HOW IT WORKS:
Creating modules:
# Save as utils.py:
def calculate_tax(amount, rate=0.18):
    return amount * rate

def format_currency(amount):
    return f"Rs. {amount:,.2f}"

# In main.py, use it:
from utils import calculate_tax, format_currency
tax = calculate_tax(10000)
print(format_currency(tax))    # → "Rs. 1,800.00"

Virtual environments:
# Create a virtual environment:
python -m venv myproject_env

# Activate it:
# Windows: myproject_env\\Scripts\\activate
# Mac/Linux: source myproject_env/bin/activate

# Your terminal shows (myproject_env) — you're inside!
# Now install packages — they stay in THIS environment only:
pip install pandas flask requests

# Save your dependencies:
pip freeze > requirements.txt

# Someone else can recreate your setup:
pip install -r requirements.txt

# Deactivate when done:
deactivate

HOW IT HELPS:
In real jobs, you work on multiple projects. Project A needs Django 3.2, Project B needs Django 4.1. Without virtual environments, they'd conflict. Every professional Python team uses venvs. Knowing this is expected in any Python interview.

KEY THINGS TO REMEMBER:
• Every project should have its own virtual environment — NEVER install packages globally
• Always create requirements.txt (pip freeze > requirements.txt) so others can recreate your setup
• Activate the venv before installing packages or running your project
• Use relative imports within your project, absolute imports for installed packages

PRACTICE TASK:
Create a new project folder. Create a virtual environment inside it. Activate it. Install pandas and requests. Run pip freeze > requirements.txt. Create a utils.py with 2 helper functions. Create main.py that imports from utils.py and uses pandas to create a simple DataFrame. Verify everything works.` },

    { id:13, day:3, dayTitle:"Intermediate Python Skills", level:"Intermediate",
      subtopicTitle:"Working with APIs",
      subtopicDesc:"Make HTTP requests to REST APIs using the requests library, handle JSON responses, and process API data.",
      lesson:`WHAT IT IS:
APIs (Application Programming Interfaces) let your Python program talk to external services — weather data, stock prices, GitHub repos, payment gateways. The requests library is Python's most popular tool for making HTTP calls to APIs.

HOW IT WORKS:
Install: pip install requests

GET request (retrieve data):
import requests

response = requests.get("https://api.github.com/users/python")
print(response.status_code)        # 200 = success
data = response.json()             # Parse JSON to Python dict
print(data["name"])                 # → "Python"
print(data["public_repos"])        # → number of repos

With parameters:
params = {"q": "python", "sort": "stars"}
response = requests.get("https://api.github.com/search/repositories", params=params)
repos = response.json()["items"]
for repo in repos[:5]:
    print(f"{repo['name']} — {repo['stargazers_count']} stars")

POST request (send data):
data = {"title": "My Post", "body": "Content here", "userId": 1}
response = requests.post("https://jsonplaceholder.typicode.com/posts", json=data)
print(response.json())

Error handling:
response = requests.get(url, timeout=10)
response.raise_for_status()        # Raises exception for 4xx/5xx errors

HOW IT HELPS:
Modern applications are API-driven. A mobile app talks to a backend API. A data pipeline pulls data from APIs. Even AI features call APIs (like the Gemini API this app uses). Knowing APIs is essential for backend, data, and full-stack Python roles.

KEY THINGS TO REMEMBER:
• Always check response.status_code — 200 is success, 4xx is client error, 5xx is server error
• Use response.json() to convert JSON responses to Python dicts/lists
• Set timeout= to prevent hanging on slow APIs
• Many APIs require an API key — pass it in headers: {"Authorization": "Bearer YOUR_KEY"}

PRACTICE TASK:
Write a script that calls the GitHub API to search for repositories with the topic "machine-learning", sorted by stars. Print the top 10 results showing: name, stars, language, and description. Handle network errors with try/except.` },

    { id:14, day:3, dayTitle:"Intermediate Python Skills", level:"Intermediate",
      subtopicTitle:"List Comprehensions & Lambda",
      subtopicDesc:"Write concise data transformations using list/dict comprehensions, lambda functions, map(), and filter().",
      lesson:`WHAT IT IS:
List comprehensions are a Python shorthand for creating lists from loops in a single line. Lambda functions are small anonymous (unnamed) functions. map() and filter() apply functions to collections. These are the tools that make Python code concise and "Pythonic."

HOW IT WORKS:
List comprehension:
# Instead of:
squares = []
for x in range(10):
    squares.append(x ** 2)

# Write:
squares = [x ** 2 for x in range(10)]

# With condition:
even_squares = [x ** 2 for x in range(10) if x % 2 == 0]
# → [0, 4, 16, 36, 64]

Dict comprehension:
word_lengths = {word: len(word) for word in ["Python", "Java", "Go"]}
# → {"Python": 6, "Java": 4, "Go": 2}

Lambda functions:
# Named function:
def double(x): return x * 2

# Same as lambda:
double = lambda x: x * 2

# Useful for sorting:
students = [("Ayyappa", 85), ("Ravi", 92), ("Priya", 78)]
students.sort(key=lambda s: s[1], reverse=True)
# Sorted by score descending

map() and filter():
numbers = [1, 2, 3, 4, 5]
doubled = list(map(lambda x: x * 2, numbers))       # [2, 4, 6, 8, 10]
evens = list(filter(lambda x: x % 2 == 0, numbers)) # [2, 4]

HOW IT HELPS:
List comprehensions are the #1 "Pythonic" coding pattern — interviewers love them. In data science, you process data with comprehensions constantly. Lambda + map/filter are used in pandas, Django querysets, and functional programming patterns.

KEY THINGS TO REMEMBER:
• List comprehensions are faster than equivalent for loops (Python optimizes them internally)
• Use comprehensions for simple transformations, regular loops for complex logic
• Lambda functions should be one-liners — use def for anything more complex
• Prefer list comprehensions over map()/filter() — they're more readable in most cases

PRACTICE TASK:
Given a list of dictionaries: [{"name": "A", "score": 85}, {"name": "B", "score": 42}, ...] — (1) Use list comprehension to get names of students who scored above 50. (2) Use dict comprehension to create {name: "Pass"/"Fail"} based on score >= 50. (3) Use sorted() with lambda to sort by score descending.` },

    { id:15, day:3, dayTitle:"Intermediate Python Skills", level:"Intermediate",
      subtopicTitle:"Exception Classes & Logging",
      subtopicDesc:"Create custom exception classes and use Python's logging module instead of print() for production-quality output.",
      lesson:`WHAT IT IS:
Custom exceptions let you define your own error types specific to your application (like InsufficientFundsError for a banking app). The logging module provides structured output with levels (DEBUG, INFO, WARNING, ERROR) instead of scattered print() statements.

HOW IT WORKS:
Custom exceptions:
class InsufficientFundsError(Exception):
    def __init__(self, balance, amount):
        self.balance = balance
        self.amount = amount
        super().__init__(f"Cannot withdraw {amount}. Balance: {balance}")

class InvalidInputError(Exception):
    pass

# Usage:
def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientFundsError(balance, amount)
    return balance - amount

try:
    new_balance = withdraw(100, 500)
except InsufficientFundsError as e:
    print(f"Error: {e}")

Logging:
import logging

# Configure once at the top of your app:
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(message)s",
    filename="app.log"
)

logger = logging.getLogger(__name__)

logger.debug("Variable x = 42")         # Detailed debugging info
logger.info("User logged in")            # General events
logger.warning("Disk space low")         # Something to watch
logger.error("Database connection failed") # Something went wrong
logger.critical("System crashed!")        # Fatal error

HOW IT HELPS:
In production, you can't use print() — you need structured logs that go to files, can be filtered by severity, and include timestamps. Custom exceptions make your error handling clear and specific. Both are requirements in any professional Python codebase.

KEY THINGS TO REMEMBER:
• Custom exceptions should inherit from Exception (or a more specific built-in exception)
• Use logging.getLogger(__name__) in each module — it tracks which file produced the log
• Set logging level to INFO in production, DEBUG during development
• Never use print() for error reporting in production code — always use logging

PRACTICE TASK:
Create a simple banking module with custom exceptions: InsufficientFundsError, NegativeAmountError, AccountNotFoundError. Add logging that records every deposit, withdrawal, and error. Test it by making various transactions and check the generated .log file.` },

    // Day 4 — Advanced
    { id:16, day:4, dayTitle:"Advanced Python Patterns", level:"Advanced",
      subtopicTitle:"Decorators & Generators",
      subtopicDesc:"Write Python decorators to modify function behavior and generators for memory-efficient data processing.",
      lesson:`WHAT IT IS:
Decorators are functions that wrap other functions to add behavior (like logging, timing, or authentication) without modifying the original code. Generators are functions that yield values one at a time instead of building an entire list in memory.

HOW IT WORKS:
Decorators:
import time

def timer(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        elapsed = time.time() - start
        print(f"{func.__name__} took {elapsed:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(1)
    return "Done!"

slow_function()  # Prints: "slow_function took 1.0012s"

Generators:
def fibonacci(limit):
    a, b = 0, 1
    while a < limit:
        yield a           # Yields one value, pauses, resumes next call
        a, b = b, a + b

# Memory efficient — doesn't create a list of millions:
for num in fibonacci(1000000):
    if num > 100:
        break
    print(num)

# Generator expression (like list comprehension but lazy):
squares = (x**2 for x in range(1000000))  # Uses almost no memory
print(next(squares))   # 0
print(next(squares))   # 1

HOW IT HELPS:
Flask/Django use decorators everywhere (@app.route, @login_required). Generators are critical for processing large datasets, streaming data, and building data pipelines that don't run out of memory. Senior Python interviews always test both.

KEY THINGS TO REMEMBER:
• Decorators modify behavior WITHOUT changing the decorated function's code
• @decorator_name is syntactic sugar for: function = decorator_name(function)
• Generators use yield instead of return — they're lazy (compute on demand)
• Use generators when processing large data that doesn't fit in memory

PRACTICE TASK:
Write a @retry(max_attempts=3) decorator that retries a function up to 3 times if it raises an exception. Write a generator that reads a large CSV file line by line (without loading it all into memory) and yields each row as a dictionary. Test both.` },

    { id:17, day:4, dayTitle:"Advanced Python Patterns", level:"Advanced",
      subtopicTitle:"Database Operations with SQLite",
      subtopicDesc:"Connect to databases, create tables, insert/query/update data using Python's built-in sqlite3 module.",
      lesson:`WHAT IT IS:
SQLite is a lightweight database that comes built into Python — no server installation needed. The sqlite3 module lets you create databases, run SQL queries, and manage data directly from Python. It's perfect for learning SQL and for small-to-medium applications.

HOW IT WORKS:
import sqlite3

# Connect (creates file if it doesn't exist):
conn = sqlite3.connect("students.db")
cursor = conn.cursor()

# Create table:
cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER,
        grade REAL,
        enrolled_date TEXT DEFAULT CURRENT_DATE
    )
""")

# Insert data:
cursor.execute("INSERT INTO students (name, age, grade) VALUES (?, ?, ?)",
               ("Ayyappa", 22, 8.5))

# Insert multiple:
students = [("Ravi", 23, 7.8), ("Priya", 21, 9.1), ("Kiran", 24, 8.0)]
cursor.executemany("INSERT INTO students (name, age, grade) VALUES (?, ?, ?)", students)

# Query:
cursor.execute("SELECT * FROM students WHERE grade > ?", (8.0,))
for row in cursor.fetchall():
    print(row)

# Update:
cursor.execute("UPDATE students SET grade = ? WHERE name = ?", (9.5, "Ayyappa"))

# Delete:
cursor.execute("DELETE FROM students WHERE age > ?", (23,))

conn.commit()   # Save changes
conn.close()    # Close connection

HOW IT HELPS:
Every application needs a database. Learning sqlite3 teaches you SQL + Python database patterns that transfer directly to PostgreSQL, MySQL, and ORMs like SQLAlchemy. This is tested in backend Python interviews and required for any data-driven application.

KEY THINGS TO REMEMBER:
• ALWAYS use parameterized queries (?, ?) — NEVER put variables directly in SQL strings (SQL injection risk)
• Call conn.commit() after INSERT/UPDATE/DELETE — without it, changes are lost
• Use "with conn:" context manager for automatic commit/rollback
• sqlite3 is built-in — no pip install needed

PRACTICE TASK:
Create a todo.db database with a tasks table (id, title, description, priority, completed boolean, created_date). Write functions: add_task(), get_all_tasks(), get_pending_tasks(), mark_complete(id), delete_task(id). Build a simple command-line todo app that uses these functions.` },

    { id:18, day:4, dayTitle:"Advanced Python Patterns", level:"Advanced",
      subtopicTitle:"Unit Testing with pytest",
      subtopicDesc:"Write automated tests for your Python code using pytest to catch bugs before they reach production.",
      lesson:`WHAT IT IS:
pytest is Python's most popular testing framework. Unit tests are small, automated tests that verify individual functions work correctly. You write tests once, run them automatically, and they catch bugs every time you change code.

HOW IT WORKS:
Install: pip install pytest

# Your code (calculator.py):
def add(a, b):
    return a + b

def divide(a, b):
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b

# Your tests (test_calculator.py):
import pytest
from calculator import add, divide

def test_add_positive():
    assert add(2, 3) == 5

def test_add_negative():
    assert add(-1, -1) == -2

def test_add_zero():
    assert add(0, 0) == 0

def test_divide_normal():
    assert divide(10, 2) == 5.0

def test_divide_by_zero():
    with pytest.raises(ValueError):
        divide(10, 0)

# Run: pytest test_calculator.py -v
# Output shows which tests passed/failed

Fixtures (setup shared data):
@pytest.fixture
def sample_students():
    return [
        {"name": "A", "score": 85},
        {"name": "B", "score": 42},
    ]

def test_passing_students(sample_students):
    passing = [s for s in sample_students if s["score"] >= 50]
    assert len(passing) == 1

HOW IT HELPS:
Companies require tests. Pull requests without tests get rejected. Tests let you refactor code confidently — if tests pass, your changes didn't break anything. pytest is the standard in Python industry and appears in every senior Python job description.

KEY THINGS TO REMEMBER:
• Test files must start with test_ and test functions must start with test_
• assert is your main tool — assert expected == actual
• Use pytest.raises() to test that exceptions are raised correctly
• Run pytest -v for verbose output, pytest --cov for code coverage

PRACTICE TASK:
Take your BankAccount class from Day 3. Write at least 8 tests: test deposit, test withdrawal, test insufficient funds, test negative amounts, test balance after multiple operations, test interest calculation. Run with pytest -v and get all tests passing.` },

    { id:19, day:4, dayTitle:"Advanced Python Patterns", level:"Advanced",
      subtopicTitle:"Web Scraping with BeautifulSoup",
      subtopicDesc:"Extract data from websites using requests and BeautifulSoup to parse HTML and collect structured information.",
      lesson:`WHAT IT IS:
Web scraping is automatically extracting data from websites. You download a webpage's HTML with requests, then use BeautifulSoup to parse and search through the HTML to find the data you need — prices, titles, links, tables, etc.

HOW IT WORKS:
Install: pip install beautifulsoup4 requests

import requests
from bs4 import BeautifulSoup

# Download the page:
url = "https://quotes.toscrape.com/"
response = requests.get(url)
soup = BeautifulSoup(response.text, "html.parser")

# Find elements:
title = soup.find("title").text              # Page title
quotes = soup.find_all("div", class_="quote") # All quote divs

for quote in quotes:
    text = quote.find("span", class_="text").text
    author = quote.find("small", class_="author").text
    tags = [tag.text for tag in quote.find_all("a", class_="tag")]
    print(f'"{text}" — {author}')
    print(f"  Tags: {', '.join(tags)}")

# Extract all links:
links = soup.find_all("a")
for link in links:
    href = link.get("href")
    print(href)

# Scrape a table:
table = soup.find("table")
rows = table.find_all("tr")
for row in rows:
    cells = [cell.text.strip() for cell in row.find_all(["th", "td"])]
    print(cells)

HOW IT HELPS:
Web scraping is used for price monitoring, research data collection, lead generation, market analysis, and building datasets for machine learning. It's a highly valued skill in data science and automation roles.

KEY THINGS TO REMEMBER:
• Always check a website's robots.txt and terms of service before scraping
• Use soup.find() for one element, soup.find_all() for multiple
• Add delays between requests (time.sleep()) to avoid overwhelming servers
• For JavaScript-heavy sites, you may need Selenium instead of requests

PRACTICE TASK:
Scrape the first 3 pages of https://quotes.toscrape.com/ (follow the "Next" link). Collect all quotes with their authors and tags. Save the results to a CSV file with columns: Quote, Author, Tags. Print the total count of quotes collected.` },

    { id:20, day:4, dayTitle:"Advanced Python Patterns", level:"Advanced",
      subtopicTitle:"Flask Web App Basics",
      subtopicDesc:"Build a simple web application with routes, templates, and form handling using the Flask microframework.",
      lesson:`WHAT IT IS:
Flask is a lightweight Python web framework for building web applications. It lets you create web pages, API endpoints, handle forms, and serve dynamic content — all in Python. It's simpler than Django and perfect for learning web development.

HOW IT WORKS:
Install: pip install flask

# app.py — minimal Flask app:
from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

tasks = []

@app.route("/")
def home():
    return render_template("index.html", tasks=tasks)

@app.route("/add", methods=["POST"])
def add_task():
    task = request.form.get("task")
    if task:
        tasks.append({"title": task, "done": False})
    return redirect(url_for("home"))

@app.route("/api/tasks")
def api_tasks():
    return {"tasks": tasks}        # Automatic JSON response

if __name__ == "__main__":
    app.run(debug=True)

# templates/index.html:
<h1>My Tasks</h1>
<form action="/add" method="POST">
    <input name="task" placeholder="New task...">
    <button>Add</button>
</form>
{% for task in tasks %}
    <p>{{ task.title }}</p>
{% endfor %}

Run: python app.py → visit http://127.0.0.1:5000

HOW IT HELPS:
Flask is used by Netflix, Reddit, Airbnb, and LinkedIn. It's the most popular Python web framework for startups and microservices. Knowing Flask opens doors to full-stack Python jobs and lets you build portfolio projects that run in the browser.

KEY THINGS TO REMEMBER:
• @app.route() defines URL paths — each route is a Python function
• Templates go in a templates/ folder — Flask uses Jinja2 for {{ variables }}
• Use debug=True during development for auto-reload and error pages
• For production, use gunicorn or waitress instead of app.run()

PRACTICE TASK:
Build a Flask contact book: (1) Home page listing all contacts, (2) Form to add new contacts (name, phone, email), (3) Delete button for each contact, (4) An API endpoint /api/contacts that returns JSON. Run it and test all features in your browser.` },

    // Day 5 — Proficient
    { id:21, day:5, dayTitle:"Production Python", level:"Proficient",
      subtopicTitle:"Project Structure & Packaging",
      subtopicDesc:"Organize a Python project with proper directory structure, setup.py/pyproject.toml, and installable packages.",
      lesson:`WHAT IT IS:
A well-structured Python project follows conventions that make it easy to navigate, test, deploy, and collaborate on. This includes standard directory layouts, configuration files, and packaging so others can install your code with pip.

HOW IT WORKS:
Standard project structure:
my_project/
├── src/
│   └── my_project/
│       ├── __init__.py
│       ├── core.py
│       ├── utils.py
│       └── models.py
├── tests/
│   ├── __init__.py
│   ├── test_core.py
│   └── test_utils.py
├── docs/
│   └── README.md
├── requirements.txt
├── pyproject.toml
├── setup.py
├── .gitignore
└── README.md

pyproject.toml (modern way):
[project]
name = "my-project"
version = "1.0.0"
description = "A Python project"
requires-python = ">=3.8"
dependencies = ["requests>=2.28", "flask>=2.3"]

[project.scripts]
my-cli = "my_project.cli:main"

.gitignore essentials:
__pycache__/
*.pyc
.env
venv/
*.egg-info/

HOW IT HELPS:
When you join a company, their Python codebases follow this structure. If your portfolio projects are messy single files, it signals junior-level work. Professional structure is the first thing senior developers and hiring managers look at.

KEY THINGS TO REMEMBER:
• Every Python package directory must have an __init__.py file (can be empty)
• Put source code in src/, tests in tests/, docs in docs/
• Use pyproject.toml (modern) over setup.py (legacy) for new projects
• requirements.txt is for application dependencies, pyproject.toml is for library packaging

PRACTICE TASK:
Restructure one of your previous projects (calculator, todo app, or Flask app) into the standard project structure. Add pyproject.toml, requirements.txt, .gitignore, and README.md. Make sure it still runs after restructuring. Push it to GitHub.` },

    { id:22, day:5, dayTitle:"Production Python", level:"Proficient",
      subtopicTitle:"Git & GitHub Workflow",
      subtopicDesc:"Use Git for version control: branching, committing, pull requests, and collaborating on GitHub.",
      lesson:`WHAT IT IS:
Git tracks changes to your code over time. GitHub hosts your Git repositories online. Together, they enable collaboration, code review, and version management. Every software job requires Git proficiency — it's non-negotiable.

HOW IT WORKS:
# Initial setup:
git init                           # Start tracking a project
git add .                          # Stage all changes
git commit -m "Initial commit"     # Save a snapshot

# Connect to GitHub:
git remote add origin https://github.com/you/repo.git
git push -u origin main            # Upload to GitHub

# Branching workflow:
git checkout -b feature/user-auth  # Create & switch to new branch
# ... make changes ...
git add .
git commit -m "Add user authentication"
git push origin feature/user-auth  # Push branch to GitHub
# → Create Pull Request on GitHub → Get code review → Merge

# Keeping up to date:
git checkout main
git pull origin main               # Get latest changes
git checkout feature/my-branch
git merge main                     # Merge main into your branch

# Common commands:
git status                         # See what's changed
git log --oneline -10              # Last 10 commits
git diff                           # See uncommitted changes
git stash                          # Temporarily save changes
git stash pop                      # Restore stashed changes

HOW IT HELPS:
Git is used by 95%+ of software teams worldwide. Not knowing Git means you cannot collaborate with any team. GitHub profiles are your public developer portfolio — recruiters check them. Every interview includes questions about Git workflow.

KEY THINGS TO REMEMBER:
• Commit often with clear messages: "Add user login endpoint" not "fix stuff"
• Never commit secrets (API keys, passwords) — use .env files + .gitignore
• Use branches for features — never commit directly to main in a team
• Write a good README.md — it's the first thing people see on your GitHub

PRACTICE TASK:
Create a GitHub account (if you don't have one). Initialize a Git repo for your best Python project. Push it to GitHub. Create a branch, make a change, push it, create a Pull Request on GitHub, and merge it. Your GitHub profile is now your portfolio.` },

    { id:23, day:5, dayTitle:"Production Python", level:"Proficient",
      subtopicTitle:"Python Interview Questions",
      subtopicDesc:"Master the most commonly asked Python interview questions covering data structures, algorithms, and language features.",
      lesson:`WHAT IT IS:
Python interviews test your understanding of language fundamentals, problem-solving ability, and coding proficiency. Knowing the top 20 most-asked questions and their optimal solutions gives you a major advantage.

HOW IT WORKS:
Top frequently asked questions and answers:

Q1: What's the difference between a list and a tuple?
A: Lists are mutable (changeable), tuples are immutable (fixed). Tuples are faster and can be used as dict keys. Use tuples for fixed data, lists for collections that change.

Q2: What are *args and **kwargs?
A: *args collects extra positional arguments as a tuple. **kwargs collects extra keyword arguments as a dict. They let functions accept any number of arguments.

Q3: What's a list comprehension? Give an example.
A: A concise way to create lists: [x**2 for x in range(10) if x % 2 == 0] creates squares of even numbers.

Q4: Explain Python's GIL.
A: The Global Interpreter Lock prevents multiple threads from executing Python code simultaneously. Use multiprocessing (not threading) for CPU-bound tasks.

Q5: What's the difference between == and "is"?
A: == checks value equality, "is" checks identity (same object in memory). Always use == for comparisons, except for None: use "x is None".

Q6: How does garbage collection work in Python?
A: Python uses reference counting + cyclic garbage collector. Objects are freed when their reference count hits zero.

Q7: What are decorators?
A: Functions that wrap other functions to add behavior. @staticmethod, @classmethod, and custom decorators like @timer are common.

Q8: Explain mutable vs immutable.
A: Mutable objects can be changed in-place (list, dict, set). Immutable objects cannot (str, int, tuple, frozenset).

HOW IT HELPS:
Preparing for these questions directly increases your interview success rate. Companies like Google, Amazon, and Infosys ask these exact questions. Practising the coding answers also deepens your actual understanding of Python.

KEY THINGS TO REMEMBER:
• Practice coding answers by hand — don't just read them
• Explain your thought process out loud during interviews
• Know time complexity (Big O) for common operations (list append is O(1), list insert is O(n))
• Have 2-3 projects ready to discuss in detail when asked "tell me about a project"

PRACTICE TASK:
Write code answers for these 5 questions: (1) Reverse a string without [::-1], (2) Find duplicates in a list, (3) Merge two sorted lists, (4) Check if a string is a palindrome, (5) Find the second-largest number in a list. Time yourself — aim for under 5 minutes each.` },

    { id:24, day:5, dayTitle:"Production Python", level:"Proficient",
      subtopicTitle:"Building a Portfolio Project",
      subtopicDesc:"Design and build a complete, deployable Python project that demonstrates your full range of skills to employers.",
      lesson:`WHAT IT IS:
A portfolio project is a polished, real-world application that showcases your Python skills to employers. It should use multiple concepts you've learned (OOP, APIs, databases, testing, Flask) and be hosted on GitHub with a clear README.

HOW IT WORKS:
Portfolio project ideas (pick one that matches your target role):

1. CLI Expense Tracker: SQLite database, CRUD operations, CSV export, charts with matplotlib
2. Weather Dashboard (Flask): API integration, templates, caching, responsive design
3. Web Scraper + Dashboard: Automated data collection, pandas analysis, Flask visualization
4. REST API: Flask + SQLite CRUD API with authentication, error handling, tests
5. Data Pipeline: Read CSV → clean with pandas → analyze → generate PDF report

Project checklist:
□ Clean project structure (src/, tests/, docs/)
□ requirements.txt and README.md
□ At least 10 unit tests with pytest
□ Error handling (no raw crashes)
□ Git history with meaningful commits
□ Hosted on GitHub with screenshots in README
□ .env for secrets (API keys, database URLs)
□ Docstrings for all public functions

README template:
# Project Name
Short description of what it does.

## Screenshots
[Include 2-3 screenshots]

## Features
- Feature 1
- Feature 2

## Tech Stack
Python 3.12, Flask, SQLite, pytest

## Installation
git clone ...
pip install -r requirements.txt
python app.py

## Usage
[How to use the app]

HOW IT HELPS:
Employers hire based on proof, not promises. A polished GitHub project proves you can build real software. Many candidates only have tutorial code — a real portfolio project puts you ahead of 80% of applicants.

KEY THINGS TO REMEMBER:
• Quality over quantity — one excellent project beats five mediocre ones
• Include screenshots/GIFs in your README — recruiters are visual
• Write tests — it shows you think about code quality
• Deploy it somewhere (Render, Railway, PythonAnywhere) so people can try it live

PRACTICE TASK:
Choose one portfolio project idea from the list. Build it over the next 3-4 days using everything you've learned. Push to GitHub with a professional README including screenshots. Share the GitHub link on your LinkedIn profile.` },

    { id:25, day:5, dayTitle:"Production Python", level:"Proficient",
      subtopicTitle:"Deploying Python Apps",
      subtopicDesc:"Deploy your Python application to the cloud so anyone can access it — using Render, Railway, or PythonAnywhere.",
      lesson:`WHAT IT IS:
Deployment means putting your Python app on a server so it's accessible via the internet — not just running on your laptop. Free platforms like Render, Railway, and PythonAnywhere let you deploy Flask apps, APIs, and scripts without paying.

HOW IT WORKS:
Option 1 — PythonAnywhere (simplest):
1. Sign up at pythonanywhere.com (free tier)
2. Go to "Web" tab → "Add a new web app" → Choose Flask
3. Upload your code files or clone from GitHub
4. Set the WSGI config to point to your Flask app
5. Click "Reload" → Your app is live at yourusername.pythonanywhere.com

Option 2 — Render (modern):
1. Push your code to GitHub
2. Add a requirements.txt and a Procfile:
   web: gunicorn app:app
3. Sign up at render.com → New Web Service → Connect GitHub repo
4. Render auto-detects Python, installs deps, starts your app
5. Your app is live at your-app.onrender.com

Option 3 — Docker (professional):
# Dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:8000"]

# Build and run:
docker build -t myapp .
docker run -p 8000:8000 myapp

Environment variables for secrets:
import os
API_KEY = os.environ.get("API_KEY")
DATABASE_URL = os.environ.get("DATABASE_URL")
# Set these in the hosting platform's dashboard — NEVER hardcode secrets

HOW IT HELPS:
A deployed app is dramatically more impressive than one that only runs locally. You can share a live link on your resume. Recruiters can click it and see your work instantly. Deployment skills are required for DevOps, backend, and full-stack roles.

KEY THINGS TO REMEMBER:
• Use gunicorn (not app.run()) for production — Flask's dev server is not production-ready
• Store secrets in environment variables — never in your code
• requirements.txt must include ALL dependencies — test with a fresh pip install
• Add a health check endpoint: @app.route("/health") returning {"status": "ok"}

PRACTICE TASK:
Deploy your portfolio project to PythonAnywhere or Render (both have free tiers). Verify it works by visiting the URL from your phone. Add the live URL to your GitHub README and LinkedIn profile.` },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA ANALYST
  // ═══════════════════════════════════════════════════════════════════════════
  "Data Analyst": [
    { id:1, day:1, dayTitle:"Data Analyst Foundations", level:"Fresher",
      subtopicTitle:"What Data Analysts Do",
      subtopicDesc:"Understand the role of a Data Analyst: collecting, cleaning, analyzing data, and presenting insights to stakeholders.",
      lesson:`WHAT IT IS:
A Data Analyst transforms raw data into meaningful insights that help businesses make better decisions. They collect data from databases, clean it (fix errors, fill gaps), analyze patterns, and present findings through charts and reports.

HOW IT WORKS:
The daily workflow of a data analyst:
1. COLLECT — Pull data from databases (SQL), spreadsheets, APIs, or CSV files
2. CLEAN — Handle missing values, fix formatting, remove duplicates, standardize data
3. ANALYZE — Find patterns, trends, correlations using statistical methods
4. VISUALIZE — Create charts, dashboards (Tableau, Power BI) to show findings
5. COMMUNICATE — Present insights to managers/executives with clear recommendations

Example: A retail company wants to know why sales dropped in Q3.
- You query the sales database for Q2 vs Q3 data
- Clean the data (remove test orders, fix date formats)
- Analyze: Sales dropped 15% in the South region, driven by out-of-stock items
- Create a dashboard showing the trend by region and product category
- Present: "We recommend increasing inventory in the South by 20% for Q4"

Tools you'll use:
• SQL — for getting data from databases
• Excel/Google Sheets — for quick analysis and sharing
• Python (pandas) — for complex data manipulation
• Tableau or Power BI — for interactive dashboards
• Statistics — for understanding distributions, correlations, significance

HOW IT HELPS:
Data Analyst is one of the fastest-growing careers globally. Average salary: $65,000-$95,000 (US), 6-15 LPA (India). Companies in every industry — tech, healthcare, finance, retail — hire data analysts. It's an excellent entry point into data science.

KEY THINGS TO REMEMBER:
• Data analysts answer BUSINESS questions with data — not just run queries
• Communication is 50% of the job — you must explain findings to non-technical people
• SQL is the #1 most important skill — every data analyst job requires it
• Start with Excel + SQL, then add Python + Tableau for career growth

PRACTICE TASK:
Go to Glassdoor or LinkedIn and find 10 Data Analyst job postings. List the top 10 skills mentioned most frequently. Compare your current skills to this list and identify your top 3 gaps. This is your learning priority roadmap.` },

    { id:2, day:1, dayTitle:"Data Analyst Foundations", level:"Fresher",
      subtopicTitle:"Excel for Data Analysis",
      subtopicDesc:"Master essential Excel functions (VLOOKUP, SUMIFS, Pivot Tables) that every data analyst uses daily.",
      lesson:`WHAT IT IS:
Excel is still the most widely used data tool in business. As a data analyst, you'll use Excel for quick analyses, sharing results with non-technical colleagues, and building simple models. Pivot Tables and lookup functions are used in literally every data team.

HOW IT WORKS:
Essential formulas:
=VLOOKUP(lookup_value, table, col_index, FALSE)
→ Find a value in one table and pull matching data from another column

=SUMIFS(sum_range, criteria_range1, criteria1, ...)
→ Sum values that meet multiple conditions (e.g., total sales for Region="South" AND Month="June")

=COUNTIFS(range1, criteria1, range2, criteria2)
→ Count rows matching multiple conditions

=IF(condition, true_result, false_result)
→ Conditional logic: =IF(A2>50, "Pass", "Fail")

=INDEX(range, MATCH(value, lookup_range, 0))
→ More flexible version of VLOOKUP (works left-to-right AND right-to-left)

Pivot Tables:
1. Select your data → Insert → Pivot Table
2. Drag fields: Region to Rows, Product to Columns, Revenue to Values
3. Instantly see revenue by region and product — no formulas needed
4. Add filters, sort by highest revenue, change aggregation (sum/avg/count)
5. Create a Pivot Chart for instant visualization

HOW IT HELPS:
In interviews, you'll be asked to analyze a dataset in Excel. At work, managers often ask for "a quick analysis" — Excel is fastest for this. Knowing Pivot Tables alone makes you useful on Day 1 of any data analyst job.

KEY THINGS TO REMEMBER:
• VLOOKUP's last parameter should almost always be FALSE (exact match)
• Pivot Tables are the fastest way to summarize large datasets — learn them deeply
• Use Ctrl+T to convert data to a Table — formulas auto-expand when you add rows
• Conditional Formatting highlights patterns visually (heat maps, top/bottom values)

PRACTICE TASK:
Download a sample sales dataset (search "sample sales data CSV" online). Open it in Excel. Create a Pivot Table showing total revenue by Region and Product Category. Use SUMIFS to calculate total revenue for the top region. Create a chart from the Pivot Table. Save and screenshot your work.` },

    { id:3, day:1, dayTitle:"Data Analyst Foundations", level:"Fresher",
      subtopicTitle:"SQL Basics: SELECT & WHERE",
      subtopicDesc:"Write your first SQL queries to retrieve and filter data from relational databases using SELECT, WHERE, and ORDER BY.",
      lesson:`WHAT IT IS:
SQL (Structured Query Language) is the language for talking to databases. Every data analyst job requires SQL. SELECT retrieves data, WHERE filters it, and ORDER BY sorts it. These three commands handle 60% of all data analyst SQL work.

HOW IT WORKS:
-- Get all columns from a table:
SELECT * FROM employees;

-- Get specific columns:
SELECT name, department, salary FROM employees;

-- Filter with WHERE:
SELECT name, salary FROM employees
WHERE department = 'Engineering'
AND salary > 80000;

-- Comparison operators:
WHERE age >= 25                    -- Greater than or equal
WHERE city != 'Mumbai'             -- Not equal
WHERE name LIKE 'A%'               -- Starts with A
WHERE salary BETWEEN 50000 AND 100000  -- Range
WHERE department IN ('Sales', 'Marketing')  -- Multiple values
WHERE email IS NOT NULL             -- Not empty

-- Sort results:
SELECT name, salary FROM employees
ORDER BY salary DESC               -- Highest salary first
LIMIT 10;                          -- Only top 10

-- Combine conditions:
SELECT * FROM orders
WHERE status = 'completed'
AND order_date >= '2024-01-01'
AND total_amount > 1000
ORDER BY order_date DESC;

HOW IT HELPS:
SQL is the #1 required skill in data analyst job postings worldwide. Before you can analyze data, you need to GET the data — and that means SQL. Whether the data is in PostgreSQL, MySQL, Snowflake, or BigQuery, the SQL syntax is nearly identical.

KEY THINGS TO REMEMBER:
• SQL is case-insensitive but convention is UPPERCASE for keywords (SELECT, WHERE)
• Use single quotes for text values: WHERE city = 'Delhi' (not double quotes)
• LIKE with % is for pattern matching: LIKE '%kumar' finds names ending in "kumar"
• Always include ORDER BY when you care about result order — databases don't guarantee order

PRACTICE TASK:
Go to sqliteviewer.app or sqlfiddle.com. Create an employees table with 10 rows. Write queries to: (1) Find all employees in Engineering, (2) Find employees earning more than the average salary, (3) List the top 5 highest-paid employees, (4) Find employees whose name starts with 'S' or 'A'. Save your queries.` },

    { id:4, day:1, dayTitle:"Data Analyst Foundations", level:"Fresher",
      subtopicTitle:"Data Types & Data Quality",
      subtopicDesc:"Understand different data types (numeric, categorical, datetime) and how to identify and fix common data quality issues.",
      lesson:`WHAT IT IS:
Data types define what kind of values a column holds. Data quality refers to the accuracy, completeness, and consistency of your data. A data analyst spends 60-80% of their time cleaning data — fixing types, handling missing values, and removing errors.

HOW IT WORKS:
Data Types:
• Numeric: Integer (age: 22), Float (price: 29.99) — for calculations
• Categorical: Text categories (department: "Sales") — for grouping
• DateTime: Dates and times (order_date: "2024-03-15") — for trends
• Boolean: True/False (is_active: True) — for filtering
• Text: Free-form text (comments: "Great product") — for text analysis

Common Data Quality Issues:
1. Missing values: Empty cells, NaN, NULL
   Fix: Fill with mean/median, drop rows, or mark as "Unknown"

2. Duplicates: Same row appears multiple times
   Fix: Identify with GROUP BY + HAVING COUNT(*) > 1, then remove

3. Wrong data types: Numbers stored as text ("123" instead of 123)
   Fix: Convert types (CAST in SQL, astype() in pandas)

4. Inconsistent formats: "Mumbai", "mumbai", "MUMBAI" for same city
   Fix: Standardize with UPPER(), LOWER(), TRIM()

5. Outliers: A salary of $999,999,999 (likely a data entry error)
   Fix: Use IQR or z-score to identify, then investigate

Data Quality Checklist:
□ Check for NULL values in every column
□ Check data types match expectations
□ Look for duplicates
□ Verify ranges (no negative ages, no future dates)
□ Check categorical values for inconsistencies

HOW IT HELPS:
"Garbage in, garbage out" — if your data is dirty, your analysis is wrong. Hiring managers specifically test data quality skills in interviews. A data analyst who can clean messy data is worth far more than one who can only query clean data.

KEY THINGS TO REMEMBER:
• Always check data quality BEFORE doing any analysis
• NULL != 0 — NULL means "unknown", 0 means "zero" — very different meanings
• Document every cleaning step so it's reproducible
• Use profiling tools (pandas describe(), SQL COUNT DISTINCT) to understand your data first

PRACTICE TASK:
Download any messy dataset from Kaggle (search "dirty data" or "data cleaning"). Identify at least 5 data quality issues. Document each issue and your fix. Clean the data using Excel or SQL. Compare row counts before and after cleaning.` },

    { id:5, day:1, dayTitle:"Data Analyst Foundations", level:"Fresher",
      subtopicTitle:"Statistics Basics for Analysts",
      subtopicDesc:"Learn mean, median, mode, standard deviation, and percentiles — the statistical foundations every analyst needs.",
      lesson:`WHAT IT IS:
Descriptive statistics summarize data so you can understand it at a glance. As a data analyst, you'll use these measures constantly to answer questions like "What's the average order value?" or "Is this month's performance unusual?"

HOW IT WORKS:
Central Tendency (Where is the "center"?):
• Mean (Average): Sum of all values / count. Sensitive to outliers.
  Salaries: [30K, 40K, 45K, 50K, 500K] → Mean = 133K (misleading!)
  
• Median: Middle value when sorted. Robust to outliers.
  Same salaries → Median = 45K (much more representative!)
  
• Mode: Most frequent value. Useful for categorical data.
  Departments: [Sales, Sales, Engineering, HR, Sales] → Mode = Sales

Spread (How spread out is the data?):
• Range: Max - Min. Simple but affected by outliers.
• Standard Deviation: Average distance from the mean. Low = clustered, High = spread out.
  Test scores: [88, 90, 92, 91, 89] → Low std dev (consistent)
  Test scores: [40, 60, 80, 95, 100] → High std dev (variable)

• Percentiles: P25 = 25% of data is below this value
  P50 = Median, P75, P90, P99 are commonly used
  "Our app's P95 response time is 200ms" = 95% of requests are faster than 200ms

Distributions:
• Normal distribution: Bell curve — most data near the mean
• Skewed right: Long tail to the right (like income — many low, few very high)
• Skewed left: Long tail to the left (like test scores when test is easy)

HOW IT HELPS:
Every business report uses these statistics. "Our average customer spends $47" or "Revenue is 2 standard deviations above last quarter" are statements you'll make weekly. Without statistics, you can't tell if a number is normal or alarming.

KEY THINGS TO REMEMBER:
• Use median instead of mean when data has outliers (income, prices, response times)
• Standard deviation tells you what's "normal" — values beyond 2 std devs are unusual
• Correlation does NOT mean causation — ice cream sales and drownings are correlated (both rise in summer) but one doesn't cause the other
• Always visualize data (histogram, box plot) before calculating statistics

PRACTICE TASK:
Take any dataset with numeric columns (e.g., house prices, employee salaries). Calculate mean, median, mode, and standard deviation for 2 numeric columns. Create a histogram for each. Identify if the distribution is normal, skewed right, or skewed left. Write a 3-sentence summary of your findings.` },

    // Day 2-5 for Data Analyst...
    { id:6, day:2, dayTitle:"SQL & Data Querying", level:"Beginner", subtopicTitle:"SQL JOINs & Relationships", subtopicDesc:"Combine data from multiple tables using INNER JOIN, LEFT JOIN, and understand foreign key relationships.",
      lesson: `WHAT IT IS:\nJOINs combine rows from two or more tables based on a related column (usually a foreign key). This is how you connect customers to their orders, employees to their departments, or students to their grades.\n\nHOW IT WORKS:\n-- INNER JOIN: Only matching rows from both tables\nSELECT orders.id, customers.name, orders.total\nFROM orders\nINNER JOIN customers ON orders.customer_id = customers.id;\n\n-- LEFT JOIN: All rows from left table + matching from right (NULL if no match)\nSELECT customers.name, orders.total\nFROM customers\nLEFT JOIN orders ON customers.id = orders.customer_id;\n-- Shows ALL customers, even those with no orders (total = NULL)\n\n-- Multiple JOINs:\nSELECT e.name, d.department_name, m.name AS manager\nFROM employees e\nJOIN departments d ON e.dept_id = d.id\nLEFT JOIN employees m ON e.manager_id = m.id;\n\nHOW IT HELPS:\nReal databases have 10-100+ tables. Data is NEVER in one table. Every analysis requires JOINs. SQL JOIN questions appear in 90%+ of data analyst interviews.\n\nKEY THINGS TO REMEMBER:\n• INNER JOIN = only matches, LEFT JOIN = everything from left table\n• Always specify the ON condition clearly — wrong JOINs create duplicate rows\n• Use table aliases (e, d, m) for readability in complex queries\n• If your result has more rows than expected, you probably have a many-to-many JOIN issue\n\nPRACTICE TASK:\nCreate two tables: customers (id, name, city) and orders (id, customer_id, product, amount, date). Insert 5 customers and 8 orders (some customers with multiple orders, one customer with no orders). Write: (1) INNER JOIN showing customer name + order details, (2) LEFT JOIN showing ALL customers including those with no orders, (3) Total spend per customer using JOIN + GROUP BY.` },

    { id:7, day:2, dayTitle:"SQL & Data Querying", level:"Beginner", subtopicTitle:"GROUP BY & Aggregations", subtopicDesc:"Summarize data using GROUP BY with COUNT, SUM, AVG, MIN, MAX and filter groups with HAVING.",
      lesson: `WHAT IT IS:\nGROUP BY groups rows that have the same values and lets you calculate aggregate statistics for each group — total sales per region, average salary per department, count of orders per customer.\n\nHOW IT WORKS:\n-- Count employees per department:\nSELECT department, COUNT(*) AS employee_count\nFROM employees\nGROUP BY department;\n\n-- Total and average salary per department:\nSELECT department, \n       SUM(salary) AS total_salary,\n       AVG(salary) AS avg_salary,\n       MAX(salary) AS max_salary\nFROM employees\nGROUP BY department\nORDER BY avg_salary DESC;\n\n-- Filter groups with HAVING (WHERE filters rows, HAVING filters groups):\nSELECT department, COUNT(*) AS emp_count\nFROM employees\nGROUP BY department\nHAVING COUNT(*) > 5;  -- Only departments with more than 5 employees\n\n-- Complex example:\nSELECT customer_id, \n       COUNT(*) AS order_count,\n       SUM(amount) AS total_spent,\n       AVG(amount) AS avg_order\nFROM orders\nWHERE status = 'completed'\nGROUP BY customer_id\nHAVING SUM(amount) > 1000\nORDER BY total_spent DESC\nLIMIT 10;\n\nHOW IT HELPS:\nEvery business dashboard is GROUP BY under the hood. "Revenue by month", "Users by country", "Average rating by product" — all GROUP BY queries. This is the single most-tested SQL concept in data analyst interviews.\n\nKEY THINGS TO REMEMBER:\n• Every non-aggregated column in SELECT must be in GROUP BY\n• WHERE filters rows BEFORE grouping, HAVING filters groups AFTER\n• Use aliases (AS total_spent) to make results readable\n• ORDER BY comes after GROUP BY and HAVING\n\nPRACTICE TASK:\nUsing a sales table with columns (id, product, category, region, amount, sale_date): Write queries to find (1) total revenue per category, (2) number of sales per region, (3) average sale amount by month, (4) top 5 products by total revenue, (5) categories with revenue over $10,000.` },

    { id:8, day:2, dayTitle:"SQL & Data Querying", level:"Beginner", subtopicTitle:"Python pandas Basics", subtopicDesc:"Load, explore, and manipulate DataFrames using pandas — the core Python library for data analysis.",
      lesson: `WHAT IT IS:\npandas is Python's #1 data analysis library. A DataFrame is a table (like an Excel sheet or SQL table) that you manipulate with Python code. pandas lets you do everything SQL and Excel can do, plus much more — all programmatically.\n\nHOW IT WORKS:\nimport pandas as pd\n\n# Load data:\ndf = pd.read_csv("sales.csv")\ndf = pd.read_excel("data.xlsx")\n\n# Explore:\ndf.head()          # First 5 rows\ndf.shape           # (rows, columns)\ndf.dtypes          # Column types\ndf.describe()      # Statistics for numeric columns\ndf.info()          # Column names, types, non-null counts\ndf.isnull().sum()  # Missing values per column\n\n# Select:\ndf["name"]                              # One column\ndf[["name", "salary"]]                  # Multiple columns\ndf[df["salary"] > 50000]                # Filter rows\ndf[(df["dept"] == "Sales") & (df["age"] > 25)]  # Multiple conditions\n\n# Modify:\ndf["bonus"] = df["salary"] * 0.10       # New column\ndf["name"] = df["name"].str.upper()     # Transform\ndf = df.drop_duplicates()               # Remove duplicates\ndf = df.fillna(0)                       # Fill missing values\n\n# Aggregate:\ndf.groupby("department")["salary"].mean()\ndf.groupby(["region", "category"])["revenue"].sum()\n\n# Save:\ndf.to_csv("clean_data.csv", index=False)\n\nHOW IT HELPS:\npandas is used by Netflix, Spotify, NASA, and every data team worldwide. It handles data too complex for Excel and is more flexible than SQL for transformations. It's a required skill in 80%+ of data analyst job postings.\n\nKEY THINGS TO REMEMBER:\n• Always start with df.head(), df.shape, df.info() to understand your data\n• Use df[condition] for filtering — put & (and) and | (or) in parentheses\n• groupby() is the pandas equivalent of SQL GROUP BY\n• df.to_csv(index=False) prevents an extra unnamed index column in your output\n\nPRACTICE TASK:\nDownload a CSV dataset from Kaggle. Load it with pandas. Check shape, dtypes, and missing values. Filter to a subset of interest. Create a new calculated column. Use groupby to find averages by category. Save the clean result to a new CSV.` },

    { id:9, day:2, dayTitle:"SQL & Data Querying", level:"Beginner", subtopicTitle:"Data Visualization Basics", subtopicDesc:"Create charts and graphs using matplotlib and seaborn to visualize trends, distributions, and comparisons.",
      lesson: `WHAT IT IS:\nData visualization turns numbers into pictures — charts, graphs, and plots that reveal patterns invisible in raw data. matplotlib is Python's base plotting library, seaborn makes statistical plots beautiful with less code.\n\nHOW IT WORKS:\nimport matplotlib.pyplot as plt\nimport seaborn as sns\nimport pandas as pd\n\ndf = pd.read_csv("sales.csv")\n\n# Line chart (trends over time):\nplt.figure(figsize=(10, 6))\nplt.plot(df["month"], df["revenue"])\nplt.title("Monthly Revenue")\nplt.xlabel("Month")\nplt.ylabel("Revenue ($)")\nplt.savefig("revenue_trend.png")\nplt.show()\n\n# Bar chart (comparisons):\ndf.groupby("region")["revenue"].sum().plot(kind="bar")\nplt.title("Revenue by Region")\nplt.show()\n\n# Histogram (distribution):\nplt.hist(df["age"], bins=20, edgecolor="black")\nplt.title("Age Distribution")\nplt.show()\n\n# Seaborn (prettier + statistical):\nsns.set_style("whitegrid")\nsns.boxplot(x="department", y="salary", data=df)\nplt.title("Salary by Department")\nplt.show()\n\n# Scatter plot (relationships):\nsns.scatterplot(x="experience", y="salary", hue="department", data=df)\nplt.show()\n\nHOW IT HELPS:\nA chart communicates findings 10x faster than a table. Executives want dashboards, not spreadsheets. Data visualization is a core deliverable in every data analyst role — you'll create charts daily.\n\nKEY THINGS TO REMEMBER:\n• Choose the right chart: Line = trends, Bar = comparisons, Histogram = distribution, Scatter = relationships\n• Always add titles, axis labels, and legends — unlabeled charts are useless\n• Use seaborn for statistical plots (box, violin, heatmap) — it's cleaner than matplotlib\n• plt.savefig() saves charts as images for reports and presentations\n\nPRACTICE TASK:\nUsing a dataset of your choice, create 4 different charts: (1) Line chart showing a trend over time, (2) Bar chart comparing categories, (3) Histogram of a numeric column, (4) Scatter plot showing relationship between two numeric columns. Add titles and labels to all. Save each as a PNG file.` },

    { id:10, day:2, dayTitle:"SQL & Data Querying", level:"Beginner", subtopicTitle:"Cleaning Data with pandas", subtopicDesc:"Handle missing values, fix data types, remove duplicates, and standardize text using pandas data cleaning methods.",
      lesson: `WHAT IT IS:\nData cleaning is fixing messy, incomplete, or inconsistent data so it's ready for analysis. Real-world data is NEVER clean — it has missing values, wrong types, duplicates, and formatting inconsistencies. pandas has built-in methods for all of these.\n\nHOW IT WORKS:\nimport pandas as pd\ndf = pd.read_csv("messy_data.csv")\n\n# 1. Check problems:\ndf.isnull().sum()          # Missing values per column\ndf.duplicated().sum()      # Number of duplicate rows\ndf.dtypes                  # Check data types\n\n# 2. Handle missing values:\ndf["age"].fillna(df["age"].median(), inplace=True)  # Fill with median\ndf["city"].fillna("Unknown", inplace=True)          # Fill with default\ndf.dropna(subset=["email"], inplace=True)           # Drop rows without email\n\n# 3. Fix data types:\ndf["date"] = pd.to_datetime(df["date"])             # String to datetime\ndf["price"] = df["price"].str.replace("$","").astype(float)  # "$29.99" → 29.99\ndf["zip_code"] = df["zip_code"].astype(str)         # Number to string\n\n# 4. Remove duplicates:\ndf = df.drop_duplicates()                           # Exact duplicates\ndf = df.drop_duplicates(subset=["email"])            # Based on specific column\n\n# 5. Standardize text:\ndf["city"] = df["city"].str.strip().str.title()     # " mumbai " → "Mumbai"\ndf["email"] = df["email"].str.lower()                # Lowercase emails\n\n# 6. Handle outliers:\nQ1, Q3 = df["salary"].quantile([0.25, 0.75])\nIQR = Q3 - Q1\ndf = df[(df["salary"] >= Q1 - 1.5*IQR) & (df["salary"] <= Q3 + 1.5*IQR)]\n\nHOW IT HELPS:\nData analysts spend 60-80% of their time cleaning data. This is where the real work happens. Anyone can query clean data — the skill is turning messy data into clean data. This is heavily tested in interviews with practical exercises.\n\nKEY THINGS TO REMEMBER:\n• Always explore data FIRST (head, info, describe, isnull) before cleaning\n• fillna() for keeping rows, dropna() for removing them — choose based on context\n• pd.to_datetime() is essential — raw date strings are useless for time analysis\n• Document every cleaning step — your team needs to know what you changed and why\n\nPRACTICE TASK:\nDownload a messy dataset from Kaggle (search "data cleaning"). Check for: missing values, duplicates, wrong types, inconsistent text. Apply all 6 cleaning techniques above. Compare df.shape before and after. Export the clean dataset. Write a summary of what you cleaned and why.` },

    // Days 3-5 abbreviated for Data Analyst
    { id:11, day:3, dayTitle:"Intermediate Analysis", level:"Intermediate", subtopicTitle:"SQL Window Functions", subtopicDesc:"Use ROW_NUMBER, RANK, LAG, LEAD, and running totals with OVER() for advanced analytical queries.", lesson: "WHAT IT IS:\nWindow functions perform calculations across rows related to the current row without collapsing them into groups (unlike GROUP BY). They're the most powerful SQL feature for analytics.\n\nHOW IT WORKS:\n-- Rank employees by salary within each department:\nSELECT name, department, salary,\n       RANK() OVER (PARTITION BY department ORDER BY salary DESC) as dept_rank\nFROM employees;\n\n-- Running total:\nSELECT date, revenue,\n       SUM(revenue) OVER (ORDER BY date) as running_total\nFROM daily_sales;\n\n-- Compare to previous row:\nSELECT month, revenue,\n       LAG(revenue, 1) OVER (ORDER BY month) as prev_month,\n       revenue - LAG(revenue, 1) OVER (ORDER BY month) as growth\nFROM monthly_sales;\n\n-- Top 3 products per category:\nSELECT * FROM (\n  SELECT product, category, revenue,\n         ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC) as rn\n  FROM products\n) WHERE rn <= 3;\n\nHOW IT HELPS:\nWindow functions solve problems that are extremely difficult with basic SQL. Month-over-month growth, rankings, running totals, and percentiles all use window functions. They're tested in every senior data analyst interview.\n\nKEY THINGS TO REMEMBER:\n• PARTITION BY is like GROUP BY for window functions — it defines the groups\n• ORDER BY inside OVER() determines the row order for the calculation\n• ROW_NUMBER gives unique ranks, RANK gives ties the same number\n• LAG looks at previous rows, LEAD looks at next rows\n\nPRACTICE TASK:\nUsing a sales table, write: (1) Rank products by revenue within each category, (2) Calculate month-over-month revenue growth percentage using LAG, (3) Running total of revenue by date, (4) Find the top 3 customers by spend using ROW_NUMBER." },
    { id:12, day:3, dayTitle:"Intermediate Analysis", level:"Intermediate", subtopicTitle:"pandas Merging & Reshaping", subtopicDesc:"Merge DataFrames with merge/join, reshape data with pivot_table and melt for complex multi-table analysis.", lesson: "WHAT IT IS:\nReal analysis needs data from multiple sources. merge() combines DataFrames (like SQL JOINs). pivot_table() reshapes data from long to wide format. melt() does the reverse. These are essential for creating the exact data shape your analysis needs.\n\nHOW IT WORKS:\nimport pandas as pd\n\n# Merge (like SQL JOIN):\ncustomers = pd.DataFrame({\"id\": [1,2,3], \"name\": [\"A\",\"B\",\"C\"]})\norders = pd.DataFrame({\"customer_id\": [1,1,2], \"amount\": [100,200,150]})\n\nresult = customers.merge(orders, left_on=\"id\", right_on=\"customer_id\", how=\"left\")\n\n# Pivot table:\nsales = pd.DataFrame({\n    \"region\": [\"N\",\"N\",\"S\",\"S\"], \n    \"product\": [\"A\",\"B\",\"A\",\"B\"],\n    \"revenue\": [100,200,150,250]\n})\npivot = sales.pivot_table(values=\"revenue\", index=\"region\", columns=\"product\", aggfunc=\"sum\")\n\n# Melt (wide to long):\nlong = pivot.reset_index().melt(id_vars=\"region\", var_name=\"product\", value_name=\"revenue\")\n\nHOW IT HELPS:\nMost analyses require combining 2-5 data sources. Dashboards need pivoted data. Reports need specific shapes. Knowing merge + pivot + melt lets you transform any data into any shape.\n\nPRACTICE TASK:\nCreate two DataFrames (students and scores). Merge them. Create a pivot table showing average score by subject and grade level. Melt it back to long format." },
    { id:13, day:3, dayTitle:"Intermediate Analysis", level:"Intermediate", subtopicTitle:"Tableau/Power BI Dashboards", subtopicDesc:"Build interactive dashboards with filters, drill-downs, and KPI cards using Tableau Public or Power BI Desktop.", lesson: "WHAT IT IS:\nTableau and Power BI are visual analytics tools that let you create interactive dashboards WITHOUT coding. You drag and drop fields to create charts, add filters for interactivity, and share dashboards with stakeholders. Both are free (Tableau Public, Power BI Desktop).\n\nHOW IT WORKS:\nTableau Public (free):\n1. Download from public.tableau.com\n2. Connect to your CSV/Excel data\n3. Drag \"Region\" to Columns, \"Revenue\" to Rows → instant bar chart\n4. Drag \"Date\" to Columns → line chart over time\n5. Add a filter: Drag \"Category\" to Filters → users can toggle\n6. Create a Dashboard: Combine multiple sheets + add title + legend\n7. Publish to Tableau Public → shareable link\n\nDashboard best practices:\n• Start with KPI cards at the top (Total Revenue, Customer Count, Growth %)\n• Add 2-3 charts below (trend line, bar comparison, geographic map)\n• Use consistent colors across all charts\n• Add filters (date range, category, region) for interactivity\n• Keep it to one screen — no scrolling\n\nHOW IT HELPS:\nExecutives don't read SQL queries or Python scripts — they look at dashboards. Tableau/Power BI skills are required in 70%+ of data analyst job postings. A portfolio of interactive dashboards is the fastest way to land a data analyst job.\n\nPRACTICE TASK:\nDownload Tableau Public. Load the sample Superstore dataset (included with Tableau). Create a dashboard with: (1) KPI cards for Total Sales, Profit, and Order Count, (2) Line chart of monthly sales trend, (3) Bar chart of sales by region, (4) Filter by year and category. Publish to your Tableau Public profile." },
    { id:14, day:3, dayTitle:"Intermediate Analysis", level:"Intermediate", subtopicTitle:"Statistical Analysis in Python", subtopicDesc:"Perform correlation analysis, hypothesis testing, and A/B test evaluation using scipy and statsmodels.", lesson: "WHAT IT IS:\nStatistical analysis goes beyond describing data — it tests whether patterns are real or just random noise. Correlation measures relationships between variables. Hypothesis testing determines if results are statistically significant.\n\nHOW IT WORKS:\nimport pandas as pd\nimport scipy.stats as stats\n\ndf = pd.read_csv(\"data.csv\")\n\n# Correlation:\ncorr = df[\"advertising_spend\"].corr(df[\"sales\"])\nprint(f\"Correlation: {corr:.2f}\")  # 0.85 = strong positive\n\n# Correlation matrix:\nprint(df[[\"spend\", \"sales\", \"customers\"]].corr())\n\n# T-test (compare two groups):\ngroup_a = df[df[\"variant\"]==\"A\"][\"conversion_rate\"]\ngroup_b = df[df[\"variant\"]==\"B\"][\"conversion_rate\"]\nt_stat, p_value = stats.ttest_ind(group_a, group_b)\nprint(f\"p-value: {p_value:.4f}\")\nif p_value < 0.05:\n    print(\"Statistically significant difference!\")\n\nHOW IT HELPS:\nBusinesses run A/B tests constantly. \"Did the new homepage increase signups?\" requires a t-test. \"Does advertising spend predict sales?\" requires correlation. Statistical literacy separates data analysts from Excel users.\n\nPRACTICE TASK:\nGenerate synthetic A/B test data (200 users per group with conversion rates). Calculate the mean conversion for each group. Run a t-test. Determine if the difference is statistically significant (p < 0.05). Write a one-paragraph business recommendation." },
    { id:15, day:3, dayTitle:"Intermediate Analysis", level:"Intermediate", subtopicTitle:"Exploratory Data Analysis (EDA)", subtopicDesc:"Conduct a systematic exploratory analysis combining statistics, visualizations, and domain knowledge to find insights.", lesson: "WHAT IT IS:\nEDA is the detective phase of data analysis — you systematically explore your data to discover patterns, anomalies, and relationships BEFORE building models or finalizing reports. It combines statistics, visualization, and curiosity.\n\nHOW IT WORKS:\nA structured EDA workflow:\n\n1. OVERVIEW: df.shape, df.info(), df.describe()\n2. UNIVARIATE: Histogram/boxplot for each numeric column, value_counts for categorical\n3. BIVARIATE: Correlation heatmap, scatter plots for key variable pairs\n4. TEMPORAL: Time series plots for date columns\n5. SEGMENTED: Group by key categories and compare distributions\n\nimport seaborn as sns\n\n# Correlation heatmap:\nsns.heatmap(df.corr(), annot=True, cmap=\"coolwarm\")\n\n# Pairplot (all combinations):\nsns.pairplot(df, hue=\"category\")\n\n# Distribution by group:\nsns.boxplot(x=\"region\", y=\"revenue\", data=df)\n\nHOW IT HELPS:\nEDA is step 1 of EVERY data project. Skipping it leads to wrong conclusions. A thorough EDA often reveals the most valuable insights — sometimes the analysis IS the EDA.\n\nPRACTICE TASK:\nPick any Kaggle dataset. Perform a complete EDA: overview, univariate analysis (3 histograms), bivariate analysis (correlation heatmap + 2 scatter plots), and segmented analysis (boxplots by category). Write 5 key findings." },

    { id:16, day:4, dayTitle:"Advanced Analytics", level:"Advanced", subtopicTitle:"SQL Subqueries & CTEs", subtopicDesc:"Write complex analytical queries using subqueries, Common Table Expressions (WITH clause), and CASE statements.", lesson: "WHAT IT IS:\nSubqueries are queries inside queries. CTEs (Common Table Expressions) use the WITH clause to create named temporary result sets, making complex queries readable. CASE adds if-then-else logic to SQL. Together, these handle the most complex business questions.\n\nHOW IT WORKS:\n-- Subquery:\nSELECT name, salary FROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees);\n\n-- CTE:\nWITH monthly_revenue AS (\n  SELECT DATE_TRUNC('month', date) as month, SUM(amount) as revenue\n  FROM orders GROUP BY 1\n),\nmonthly_growth AS (\n  SELECT month, revenue,\n         LAG(revenue) OVER (ORDER BY month) as prev_revenue,\n         ROUND((revenue - LAG(revenue) OVER (ORDER BY month)) / \n               LAG(revenue) OVER (ORDER BY month) * 100, 1) as growth_pct\n  FROM monthly_revenue\n)\nSELECT * FROM monthly_growth WHERE growth_pct IS NOT NULL;\n\n-- CASE:\nSELECT name, salary,\n  CASE\n    WHEN salary >= 100000 THEN 'Senior'\n    WHEN salary >= 60000 THEN 'Mid'\n    ELSE 'Junior'\n  END as level\nFROM employees;\n\nHOW IT HELPS:\nReal business questions require 20-50 line SQL queries. CTEs make them manageable. Google, Amazon, and Meta all test CTE and subquery skills in data analyst interviews.\n\nPRACTICE TASK:\nWrite a CTE-based query that: (1) Calculates monthly revenue, (2) Adds month-over-month growth %, (3) Classifies months as 'Growth' (>5%), 'Stable' (-5% to 5%), or 'Decline' (<-5%) using CASE, (4) Returns only the last 12 months." },
    { id:17, day:4, dayTitle:"Advanced Analytics", level:"Advanced", subtopicTitle:"Advanced pandas & Feature Engineering", subtopicDesc:"Use apply, transform, rolling windows, and create derived features for deeper analytical insights.", lesson: "WHAT IT IS:\nAdvanced pandas operations let you create new features from existing data — rolling averages, lagged values, ratios, and custom transformations. Feature engineering is the art of creating the right calculated columns that reveal hidden patterns.\n\nHOW IT WORKS:\n# Rolling average (smooths out noise):\ndf['revenue_7d_avg'] = df['revenue'].rolling(window=7).mean()\n\n# Lag (previous value):\ndf['prev_month_revenue'] = df['revenue'].shift(1)\ndf['growth_pct'] = (df['revenue'] - df['prev_month_revenue']) / df['prev_month_revenue'] * 100\n\n# Apply custom function:\ndef categorize_score(score):\n    if score >= 90: return 'A'\n    elif score >= 70: return 'B'\n    else: return 'C'\ndf['grade'] = df['score'].apply(categorize_score)\n\n# GroupBy transform (adds group-level stats back to each row):\ndf['dept_avg_salary'] = df.groupby('department')['salary'].transform('mean')\ndf['above_avg'] = df['salary'] > df['dept_avg_salary']\n\nHOW IT HELPS:\nRaw data rarely contains the answer. Feature engineering creates the columns that DO. Rolling averages smooth trends. Growth percentages show change. Ratios normalize comparisons. This separates good analysts from great ones.\n\nPRACTICE TASK:\nTake a time-series sales dataset. Add: 7-day rolling average, month-over-month growth %, day-of-week column, a flag for above/below average days, and a cumulative total. Plot the original vs rolling average." },
    { id:18, day:4, dayTitle:"Advanced Analytics", level:"Advanced", subtopicTitle:"Storytelling with Data", subtopicDesc:"Structure analysis findings into compelling narratives that drive business action and executive decision-making.", lesson: "WHAT IT IS:\nStorytelling with data is presenting your analysis as a narrative — not just charts and numbers, but a story with context, insight, and recommendations. It's the difference between showing data and driving decisions.\n\nHOW IT WORKS:\nThe SCQA Framework:\n• Situation: \"Our e-commerce platform processes 50,000 orders monthly\"\n• Complication: \"Customer returns increased 40% in Q3, costing $2M\"\n• Question: \"What's driving the increase and how do we fix it?\"\n• Answer: \"Size-related returns account for 65% — adding a size guide could save $1.3M annually\"\n\nDashboard storytelling structure:\n1. Title: Clear statement of the insight (not \"Sales Dashboard\" but \"South Region Sales Dropped 15% in Q3\")\n2. KPIs: 3-4 headline metrics with trend arrows\n3. Supporting charts: Evidence that explains WHY\n4. Callout: The key insight highlighted visually\n5. Recommendation: Specific next step with expected impact\n\nPresentation tips:\n• Lead with the answer, then show evidence (executives are busy)\n• Use annotations on charts to point out key moments\n• Compare: \"15% drop\" means nothing. \"15% drop vs 2% industry average\" is alarming.\n• Always end with \"So what?\" → specific, actionable recommendation\n\nHOW IT HELPS:\nTechnical skills get you the interview. Storytelling skills get you the promotion. The analysts who advance fastest are those who can explain findings to non-technical executives in a way that drives action.\n\nPRACTICE TASK:\nTake one of your previous analyses. Reformat it as a data story using SCQA. Create a single-page dashboard or slide with: headline insight, 2 supporting charts with annotations, and a specific recommendation with estimated impact." },
    { id:19, day:4, dayTitle:"Advanced Analytics", level:"Advanced", subtopicTitle:"Automating Reports with Python", subtopicDesc:"Build automated data pipelines that extract, transform, and generate reports on schedule without manual work.", lesson: "WHAT IT IS:\nReport automation means writing Python scripts that pull fresh data, process it, generate visualizations, and deliver reports — all without you clicking anything. This saves hours of repetitive weekly/monthly reporting work.\n\nHOW IT WORKS:\nimport pandas as pd\nimport matplotlib.pyplot as plt\nfrom datetime import datetime\n\ndef generate_weekly_report():\n    # 1. Extract\n    df = pd.read_csv(\"sales_data.csv\")  # Or query from database\n    \n    # 2. Transform\n    this_week = df[df['date'] >= '2024-01-08']\n    summary = this_week.groupby('region')['revenue'].agg(['sum','mean','count'])\n    \n    # 3. Visualize\n    fig, axes = plt.subplots(1, 2, figsize=(14, 6))\n    summary['sum'].plot(kind='bar', ax=axes[0], title='Revenue by Region')\n    this_week.groupby('date')['revenue'].sum().plot(ax=axes[1], title='Daily Trend')\n    plt.tight_layout()\n    plt.savefig(f'report_{datetime.now().strftime(\"%Y%m%d\")}.png')\n    \n    # 4. Email (optional)\n    print(f\"Report generated: {summary.to_string()}\")\n    return summary\n\ngenerate_weekly_report()\n\nHOW IT HELPS:\nManual reporting takes 2-4 hours per week. Automated reporting takes 2 minutes to run. Over a year, that's 100+ hours saved. Companies love analysts who automate — it shows you think about efficiency.\n\nPRACTICE TASK:\nWrite a Python script that: (1) Reads a CSV, (2) Creates 3 summary statistics, (3) Generates 2 charts, (4) Saves everything to a dated output folder. Run it and verify the output." },
    { id:20, day:4, dayTitle:"Advanced Analytics", level:"Advanced", subtopicTitle:"A/B Testing & Experimentation", subtopicDesc:"Design, analyze, and interpret A/B tests to measure the impact of product changes with statistical rigor.", lesson: "WHAT IT IS:\nA/B testing compares two versions (A = control, B = variant) to determine which performs better. It's how tech companies make data-driven product decisions — testing button colors, pricing, features, and layouts.\n\nHOW IT WORKS:\n1. DESIGN: Define metric (conversion rate), sample size, duration\n2. SPLIT: Randomly assign users to Group A or Group B\n3. COLLECT: Run the test for enough time to reach statistical significance\n4. ANALYZE:\nimport scipy.stats as stats\nimport numpy as np\n\n# Group A: 1000 users, 120 conversions (12%)\n# Group B: 1000 users, 145 conversions (14.5%)\nn_a, conv_a = 1000, 120\nn_b, conv_b = 1000, 145\n\nrate_a = conv_a / n_a\nrate_b = conv_b / n_b\nlift = (rate_b - rate_a) / rate_a * 100\n\n# Z-test for proportions:\nfrom statsmodels.stats.proportion import proportions_ztest\nz_stat, p_value = proportions_ztest([conv_a, conv_b], [n_a, n_b])\n\nprint(f\"Control: {rate_a:.1%}, Variant: {rate_b:.1%}\")\nprint(f\"Lift: {lift:.1f}%\")\nprint(f\"p-value: {p_value:.4f}\")\nprint(\"Significant!\" if p_value < 0.05 else \"Not significant\")\n\nHOW IT HELPS:\nEvery major tech company (Google, Amazon, Netflix, Meta) runs thousands of A/B tests yearly. Being able to design and analyze experiments is a high-value, high-demand skill that sets you apart from basic analysts.\n\nPRACTICE TASK:\nSimulate an A/B test: Generate random data for 2000 users (1000 per group) with different conversion rates. Calculate the lift, run a z-test, determine significance. Write a recommendation: launch, iterate, or abandon?" },

    { id:21, day:5, dayTitle:"Professional Data Analyst", level:"Proficient", subtopicTitle:"Building an Analytics Portfolio", subtopicDesc:"Create a professional portfolio of 3-5 data analysis projects with documented methodology and business insights.", lesson: "WHAT IT IS:\nAn analytics portfolio is a collection of your best data analysis projects, hosted on GitHub and/or a personal website. Each project should demonstrate a complete analysis: question → data → methodology → findings → recommendations.\n\nHOW IT WORKS:\nIdeal portfolio structure (3-5 projects):\n\n1. SQL Analysis: Complex queries on a public dataset (use BigQuery public datasets)\n2. Python EDA: Full exploratory analysis with pandas + seaborn on Kaggle data\n3. Dashboard: Interactive Tableau/Power BI dashboard with filters and drill-downs\n4. A/B Test Analysis: Statistical analysis of an experiment with business recommendation\n5. Automated Report: Python pipeline that generates periodic insights\n\nEach project README should include:\n• Business Question: What problem are you solving?\n• Data Source: Where did the data come from?\n• Methodology: What techniques did you use and why?\n• Key Findings: 3-5 bullet points with numbers\n• Recommendations: What should the business do?\n• Visualizations: Charts embedded in the README\n\nHOW IT HELPS:\nHiring managers spend 30 seconds on your resume. A portfolio link with live dashboards and clean code gives you a massive advantage. Many analysts get hired based on their portfolio alone.\n\nPRACTICE TASK:\nCreate a GitHub repository called 'data-analyst-portfolio'. Set up the structure with 3 project folders. Complete your strongest project first with a full README. Add the portfolio link to your LinkedIn headline." },
    { id:22, day:5, dayTitle:"Professional Data Analyst", level:"Proficient", subtopicTitle:"Data Analyst Interview Prep", subtopicDesc:"Prepare for SQL coding tests, case studies, and behavioral questions asked in data analyst interviews.", lesson: "WHAT IT IS:\nData analyst interviews typically have 3 rounds: SQL coding test, case study/analysis exercise, and behavioral interview. Each tests different skills and requires specific preparation.\n\nHOW IT WORKS:\nSQL Coding (30-45 min):\n• Write 3-5 queries of increasing difficulty\n• Topics: JOINs, GROUP BY, window functions, CTEs, CASE\n• Practice on: StrataScratch, LeetCode (SQL section), HackerRank\n\nCase Study (45-60 min):\n• Given a dataset and business question\n• You analyze data, find insights, present findings\n• Example: \"Why did user retention drop 20% last month?\"\n• Structure: Clarify → Hypothesize → Analyze → Recommend\n\nBehavioral:\n• \"Tell me about a time you used data to influence a decision\"\n• \"Describe a project where you had to clean messy data\"\n• Use STAR format: Situation → Task → Action → Result\n\nTop 10 SQL interview questions:\n1. Find the second highest salary\n2. Customers who never placed an order (LEFT JOIN + IS NULL)\n3. Running total of daily revenue\n4. Month-over-month growth percentage\n5. Top N per category (ROW_NUMBER)\n\nHOW IT HELPS:\nPreparation is the #1 predictor of interview success. Candidates who practice SQL problems for 2 weeks pass at 3x the rate of those who don't.\n\nPRACTICE TASK:\nSolve 5 SQL problems on StrataScratch or LeetCode this week. Practice one case study: take any Kaggle dataset, set a timer for 45 minutes, analyze it, and write findings. Prepare 3 STAR-format stories about your data projects." },
    { id:23, day:5, dayTitle:"Professional Data Analyst", level:"Proficient", subtopicTitle:"Advanced Tableau Dashboards", subtopicDesc:"Create publication-quality dashboards with calculated fields, parameters, LOD expressions, and dashboard actions.", lesson: "WHAT IT IS:\nAdvanced Tableau goes beyond basic charts — calculated fields create custom metrics, parameters let users control the analysis, LOD (Level of Detail) expressions compute at different granularities, and dashboard actions enable drill-down interactivity.\n\nHOW IT WORKS:\nCalculated fields:\n• Profit Margin: [Profit] / [Sales]\n• YoY Growth: (SUM([Sales]) - LOOKUP(SUM([Sales]), -1)) / ABS(LOOKUP(SUM([Sales]), -1))\n\nLOD Expressions:\n• Customer's first purchase date: {FIXED [Customer ID] : MIN([Order Date])}\n• Cohort analysis: Compare customers by when they first purchased\n\nParameters:\n• Create a parameter \"Select Metric\" with values: Revenue, Profit, Units\n• Use it in a calculated field to switch what the chart shows\n\nDashboard actions:\n• Click a region on a map → all other charts filter to that region\n• Hover over a bar → tooltip shows detail breakdown\n\nHOW IT HELPS:\nAdvanced Tableau skills separate you from the 80% of analysts who only make basic charts. LOD expressions and parameters are specifically asked about in senior data analyst interviews.\n\nPRACTICE TASK:\nCreate a Tableau dashboard with: (1) A parameter that switches between Sales/Profit/Quantity, (2) An LOD expression for customer first purchase cohort, (3) Dashboard filter actions (click region → filter all charts). Publish to Tableau Public." },
    { id:24, day:5, dayTitle:"Professional Data Analyst", level:"Proficient", subtopicTitle:"Business Metrics & KPIs", subtopicDesc:"Understand the key metrics (CAC, LTV, churn, retention, ARPU, conversion) that businesses track and how to calculate them.", lesson: "WHAT IT IS:\nKPIs (Key Performance Indicators) are the metrics businesses use to measure success. Understanding which metrics matter for different business models (SaaS, e-commerce, marketplace) is what separates data analysts from data pullers.\n\nHOW IT WORKS:\nSaaS Metrics:\n• MRR (Monthly Recurring Revenue): Total monthly subscription revenue\n• Churn Rate: Customers lost / Total customers per month\n• LTV (Lifetime Value): Average revenue per customer over their lifetime\n• CAC (Customer Acquisition Cost): Total marketing spend / New customers\n• LTV/CAC Ratio: Should be > 3 (healthy business)\n\nE-commerce Metrics:\n• Conversion Rate: Purchases / Visits\n• AOV (Average Order Value): Total revenue / Number of orders\n• Cart Abandonment: Carts created - Purchases / Carts created\n• Repeat Purchase Rate: Customers with 2+ orders / Total customers\n\nCalculation example:\nLTV = (Average Revenue Per User) × (Average Customer Lifespan)\nCAC = (Total Marketing Spend) / (New Customers Acquired)\n\nIf LTV = $500 and CAC = $100 → LTV/CAC = 5 → healthy!\nIf LTV = $100 and CAC = $200 → LTV/CAC = 0.5 → losing money per customer!\n\nHOW IT HELPS:\nWhen an executive asks \"how's the business doing?\" they mean these metrics. Knowing KPIs lets you ask the right questions, build relevant dashboards, and provide actionable insights instead of just data dumps.\n\nPRACTICE TASK:\nChoose a business type (SaaS or e-commerce). Calculate 5 key metrics from a sample dataset. Build a KPI dashboard showing current values, trends, and comparison to targets. Add a written summary interpreting each metric." },
    { id:25, day:5, dayTitle:"Professional Data Analyst", level:"Proficient", subtopicTitle:"Career Growth & Next Steps", subtopicDesc:"Plan your career path from Data Analyst to Senior Analyst, Analytics Manager, or Data Scientist with concrete milestones.", lesson: "WHAT IT IS:\nData Analyst is a launching pad — not a ceiling. Understanding career paths helps you make strategic learning investments and position yourself for promotions and transitions.\n\nHOW IT WORKS:\nCareer paths from Data Analyst:\n\n1. Senior Data Analyst (2-4 years):\n   • Deeper SQL, Python, statistics\n   • Lead analysis projects end-to-end\n   • Mentor junior analysts\n   • Salary: $85K-$120K US / 10-20 LPA India\n\n2. Analytics Manager (4-6 years):\n   • Manage a team of analysts\n   • Define metrics and KPIs for the business\n   • Partner with executives on strategy\n   • Less coding, more leadership\n\n3. Data Scientist (requires additional learning):\n   • Machine learning (scikit-learn, TensorFlow)\n   • Predictive modeling, NLP, recommendation systems\n   • Typically requires more Python/math depth\n\n4. Analytics Engineer:\n   • Build data pipelines (dbt, Airflow)\n   • Design data warehouses (Snowflake, BigQuery)\n   • Bridge between engineering and analytics\n\nSkill investment priorities by timeline:\n• Now: SQL + pandas + Tableau (core analyst skills)\n• 6 months: Statistics + A/B testing + storytelling\n• 1 year: Python automation + advanced SQL\n• 2 years: Machine learning basics OR management skills\n\nHOW IT HELPS:\nHaving a career plan prevents aimless learning. Focus on skills that your NEXT role requires, not random technologies. Targeted growth is 5x more effective than random upskilling.\n\nPRACTICE TASK:\nIdentify your target role 2 years from now. Find 5 job postings for that role. List the skills they require that you don't have yet. Create a 6-month learning plan with specific courses, projects, and milestones for your top 3 skill gaps." },
  ],
};

// ─── Skill aliases (map variations to canonical names) ──────────────────────
const SKILL_ALIASES = {
  "python": "Python Developer",
  "python developer": "Python Developer",
  "python programming": "Python Developer",
  "python development": "Python Developer",
  "data analyst": "Data Analyst",
  "data analytics": "Data Analyst",
  "data analysis": "Data Analyst",
  "business analyst": "Data Analyst",
};

// ─── Public API ─────────────────────────────────────────────────────────────
export const getSkillRoadmap = (skill) => {
  const normalized = skill.toLowerCase().trim();
  const canonical = SKILL_ALIASES[normalized] || null;
  const roadmap = canonical ? SKILL_ROADMAPS[canonical] : null;
  return roadmap ? roadmap.map(t => ({ ...t, parentSkill: canonical || skill })) : null;
};

export const getSkillLesson = (skill, subtopicId) => {
  const normalized = skill.toLowerCase().trim();
  const canonical = SKILL_ALIASES[normalized] || null;
  const roadmap = canonical ? SKILL_ROADMAPS[canonical] : null;
  if (!roadmap) return null;
  const topic = roadmap.find(t => t.id === subtopicId);
  return topic?.lesson || null;
};

export const hasOfflineRoadmap = (skill) => {
  const normalized = skill.toLowerCase().trim();
  const canonical = SKILL_ALIASES[normalized] || null;
  return !!canonical && !!SKILL_ROADMAPS[canonical];
};

export const getAvailableOfflineSkills = () => Object.keys(SKILL_ROADMAPS);
