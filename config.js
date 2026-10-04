/* Datta Restaurant - Main Configuration */

const RESTAURANT = {
  name: "Datta Restaurant",
  phone: "+91 0000000000",
  whatsapp: "910000000000",
  address: "Maheshpur, Pakur, Jharkhand 816106"
};

/* =========================
   MENU DATA
========================= */

let MENU = [];

/* =========================
   LOAD MENU FROM SUPABASE
========================= */

async function loadMenuFromSupabase() {
  try {
    if (typeof supabaseClient === "undefined") {
      console.error("Supabase client is not initialized yet.");
      return;
    }
    const { data, error } = await supabaseClient
      .from("menu_items")
      .select("*")
      .eq("is_available", true)
      .order("id", { ascending: true });

    if (error) {
      console.error("Menu loading error:", error);
      return;
    }

    MENU = (data || []).map(item => ({
      id: Number(item.id),
      name: item.name || "",
      price: Number(item.price || 0),
      cat: item.category || "mains",
      desc: item.description || "",
      image_url: item.image_url || ""
    }));

    console.log("Supabase menu loaded:", MENU);

  } catch (error) {
    console.error("Supabase menu error:", error);
  }
}

/* =========================
   SYNC EXISTING WEBSITE CARDS
   WITH SUPABASE MENU
========================= */

function syncMenuCards() {

  const cards = document.querySelectorAll(
    ".dish-card, .menu-card"
  );

  cards.forEach(card => {

    const title = card.querySelector("h3");

    if (!title) return;

    const name = title.textContent.trim();

    const item = MENU.find(
      x =>
        x.name.trim().toLowerCase() ===
        name.toLowerCase()
    );

    if (!item) return;

    /* PRICE */

    const price = card.querySelector(
      ".dish-info > b, .menu-body > strong"
    );

    if (price) {
      price.textContent = "₹" + item.price;
    }

    /* DESCRIPTION */

    const description = card.querySelector(
      ".dish-info > p, .menu-body > p"
    );

    if (description) {
      description.textContent = item.desc;
    }

    /* ADD TO CART BUTTON */

    const addButton = card.querySelector(
      ".add-cart"
    );

    if (addButton) {
      addButton.dataset.id = item.id;
    }

    /* QUANTITY BUTTONS */

    const qtyButtons = card.querySelectorAll(
      "[data-action]"
    );

    qtyButtons.forEach(button => {
      button.dataset.id = item.id;
    });

    /* QUANTITY NUMBER */

    const qty = card.querySelector(
      ".qty span"
    );

    if (qty) {
      qty.id = "menuQty-" + item.id;
      qty.textContent = "1";
    }

    /* CATEGORY */

    if (card.classList.contains("menu-card")) {
      card.dataset.cat = item.cat;
    }

  });
}

/* =========================
   CART
========================= */

let cart = [];

try {
  cart = JSON.parse(
    localStorage.getItem("datta_cart") || "[]"
  );
} catch (e) {
  cart = [];
}

/* =========================
   SAVE CART
========================= */

function saveCart() {
  localStorage.setItem(
    "datta_cart",
    JSON.stringify(cart)
  );
}

/* =========================
   FIND MENU ITEM
========================= */

function findMenuItem(id) {
  return MENU.find(
    item => Number(item.id) === Number(id)
  );
}

/* =========================
   ADD TO CART
========================= */

function addToCart(id) {

  const item = findMenuItem(id);

  if (!item) {
    console.error("Menu item not found:", id);
    return;
  }

  const existing = cart.find(
    x => Number(x.id) === Number(id)
  );

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      qty: 1
    });
  }

  saveCart();
  renderCart();

  console.log("Added to cart:", item.name);
}

/* =========================
   CHANGE CART QUANTITY
========================= */

function changeCartQty(id, change) {

  const item = cart.find(
    x => Number(x.id) === Number(id)
  );

  if (!item) return;

  item.qty += change;

  if (item.qty <= 0) {
    cart = cart.filter(
      x => Number(x.id) !== Number(id)
    );
  }

  saveCart();
  renderCart();
}

/* =========================
   CART TOTAL
========================= */

function getCartTotal() {

  return cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
      Number(item.qty || 0),
    0
  );
}

/* =========================
   RENDER CART
========================= */

function renderCart() {

  const cartCount =
    document.getElementById("cartCount");

  const cartItems =
    document.getElementById("cartItems");

  const cartTotal =
    document.getElementById("cartTotal");

  const totalQty = cart.reduce(
    (sum, item) =>
      sum + Number(item.qty || 0),
    0
  );

  if (cartCount) {
    cartCount.textContent = totalQty;
  }

  if (!cartItems) return;

  if (!cart.length) {

    cartItems.innerHTML =
      '<div class="empty-cart">Your cart is empty.</div>';

    if (cartTotal) {
      cartTotal.textContent = "₹0";
    }

    return;
  }

  cartItems.innerHTML = cart.map(item => {

    const total =
      Number(item.price || 0) *
      Number(item.qty || 0);

    return `
      <div class="cart-item">

        <div class="cart-item-info">
          <strong>${escapeHtml(item.name)}</strong>
          <span>₹${item.price} × ${item.qty}</span>
        </div>

        <div class="cart-item-actions">

          <button
            type="button"
            onclick="changeCartQty(${item.id}, -1)"
          >
            −
          </button>

          <span>${item.qty}</span>

          <button
            type="button"
            onclick="changeCartQty(${item.id}, 1)"
          >
            +
          </button>

        </div>

        <strong>₹${total}</strong>

      </div>
    `;

  }).join("");

  if (cartTotal) {
    cartTotal.textContent =
      "₹" + getCartTotal();
  }
}

