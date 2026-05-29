// Dark/Light Mode Toggle
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

function toggleTheme() {
  body.classList.toggle('light-mode');
  const isLightMode = body.classList.contains('light-mode');
  localStorage.setItem('theme', isLightMode ? 'light' : 'dark');

  // Update toggle icon
  const icon = themeToggle.querySelector('i');
  if (icon) {
    icon.className = isLightMode ? 'fas fa-moon' : 'fas fa-sun';
  }
}

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
  body.classList.add('light-mode');
}

// Add event listener if toggle exists
if (themeToggle) {
  themeToggle.addEventListener('click', toggleTheme);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Add fade-in animation to elements on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
    }
  });
}, observerOptions);

// Observe elements with data-animate attribute
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-animate]').forEach(el => {
    observer.observe(el);
  });
});

// Form validation for login/signup
function validateForm(form) {
  const inputs = form.querySelectorAll('input[required]');
  let isValid = true;

  inputs.forEach(input => {
    if (!input.value.trim()) {
      input.style.borderColor = 'var(--neon-pink)';
      isValid = false;
    } else {
      input.style.borderColor = 'var(--border-glass)';
    }
  });

  return isValid;
}

// Add form validation to login/signup forms
document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      if (!validateForm(form)) {
        e.preventDefault();
        alert('Please fill in all required fields.');
      }
    });
  });
});

// Chat functionality for study groups page
function sendMessage() {
  const input = document.getElementById('message-input');
  const chatWindow = document.getElementById('chat-window');

  if (input && input.value.trim() && chatWindow) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message sent';
    messageDiv.textContent = input.value;
    chatWindow.appendChild(messageDiv);
    input.value = '';
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
}

// Add enter key support for chat
document.addEventListener('DOMContentLoaded', () => {
  const messageInput = document.getElementById('message-input');
  if (messageInput) {
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }
});

// Search functionality
function searchItems(searchTerm, items) {
  const term = searchTerm.toLowerCase();
  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(term) ? 'block' : 'none';
  });
}

// Add search functionality to search inputs
document.addEventListener('DOMContentLoaded', () => {
  const searchInputs = document.querySelectorAll('input[type="search"]');
  searchInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const container = e.target.closest('.search-container') || document.body;
      const items = container.querySelectorAll('.searchable-item');
      searchItems(e.target.value, items);
    });
  });
});

// Notification system
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--bg-glass);
    backdrop-filter: blur(10px);
    border: 1px solid var(--border-glass);
    border-radius: 10px;
    padding: 15px 20px;
    color: var(--text-primary);
    z-index: 1001;
    animation: fadeIn 0.3s ease-out;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Add notification styles
const notificationStyles = `
@keyframes fadeOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-20px); }
}

.notification {
  box-shadow: var(--shadow-neon);
}
`;

const style = document.createElement('style');
style.textContent = notificationStyles;
document.head.appendChild(style);

// Login and Signup functionality
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  // Load users from localStorage or initialize empty array
  let users = JSON.parse(localStorage.getItem('campusverseUsers')) || [];

  // Save users to localStorage
  function saveUsers() {
    localStorage.setItem('campusverseUsers', JSON.stringify(users));
  }

  // Show notification helper
  function notify(message, type = 'info') {
    showNotification(message, type);
  }

  // Signup form submit handler
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(signupForm)) {
        notify('Please fill in all required fields.', 'error');
        return;
      }
      const name = signupForm['name'].value.trim();
      const email = signupForm['email'].value.trim().toLowerCase();
      const password = signupForm['password'].value;
      const collegeId = signupForm['college-id'].value.trim();

      // Check if user already exists
      if (users.some(u => u.email === email)) {
        notify('User with this email already exists.', 'error');
        return;
      }

      // Add new user
      users.push({ name, email, password, collegeId });
      saveUsers();
      notify('Account created successfully! You can now log in.', 'success');

      // Reset form and switch to login
      signupForm.reset();
      showLogin();
    });
  }

  // Login form submit handler
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(loginForm)) {
        notify('Please fill in all required fields.', 'error');
        return;
      }
      const email = loginForm['email'].value.trim().toLowerCase();
      const password = loginForm['password'].value;
      const collegeId = loginForm['college-id'].value.trim();

      // Find user
      const user = users.find(u => u.email === email && u.password === password && u.collegeId === collegeId);
      if (!user) {
        notify('Invalid credentials. Please try again.', 'error');
        return;
      }

      notify(`Welcome back, ${user.name}! Redirecting to dashboard...`, 'success');

      // Set logged-in user in localStorage
      localStorage.setItem('campusverseLoggedInUser', JSON.stringify(user));

      // Simulate redirect after delay
      setTimeout(() => {
        window.location.href = 'pages/dashboard.html';
      }, 1500);
    });
  }
});

