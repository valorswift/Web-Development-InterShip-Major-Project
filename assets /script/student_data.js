let students = [];
let currentCardId = null;

window.onload = async function () {
  currentCardId = localStorage.getItem("currentCardId");
  if (!currentCardId) {
    alert("No card selected.");
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/getStudents?cardId=${encodeURIComponent(currentCardId)}`);
    const data = await response.json();

    if (data.success) {
      students = data.students;  // expecting array of student objects with id included
      renderTable();
    } else {
      alert("Failed to load students: " + data.message);
    }
  } catch (err) {
    alert("Error loading students: " + err.message);
  }
};

document.getElementById("studentForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const student = {
  name: document.getElementById("studentName").value,
  roll: document.getElementById("studentRoll").value,
  gmail: document.getElementById("studentGmail").value,
  address: document.getElementById("studentAddress").value,
  dom: document.getElementById("studentDom").value,
  age: document.getElementById("studentAge").value,
  phone: document.getElementById("studentPhone").value,
  gender: document.getElementById("studentGender").value  // get dropdown value
};


  const editIndex = document.getElementById("editIndex").value;

  if (editIndex) {
    // Edit existing student - send update request to backend
    try {
      const studentId = students[editIndex].id;
      const res = await fetch(`http://localhost:3000/updateStudent/${studentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...student, cardId: currentCardId })
      });
      const data = await res.json();

      if (data.success) {
        students[editIndex] = { id: studentId, ...student };
        renderTable();
        closeModal();
      } else {
        alert("Failed to update student: " + data.message);
      }
    } catch (err) {
      alert("Error updating student: " + err.message);
    }
  } else {
    // Add new student - send add request to backend
    try {
      const res = await fetch(`http://localhost:3000/addStudent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...student, cardId: currentCardId })
      });
      const data = await res.json();

      if (data.success && data.studentId) {
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

function deleteStudent(index) {
  if (!confirm("Are you sure you want to delete this student?")) return;

  const studentId = students[index].id;

  fetch(`http://localhost:3000/deleteStudent/${studentId}`, {
    method: "DELETE"
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
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

// --- rest of your existing code below (unchanged) ---

function openAddStudentForm() {
  document.getElementById("modalTitle").textContent = "Add Student";
  document.getElementById("studentForm").reset();
  document.getElementById("editIndex").value = "";
  document.getElementById("studentModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("studentModal").style.display = "none";
}

function renderTable() {
  const tbody = document.querySelector("#studentTable tbody");
  tbody.innerHTML = "";

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

function editStudent(index) {
  const student = students[index];
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

document.getElementById("searchInput").addEventListener("input", function () {
  const filter = this.value.toLowerCase();
  const rows = document.querySelectorAll("#studentTable tbody tr");

  rows.forEach(row => {
    const nameCell = row.querySelector("td:first-child");
    if (nameCell) {
      const nameText = nameCell.textContent.toLowerCase();
      row.style.display = nameText.includes(filter) ? "" : "none";
    }
  });
});

function goBack() {
  window.history.back();
}
