const API_URL = "/api";
let token = localStorage.getItem("token");
let user = JSON.parse(localStorage.getItem("user") || "null");

// cart храним в localStorage
let cart = JSON.parse(localStorage.getItem("cart") || "[]"); // [{id,name,price,qty}]

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
    fetchMenu();
    updateAuthUI();
    setupEventListeners();
    renderCart();
    updateCartCount();
});

// --- UI Updates ---
function updateAuthUI() {
    const authNav = document.getElementById("auth-nav");
    if (!authNav) return;

    if (token && user) {
        authNav.innerHTML = `
      <span class="user-welcome">Welcome, ${user.username}</span>
      <button class="btn btn-outline" id="logout-btn">Logout</button>
    `;
        document.getElementById("logout-btn").addEventListener("click", logout);
    } else {
        authNav.innerHTML = `
      <button class="btn btn-outline" id="login-btn">Login</button>
      <button class="btn btn-primary" id="register-btn">Sign Up</button>
    `;
        document.getElementById("login-btn").addEventListener("click", () => showAuthModal("login"));
        document.getElementById("register-btn").addEventListener("click", () => showAuthModal("register"));
    }
}

const MENU_ITEMS = [
    { id: 1, name: "Bruschetta", category: "Appetizer", price: 6, image: "images/menu/bruschetta.jpg" },
    { id: 2, name: "Spring Rolls", category: "Appetizer", price: 5, image: "images/menu/spring-rolls.jpg" },
    { id: 3, name: "Garlic Bread", category: "Appetizer", price: 4, image: "images/menu/garlic-bread.jpg" },
    { id: 4, name: "Nachos", category: "Appetizer", price: 7, image: "images/menu/nachos.jpg" },

    { id: 5, name: "Steak", category: "Main Course", price: 18, image: "images/menu/steak.jpg" },
    { id: 6, name: "Pasta Carbonara", category: "Main Course", price: 14, image: "images/menu/pasta-carbonara.jpg" },
    { id: 7, name: "Burger", category: "Main Course", price: 12, image: "images/menu/burger.jpg" },
    { id: 8, name: "Pizza", category: "Main Course", price: 15, image: "images/menu/pizza.jpg" },

    { id: 9, name: "Cheesecake", category: "Dessert", price: 6, image: "images/menu/cheesecake.jpg" },
    { id: 10, name: "Chocolate Cake", category: "Dessert", price: 7, image: "images/menu/chocolate-cake.jpg" },
    { id: 11, name: "Ice Cream", category: "Dessert", price: 5, image: "images/menu/ice-cream.jpg" },
    { id: 12, name: "Tiramisu", category: "Dessert", price: 6, image: "images/menu/tiramisu.jpg" },

    { id: 13, name: "Coffee", category: "Drinks", price: 3, image: "images/menu/coffee.jpg" },
    { id: 14, name: "Fresh Juice", category: "Drinks", price: 4, image: "images/menu/fresh-juice.jpg" },
    { id: 15, name: "Lemonade", category: "Drinks", price: 4, image: "images/menu/lemonade.jpg" },
    { id: 16, name: "Tea", category: "Drinks", price: 3, image: "images/menu/tea.jpg" },
];

function fetchMenu(category = "all") {
    const items = category === "all" ? MENU_ITEMS : MENU_ITEMS.filter((i) => i.category === category);
    renderMenu(items);
}

function renderMenu(items) {
    const grid = document.getElementById("menu-grid");
    if (!grid) return;


    grid.innerHTML = items.map(item => `
    <div class="menu-item">
      <img
      src="${item.image}"
      alt="${item.name}"
      loading="lazy"
      referrerpolicy="no-referrer"
      onerror="this.onerror=null; this.src='images/placeholder-food.svg';"
      />
      <div class="menu-item-content">
        <h3>${item.name}</h3>
        <div class="price">$${item.price}</div>
        <button class="choose-btn" data-id="${item.id}">Add to Cart</button>
      </div>
    </div>
  `).join("");
}