/* =========================
   HTML ESCAPE
========================= */

function escapeHtml(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================
   BOOKING
========================= */

function setupBooking() {

  const form =
    document.getElementById("bookingForm");

  if (!form) return;

  form.addEventListener("submit", async function(e) {

    e.preventDefault();

    const name =
      document.getElementById("bookingName")?.value.trim() || "";

    const phone =
      document.getElementById("bookingPhone")?.value.trim() || "";

    const date =
      document.getElementById("bookingDate")?.value || "";

    const time =
      document.getElementById("bookingTime")?.value || "";

    const guests =
      document.getElementById("bookingGuests")?.value || "1";

    const type =
      document.getElementById("bookingType")?.value || "Table";

    const event =
      document.getElementById("bookingEvent")?.value.trim() || "";

    try {

      await saveBooking({
        name,
        phone,
        date,
        time,
        guests,
        type,
        event,
        status: "New"
      });

      alert(
        "Booking request submitted successfully!"
      );

      form.reset();

    } catch (error) {

      console.error("Booking error:", error);

      alert(
        error.message ||
        "Booking failed. Please login and try again."
      );
    }

  });
}

/* =========================
   PAYMENT
========================= */

function setupPayment() {

  const paymentForm =
    document.getElementById("paymentForm");

  if (!paymentForm) return;

  paymentForm.addEventListener(
    "submit",
    async function(e) {

      e.preventDefault();

      if (!cart.length) {
        alert("Your cart is empty.");
        return;
      }

      try {

        const user =
          await getCurrentSupabaseUser();

        if (!user) {
          alert(
            "Please login before placing your order."
          );

          location.href =
            "login.html?next=index.html";

          return;
        }

        const profile =
          await getProfile(user.id);

        const order = {

          customerName:
            profile?.name ||
            user.user_metadata?.name ||
            "",

          email:
            user.email || "",

          phone:
            profile?.phone || "",

          total:
            getCartTotal(),

          status:
            "New",

          createdAt:
            new Date().toISOString(),

          items:
            cart.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              qty: item.qty
            }))

        };

        await saveOrder(order);

        alert(
          "Order placed successfully!"
        );

        cart = [];

        saveCart();
        renderCart();

        paymentForm.reset();

      } catch (error) {

        console.error("Payment/order error:", error);

        alert(
          error.message ||
          "Order failed. Please try again."
        );

      }

    }
  );
}

/* =========================
   RESTAURANT PAGE INIT
========================= */

async function initRestaurantPage() {

  /* Load latest menu from Supabase */
  await loadMenuFromSupabase();

  /* Update existing website cards */
  syncMenuCards();

  /* Render cart */
  renderCart();

  /* Booking */
  setupBooking();

  /* Payment/order */
  setupPayment();

  /* =========================
     ADD CART BUTTONS
  ========================= */

  document
    .querySelectorAll(".add-cart")
    .forEach(button => {

      button.addEventListener(
        "click",
        function() {

          const id =
            Number(this.dataset.id);

          addToCart(id);

        }
      );

    });

  /* =========================
     QUANTITY BUTTONS
  ========================= */

  document
    .querySelectorAll("[data-action]")
    .forEach(button => {

      button.addEventListener(
        "click",
        function() {

          const action =
            this.dataset.action;

          const id =
            Number(this.dataset.id);

          const qty =
            document.getElementById(
              "menuQty-" + id
            );

          if (!qty) return;

          let value =
            Number(qty.textContent || 1);

          if (action === "plus") {
            value++;
          }

          if (action === "minus") {
            value--;

            if (value < 1) {
              value = 1;
            }
          }

          qty.textContent = value;

        }
      );

    });

  /* =========================
     MENU CATEGORY FILTER
  ========================= */

  const filterButtons =
    document.querySelectorAll(
      "[data-filter]"
    );

  filterButtons.forEach(button => {

    button.addEventListener(
      "click",
      function() {

        const filter =
          this.dataset.filter;

        document
          .querySelectorAll(
            ".menu-card"
          )
          .forEach(card => {

            const category =
              card.dataset.cat;

            if (
              filter === "all" ||
              filter === category
            ) {
              card.style.display = "";
            } else {
              card.style.display = "none";
            }

          });

        filterButtons.forEach(btn => {
          btn.classList.remove("active");
        });

        this.classList.add("active");

      }
    );

  });

}

/* =========================
   START
========================= */

document.addEventListener(
  "DOMContentLoaded",
  initRestaurantPage
);
