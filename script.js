// Configuration
const BASE_URL = "http://localhost:8080";
const API_URL = `${BASE_URL}/students`;
const ADD_URL = `${BASE_URL}/add-student`;
const UPDATE_URL = `${BASE_URL}/update`;
const DELETE_URL = `${BASE_URL}/students`;

// DOM Elements
const tableBody = document.getElementById('student-table-body');
const loadingSpinner = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const emptyState = document.getElementById('empty-state');
const tableContainer = document.getElementById('table-container');

// Modal Elements
const studentModal = document.getElementById('student-modal');
const studentForm = document.getElementById('student-form');
const modalTitle = document.getElementById('modal-title');
const inputId = document.getElementById('student-id');
const inputName = document.getElementById('name');
const inputEmail = document.getElementById('email');
const inputAge = document.getElementById('age');
const addStudentBtn = document.querySelector('.header-right button');

// --- Event Listeners ---

// Open Modal for Add
addStudentBtn.onclick = () => openModal();

// Form Submit
studentForm.onsubmit = async (e) => {
    e.preventDefault();
    const id = inputId.value;
    const student = {
        name: inputName.value,
        email: inputEmail.value,
        age: parseInt(inputAge.value)
    };

    if (id) {
        await updateStudent(id, student);
    } else {
        await createStudent(student);
    }
};

// Close Modal when clicking outside
window.onclick = (event) => {
    if (event.target === studentModal) {
        closeModal();
    }
};

// --- API Functions ---

// 1. Fetch Students (Read)
async function fetchStudents() {
    showLoading();
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const students = await response.json();
        renderStudents(students);
    } catch (error) {
        console.error("Error fetching students:", error);
        showError();
    } finally {
        hideLoading();
    }
}

// 2. Create Student
async function createStudent(student) {
    try {
        const response = await fetch(ADD_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student)
        });

        if (!response.ok) throw new Error('Failed to create student');

        closeModal();
        fetchStudents(); // Refresh list
    } catch (error) {
        console.error("Error creating student:", error);
        alert("Failed to create student. Please check the console.");
    }
}

// 3. Update Student
async function updateStudent(id, student) {
    try {
        const response = await fetch(`${UPDATE_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student)
        });

        if (!response.ok) throw new Error('Failed to update student');

        closeModal();
        fetchStudents(); // Refresh list
    } catch (error) {
        console.error("Error updating student:", error);
        alert("Failed to update student. Please check the console.");
    }
}

// 4. Delete Student
async function deleteStudent(id) {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
        const response = await fetch(`${DELETE_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete student');

        fetchStudents(); // Refresh list
    } catch (error) {
        console.error("Error deleting student:", error);
        alert("Failed to delete student. Please check the console.");
    }
}

// --- UI Functions ---

function renderStudents(students) {
    tableBody.innerHTML = '';

    if (!students || students.length === 0) {
        showEmptyState();
        return;
    }

    emptyState.style.display = 'none';
    tableContainer.style.display = 'block';

    students.forEach(student => {
        if (!student.id) return; // Skip if no ID

        const row = document.createElement('tr');
        // Using quotes for ID to handle strings safely in onclick
        const idSafe = `'${student.id}'`;



        // Prepare object for edit (encode to avoid syntax errors)
        const studentData = JSON.stringify(student).replace(/"/g, '&quot;');

        row.innerHTML = `
            <td>#${student.id}</td>
            <td style="font-weight: 500;">
                ${student.name}
            </td>
            <td>${student.age}</td>
            <td style="color: var(--muted);">${student.email}</td>
            <td style="text-align: right;">
                <button class="btn" style="border: none; padding: 0.5rem; color: var(--fg); font-size: 0.8rem;" onclick="openModal(${studentData})">
                    EDIT
                </button>
                <button class="btn" style="border: none; padding: 0.5rem; color: var(--muted); font-size: 0.8rem;" onclick="deleteStudent(${idSafe})">
                    DELETE
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function openModal(student = null) {
    studentModal.style.display = 'flex';
    if (student) {
        // Edit Mode
        modalTitle.textContent = "Edit Student";
        inputId.value = student.id;
        inputName.value = student.name;
        inputEmail.value = student.email;
        inputAge.value = student.age;
    } else {
        // Add Mode
        modalTitle.textContent = "Add Student";
        studentForm.reset();
        inputId.value = '';
    }
}

function closeModal() {
    studentModal.style.display = 'none';
}



// Utility Functions
function showLoading() {
    loadingSpinner.style.display = 'block';
    tableContainer.style.display = 'none';
    emptyState.style.display = 'none';
    errorMessage.style.display = 'none';
}

function hideLoading() {
    loadingSpinner.style.display = 'none';
}

function showEmptyState() {
    emptyState.style.display = 'block';
    tableContainer.style.display = 'none';
}

function showError() {
    errorMessage.style.display = 'block';
    loadingSpinner.style.display = 'none';
    tableContainer.style.display = 'none';
}

// Initialize
document.addEventListener('DOMContentLoaded', fetchStudents);