// --- Auth Functions ---
function showAuthModal(type) {
    const modal = document.getElementById("auth-modal");
    const forms = document.getElementById("auth-forms");
    if (!modal || !forms) return;

    modal.style.display = "block";

    if (type === "login") {
        forms.innerHTML = `
      <h2>Login</h2>
      <form id="login-form-inner">
        <input type="email" placeholder="Email" id="login-email" required>
        <input type="password" placeholder="Password" id="login-password" required>
        <button type="submit" class="btn btn-primary w-full">Login</button>
      </form>
    `;
    } else {
        forms.innerHTML = `
      <h2>Register</h2>
      <form id="register-form-inner">
        <input type="text" placeholder="Username" id="reg-username" required>
        <input type="email" placeholder="Email" id="reg-email" required>
        <input type="password" placeholder="Password" id="reg-password" required>
        <button type="submit" class="btn btn-primary w-full">Sign Up</button>
      </form>
    `;
    }

    const currentForm = forms.querySelector("form");
    currentForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const path = type === "login" ? "/auth/login" : "/auth/register";
        const body =
            type === "login"
                ? { email: e.target[0].value, password: e.target[1].value }
                : { username: e.target[0].value, email: e.target[1].value, password: e.target[2].value };

        const res = await fetch(`${API_URL}${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            token = data.token;
            user = data.user;
            modal.style.display = "none";
            updateAuthUI();
        } else {
            alert(data.message || "Auth failed");
        }
    });
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    token = null;
    user = null;
    updateAuthUI();
}

// --- Cart (Fixed) ---
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
    const countEl = document.getElementById("cart-count");
    if (countEl) countEl.textContent = `(${cart.reduce((s, x) => s + x.qty, 0)})`;
}

function addToCartById(id) {
    if (!token) return alert("Please login to order!");

    const item = MENU_ITEMS.find((x) => x.id === id);
    if (!item) return;

    const existing = cart.find((x) => x.id === id);
    if (existing) existing.qty += 1;
    else cart.push({ id: item.id, name: item.name, price: item.price, qty: 1 });

    saveCart();
    renderCart();
    updateCartCount();
}

function renderCart() {
    const cartEl = document.getElementById("cart-items");
    const orderForm = document.getElementById("order-form-container");
    if (!cartEl) return;

    if (cart.length === 0) {
        cartEl.innerHTML = '<p class="empty-msg">Your cart is empty. Add items from the menu!</p>';
        if (orderForm) orderForm.style.display = "none";
        updateCartCount();
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    cartEl.innerHTML = `
    <div class="cart-list">
      ${cart
            .map(
                (item) => `
        <div class="cart-item">
          <span>${item.name} × ${item.qty}</span>
          <span>$${item.price * item.qty}</span>
          <div>
            <button class="qty-btn" data-action="dec" data-id="${item.id}">−</button>
            <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
            <button class="remove-btn" data-action="remove" data-id="${item.id}">×</button>
          </div>
        </div>
      `
            )
            .join("")}
      <div class="cart-total">
        <strong>Total: $${total}</strong>
      </div>
    </div>
  `;

    if (orderForm) orderForm.style.display = "block";
    updateCartCount();
}

function removeFromCart(id) {
    cart = cart.filter((x) => x.id !== id);
    saveCart();
    renderCart();
    updateCartCount();
}

function changeQty(id, delta) {
    const item = cart.find((x) => x.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter((x) => x.id !== id);
    saveCart();
    renderCart();
    updateCartCount();
}

// --- Event Listeners ---
function setupEventListeners() {
    // Filters
    document.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
            e.target.classList.add("active");
            fetchMenu(e.target.dataset.category);
        });
    });

    // Add to Cart buttons (delegation)
    const grid = document.getElementById("menu-grid");
    if (grid) {
        grid.addEventListener("click", (e) => {
            const btn = e.target.closest(".choose-btn");
            if (!btn) return;
            addToCartById(Number(btn.dataset.id));
        });
    }

    // Cart buttons (delegation)
    const cartEl = document.getElementById("cart-items");
    if (cartEl) {
        cartEl.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-action]");
            if (!btn) return;
            const id = Number(btn.dataset.id);
            const action = btn.dataset.action;

            if (action === "inc") return changeQty(id, +1);
            if (action === "dec") return changeQty(id, -1);
            if (action === "remove") return removeFromCart(id);
        });
    }

    // Close modal (если есть)
    const closeBtn = document.querySelector(".close-modal");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            const modal = document.getElementById("auth-modal");
            if (modal) modal.style.display = "none";
        });
    }

    // Booking form (ТОЛЬКО если он реально есть на странице)
    const bookingForm = document.getElementById("booking-form");
    if (bookingForm) {
        bookingForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (!token) return alert("Please login to book a table!");

            const bookingData = {
                date: document.getElementById("date").value,
                time: document.getElementById("time").value,
                guests: document.getElementById("guests").value,
            };

            const res = await fetch(`${API_URL}/bookings`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(bookingData),
            });

            if (res.ok) {
                alert("Booking successful!");
                e.target.reset();
            } else {
                const err = await res.json().catch(() => ({}));
                alert(err.message || "Booking failed");
            }
        });
    }

    // Order form (ТОЛЬКО если есть)
    const orderForm = document.getElementById("order-form");
    if (orderForm) {
        orderForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (!token) return alert("Please login to order!");

            const orderData = {
                items: cart.map((i) => ({ menuItem: i.id, quantity: i.qty })),
                totalAmount: cart.reduce((sum, item) => sum + item.price * item.qty, 0),
                address: document.getElementById("address").value,
                phone: document.getElementById("phone").value,
                paymentMethod: document.getElementById("payment").value,
            };

            const res = await fetch(`${API_URL}/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(orderData),
            });

            if (res.ok) {
                alert("Order placed successfully!");
                cart = [];
                saveCart();
                renderCart();
                e.target.reset();
            } else {
                const err = await res.json().catch(() => ({}));
                alert(err.message || "Order failed");
            }
        });
    }
}
