// ===============================
// Toggle between Login & Signup forms
// ===============================

// Show Login form and hide Signup form
function showLogin() {
    document.getElementById("signupSection").classList.add("hidden");
    document.getElementById("loginSection").classList.remove("hidden");
}

// Show Signup form and hide Login form
function showSignup() {
    document.getElementById("loginSection").classList.add("hidden");
    document.getElementById("signupSection").classList.remove("hidden");
}


// ===============================
// Signup Functionality
// ===============================

async function handleSignup(event) {
    event.preventDefault(); // Prevent page reload on form submit

    // Extract user input values from signup form
    const inputs = event.target.querySelectorAll("input");
    const fullname = inputs[0].value.trim();
    const email = inputs[1].value.trim();
    const password = inputs[2].value.trim();

    try {
        // Send signup data to backend API
        const response = await fetch("http://localhost:3000/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fullname, email, password })
        });

        const result = await response.json();

        // Show success alert if signup was successful
        if (result.success) {
            Swal.fire({
                icon: "success",
                title: "Signup Successful",
                text: result.message || "Your account has been created!",
                showConfirmButton: true,
                confirmButtonColor: "#3085d6"
            });
        }
        // Show error alert if signup failed
        else {
            Swal.fire({
                icon: "error",
                title: "Signup Failed",
                text: result.message || "Something went wrong while creating your account",
                confirmButtonColor: "#d33"
            });
        }
    } catch (err) {
        // Show error if request itself fails
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Signup failed: " + err.message,
            confirmButtonColor: "#d33"
        });
    }
}


// ===============================
// Login Functionality
// ===============================

async function handleLogin(event) {
    event.preventDefault(); // Prevent page reload on form submit

    // Extract login input values
    const inputs = event.target.querySelectorAll("input");
    const email = inputs[0].value.trim();
    const password = inputs[1].value.trim();

    try {
        // Send login data to backend API
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        // Show success alert if login successful
        if (result.success) {
            Swal.fire({
                icon: "success",
                title: "Login Successful",
                text: result.message || "Welcome back!",
                showConfirmButton: false,
                timer: 1500
            });

            // Store logged-in user email in localStorage
            localStorage.setItem("email", email);

            // Redirect to dashboard after short delay
            setTimeout(() => {
                window.location.href = "../pages/dashboard.html";
            }, 1500);
        }
        // Show error alert if login failed
        else {
            Swal.fire({
                icon: "error",
                title: "Login Failed",
                text: result.message || "Email or password is incorrect",
                confirmButtonColor: "#d33"
            });
        }

    } catch (err) {
        // Show error if request itself fails
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Login failed: " + err.message,
            confirmButtonColor: "#d33"
        });
    }
}


// ===============================
// Modal Handling (for extra success UI)
// ===============================

// Show custom success modal with message
function showSuccess(message) {
    document.getElementById("successMessage").innerText = message;
    document.getElementById("successModal").classList.remove("hidden");
}

// Close success modal
function closeModal() {
    document.getElementById("successModal").classList.add("hidden");
}
