from flask import Flask, render_template, redirect, session
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, validators, SubmitField
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mysqldb import MySQL

app = Flask(__name__)

# Database Configuration
app.config['SECRET_KEY'] = '8nvtqog7wbahogath8u9iTgulR:pc(Sogtyet)'
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'root'
app.config['MYSQL_DB'] = 'Pokedex'
mysql = MySQL(app)

# Define a SignupForm class for creating a new user
class SignupForm(FlaskForm):
    username = StringField('Username', [validators.DataRequired()])
    email = StringField('Email Address', [validators.DataRequired(), validators.Email()])
    password = PasswordField('Password', [
        validators.DataRequired(),
        validators.Length(min=8),
        validators.EqualTo('confirm_password', message='Passwords must match')
    ])
    confirm_password = PasswordField('Confirm Password')
    submit = SubmitField('Sign Up')

# Define a LoginForm class for logging in an existing user
class LoginForm(FlaskForm):
    username = StringField('Username', [validators.DataRequired()])
    password = PasswordField('Password', [validators.DataRequired()])
    submit = SubmitField('Login')

# Define a route to the home page
@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

# Define a route for signing up a new user
@app.route('/signup', methods=['GET', 'POST'])
def signup():
    form = SignupForm()
    if form.validate_on_submit():
        username = form.username.data
        email = form.email.data
        password = form.password.data
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM users WHERE username=%s", (username,))
        user = cur.fetchone()
        # Check if the Username already taken
        if user:
            error = 'Username already taken'
            return render_template('signup.html', form=form, error=error)
        cur.execute("SELECT * FROM users WHERE email=%s", (email,))
        user = cur.fetchone()
        # Check if the Email already taken
        if user:
            error = 'Email already taken'
            return render_template('signup.html', form=form, error=error)
        password_hash = generate_password_hash(password) # hash the password
        cur.execute("INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)", (username, email, password_hash))
        mysql.connection.commit()
        cur.close()
        #add the current user;s username in the session
        session['username'] = username
        return redirect('/dashboard')
    # If the form didn't validate on submit, render it with any errors
    return render_template('signup.html', form=form)

# Define a route for logging in a user
@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        username = form.username.data
        password = form.password.data
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM users WHERE username=%s", (username,))
        user = cur.fetchone()
        # match the password entered byt the user and the one in the database
        if user and check_password_hash(user[3], password):
            session['username'] = username
            return redirect('/dashboard')
        else:
            error = 'Invalid username or password'
            return render_template('login.html', form=form, error=error)
    # If the form didn't validate on submit, render it with any errors
    return render_template('login.html', form=form)

# Define a route for logging out a user
@app.route('/logout')
def logout():
    # Clear the username from the session
    session.pop('username', None)
    # Redirect to the index page
    return redirect('/')

# Define a route to the dashboard
@app.route('/dashboard')
def dashboard():
    # Check if user is in session
    if not session.get('username'):
        # If not, redirect to login page
        return redirect('/login')
    # If user is in session, render dashboard template
    return render_template('dashboard.html')


if __name__ == '__main__':
    app.run(debug=True)
