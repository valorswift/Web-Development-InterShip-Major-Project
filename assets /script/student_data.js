// Global variables
let students = [];              // Stores list of student objects
let currentCardId = null;       // Keeps track of selected card ID

// ---------------- Page Load ----------------
window.onload = async function () {
    // Get the current card ID from local storage
    currentCardId = localStorage.getItem("currentCardId");
    console.log(currentCardId);

    if (!currentCardId) {
        alert("No card selected.");
        return;
    }

    // Fetch students from backend using cardId
    try {
        const response = await fetch(`http://localhost:3000/getStudents?cardId=${encodeURIComponent(currentCardId)}`);
        const data = await response.json();

        if (data.success) {
            students = data.students;  // Expecting an array of students with `id`
            renderTable();             // Display data in table
        } else {
            alert("Failed to load students: " + data.message);
        }
    } catch (err) {
        alert("Error loading students: " + err.message);
    }
};

// ---------------- Add / Edit Student ----------------
document.getElementById("studentForm").addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevent form from refreshing page

    // Collect student form data
    const student = {
        name: document.getElementById("studentName").value,
        roll: document.getElementById("studentRoll").value,
        gmail: document.getElementById("studentGmail").value,
        address: document.getElementById("studentAddress").value,
        dom: document.getElementById("studentDom").value,
        age: document.getElementById("studentAge").value,
        phone: document.getElementById("studentPhone").value,
        gender: document.getElementById("studentGender").value  // Dropdown value
    };

    const editIndex = document.getElementById("editIndex").value;

    if (editIndex) {
        // ---------- Update Existing Student ----------
        try {
            const studentId = students[editIndex].id;  // Get id of student being edited
            const res = await fetch(`http://localhost:3000/updateStudent/${studentId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...student, cardId: currentCardId }) // Merge with cardId
            });
            const data = await res.json();

            if (data.success) {
                // Update local array with new data
                students[editIndex] = { id: studentId, ...student };
                renderTable();
                closeModal();  // Close modal after success
            } else {
                alert("Failed to update student: " + data.message);
            }
        } catch (err) {
            alert("Error updating student: " + err.message);
        }
    } else {
        // ---------- Add New Student ----------
        try {
            const res = await fetch(`http://localhost:3000/addStudent`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...student, cardId: currentCardId })
            });
            const data = await res.json();

            if (data.success && data.studentId) {
                // Push new student with assigned backend ID
                students.push({ id: data.studentId, ...student });
                renderTable();
                closeModal();
            } else {
                alert("Failed to add student: " + data.message);
            }
        } catch (err) {
            alert("Error adding student: " + err.message);
        }
    }
});

// ---------------- Delete Student ----------------
function deleteStudent(index) {
    if (!confirm("Are you sure you want to delete this student?")) return;

    const studentId = students[index].id;

    fetch(`http://localhost:3000/deleteStudent/${studentId}`, {
        method: "DELETE"
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Remove from array and re-render
                students.splice(index, 1);
                renderTable();
            } else {
                alert("Failed to delete student: " + data.message);
            }
        })
        .catch(err => {
            alert("Error deleting student: " + err.message);
        });
}

// ---------------- Modal Controls ----------------
function openAddStudentForm() {
    document.getElementById("modalTitle").textContent = "Add Student";
    document.getElementById("studentForm").reset(); // Clear form
    document.getElementById("editIndex").value = "";
    document.getElementById("studentModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("studentModal").style.display = "none";
}

// ---------------- Render Table ----------------
function renderTable() {
    const tbody = document.querySelector("#studentTable tbody");
    tbody.innerHTML = ""; // Clear old rows

    // Loop through students and create rows
    students.forEach((student, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${student.name}</td>
          <td>${student.roll}</td>
          <td>${student.gmail}</td>
          <td>${student.address}</td>
          <td>${student.dom}</td>
          <td>${student.age}</td>
          <td>${student.phone}</td>
          <td>${student.gender}</td>
          <td>
            <button class="action-btn edit-btn" onclick="editStudent(${index})">Edit</button>
            <button class="action-btn delete-btn" onclick="deleteStudent(${index})">Delete</button>
          </td>
        `;
        tbody.appendChild(row);
    });
}

// ---------------- Edit Student ----------------
function editStudent(index) {
    const student = students[index];

    // Pre-fill modal with selected student’s data
    document.getElementById("modalTitle").textContent = "Edit Student";
    document.getElementById("studentName").value = student.name;
    document.getElementById("studentRoll").value = student.roll;
    document.getElementById("studentGender").value = student.gender || "";
    document.getElementById("studentGmail").value = student.gmail;
    document.getElementById("studentAddress").value = student.address;
    document.getElementById("studentDom").value = student.dom;
    document.getElementById("studentAge").value = student.age;
    document.getElementById("studentPhone").value = student.phone;
    document.getElementById("editIndex").value = index;

    document.getElementById("studentModal").style.display = "flex";
}

// ---------------- Search Functionality ----------------
document.getElementById("searchInput").addEventListener("input", function () {
    const filter = this.value.toLowerCase();
    const rows = document.querySelectorAll("#studentTable tbody tr");

    rows.forEach(row => {
        const nameCell = row.querySelector("td:first-child");
        if (nameCell) {
            const nameText = nameCell.textContent.toLowerCase();
            row.style.display = nameText.includes(filter) ? "" : "none"; // Show/Hide
        }
    });
});

// ---------------- Navigation ----------------
function goBack() {
    window.history.back(); // Go to previous page
}

function goToAttendance() {
    // Redirect to attendance page
    window.location.href = "../pages/attendance.html";
}
