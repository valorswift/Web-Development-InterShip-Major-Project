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
  const fullname = inputs[0].value.trim();
  const email = inputs[1].value.trim();
  const password = inputs[2].value.trim();

  try {
    const response = await fetch("http://localhost:3000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullname, email, password })
    });

    const result = await response.json();

    if (result.success) {
      Swal.fire({
        icon: "success",
        title: "Signup Successful",
        text: result.message || "Your account has been created!",
        showConfirmButton: true,
        confirmButtonColor: "#3085d6"
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Signup Failed",
        text: result.message || "Something went wrong while creating your account",
        confirmButtonColor: "#d33"
      });
    }
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Signup failed: " + err.message,
      confirmButtonColor: "#d33"
    });
  }
}

// Make sure you have this in your HTML:
// <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

async function handleLogin(event) {
  event.preventDefault();
  const inputs = event.target.querySelectorAll("input");
  const email = inputs[0].value.trim();
  const password = inputs[1].value.trim();

  try {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (result.success) {
      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: result.message || "Welcome back!",
        showConfirmButton: false,
        timer: 1500
      });

      localStorage.setItem("email", email);

      setTimeout(() => {
        window.location.href = "../pages/dashboard.html";
      }, 1500);

    } else {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: result.message || "Email or password is incorrect",
        confirmButtonColor: "#d33"
      });
    }

  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Login failed: " + err.message,
      confirmButtonColor: "#d33"
    });
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
