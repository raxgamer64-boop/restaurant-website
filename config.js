/* Datta Restaurant - Main Configuration v3
   Database is the source of truth for menu, prices and availability. */

window.RESTAURANT = {
  name: "Datta Restaurant",
  phone: "+91 95463 20565",
  whatsapp: "919546320565",
  address: "Ambedkar Chowk, Maheshpur, Pakur, Jharkhand, India",
  upi: "9546320565-2@ibl"
};

let MENU = [];
let cart = [];
try { cart = JSON.parse(localStorage.getItem("datta_cart") || "[]"); } catch (_) { cart = []; }

const client = () => window.dattaSupabaseClient;

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function loadMenuFromSupabase() {
  const db = client();
  if (!db) throw new Error("Supabase is not initialized. Please refresh the page.");
  const { data, error } = await db.from("menu_items").select("*")
    .eq("is_available", true).order("sort_order", { ascending: true }).order("id", { ascending: true });
  if (error) throw error;
  MENU = (data || []).map(x => ({
    id: Number(x.id), name: x.name || "", price: Number(x.price || 0),
    cat: x.category || "mains", desc: x.description || "",
    image_url: x.image_url || "", badge: x.badge || ""
  }));
  return MENU;
}

function findMenuItem(id) {
  return MENU.find(x => Number(x.id) === Number(id));
}

function saveCart() {
  localStorage.setItem("datta_cart", JSON.stringify(cart));
}

function getCartTotal() {
  return cart.reduce((sum, x) => sum + Number(x.price || 0) * Number(x.qty || 0), 0);
}

function renderCart() {
  const count = document.getElementById("cartCount");
  const items = document.getElementById("cartItems");
  const total = document.getElementById("cartTotal");
  const qty = cart.reduce((s, x) => s + Number(x.qty || 0), 0);
  if (count) count.textContent = qty;
  if (!items) return;
  if (!cart.length) {
    items.innerHTML = '<div class="empty-cart">Your cart is empty.</div>';
    if (total) total.textContent = "₹0";
    return;
  }
  items.innerHTML = cart.map(x => {
    const line = Number(x.price || 0) * Number(x.qty || 0);
    return `<div class="cart-item">
      <div class="cart-item-info"><strong>${escapeHtml(x.name)}</strong><span>₹${x.price} × ${x.qty}</span></div>
      <div class="cart-item-actions">
        <button type="button" onclick="changeCartQty(${x.id},-1)">−</button>
        <span>${x.qty}</span>
        <button type="button" onclick="changeCartQty(${x.id},1)">+</button>
      </div>
      <strong>₹${line}</strong>
    </div>`;
  }).join("");
  if (total) total.textContent = "₹" + getCartTotal();
}

function addToCart(id, quantity = 1) {
  const item = findMenuItem(id);
  if (!item) {
    alert("This menu item is not available right now. Please refresh the page.");
    return;
  }
  quantity = Math.max(1, Number(quantity || 1));
  const existing = cart.find(x => Number(x.id) === Number(id));
  if (existing) existing.qty += quantity;
  else cart.push({ id: item.id, name: item.name, price: item.price, qty: quantity });
  saveCart();
  renderCart();
  document.getElementById("cartPanel")?.classList.add("open");
}

function changeCartQty(id, delta) {
  const item = cart.find(x => Number(x.id) === Number(id));
  if (!item) return;
  item.qty += Number(delta || 0);
  if (item.qty <= 0) cart = cart.filter(x => Number(x.id) !== Number(id));
  saveCart();
  renderCart();
}

window.addToCart = addToCart;
window.changeCartQty = changeCartQty;

function syncExistingCards() {
  document.querySelectorAll(".dish-card,.menu-card").forEach(card => {
    const title = card.querySelector("h3");
    if (!title) return;
    const item = MENU.find(x => x.name.toLowerCase() === title.textContent.trim().toLowerCase());
    if (!item) { card.style.display = "none"; return; }
    card.style.display = "";
    const price = card.querySelector(".dish-info > b,.menu-body > strong");
    const desc = card.querySelector(".dish-info > p,.menu-body > p");
    if (price) price.textContent = "₹" + item.price;
    if (desc) desc.textContent = item.desc;
    card.querySelectorAll(".add-cart").forEach(b => b.dataset.id = item.id);
    card.querySelectorAll("[data-action]").forEach(b => b.dataset.id = item.id);
    const q = card.querySelector(".qty span");
    if (q) { q.id = "menuQty-" + item.id; q.textContent = "1"; }
    if (card.classList.contains("menu-card")) card.dataset.cat = item.cat;
  });
}