function updateProfileDisplay() {
  const savedProfile = localStorage.getItem('campusverseProfile');
  if (savedProfile) {
    const profileData = JSON.parse(savedProfile);
    
    // Update dashboard header if exists
    const studentName = document.querySelector('.student-name');
    if (studentName) {
      studentName.textContent = profileData.name;
    }
    
    const dashboardSubtitle = document.querySelector('.dashboard-subtitle');
    if (dashboardSubtitle) {
      dashboardSubtitle.textContent = `${profileData.course} • ${profileData.year} • Roll No: ${profileData.roll}`;
    }
    
    // Update navbar profile
    const navbarProfileName = document.querySelector('.profile-name');
    if (navbarProfileName) {
      navbarProfileName.textContent = profileData.name;
    }
    
    const navbarProfileCourse = document.querySelector('.profile-course');
    if (navbarProfileCourse) {
      navbarProfileCourse.textContent = `${profileData.course}, ${profileData.year}`;
    }
    
    // Update profile card if exists
    const profileName = document.getElementById('profile-name');
    if (profileName) {
      profileName.textContent = profileData.name;
    }
    
    const profileCourse = document.getElementById('profile-course');
    if (profileCourse) {
      profileCourse.textContent = profileData.course;
    }
    
    const profileYear = document.getElementById('profile-year');
    if (profileYear) {
      profileYear.textContent = profileData.year;
    }
    
    const profileRoll = document.getElementById('profile-roll');
    if (profileRoll) {
      profileRoll.textContent = `Roll No: ${profileData.roll}`;
    }
    
    const profileCgpa = document.getElementById('profile-cgpa');
    if (profileCgpa) {
      profileCgpa.textContent = profileData.cgpa;
    }
    
    const profileProgress = document.getElementById('profile-progress');
    if (profileProgress) {
      profileProgress.style.width = `${profileData.progress}%`;
    }
    
    const profileAttendance = document.getElementById('profile-attendance');
    if (profileAttendance) {
      profileAttendance.textContent = profileData.attendance;
    }
  }
}

function updateAcademicPerformanceWidget() {
  const savedProfile = localStorage.getItem('campusverseProfile');
  if (savedProfile) {
    const profileData = JSON.parse(savedProfile);
    const cgpa = profileData.cgpa || 8.7;
    const attendance = profileData.attendance || 95;
    const progress = profileData.progress || 87;
    const completed = Math.round((progress / 100) * 28);

    const cgpaValue = document.getElementById('academic-cgpa-value');
    if (cgpaValue) cgpaValue.textContent = cgpa;
    
    const cgpaProgress = document.getElementById('academic-cgpa-progress');
    if (cgpaProgress) cgpaProgress.style.width = `${(cgpa / 10) * 100}%`;
    
    const attendanceValue = document.getElementById('academic-attendance-value');
    if (attendanceValue) attendanceValue.textContent = `${attendance}%`;
    
    const attendanceProgress = document.getElementById('academic-attendance-progress');
    if (attendanceProgress) attendanceProgress.style.width = `${attendance}%`;
    
    const assignmentsValue = document.getElementById('academic-assignments-value');
    if (assignmentsValue) assignmentsValue.textContent = `${completed}/28`;
    
    const assignmentsProgress = document.getElementById('academic-assignments-progress');
    if (assignmentsProgress) assignmentsProgress.style.width = `${progress}%`;
  }
}

