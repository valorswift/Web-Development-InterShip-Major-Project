const cardsData = [];

function createCard() {
    document.getElementById("folderNameInput").value = "";
    document.getElementById("folderDescInput").value = "";
    document.getElementById("cardModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("cardModal").style.display = "none";
}

function fetchCards() {
    const userEmail = localStorage.getItem("email");
    if (!userEmail) return;

    fetch("http://localhost:3000/getCards?email=" + encodeURIComponent(userEmail))
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                cardsData.length = 0; // clear old data
                data.cards.forEach(card => {
                    cardsData.push({
                        id: card.id,
                        name: card.title,
                        desc: card.description,
                        timestamp: new Date(card.createdAt).getTime()
                    });
                });
                showHome(); // Render cards fresh
            }
        })
        .catch(err => {
            console.error("Error fetching cards:", err);
        });
}

function submitFolder() {
    const name = document.getElementById("folderNameInput").value.trim();
    const desc = document.getElementById("folderDescInput").value.trim();
    if (!name) return;

    fetch("http://localhost:3000/saveCard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: localStorage.getItem("email"),
            title: name,
            description: desc
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                closeModal();
                fetchCards(); // Fetch fresh cards after save
            } else {
                alert("Failed to save card: " + (data.message || "Unknown error"));
            }
        })
        .catch(err => {
            console.error("Error saving card to DB:", err);
        });
}



function openFolder(cardId) {
    localStorage.setItem('currentCardId', cardId);  // Store the card id
    window.location.href = '../pages/student_data.html'; // Redirect to student_data.html
}



document.getElementById("searchBar").addEventListener("input", function () {
    const query = this.value.toLowerCase().replace(/\s+/g, ' ').trim(); // Normalize spaces
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        const title = card.querySelector(".card-title").textContent.toLowerCase().replace(/\s+/g, ' ').trim();
        const description = card.querySelector("p").textContent.toLowerCase().replace(/\s+/g, ' ').trim(); // optional
        if (title.includes(query) || description.includes(query)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
});

window.onload = function () {
    showHome();
};

function showRecent() {

    document.getElementById("studentStats").style.display = "none";
    document.getElementById("cardContainer").style.display = "flex"; // Show main content again
    document.getElementById("examContainer").style.display = "none";

    const container = document.getElementById("cardContainer");
    container.innerHTML = "";

    cardsData
        .sort((a, b) => b.timestamp - a.timestamp)
        .forEach(card => addCardToDOM(card));
}

async function showStudentStats() {
    console.log("Function is called");
    document.getElementById("studentStats").style.display = "block";
    document.getElementById("cardContainer").style.display = "none"; // Hide cards
    document.getElementById("examContainer").style.display = "none";

    try {
        const email = localStorage.getItem("email");
        // const response = await fetch(`http://localhost:3000/getStudentStats?email=${encodeURIComponent(email)}`);  getAllStudents
        const response = await fetch(`http://localhost:3000/getAllStudents?email=${encodeURIComponent(email)}`)
        const data = await response.json();

        if (data.success) {
      const students = data.students;
      const totalStudents = students.length;
      const totalBoys = students.filter(s => s.gender.toLowerCase() === 'male').length;
      const totalGirls = students.filter(s => s.gender.toLowerCase() === 'female').length;

      document.getElementById("totalStudents").textContent = totalStudents;
      document.getElementById("totalBoys").textContent = totalBoys;
      document.getElementById("totalGirls").textContent = totalGirls;

      console.log("Student Stats Data:", { totalStudents, totalBoys, totalGirls });
        } else {
            alert("Failed to load student stats: " + data.message);
        }
    } catch (err) {
        alert("Error fetching student stats: " + err.message);
    }
}
window.showStudentStats = showStudentStats;



// function showSettings() {
//     document.getElementById("studentStats").style.display = "none";
//     const cardContainer = document.getElementById("cardContainer");
//     document.getElementById("examContainer").style.display = "none";
//     cardContainer.style.display = "flex";
//     cardContainer.innerHTML = `
//     <h3>Settings</h3>
//     <label>Change Background Color:
//       <input type="color" id="bgColorPicker" />
//     </label>
//     <br>
//     <label>
//       <input type="checkbox" id="darkModeToggle" /> Enable Dark Mode
//     </label>
//   `;

//     const bgColorPicker = document.getElementById("bgColorPicker");
//     const darkModeToggle = document.getElementById("darkModeToggle");

//     bgColorPicker.addEventListener("input", (e) => {
//         document.body.style.backgroundColor = e.target.value;
//     });

//     darkModeToggle.addEventListener("change", (e) => {
//         if (e.target.checked) {
//             document.body.classList.add("dark-mode");
//         } else {
//             document.body.classList.remove("dark-mode");
//             // Reset to selected background color if any
//             document.body.style.backgroundColor = bgColorPicker.value || "";
//         }
//     });
// }

function showExamRecords() {
    console.log("Exam details function is called");

    // Hide other sections
    document.getElementById("studentStats").style.display = "none";
    document.getElementById("cardContainer").style.display = "none";

    // Show exam section
    document.getElementById("examContainer").style.display = "block";
}
window.showExamRecords = showExamRecords;

function addCardToDOM(data) {
    const container = document.getElementById("cardContainer");

    const now = new Date(data.timestamp);
    const dateString = now.toLocaleString();

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
    <div class="card-content">
      <h2 class="card-title">${data.name}</h2>
      <p>${data.desc || "No description provided."}</p>
    </div>
    <div class="card-footer">
        <button class="open-btn" onclick="openFolder('${data.id}')">Open File</button>
      <button class="delete-btn" onclick="deleteCard('${data.id}')">Delete</button>
      <span class="timestamp">Created: ${dateString}</span>
    </div>
  `;

    container.appendChild(card);
}
// <button class="open-btn" onclick="openFolder({data.name}', '{dateString}')">Open File</button>
function showHome() {

    document.getElementById("studentStats").style.display = "none";
    document.getElementById("cardContainer").style.display = "flex"; // Show main content again
    document.getElementById("examContainer").style.display = "none";

    const container = document.getElementById("cardContainer");
    container.innerHTML = "";

    cardsData
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(card => addCardToDOM(card));
}

function logout() {
    window.location.href = "../pages/signup.html";
}

function deleteCard(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: "This folder will be permanently deleted.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e74c3c',  // red
        cancelButtonColor: '#3498db',   // blue
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`http://localhost:3000/deleteCard/${id}`, { method: 'DELETE' })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire(
                            'Deleted!',
                            'The folder has been deleted.',
                            'success'
                        ).then(() => location.reload());
                    } else {
                        Swal.fire('Error', data.message, 'error');
                    }
                })
                .catch(err => {
                    Swal.fire('Error', err.message, 'error');
                });
        }
    });
}

