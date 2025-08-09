const cardsData = [];

function createCard() {
  document.getElementById("folderNameInput").value = "";
  document.getElementById("folderDescInput").value = "";
  document.getElementById("cardModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("cardModal").style.display = "none";
}

function submitFolder() {
  const name = document.getElementById("folderNameInput").value.trim();
  const desc = document.getElementById("folderDescInput").value.trim();
  if (!name) return;

  const newCard = {
    name,
    desc,
    timestamp: Date.now()
  };

  cardsData.push(newCard);
  // Save to database
fetch("http://localhost:3000/saveCard", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    email: localStorage.getItem("email"), // or however you're storing logged-in user email
    title: name,
  description: desc
  })
})
.then(res => res.json())
.then(data => {
  console.log("Card saved to DB:", data);
})
.catch(err => {
  console.error("Error saving card to DB:", err);
});

  closeModal();
  showHome(); // ✅ This line displays all cards, including the new one
}

function openFolder(name, time) {
  alert(`📂 Folder: ${name}\n🕒 Created on: ${time}`);
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

  const container = document.getElementById("cardContainer");
  container.innerHTML = "";

  cardsData
    .sort((a, b) => b.timestamp - a.timestamp)
    .forEach(card => addCardToDOM(card));
}


function showStudent() {
  const cardContainer = document.getElementById("cardContainer");
  cardContainer.innerHTML = `<div class="student-counts">
    <h3>👦 Boys: 0</h3>
    <h3>👧 Girls: 0</h3>
  </div>`;
}

function showSettings() {
  document.getElementById("studentStats").style.display = "none";
  const cardContainer = document.getElementById("cardContainer");
  cardContainer.style.display = "flex";
  cardContainer.innerHTML = `
    <h3>Settings</h3>
    <label>Change Background Color:
      <input type="color" id="bgColorPicker" />
    </label>
    <br>
    <label>
      <input type="checkbox" id="darkModeToggle" /> Enable Dark Mode
    </label>
  `;

  const bgColorPicker = document.getElementById("bgColorPicker");
  const darkModeToggle = document.getElementById("darkModeToggle");

  bgColorPicker.addEventListener("input", (e) => {
    document.body.style.backgroundColor = e.target.value;
  });

  darkModeToggle.addEventListener("change", (e) => {
    if (e.target.checked) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
      // Reset to selected background color if any
      document.body.style.backgroundColor = bgColorPicker.value || "";
    }
  });
}

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
      <button class="open-btn" onclick="openFolder('${data.name}', '${dateString}')">Open File</button>
      <span class="timestamp">Created: ${dateString}</span>
    </div>
  `;

  container.appendChild(card);
}

function showHome() {

  document.getElementById("studentStats").style.display = "none";
document.getElementById("cardContainer").style.display = "flex"; // Show main content again

  const container = document.getElementById("cardContainer");
  container.innerHTML = "";

  cardsData
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach(card => addCardToDOM(card));
}

function showStudentStats() {
  document.getElementById("studentStats").style.display = "block";
  document.getElementById("cardContainer").style.display = "none"; // Hide main content
}

 function logout() {
    window.location.href = "../pages/signup.html";
  }

window.onload = async function () {
  const userEmail = localStorage.getItem("email");
  if (!userEmail) return;

  try {
    // const response = await fetch("/getCards?email=" + encodeURIComponent(userEmail)); // 🟢 Note: GET endpoint is /getCards not /get-cards
    const response = await fetch("http://localhost:3000/getCards?email=" + encodeURIComponent(userEmail));
    const data = await response.json();
    if (data.success) {
      cardsData.length = 0; // Clear existing cards
      data.cards.forEach(card => {
        cardsData.push({
          name: card.title,
          desc: card.description,
          timestamp: new Date(card.createdAt).getTime()
        });
      });
      showHome(); // 🟢 Renders the fetched cards
    }
  } catch (err) {
    console.error("Error fetching cards:", err);
  }
};

