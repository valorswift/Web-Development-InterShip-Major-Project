function showLogin() {
  document.getElementById("signupSection").classList.add("hidden");
  document.getElementById("loginSection").classList.remove("hidden");
}

function showSignup() {
  document.getElementById("loginSection").classList.add("hidden");
  document.getElementById("signupSection").classList.remove("hidden");
}

async function handleSignup(event) {
  event.preventDefault();
  const inputs = event.target.querySelectorAll("input");
  const fullname = inputs[0].value;   // First input is Full Name
  const email = inputs[1].value;
  const password = inputs[2].value;

  try {
    const response = await fetch("http://localhost:3000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullname, email, password }) // Include fullname
    });

    const result = await response.json();
    showSuccess(result.message);
  } catch (err) {
    alert("Signup failed: " + err.message);
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const inputs = event.target.querySelectorAll("input");
  const email = inputs[0].value;
  const password = inputs[1].value;

  try {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    if (result.success) {
      showSuccess(result.message); // shows success modal or message
      localStorage.setItem("email", email);
      setTimeout(() => {
        window.location.href = "../pages/dashboard.html"; // 👈 Redirect after 1s
      }, 1000);
    } else {
      alert(result.message);
    }
  } catch (err) {
    alert("Login failed: " + err.message);
  }
}

// Show Modal on Success
function showSuccess(message) {
  document.getElementById("successMessage").innerText = message;
  document.getElementById("successModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("successModal").classList.add("hidden");
}
