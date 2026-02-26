document.getElementById("contactForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;

  try {
    // ✅ Updated to match backend route (/contact)
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message })
    });

    if (response.ok) {
      alert("Thank you! Your message has been submitted.");
      document.getElementById("contactForm").reset();
    } else {
      const errorData = await response.json();
      alert("Oops! " + (errorData.message || "Something went wrong. Please try again."));
    }
  } catch (error) {
    alert("Error connecting to server.");
  }
});