async function goToProfile() {
    const email = localStorage.getItem("email");

    try {
        const res = await fetch(`http://localhost:3000/getProfileData?email=${encodeURIComponent(email)}`);
        const data = await res.json();

        if (!data.success) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Failed to load profile information"
            });
            return;
        }

        Swal.fire({
            title: "Profile Info",
            html: `
        <div style="text-align:center; padding: 10px;">
          <img src="${data.profileImage || 'https://cdn-icons-png.flaticon.com/512/847/847969.png'}" 
               style="width:100px; height:100px; border-radius:50%; object-fit:cover; margin-bottom: 15px;">
          <p><strong>Name:</strong> ${data.fullname || "N/A"}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Active Folders:</strong> ${data.activeCount}</p>
        </div>
      `,
            showConfirmButton: true,
            confirmButtonText: "Close",
            confirmButtonColor: "#3498db",
            width: "350px"
        });

    } catch (err) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Could not fetch profile data"
        });
    }
}

async function fetchAndShowCards() {
    const userEmail = localStorage.getItem("email");
    if (!userEmail) return;

    try {
        const response = await fetch("http://localhost:3000/getCards?email=" + encodeURIComponent(userEmail));
        const data = await response.json();
        if (data.success) {
            cardsData.length = 0; // Clear existing cards
            data.cards.forEach(card => {
                cardsData.push({
                    id: card.id,
                    name: card.title,
                    desc: card.description,
                    timestamp: new Date(card.createdAt).getTime()
                });
            });
            showHome();
        }
    } catch (err) {
        console.error("Error fetching cards:", err);
    }
}

window.onload = fetchAndShowCards;

window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        fetchAndShowCards();
    }
});
