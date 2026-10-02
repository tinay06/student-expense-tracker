// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import 
     {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDrZ09QCDo3eZoLMbiDI1nb1tjo2TE2vyU",
    authDomain: "student-expense-tracker-d08c1.firebaseapp.com",
    projectId: "student-expense-tracker-d08c1",
    storageBucket: "student-expense-tracker-d08c1.firebasestorage.app",
    messagingSenderId: "837485377017",
    appId: "1:837485377017:web:74c6bf838d0a337253f928",
    measurementId: "G-62DEN1L72T"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// Forms
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const dashboardSection = document.getElementById("dashboardSection");


// Login inputs
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");


// Register inputs
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");


// Buttons
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");

const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");


// Messages
const loginMessage = document.getElementById("loginMessage");
const registerMessage = document.getElementById("registerMessage");


// Dashboard
const userEmail = document.getElementById("userEmail");


// -----------------------------
// SWITCH TO REGISTER
// -----------------------------

showRegister.addEventListener("click", () => {

    loginForm.style.display = "none";
    registerForm.style.display = "block";

    loginMessage.textContent = "";
});


// -----------------------------
// SWITCH TO LOGIN
// -----------------------------

showLogin.addEventListener("click", () => {

    registerForm.style.display = "none";
    loginForm.style.display = "block";

    registerMessage.textContent = "";
});


// -----------------------------
// REGISTER
// -----------------------------

registerBtn.addEventListener("click", async () => {

    const email = registerEmail.value.trim();
    const password = registerPassword.value;

    if (!email || !password) {

        registerMessage.textContent =
            "Please enter your email and password.";

        return;
    }

    try {

        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        registerMessage.textContent =
            "Account created successfully!";

    } catch (error) {

        registerMessage.textContent =
            error.message;

    }

});


// -----------------------------
// LOGIN
// -----------------------------

loginBtn.addEventListener("click", async () => {

    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email || !password) {

        loginMessage.textContent =
            "Please enter your email and password.";

        return;
    }

    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        loginMessage.textContent =
            "Login successful!";

    } catch (error) {

        loginMessage.textContent =
            error.message;

    }

});


// -----------------------------
// LOGOUT
// -----------------------------

logoutBtn.addEventListener("click", async () => {

    await signOut(auth);

});


// -----------------------------
// CHECK LOGIN STATUS
// -----------------------------

onAuthStateChanged(auth, (user) => {

    if (user) {

        // User is logged in
        loginForm.style.display = "none";
        registerForm.style.display = "none";
        dashboardSection.style.display = "block";

        userEmail.textContent =
            "Logged in as: " + user.email;

            loadExpenses();

    } else {

        // User is logged out
        dashboardSection.style.display = "none";
        loginForm.style.display = "block";

    }

});
// Show / hide login password
const toggleLoginPassword =
    document.getElementById("toggleLoginPassword");

toggleLoginPassword.addEventListener("click", () => {

    if (loginPassword.type === "password") {
        loginPassword.type = "text";
        toggleLoginPassword.textContent = "";
    } else {
        loginPassword.type = "password";
        toggleLoginPassword.textContent = "👁";
    }

});


// Show / hide register password
const toggleRegisterPassword =
    document.getElementById("toggleRegisterPassword");

toggleRegisterPassword.addEventListener("click", () => {

    if (registerPassword.type === "password") {
        registerPassword.type = "text";
        toggleRegisterPassword.textContent = "";
    } else {
        registerPassword.type = "password";
        toggleRegisterPassword.textContent = "👁";
    }

});
// =============================
// FIRESTORE EXPENSE TRACKER
// =============================

const expenseDescription =
    document.getElementById("expenseDescription");

const expenseAmount =
    document.getElementById("expenseAmount");

const expenseCategory =
    document.getElementById("expenseCategory");

const expenseDate =
    document.getElementById("expenseDate");

const addExpenseBtn =
    document.getElementById("addExpenseBtn");

const expenseMessage =
    document.getElementById("expenseMessage");

const expenseItems =
    document.getElementById("expenseItems");

const totalExpenses =
    document.getElementById("totalExpenses");

const expenseCount =
    document.getElementById("expenseCount");


// -----------------------------
// ADD EXPENSE
// -----------------------------

addExpenseBtn.addEventListener("click", async () => {

    const user = auth.currentUser;

    if (!user) {
        expenseMessage.textContent =
            "Please log in first.";
        return;
    }

    const description =
        expenseDescription.value.trim();

    const amount =
        parseFloat(expenseAmount.value);

    const category =
        expenseCategory.value;

    const date =
        expenseDate.value;


    if (!description || !amount || !category || !date) {

        expenseMessage.textContent =
            "Please complete all expense fields.";

        return;
    }


    try {

        await addDoc(
            collection(
                db,
                "users",
                user.uid,
                "expenses"
            ),
            {
                description: description,
                amount: amount,
                category: category,
                date: date,
                createdAt: serverTimestamp()
            }
        );


        expenseMessage.textContent =
            "Expense added successfully! 🌸";


        // Clear form
        expenseDescription.value = "";
        expenseAmount.value = "";
        expenseCategory.value = "";
        expenseDate.value = "";


        // Reload expenses
        loadExpenses();


    } catch (error) {

        console.error(error);

        expenseMessage.textContent =
            "Error saving expense: " + error.message;

    }

});