function renderDynamicMenu() {
  const grid = document.getElementById("menu-grid");
  if (!grid || !MENU.length) return;
  grid.innerHTML = MENU.map((x, i) => {
    const photo = x.image_url ? `style="background-image:url('${String(x.image_url).replace(/'/g, "\\'")}')"` : "";
    const catLabel = String(x.cat || "mains").replace(/^\w/, c => c.toUpperCase());
    return `<article class="menu-card" data-cat="${escapeHtml(x.cat)}">
      <div class="menu-photo m${(i % 6) + 1}" ${photo}></div>
      <div class="menu-body"><small>${escapeHtml(catLabel)}</small>
      <h3>${escapeHtml(x.name)}</h3><p>${escapeHtml(x.desc)}</p><strong>₹${x.price}</strong>
      <div class="dish-actions"><div class="qty"><button type="button" data-action="minus" data-id="${x.id}">−</button>
      <span id="menuQty-${x.id}">1</span><button type="button" data-action="plus" data-id="${x.id}">+</button></div>
      <button type="button" class="add-cart" data-id="${x.id}">Add to Cart</button></div></div></article>`;
  }).join("");
}

function bindMenuButtons() {
  document.querySelectorAll(".add-cart").forEach(button => {
    if (button.dataset.bound === "1") return;
    button.dataset.bound = "1";
    button.addEventListener("click", () => {
      const id = Number(button.dataset.id);
      const q = document.getElementById("menuQty-" + id);
      const quantity = Math.max(1, Number(q?.textContent || 1));
      addToCart(id, quantity);
      if (q) q.textContent = "1";
    });
  });
  document.querySelectorAll("[data-action]").forEach(button => {
    if (button.dataset.bound === "1") return;
    button.dataset.bound = "1";
    button.addEventListener("click", () => {
      const id = Number(button.dataset.id);
      const q = document.getElementById("menuQty-" + id);
      if (!q) return;
      let n = Number(q.textContent || 1) + (button.dataset.action === "plus" ? 1 : -1);
      q.textContent = String(Math.max(1, n));
    });
  });
}

function bindCategoryFilters() {
  document.querySelectorAll(".category-row button").forEach(btn => {
    if (btn.dataset.bound === "1") return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", () => {
      const cat = btn.dataset.cat || "all";
      document.querySelectorAll(".category-row button").forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll("#menu-grid .menu-card").forEach(card => {
        card.style.display = cat === "all" || card.dataset.cat === cat ? "" : "none";
      });
    });
  });
}

function openCart() { document.getElementById("cartPanel")?.classList.add("open"); }
function closeCart() { document.getElementById("cartPanel")?.classList.remove("open"); }

function makeWhatsApp(text) {
  return "https://wa.me/" + window.RESTAURANT.whatsapp + "?text=" + encodeURIComponent(text);
}

function cartText() {
  return cart.map(x => `${x.name} x${x.qty} = ₹${Number(x.price) * Number(x.qty)}`).join("\n");
}

async function currentCustomerDetails() {
  const user = await getCurrentSupabaseUser();
  if (!user) return null;
  const profile = await getProfile(user.id);
  return { user, profile };
}

async function placeOrderAndWhatsApp(paymentLabel) {
  if (!cart.length) { alert("Your cart is empty."); return; }
  const details = await currentCustomerDetails();
  if (!details) {
    location.href = "login.html?next=index.html";
    return;
  }
  const { user, profile } = details;
  const total = getCartTotal();
  await saveOrder({
    customerName: profile?.name || user.user_metadata?.name || "",
    email: user.email || "",
    phone: profile?.phone || "",
    total,
    status: "New",
    items: cart.map(x => ({ id:x.id, name:x.name, price:x.price, qty:x.qty }))
  });
  const message = `Hello Datta Restaurant,\nI want to place an order.\n\n${cartText()}\n\nTotal: ₹${total}\nPayment: ${paymentLabel}`;
  window.open(makeWhatsApp(message), "_blank");
  cart = [];
  saveCart();
  renderCart();
  document.getElementById("paymentModal")?.setAttribute("aria-hidden","true");
  document.getElementById("paymentModal")?.classList.remove("open");
  closeCart();
}

