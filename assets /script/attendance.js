console.log('attendance.js loaded');

const cardId =  localStorage.getItem("currentCardId");; // Replace with selected card ID 
// currentCardId
// const currentCardId = localStorage.getItem("currentCardId");
let students = [];

// Fetch students from backend
async function fetchStudents() {
    console.log(cardId);
    const res = await fetch(`http://localhost:3000/getStudents?cardId=${cardId}`);
    const data = await res.json();
    if (data.success) {
        students = data.students.map(s => ({ ...s, attendance_status: s.attendance_status || 'not-marked' }));
        renderStudents();
    }
}

function renderStudents() {
    const studentList = document.getElementById('studentList');
    studentList.innerHTML = students.map(s => `
        <div class="attendance-card bg-gray-50 border border-gray-200 rounded-lg p-4" data-name="${s.name.toLowerCase()}">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">${s.name.charAt(0)}</div>
                    <div>
                        <h3 class="font-semibold text-gray-800">${s.name}</h3>
                        <p class="text-sm text-gray-600">Roll No: ${s.roll}</p>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button onclick="markAttendance(${s.id}, 'present')"
                        class="present-btn text-white px-3 py-1 rounded-lg font-medium hover:opacity-90 ${s.attendance_status === 'present' ? 'ring-2 ring-green-300' : ''}">
                        ✅ Present
                    </button>
                    <button onclick="markAttendance(${s.id}, 'absent')"
                        class="absent-btn text-white px-3 py-1 rounded-lg font-medium hover:opacity-90 ${s.attendance_status === 'absent' ? 'ring-2 ring-red-300' : ''}">
                        ❌ Absent
                    </button>
                    <button onclick="markAttendance(${s.id}, 'late')"
                        class="late-btn text-white px-3 py-1 rounded-lg font-medium hover:opacity-90 ${s.attendance_status === 'late' ? 'ring-2 ring-yellow-300' : ''}">
                        ⏰ Late
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    updateStats();
}

async function markAttendance(studentId, status) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    student.attendance_status = status;
    renderStudents();

    // Update DB
    await fetch(`http://localhost:3000/updateStudent/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            cardId,
            name: student.name,
            roll: student.roll,
            gmail: student.gmail,
            address: student.address,
            dom: student.dom,
            age: student.age,
            phone: student.phone,
            gender: student.gender,
            attendance_status: status
        })
    });
}

async function markAllPresent() {
    for (const s of students) {
        s.attendance_status = 'present';
    }
    renderStudents();
    for (const s of students) {
        await markAttendance(s.id, 'present');
    }
}

async function deleteAllAttendance() {
    if (!confirm('Mark all students as absent?')) return;
    for (const s of students) {
        s.attendance_status = 'absent';
    }
    renderStudents();
    for (const s of students) {
        await markAttendance(s.id, 'absent');
    }
}

function updateStats() {
    document.getElementById('presentCount').textContent = students.filter(s => s.attendance_status === 'present').length;
    document.getElementById('absentCount').textContent = students.filter(s => s.attendance_status === 'absent').length;
    document.getElementById('lateCount').textContent = students.filter(s => s.attendance_status === 'late').length;
    document.getElementById('totalCount').textContent = students.length;
}

function exportAttendance() {
    const csv = "data:text/csv;charset=utf-8," + ["Name,Roll,Status", ...students.map(s => `${s.name},${s.roll},${s.attendance_status}`)].join("\n");
    const encoded = encodeURI(csv);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download", `attendance_card_${cardId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function filterStudents() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    document.querySelectorAll('#studentList .attendance-card').forEach(card => {
        card.style.display = card.dataset.name.includes(query) ? '' : 'none';
    });
}

function fetchAttendance() {
    const date = document.getElementById('attendanceDate').value;
    const storedCardId = cardId || localStorage.getItem("cardId");
    if (!date || !storedCardId) return;

    fetch(`http://localhost:3000/getAttendance?cardId=${storedCardId}&date=${date}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Map attendance data correctly
                students.forEach(student => {
                    // Convert keys to numbers to match student.id
                    const dbRecord = Object.entries(data.attendance)
                        .find(([dbId, status]) => Number(dbId) === Number(student.id));
                    student.attendance_status = dbRecord ? dbRecord[1] : 'not-marked';
                });

                renderStudents();
                updateStats(); // <-- now counts will update
            } else {
                console.error("Failed to fetch attendance:", data.message);
            }
        })
        .catch(err => {
            console.error("Error fetching attendance:", err);
        });
}


async function saveAttendance() {
    console.log("It reached");

    // Get today's date if no date entered
    let date = document.getElementById('attendanceDate').value;
    if (!date) {
        const today = new Date();
        date = today.toISOString().split('T')[0]; // format YYYY-MM-DD
        document.getElementById('attendanceDate').value = date;
    }

    console.log("Final Date Value:", date);

    // Make sure cardId exists (from URL or localStorage)
    const cardId =  localStorage.getItem("currentCardId");; // Replace with selected card ID 
    if (!cardId) {
        alert('❌ cardId is missing!');
        return;
    }

    const attendanceData = students.map(s => ({
        student_id: s.id,
        status: s.attendance_status
    }));

    try {
        const res = await fetch('http://localhost:3000/saveAttendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cardId: cardId,  // match backend name
                date: date,
                attendanceData: attendanceData
            })
        });

        const data = await res.json();
        if (data.success) {
            alert('✅ Attendance saved successfully!');
        } else {
            alert('❌ Failed to save: ' + data.message);
        }
    } catch (err) {
        console.error(err);
        alert('❌ Error saving attendance');
    }
}


function goBack() {
    history.back();
}

document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('saveAttendanceBtn').addEventListener('click', saveAttendance);
    document.getElementById('goBackBtn').addEventListener('click', goBack);
    document.getElementById('markAllPresentBtn').addEventListener('click', markAllPresent);
    document.getElementById('deleteAllAttendanceBtn').addEventListener('click', deleteAllAttendance);
    document.getElementById('exportAttendanceBtn').addEventListener('click', exportAttendance);
    document.getElementById('attendanceDate').addEventListener('change', fetchAttendance);

    document.getElementById('attendanceDate').value = new Date().toISOString().split('T')[0];

    await fetchStudents(); // Wait until students are loaded
    fetchAttendance();     // Then fetch attendance
});