// Initialize on every page load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize default profile if not exists
  if (!localStorage.getItem('campusverseProfile')) {
    const defaultProfile = {
      name: 'Sivareddy',
      roll: '123456',
      course: 'B.Tech CSE - AI & ML',
      year: '3rd Year',
      cgpa: '8.7',
      attendance: '95',
      progress: '87'
    };
    localStorage.setItem('campusverseProfile', JSON.stringify(defaultProfile));
  }
  
  updateProfileDisplay();
  updateAcademicPerformanceWidget();

  // Listen for profile updates across tabs
  window.addEventListener('storage', (e) => {
    if (e.key === 'campusverseProfile') {
      updateProfileDisplay();
      updateAcademicPerformanceWidget();
    }
  });

  // Toggle profile dropdown menu
  const profileToggle = document.querySelector('.profile-dropdown-toggle');
  const profileMenu = document.querySelector('.profile-dropdown-menu');

  if (profileToggle && profileMenu) {
    profileToggle.addEventListener('click', () => {
      profileMenu.classList.toggle('show');
    });

    // Close dropdown if clicked outside
    document.addEventListener('click', (e) => {
      if (!profileToggle.contains(e.target) && !profileMenu.contains(e.target)) {
        profileMenu.classList.remove('show');
      }
    });
  }

  // Profile editing functionality (dashboard specific)
  const editProfileBtn = document.getElementById('edit-profile-btn');
  const profileEditForm = document.getElementById('profile-edit-form');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const profileInfo = document.getElementById('profile-info');
  const profileDetails = document.getElementById('profile-details');

  if (editProfileBtn && profileEditForm) {
    editProfileBtn.addEventListener('click', () => {
      profileInfo.style.display = 'none';
      profileDetails.style.display = 'none';
      profileEditForm.style.display = 'flex';
    });

    cancelEditBtn.addEventListener('click', () => {
      profileEditForm.style.display = 'none';
      profileInfo.style.display = 'block';
      profileDetails.style.display = 'block';
    });

    profileEditForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Get form values
      const name = document.getElementById('edit-name').value;
      const course = document.getElementById('edit-course').value;
      const year = document.getElementById('edit-year').value;
      const roll = document.getElementById('edit-roll').value;
      const cgpa = document.getElementById('edit-cgpa').value;
      const progress = document.getElementById('edit-progress').value;
      const attendance = document.getElementById('edit-attendance').value;

      // Save to localStorage
      const profileData = { name, course, year, roll, cgpa, progress, attendance };
      localStorage.setItem('campusverseProfile', JSON.stringify(profileData));

      // Update display
      updateProfileDisplay();
      updateAcademicPerformanceWidget();

      // Hide form and show profile
      profileEditForm.style.display = 'none';
      profileInfo.style.display = 'block';
      profileDetails.style.display = 'block';

      showNotification('Profile updated successfully! Changes will sync across all pages.', 'success');
    });
  }

  // Photo upload functionality (dashboard specific)
  const editPhoto = document.getElementById('edit-photo');
  if (editPhoto) {
    editPhoto.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          document.getElementById('profile-photo').src = e.target.result;
          localStorage.setItem('campusverseProfilePhoto', e.target.result);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Load saved profile photo
  const savedPhoto = localStorage.getItem('campusverseProfilePhoto');
  if (savedPhoto) {
    const profilePhoto = document.getElementById('profile-photo');
    if (profilePhoto) profilePhoto.src = savedPhoto;
  }

  // Settings modal functionality (dashboard specific)
  const settingsBtn = document.getElementById('settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const closeSettings = document.getElementById('close-settings');

  if (settingsBtn && settingsModal) {
    settingsBtn.addEventListener('click', () => {
      settingsModal.style.display = 'flex';
      profileMenu.classList.remove('show'); // Close dropdown
    });

    closeSettings.addEventListener('click', () => {
      settingsModal.style.display = 'none';
    });

    // Close modal if clicked outside
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) {
        settingsModal.style.display = 'none';
      }
    });

    // Load saved settings
    const savedSettings = JSON.parse(localStorage.getItem('campusverseSettings')) || {};
    const themeSetting = document.getElementById('theme-setting');
    if (themeSetting) themeSetting.checked = savedSettings.theme || false;
    const notificationSetting = document.getElementById('notification-setting');
    if (notificationSetting) notificationSetting.checked = savedSettings.notifications !== false;
    const privacySetting = document.getElementById('privacy-setting');
    if (privacySetting) privacySetting.checked = savedSettings.privacy || false;
    const languageSetting = document.getElementById('language-setting');
    if (languageSetting) languageSetting.value = savedSettings.language || 'en';

    // Save settings
    const saveSettingsBtn = document.getElementById('save-settings');
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', () => {
        const settings = {
          theme: themeSetting ? themeSetting.checked : false,
          notifications: notificationSetting ? notificationSetting.checked : true,
          privacy: privacySetting ? privacySetting.checked : false,
          language: languageSetting ? languageSetting.value : 'en'
        };
        localStorage.setItem('campusverseSettings', JSON.stringify(settings));
        showNotification('Settings saved successfully!', 'success');
        settingsModal.style.display = 'none';
      });
    }
  }

  // Logout functionality
  const logoutBtn = document.getElementById('logout-btn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      // Clear user session but keep profile data to persist edits
      localStorage.removeItem('campusverseLoggedInUser');
      // localStorage.removeItem('campusverseProfile'); // Commented out to keep profile data

      showNotification('Logged out successfully!', 'info');

      // Redirect to login page after delay
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 1500);
    });
  }
});

// Export functions for global use
window.toggleTheme = toggleTheme;
window.sendMessage = sendMessage;
window.showNotification = showNotification;
window.updateProfileDisplay = updateProfileDisplay;
window.updateAcademicPerformanceWidget = updateAcademicPerformanceWidget;
