const API_URL = "/api";
let user = null;
let menuItems = [];
let adminEditMenuId = null;
let adminBookings = [];

let cart = JSON.parse(localStorage.getItem("cart") || "[]");

document.addEventListener("DOMContentLoaded", () => {
    init();
});

async function init() {
    await checkAuth();
    await loadMenu();
    updateAuthUI();
    setupEventListeners();
    renderCart();
    updateCartCount();

    if (isAdmin()) {
        showAdminPanel();
        await loadAdminData();
    }
}

async function checkAuth() {
    try {
        const res = await fetch(`${API_URL}/auth/profile`, {
            credentials: "include"
        });
        if (!res.ok) {
            user = null;
            return;
        }
        user = await res.json();
    } catch (err) {
        user = null;
    }
}

function isAdmin() {
    return user && user.role === "admin";
}

function updateAuthUI() {
    const authNav = document.getElementById("auth-nav");
    if (!authNav) return;

    if (user) {
        const adminLink = isAdmin() ? '<a href="#admin-panel" class="btn btn-outline" style="padding: 8px 20px;">Admin</a>' : "";
        authNav.innerHTML = `
      <span class="user-welcome">Welcome, ${user.username}</span>
      ${adminLink}
      <button class="btn btn-outline" id="logout-btn">Logout</button>
    `;
        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) logoutBtn.addEventListener("click", logout);
    } else {
        authNav.innerHTML = `
      <button class="btn btn-outline" id="login-btn">Login</button>
      <button class="btn btn-primary" id="register-btn">Sign Up</button>
    `;
        const loginBtn = document.getElementById("login-btn");
        const registerBtn = document.getElementById("register-btn");
        if (loginBtn) loginBtn.addEventListener("click", () => showAuthModal("login"));
        if (registerBtn) registerBtn.addEventListener("click", () => showAuthModal("register"));
    }
}

async function loadMenu() {
    try {
        const res = await fetch(`${API_URL}/menu`);
        if (!res.ok) throw new Error("Menu load failed");
        menuItems = await res.json();
        fetchMenu();
    } catch (err) {
        const grid = document.getElementById("menu-grid");
        if (grid) grid.innerHTML = "<p class=\"empty-msg\">Menu is unavailable.</p>";
    }
}

function fetchMenu(category = "all") {
    const visible = isAdmin() ? menuItems : menuItems.filter((i) => i.isAvailable !== false);
    const items = category === "all" ? visible : visible.filter((i) => i.category === category);
    renderMenu(items);
}

function renderMenu(items) {
    const grid = document.getElementById("menu-grid");
    if (!grid) return;

    grid.innerHTML = items.map(item => `
    <div class="menu-item">
      <img
      src="${item.image || "images/placeholder-food.svg"}"
      alt="${item.name}"
      loading="lazy"
      referrerpolicy="no-referrer"
      onerror="this.onerror=null; this.src='images/placeholder-food.svg';"
      />
      <div class="menu-item-content">
        <h3>${item.name}</h3>
        <div class="price">$${item.price}</div>
        <button class="choose-btn" data-id="${item._id}">Add to Cart</button>
      </div>
    </div>
  `).join("");
}

