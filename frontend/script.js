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