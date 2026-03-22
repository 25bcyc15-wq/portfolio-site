// Fetch and display messages from the database
async function loadMessages() {
  try {
    const response = await fetch("http://localhost:5000/messages");
    const messages = await response.json();
    const messagesList = document.getElementById("messages-list");
    
    if (!messages || messages.length === 0) {
      messagesList.innerHTML = "<p>No messages yet.</p>";
      return;
    }
    
    messagesList.innerHTML = messages.map(msg => `
      <div class="message-card">
        <h4>${msg.name}</h4>
        <p><strong>Email:</strong> ${msg.email}</p>
        <p><strong>Message:</strong> ${msg.message}</p>
      </div>
    `).join("");
  } catch (error) {
    console.error("Error loading messages:", error);
    document.getElementById("messages-list").innerHTML = "<p>Error loading messages.</p>";
  }
}

// Clear all messages from the database
async function clearHistory() {
  const confirmDelete = confirm("Are you sure you want to delete all messages? This action cannot be undone.");
  if (!confirmDelete) return;
  
  try {
    const response = await fetch("http://localhost:5000/messages", {
      method: "DELETE"
    });
    
    if (response.ok) {
      alert("All messages have been deleted successfully.");
      loadMessages(); // Refresh the messages list
    } else {
      alert("Failed to delete messages.");
    }
  } catch (error) {
    console.error("Error clearing messages:", error);
    alert("Error connecting to server.");
  }
}

// Load messages and setup event listeners when page loads
window.addEventListener("DOMContentLoaded", function() {
  loadMessages();
  const clearBtn = document.getElementById("clear-history-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", clearHistory);
  }
});

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

    // Show loading feedback
    const submitButton = form.querySelector("button[type='submit']");
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    try {
      const response = await fetch("http://localhost:5000/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message })
      });

      const result = await response.json();
      if (response.ok) {
        alert("Thank you! Your message has been submitted.");
        form.reset();
        loadMessages(); // Refresh messages list
      } else {
        alert(result.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      alert("Error connecting to server.");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Send Message";
    }
  });
}