function showAuthModal(type) {
    const modal = document.getElementById("auth-modal");
    const forms = document.getElementById("auth-forms");
    if (!modal || !forms) return;

    modal.style.display = "block";

    if (type === "login") {
        forms.innerHTML = `
      <div class="auth-title">Login</div>
      <form id="login-form-inner" class="auth-form">
        <div class="auth-grid">
          <div class="auth-fields">
            <input class="auth-input" type="email" placeholder="Email" id="login-email" required>
            <input class="auth-input" type="password" placeholder="Password" id="login-password" required>
          </div>
          <button type="submit" class="auth-action">Login</button>
        </div>
        <div class="auth-hint">Use your account email and password</div>
      </form>
    `;
    } else {
        forms.innerHTML = `
      <div class="auth-title">Register</div>
      <form id="register-form-inner" class="auth-form">
        <div class="auth-grid">
          <div class="auth-fields">
            <input class="auth-input" type="text" placeholder="Username" id="reg-username" required>
            <input class="auth-input" type="email" placeholder="Email" id="reg-email" required>
            <input class="auth-input" type="password" placeholder="Password" id="reg-password" required>
          </div>
          <button type="submit" class="auth-action">Sign Up</button>
        </div>
        <div class="auth-hint">Create a new account to continue</div>
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
            credentials: "include",
            body: JSON.stringify(body),
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok) {
            user = data.user || null;
            if (!user) await checkAuth();
            modal.style.display = "none";
            updateAuthUI();
            if (isAdmin()) {
                showAdminPanel();
                await loadAdminData();
            }
        } else {
            alert(data.message || "Auth failed");
        }
    });
}

async function logout() {
    await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include"
    });
    user = null;
    updateAuthUI();
    hideAdminPanel();
}

function showAdminPanel() {
    const panel = document.getElementById("admin-panel");
    if (panel) panel.style.display = "block";
}

function hideAdminPanel() {
    const panel = document.getElementById("admin-panel");
    if (panel) panel.style.display = "none";
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
    const countEl = document.getElementById("cart-count");
    if (countEl) countEl.textContent = `(${cart.reduce((s, x) => s + x.qty, 0)})`;
}

function addToCartById(id) {
    if (!user) return alert("Please login to order!");

    const item = menuItems.find((x) => x._id === id);
    if (!item) return;

    const existing = cart.find((x) => x.id === id);
    if (existing) existing.qty += 1;
    else cart.push({ id: item._id, name: item.name, price: item.price, qty: 1 });

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
          <span>${item.name} x ${item.qty}</span>
          <span>$${item.price * item.qty}</span>
          <div>
            <button class="qty-btn" data-action="dec" data-id="${item.id}">-</button>
            <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
            <button class="remove-btn" data-action="remove" data-id="${item.id}">x</button>
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

function setupEventListeners() {
    document.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
            e.target.classList.add("active");
            fetchMenu(e.target.dataset.category);
        });
    });

    const grid = document.getElementById("menu-grid");
    if (grid) {
        grid.addEventListener("click", (e) => {
            const btn = e.target.closest(".choose-btn");
            if (!btn) return;
            addToCartById(btn.dataset.id);
        });
    }

    const cartEl = document.getElementById("cart-items");
    if (cartEl) {
        cartEl.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-action]");
            if (!btn) return;
            const id = btn.dataset.id;
            const action = btn.dataset.action;

            if (action === "inc") return changeQty(id, +1);
            if (action === "dec") return changeQty(id, -1);
            if (action === "remove") return removeFromCart(id);
        });
    }

    const closeBtn = document.querySelector(".close-modal");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            const modal = document.getElementById("auth-modal");
            if (modal) modal.style.display = "none";
        });
    }

    const bookingForm = document.getElementById("booking-form");
    if (bookingForm) {
        bookingForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (!user) return alert("Please login to book a table!");

            const bookingData = {
                date: document.getElementById("date").value,
                time: document.getElementById("time").value,
                guests: document.getElementById("guests").value,
            };

            const res = await fetch(`${API_URL}/bookings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
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

    const orderForm = document.getElementById("order-form");
    if (orderForm) {
        orderForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (!user) return alert("Please login to order!");

            const orderData = {
                items: cart.map((i) => ({ menuItem: i.id, quantity: i.qty })),
                totalAmount: cart.reduce((sum, item) => sum + item.price * item.qty, 0),
                address: document.getElementById("address").value,
                phone: document.getElementById("phone").value,
                paymentMethod: document.getElementById("payment").value,
            };

            const res = await fetch(`${API_URL}/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
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

    const adminMenuForm = document.getElementById("admin-menu-form");
    if (adminMenuForm) {
        adminMenuForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (!isAdmin()) return alert("Admin access required");

            const payload = {
                name: document.getElementById("menu-name").value,
                description: document.getElementById("menu-desc").value,
                price: Number(document.getElementById("menu-price").value),
                category: document.getElementById("menu-category").value,
                image: document.getElementById("menu-image").value,
                isAvailable: true
            };

            const url = adminEditMenuId ? `${API_URL}/menu/${adminEditMenuId}` : `${API_URL}/menu`;
            const method = adminEditMenuId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                adminEditMenuId = null;
                adminMenuForm.reset();
                await loadAdminMenu();
                await loadMenu();
            } else {
                const err = await res.json().catch(() => ({}));
                alert(err.message || "Menu update failed");
            }
        });
    }

    const adminMenuList = document.getElementById("admin-menu-list");
    if (adminMenuList) {
        adminMenuList.addEventListener("click", async (e) => {
            const btn = e.target.closest("button");
            if (!btn) return;
            const action = btn.dataset.action;
            const id = btn.dataset.id;

            if (action === "delete") {
                if (!confirm("Delete this item?")) return;
                await fetch(`${API_URL}/menu/${id}`, {
                    method: "DELETE",
                    credentials: "include"
                });
                await loadAdminMenu();
                await loadMenu();
            }

            if (action === "edit") {
                const item = menuItems.find((x) => x._id === id);
                if (!item) return;
                adminEditMenuId = id;
                document.getElementById("menu-name").value = item.name;
                document.getElementById("menu-desc").value = item.description;
                document.getElementById("menu-price").value = item.price;
                document.getElementById("menu-category").value = item.category;
                document.getElementById("menu-image").value = item.image || "";
            }
        });
    }

    const adminBookingsEl = document.getElementById("admin-bookings");
    if (adminBookingsEl) {
        adminBookingsEl.addEventListener("click", async (e) => {
            const btn = e.target.closest("button");
            if (!btn) return;
            const action = btn.dataset.action;
            const id = btn.dataset.id;

            if (action === "delete") {
                if (!confirm("Delete this booking?")) return;
                await fetch(`${API_URL}/bookings/${id}`, { method: "DELETE", credentials: "include" });
                await loadAdminBookings();
            }

            if (action === "status") {
                const status = btn.dataset.status;
                await updateBookingStatus(id, status);
            }
        });
    }

    const adminOrdersEl = document.getElementById("admin-orders");
    if (adminOrdersEl) {
        adminOrdersEl.addEventListener("click", async (e) => {
            const btn = e.target.closest("button");
            if (!btn) return;
            const action = btn.dataset.action;
            const id = btn.dataset.id;

            if (action === "delete") {
                if (!confirm("Delete this order?")) return;
                await fetch(`${API_URL}/orders/${id}`, { method: "DELETE", credentials: "include" });
                await loadAdminOrders();
            }

            if (action === "status") {
                const status = btn.dataset.status;
                await fetch(`${API_URL}/orders/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ status })
                });
                await loadAdminOrders();
            }
        });
    }
}

