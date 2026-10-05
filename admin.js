const KEY = "dutta_restaurant_data_v2";
const PIN = "2026";

const $ = (selector) => document.querySelector(selector);

const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[m]));

function getData() {
  try {
    const saved = localStorage.getItem(KEY);
    return saved ? JSON.parse(saved) : structuredClone(DEFAULT_DATA);
  } catch (e) {
    return structuredClone(DEFAULT_DATA);
  }
}

function saveData(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
  toast("Saved successfully");
}

function toast(message) {
  const x = document.createElement("div");
  x.className = "toast";
  x.textContent = message;
  document.body.appendChild(x);

  setTimeout(() => {
    x.remove();
  }, 2200);
}

function showApp() {
  $("#login").hidden = true;
  $("#app").hidden = false;
}

function showLogin() {
  $("#login").hidden = false;
  $("#app").hidden = true;
}

function login() {
  const pin = $("#pin").value.trim();

  if (pin === PIN) {
    localStorage.setItem("dutta_admin_auth", "1");
    showApp();
    page("overview");
  } else {
    toast("Wrong PIN");
  }
}

function field(label, value, key) {
  return `
    <label>
      ${esc(label)}
      <input value="${esc(value)}" data-field="${esc(key)}">
    </label>
  `;
}

function page(name) {
  const data = getData();
  const el = $("#page");

  if (!el) return;

  if (name === "overview") {
    el.innerHTML = `
      <h1>Good morning 👋</h1>
      <p class="sub">
        Manage Dutta Restaurant without touching website files.
      </p>

      <div class="cards">
        <div>
          <b>${data.menu.length}</b>
          <span>Menu items</span>
        </div>

        <div>
          <b>${data.gallery.length}</b>
          <span>Gallery images</span>
        </div>

        <div>
          <b>${esc(data.brand.phone)}</b>
          <span>Customer phone</span>
        </div>

        <div>
          <b>₹</b>
          <span>Prices editable</span>
        </div>
      </div>

      <div class="notice">
        <b>How this works</b>
        <p>
          Edit content here and click Save.
          The public website reads the saved content automatically
          on this browser.
        </p>
      </div>
    `;

    return;
  }

  if (name === "brand") {
    brandPage(el, data);
    return;
  }

  if (name === "hero") {
    heroPage(el, data);
    return;
  }

  if (name === "menu") {
    menuPage(el, data);
    return;
  }

  if (name === "gallery") {
    galleryPage(el, data);
    return;
  }

  if (name === "settings") {
    settingsPage(el, data);
    return;
  }
}

function brandPage(el, data) {
  el.innerHTML = `
    <h1>Restaurant information</h1>

    <p class="sub">
      Change contact and restaurant details here.
    </p>

    <div class="form">

      ${field("Restaurant name", data.brand.name, "name")}

      ${field("Owner name", data.brand.owner, "owner")}

      ${field("Phone", data.brand.phone, "phone")}

      ${field(
        "WhatsApp number (country code)",
        data.brand.whatsapp,
        "whatsapp"
      )}

      ${field("UPI ID", data.brand.upi, "upi")}

      ${field("Address", data.brand.address, "address")}

      ${field("Opening hours", data.brand.hours, "hours")}

      ${field("City", data.brand.city, "city")}

      <button class="save" id="saveBrand">
        Save changes
      </button>

    </div>
  `;

  $("#saveBrand").onclick = () => {
    const x = getData();

    document.querySelectorAll("[data-field]").forEach((input) => {
      x.brand[input.dataset.field] = input.value;
    });

    saveData(x);
  };
}

function heroPage(el, data) {
  el.innerHTML = `
    <h1>Homepage</h1>

    <p class="sub">
      Update the first impression of the restaurant.
    </p>

    <div class="form">

      ${field("Eyebrow", data.hero.eyebrow, "eyebrow")}

      ${field("Main title", data.hero.title, "title")}

      ${field("Emphasis", data.hero.emphasis, "emphasis")}

      <label>
        Description
        <textarea data-field="description">${esc(
          data.hero.description
        )}</textarea>
      </label>

      ${field(
        "Hero image URL",
        data.hero.image,
        "image"
      )}

      <button class="save" id="saveHero">
        Save homepage
      </button>

    </div>
  `;

  $("#saveHero").onclick = () => {
    const x = getData();

    document
      .querySelectorAll("[data-field]")
      .forEach((input) => {
        x.hero[input.dataset.field] = input.value;
      });

    saveData(x);
  };
}

