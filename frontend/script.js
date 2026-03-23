// Configuration
const API_BASE_URL = window.location.origin;
const CONTACT_ENDPOINT = '/api/contact';
const MESSAGES_ENDPOINT = '/api/messages';

// Fetch and display messages from the database
async function loadMessages() {
  try {
    const url = `${API_BASE_URL}${MESSAGES_ENDPOINT}`;
    console.log("Loading messages from:", url);
    
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    
    console.log("Response status:", response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log("Messages loaded:", result);
    
    const messages = result.data || result || [];
    const messagesList = document.getElementById("messages-list");
    
    if (!messages || messages.length === 0) {
      messagesList.innerHTML = "<p style='text-align: center; color: #b0b8c1;'>No messages yet. Submit one using the contact form above!</p>";
      return;
    }
    
    messagesList.innerHTML = messages.map(msg => `
      <div class="message-card">
        <h4>${escapeHtml(msg.name)}</h4>
        <p><strong>Email:</strong> ${escapeHtml(msg.email)}</p>
        <p><strong>Message:</strong> ${escapeHtml(msg.message)}</p>
        <p style="font-size: 0.85rem; color: #888; margin-top: 0.5rem;">${new Date(msg.created_at).toLocaleString()}</p>
      </div>
    `).join("");
  } catch (error) {
    console.error("Error loading messages:", error);
    const messagesList = document.getElementById("messages-list");
    messagesList.innerHTML = "<p style='text-align: center; color: #b0b8c1;'>📧 Messages feature unavailable. Check browser console for details.</p>";
  }
}

// Clear all messages from the database
async function clearHistory() {
  const confirmDelete = confirm("Are you sure you want to delete all messages? This action cannot be undone.");
  if (!confirmDelete) return;
  
  try {
    const response = await fetch(`${API_BASE_URL}${MESSAGES_ENDPOINT}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" }
    });
    
    if (response.ok) {
      alert("All messages have been deleted successfully.");
      loadMessages(); // Refresh the messages list
    } else {
      const error = await response.json();
      alert(error.detail || "Failed to delete messages.");
    }
  } catch (error) {
    console.error("Error clearing messages:", error);
    alert("Error connecting to server.");
  }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Load messages and setup event listeners when page loads
window.addEventListener("DOMContentLoaded", function() {
  loadMessages();
  const clearBtn = document.getElementById("clear-history-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", clearHistory);
  }
  
  // Setup smooth scroll
  setupSmoothScroll();
  
  // Setup animations on scroll
  setupScrollAnimations();
});

// Smooth scroll for navigation
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const offsetTop = target.offsetTop - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      }
    });
  });
}

// Scroll animations
function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.skill-card, .project-card, .stat-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
  });
}

// Enhanced contact form handler with validation and user feedback
const form = document.getElementById("contact-form");
if (form) {
  form.addEventListener("submit", async function(e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    // Simple validation
    if (!name || !email || !message) {
      alert("Please fill in all fields.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Show loading feedback
    const submitButton = form.querySelector("button[type='submit']");
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    try {
      const url = `${API_BASE_URL}${CONTACT_ENDPOINT}`;
      console.log(\"Submitting to:\", url);
      
      const response = await fetch(url, {
        method: \"POST\",
        headers: { \"Content-Type\": \"application/json\" },
        body: JSON.stringify({ name, email, message })
      });

      const result = await response.json();
      console.log(\"Submit response:\", response.status, result);
      
      if (response.ok && result.success) {
        alert(\"✅ Thank you! Your message has been submitted.\");
        form.reset();
        setTimeout(() => loadMessages(), 500);
      } else {
        alert(\"❌ \" + (result.message || result.detail || \"Failed to submit.\"));
      }
    } catch (error) {
      alert(\"❌ Error: \" + error.message);
      console.error("Error:", error);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
}

// Theme toggle
const themeToggle = document.querySelector('.theme-toggle');
if (themeToggle) {
  themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('light-theme');
    localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
  });

  // Load saved theme
  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-theme');
  }
}

// Active nav link on scroll
window.addEventListener('scroll', function() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (pageYOffset >= sectionTop - 200) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href').slice(1) === current) {
      link.classList.add('active');
    }
  });
});