function setupCheckout() {
  const checkout = document.getElementById("checkoutBtn");
  const modal = document.getElementById("paymentModal");
  const close = document.getElementById("closePayment");
  const qr = document.getElementById("showQrBtn");
  const qrArea = document.getElementById("qrArea");
  const confirm = document.getElementById("confirmPaymentBtn");
  const noPay = document.getElementById("modalWhatsAppBtn");
  const upi = document.getElementById("upiPayBtn");
  const total = document.getElementById("paymentTotal");
  const wa = document.getElementById("whatsappOrderBtn");

  checkout?.addEventListener("click", () => {
    if (!cart.length) { alert("Your cart is empty."); return; }
    if (total) total.textContent = "₹" + getCartTotal();
    if (modal) { modal.classList.add("open"); modal.setAttribute("aria-hidden","false"); }
  });
  close?.addEventListener("click", () => { modal?.classList.remove("open"); modal?.setAttribute("aria-hidden","true"); });
  qr?.addEventListener("click", () => { if (qrArea) qrArea.hidden = !qrArea.hidden; });
  upi?.addEventListener("click", e => {
    e.preventDefault();
    upi.href = `upi://pay?pa=${encodeURIComponent(window.RESTAURANT.upi)}&pn=${encodeURIComponent(window.RESTAURANT.name)}&am=${getCartTotal()}&cu=INR`;
    location.href = upi.href;
  });
  confirm?.addEventListener("click", async () => {
    try { await placeOrderAndWhatsApp("UPI (payment completed by customer)"); }
    catch (e) { console.error(e); alert(e.message || "Order failed."); }
  });
  noPay?.addEventListener("click", async e => {
    e.preventDefault();
    try { await placeOrderAndWhatsApp("Cash/WhatsApp confirmation"); }
    catch (err) { console.error(err); alert(err.message || "Order failed."); }
  });
  wa?.addEventListener("click", e => {
    e.preventDefault();
    window.open(makeWhatsApp(`Hello Datta Restaurant,\nI want to order:\n\n${cartText()}\n\nTotal: ₹${getCartTotal()}`), "_blank");
  });
}

function setupBooking() {
  const form = document.getElementById("bookingForm");
  if (!form || form.dataset.bound === "1") return;
  form.dataset.bound = "1";
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const get = name => form.elements[name]?.value?.trim?.() ?? form.elements[name]?.value ?? "";
    const booking = {
      name: get("name"), phone: get("phone"), date: get("date"), time: get("time"),
      guests: get("guests") || "1", type: get("type") || "Table", event: get("event") || "", status:"New"
    };
    if (!booking.name || !booking.phone || !booking.date || !booking.time) {
      alert("Please fill Name, Phone, Date and Time.");
      return;
    }
    try {
      await saveBooking(booking);
      const msg = `Hello Datta Restaurant,\nI want to book a ${booking.type}.\n\nName: ${booking.name}\nPhone: ${booking.phone}\nDate: ${booking.date}\nTime: ${booking.time}\nGuests: ${booking.guests}\nEvent/Requirements: ${booking.event || "None"}`;
      window.open(makeWhatsApp(msg), "_blank");
      const status = document.getElementById("bookingStatus");
      if (status) status.textContent = "Booking saved and WhatsApp opened.";
      form.reset();
    } catch (err) {
      console.error("Booking error:", err);
      if (String(err.message || "").toLowerCase().includes("login")) {
        location.href = "login.html?next=index.html#booking";
      } else alert(err.message || "Booking failed. Please try again.");
    }
  });
}

function setupCartUI() {
  document.getElementById("cartFab")?.addEventListener("click", openCart);
  document.getElementById("closeCart")?.addEventListener("click", closeCart);
}

async function initRestaurantPage() {
  try {
    await loadMenuFromSupabase();
    renderDynamicMenu();
    syncExistingCards();
    renderCart();
    setupCartUI();
    setupCheckout();
    setupBooking();
    bindMenuButtons();
    bindCategoryFilters();
    document.querySelectorAll("[data-wa]").forEach(a => a.href = makeWhatsApp("Hello Datta Restaurant, I want to place an order."));
    document.querySelectorAll("[data-phone]").forEach(a => { a.textContent = window.RESTAURANT.phone; a.href = "tel:" + window.RESTAURANT.phone.replace(/\s/g,""); });
    document.querySelectorAll("[data-address]").forEach(x => x.innerHTML = escapeHtml(window.RESTAURANT.address).replace(/,/g,",<br>"));
  } catch (e) {
    console.error("Restaurant initialization error:", e);
    const grid = document.getElementById("menu-grid");
    if (grid) grid.insertAdjacentHTML("beforebegin", `<div class="form-status">Menu could not be loaded. Please refresh.</div>`);
  }
}

document.addEventListener("DOMContentLoaded", initRestaurantPage);