function menuPage(el, data) {
  el.innerHTML = `
    <h1>Menu & prices</h1>

    <p class="sub">
      Add, edit or remove dishes.
      Changes appear on the public site after saving.
    </p>

    <button class="save" id="addDish">
      Add new dish +
    </button>

    <div id="menuList" class="menulist">

      ${data.menu.map((item, index) => `
        <div class="item" data-index="${index}">

          <div>

            <input
              data-key="name"
              value="${esc(item.name)}"
              placeholder="Dish name"
            >

            <input
              data-key="cat"
              value="${esc(item.cat)}"
              placeholder="Category"
            >

            <input
              data-key="price"
              value="${esc(item.price)}"
              placeholder="Price"
            >

            <textarea
              data-key="desc"
              placeholder="Description"
            >${esc(item.desc)}</textarea>

            <input
              data-key="image"
              value="${esc(item.image)}"
              placeholder="Image URL"
            >

          </div>

          <button
            class="delete"
            data-delete="${index}"
          >
            Delete
          </button>

        </div>
      `).join("")}

    </div>

    <button class="save" id="saveMenu">
      Save all menu changes
    </button>
  `;

  $("#addDish").onclick = () => {
    const x = getData();

    x.menu.push({
      cat: "New Category",
      name: "New Dish",
      desc: "Dish description",
      price: "0",
      image:
        "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80"
    });

    saveData(x);
    menuPage(el, x);
  };

  $("#saveMenu").onclick = () => {
    const x = getData();

    document.querySelectorAll(".item").forEach((row) => {
      const index = Number(row.dataset.index);

      row.querySelectorAll("[data-key]").forEach((input) => {
        x.menu[index][input.dataset.key] = input.value;
      });
    });

    saveData(x);
  };

  document.querySelectorAll("[data-delete]").forEach((button) => {
    button.onclick = () => {
      const x = getData();
      const index = Number(button.dataset.delete);

      x.menu.splice(index, 1);

      saveData(x);
      menuPage(el, x);
    };
  });
}

function galleryPage(el, data) {
  el.innerHTML = `
    <h1>Gallery</h1>

    <p class="sub">
      Paste image URLs.
      Replace stock images with the restaurant's own photos before delivery.
    </p>

    <div class="form">

      ${data.gallery.map((image, index) => `
        <label>
          Image ${index + 1}

          <input
            class="galleryImage"
            data-index="${index}"
            value="${esc(image)}"
          >
        </label>
      `).join("")}

      <button class="save" id="saveGallery">
        Save gallery
      </button>

    </div>
  `;

  $("#saveGallery").onclick = () => {
    const x = getData();

    x.gallery = [...document.querySelectorAll(".galleryImage")]
      .map((input) => input.value);

    saveData(x);
  };
}

function settingsPage(el, data) {
  el.innerHTML = `
    <h1>Backup & reset</h1>

    <p class="sub">
      Keep a backup before handing the site to the owner.
    </p>

    <button class="save" id="exportData">
      Export website content JSON
    </button>

    <button class="delete" id="resetData">
      Reset to original demo content
    </button>

    <div class="notice">

      <b>Important for the final client version</b>

      <p>
        The current admin stores changes inside this browser.
        For true multi-device owner access, the next version
        should connect this dashboard to Firebase or Supabase.
      </p>

    </div>
  `;

  $("#exportData").onclick = () => {
    const blob = new Blob(
      [JSON.stringify(getData(), null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "dutta-restaurant-content.json";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  $("#resetData").onclick = () => {
    if (confirm("Reset all content?")) {
      localStorage.removeItem(KEY);
      toast("Reset complete");
      page("overview");
    }
  };
}

/* LOGIN */

const loginButton = $("#loginBtn");

if (loginButton) {
  loginButton.onclick = login;
}

const pinInput = $("#pin");

if (pinInput) {
  pinInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      login();
    }
  });
}

/* SIDEBAR */

document.querySelectorAll(".side").forEach((button) => {
  button.onclick = () => {

    document
      .querySelectorAll(".side")
      .forEach((item) => item.classList.remove("on"));

    button.classList.add("on");

    page(button.dataset.page);
  };
});

/* RESTORE LOGIN SESSION */

if (localStorage.getItem("dutta_admin_auth") === "1") {
  showApp();
  page("overview");
} else {
  showLogin();
}
