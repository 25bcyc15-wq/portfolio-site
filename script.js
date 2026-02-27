// Contact form submission handler
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', async function(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    const response = await fetch('/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, message })
    });

    const result = await response.json();
    if (response.ok) {
      alert('Message sent successfully!');
      form.reset();
    } else {
      alert(result.message || 'Failed to send message.');
    }
  });
}