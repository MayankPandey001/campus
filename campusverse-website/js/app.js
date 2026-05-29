// Simple auth without Firebase for demo

// Signup function
const signup = (email, password, name, collegeId) => {
  // Simple validation
  if (email && password && name && collegeId) {
    // Store in localStorage for demo
    localStorage.setItem('user', JSON.stringify({ name, email, collegeId }));
    // Redirect to dashboard
    window.location.href = 'pages/dashboard.html';
  } else {
    alert('Please fill all fields');
  }
};

// Login function
const login = (email, password) => {
  // Simple demo login - accept any email/password
  if (email && password) {
    // Store in localStorage
    localStorage.setItem('user', JSON.stringify({ email }));
    // Redirect to dashboard
    window.location.href = 'pages/dashboard.html';
  } else {
    alert('Please enter email and password');
  }
};

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = signupForm['signup-name'].value;
    const email = signupForm['signup-email'].value;
    const password = signupForm['signup-password'].value;
    const collegeId = signupForm['signup-college-id'].value;
    signup(email, password, name, collegeId);
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginForm['email'].value;
    const password = loginForm['password'].value;
    login(email, password);
  });
}