// -----------------------------
// LOAD EXPENSES
// -----------------------------

async function loadExpenses() {

    const user = auth.currentUser;

    if (!user) {
        return;
    }


    try {

        const expensesRef =
            collection(
                db,
                "users",
                user.uid,
                "expenses"
            );


        const snapshot =
            await getDocs(expensesRef);


        expenseItems.innerHTML = "";


        let total = 0;
        let count = 0;

        const expensesForChart = [];


        if (snapshot.empty) {

            expenseItems.innerHTML = `
                <p class="empty-message">
                    No expenses added yet.
                </p>
            `;

        }


        snapshot.forEach((expenseDoc) => {

           const expense =
    expenseDoc.data();

expensesForChart.push(expense);

total += Number(expense.amount);
count++;


            const item =
                document.createElement("div");

            item.className =
                "expense-item";


            item.innerHTML = `
                <div class="expense-info">
                    <strong>
                        ${expense.description}
                    </strong>

                    <small>
                        ${expense.category} • ${expense.date}
                    </small>
                </div>

                <div>
    <div class="expense-amount">
        ₱${Number(expense.amount).toFixed(2)}
    </div>

    <button
    class="edit-button"
    data-id="${expenseDoc.id}"
>
    Edit
</button>


    <button
        class="delete-button"
        data-id="${expenseDoc.id}"
    >
        Delete
    </button>
</div>
            `;


            expenseItems.appendChild(item);

        });


        totalExpenses.textContent =
            "₱" + total.toFixed(2);

        expenseCount.textContent =
            count;

         updateExpenseChart(expensesForChart);


    } catch (error) {

        console.error(error);

        expenseItems.innerHTML = `
            <p class="empty-message">
                Unable to load expenses.
            </p>
        `;

    }

}
// =============================
// DELETE EXPENSE
// =============================

document.addEventListener("click", async (event) => {

    if (!event.target.classList.contains("delete-button")) {
        return;
    }

    const expenseId =
        event.target.getAttribute("data-id");

    const user = auth.currentUser;

    if (!user) {
        return;
    }

    const confirmDelete =
        confirm("Are you sure you want to delete this expense?");

    if (!confirmDelete) {
        return;
    }

    try {

        await deleteDoc(
            doc(
                db,
                "users",
                user.uid,
                "expenses",
                expenseId
            )
        );

        loadExpenses();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to delete expense: " +
            error.message
        );

    }

});
// =============================
// EDIT EXPENSE
// =============================

document.addEventListener("click", async (event) => {

    if (!event.target.classList.contains("edit-button")) {
        return;
    }

    const expenseId =
        event.target.getAttribute("data-id");

    const user = auth.currentUser;

    if (!user) {
        return;
    }

    try {

        // Get the current expense
        const expenseRef = doc(
            db,
            "users",
            user.uid,
            "expenses",
            expenseId
        );

        const snapshot =
            await getDocs(
                query(
                    collection(
                        db,
                        "users",
                        user.uid,
                        "expenses"
                    )
                )
            );

        let currentExpense = null;

        snapshot.forEach((expenseDoc) => {

            if (expenseDoc.id === expenseId) {
                currentExpense = expenseDoc.data();
            }

        });

        if (!currentExpense) {
            alert("Expense not found.");
            return;
        }


        // Ask for updated information
        const newDescription =
            prompt(
                "Expense description:",
                currentExpense.description
            );

        if (newDescription === null) {
            return;
        }


        const newAmount =
            prompt(
                "Amount:",
                currentExpense.amount
            );

        if (newAmount === null) {
            return;
        }


        const newCategory =
            prompt(
                "Category:",
                currentExpense.category
            );

        if (newCategory === null) {
            return;
        }


        const newDate =
            prompt(
                "Date (YYYY-MM-DD):",
                currentExpense.date
            );

        if (newDate === null) {
            return;
        }


        // Update Firestore
        await import(
            "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js"
        ).then(({ updateDoc }) => {

            return updateDoc(
                expenseRef,
                {
                    description: newDescription.trim(),
                    amount: Number(newAmount),
                    category: newCategory.trim(),
                    date: newDate
                }
            );

        });


        // Refresh the expense list
        loadExpenses();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to edit expense: " +
            error.message
        );

    }

});
// =============================
// EXPENSE CHART
// =============================

let expenseChart = null;

function updateExpenseChart(expenses) {

    const chartCanvas =
        document.getElementById("expenseChart");

    if (!chartCanvas) {
        return;
    }

    const categoryTotals = {};

    expenses.forEach((expense) => {

        const category = expense.category;
        const amount = Number(expense.amount);

        if (!categoryTotals[category]) {
            categoryTotals[category] = 0;
        }

        categoryTotals[category] += amount;

    });


    const labels =
        Object.keys(categoryTotals);

    const values =
        Object.values(categoryTotals);


    // Remove previous chart
    if (expenseChart) {
        expenseChart.destroy();
    }


    expenseChart = new Chart(
        chartCanvas,
        {
            type: "doughnut",

            data: {
                labels: labels,

                datasets: [{
                    label: "Expenses",
                    data: values
                }]
            },

            options: {
                responsive: true,

                plugins: {
                    legend: {
                        position: "bottom"
                    }
                }
            }
        }
    );

}