async function loadAdminData() {
    await Promise.all([loadAdminMenu(), loadAdminBookings(), loadAdminOrders()]);
}

async function loadAdminMenu() {
    try {
        const res = await fetch(`${API_URL}/menu/admin`, { credentials: "include" });
        if (!res.ok) return;
        menuItems = await res.json();
        const list = document.getElementById("admin-menu-list");
        if (!list) return;
        list.innerHTML = menuItems.map(item => `
            <div class="admin-item">
                <div><strong>${item.name}</strong> - $${item.price}</div>
                <div>${item.category}</div>
                <div class="admin-actions">
                    <button data-action="edit" data-id="${item._id}">Edit</button>
                    <button data-action="delete" data-id="${item._id}">Delete</button>
                </div>
            </div>
        `).join("");
        fetchMenu();
    } catch (err) {
        return;
    }
}

async function loadAdminBookings() {
    try {
        const res = await fetch(`${API_URL}/bookings`, { credentials: "include" });
        if (!res.ok) return;
        adminBookings = await res.json();
        const list = document.getElementById("admin-bookings");
        if (!list) return;
        list.innerHTML = adminBookings.map(booking => `
            <div class="admin-item">
                <div><strong>${booking.user?.username || "User"}</strong> - ${new Date(booking.date).toLocaleDateString()} ${booking.time}</div>
                <div>Status: ${booking.status}</div>
                <div class="admin-actions">
                    <button data-action="status" data-status="confirmed" data-id="${booking._id}">Confirm</button>
                    <button data-action="status" data-status="cancelled" data-id="${booking._id}">Cancel</button>
                    <button data-action="delete" data-id="${booking._id}">Delete</button>
                </div>
            </div>
        `).join("");
    } catch (err) {
        return;
    }
}

async function updateBookingStatus(id, status) {
    const booking = adminBookings.find((b) => b._id === id);
    if (!booking) return;

    const payload = {
        date: booking.date,
        time: booking.time,
        guests: booking.guests,
        tableNumber: booking.tableNumber,
        specialRequests: booking.specialRequests || "",
        status
    };

    await fetch(`${API_URL}/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
    });

    await loadAdminBookings();
}

async function loadAdminOrders() {
    try {
        const res = await fetch(`${API_URL}/orders`, { credentials: "include" });
        if (!res.ok) return;
        const orders = await res.json();
        const list = document.getElementById("admin-orders");
        if (!list) return;
        list.innerHTML = orders.map(order => `
            <div class="admin-item">
                <div><strong>${order.user?.username || "User"}</strong> - $${order.totalAmount}</div>
                <div>Status: ${order.status}</div>
                <div class="admin-actions">
                    <button data-action="status" data-status="processing" data-id="${order._id}">Process</button>
                    <button data-action="status" data-status="shipped" data-id="${order._id}">Ship</button>
                    <button data-action="status" data-status="delivered" data-id="${order._id}">Deliver</button>
                    <button data-action="delete" data-id="${order._id}">Delete</button>
                </div>
            </div>
        `).join("");
    } catch (err) {
        return;
    }
}
