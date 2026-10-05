(function () {
  "use strict";

  /* =========================================================
     DUTTA RESTAURANT ADMIN
     Browser-local admin dashboard
  ========================================================= */

  const STORAGE_KEY = "dutta_restaurant_data_v2";
  const AUTH_KEY = "dutta_admin_auth";

  /*
    CHANGE THIS PIN BEFORE FINAL CLIENT DELIVERY
  */
  const ADMIN_PIN = "2026";


  /* =========================================================
     HELPERS
  ========================================================= */

  function $(selector) {
    return document.querySelector(selector);
  }

  function $all(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }


  function getDefaultData() {
    if (
      typeof window.DEFAULT_DATA === "object" &&
      window.DEFAULT_DATA !== null
    ) {
      return deepClone(window.DEFAULT_DATA);
    }

    return {
      brand: {
        name: "Dutta Restaurant",
        tagline: "Taste Worth Remembering.",
        owner: "Akash Dutta",
        phone: "+91 95463 20565",
        whatsapp: "919546320565",
        upi: "9546320565-2@ibl",
        address: "Main Road, Ranchi, Jharkhand",
        hours: "11:00 AM – 11:00 PM",
        city: "Ranchi"
      },
      hero: {
        eyebrow: "GOOD FOOD · GOOD PEOPLE · GOOD MEMORIES",
        title: "Made with passion.",
        emphasis: "Served with warmth.",
        description:
          "A refined dining experience built around flavour, hospitality and moments worth coming back to.",
        image:
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2200&q=90"
      },
      story: {
        eyebrow: "MORE THAN A MEAL",
        title: "A place where",
        emphasis: "flavour feels personal.",
        p1:
          "Dutta Restaurant brings together honest food, warm hospitality and an atmosphere made for people who love to eat well.",
        p2:
          "From family dinners to celebrations with friends, every visit is designed to feel relaxed, generous and memorable."
      },
      experience: {
        title: "Come hungry.",
        emphasis: "Leave with a story.",
        image:
          "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=2200&q=90"
      },
      gallery: [],
      menu: []
    };
  }


  function getData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        return getDefaultData();
      }

      const parsed = JSON.parse(saved);

      if (
        !parsed ||
        typeof parsed !== "object"
      ) {
        return getDefaultData();
      }

      return parsed;
    } catch (error) {
      console.error("Could not read saved data:", error);
      return getDefaultData();
    }
  }


  function saveData(data, message) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
      );

      toast(message || "Saved successfully");
    } catch (error) {
      console.error(error);
      toast("Could not save data");
    }
  }


  function toast(message) {
    let old = document.querySelector(".toast");

    if (old) {
      old.remove();
    }

    const element = document.createElement("div");

    element.className = "toast";
    element.textContent = message;

    document.body.appendChild(element);

    setTimeout(function () {
      element.remove();
    }, 2500);
  }


  /* =========================================================
     LOGIN
  ========================================================= */

  function showLogin() {
    const login = $("#login");
    const app = $("#app");

    if (login) {
      login.hidden = false;
    }

    if (app) {
      app.hidden = true;
    }
  }


  function showApp() {
    const login = $("#login");
    const app = $("#app");

    if (login) {
      login.hidden = true;
    }

    if (app) {
      app.hidden = false;
    }

    page("overview");
  }


  function login() {
    const pinInput = $("#pin");
    const message = $("#loginMessage");

    if (!pinInput) {
      return;
    }

    const enteredPin = String(pinInput.value || "").trim();

    if (enteredPin === ADMIN_PIN) {
      localStorage.setItem(AUTH_KEY, "1");

      if (message) {
        message.textContent = "";
      }

      pinInput.value = "";

      showApp();

      toast("Dashboard opened");
    } else {
      if (message) {
        message.textContent = "Wrong PIN";
      }

      toast("Wrong PIN");

      pinInput.value = "";
      pinInput.focus();
    }
  }


  function logout() {
    localStorage.removeItem(AUTH_KEY);

    showLogin();

    const pin = $("#pin");

    if (pin) {
      pin.value = "";
      pin.focus();
    }

    toast("Logged out");
  }


  /* =========================================================
     PAGE ROUTER
  ========================================================= */

  function page(name) {
    const pageElement = $("#page");

    if (!pageElement) {
      return;
    }

    $all(".side[data-page]").forEach(function (button) {
      button.classList.toggle(
        "on",
        button.dataset.page === name
      );
    });


    if (name === "overview") {
      renderOverview(pageElement);
      return;
    }


    if (name === "brand") {
      renderBrand(pageElement);
      return;
    }


    if (name === "hero") {
      renderHero(pageElement);
      return;
    }


    if (name === "menu") {
      renderMenu(pageElement);
      return;
    }


    if (name === "gallery") {
      renderGallery(pageElement);
      return;
    }


    if (name === "settings") {
      renderSettings(pageElement);
      return;
    }


    renderOverview(pageElement);
  }


  /* =========================================================
     OVERVIEW
  ========================================================= */

  function renderOverview(container) {
    const data = getData();

    const menuCount = Array.isArray(data.menu)
      ? data.menu.length
      : 0;

    const galleryCount = Array.isArray(data.gallery)
      ? data.gallery.length
      : 0;


    container.innerHTML = `
      <div class="pageHead">
        <div>
          <span class="eyebrow">CONTROL CENTER</span>
          <h2>Welcome back.</h2>
          <p>Manage the public Dutta Restaurant website from here.</p>
        </div>

        <a
          class="primary"
          href="index.html"
          target="_blank"
          rel="noopener"
        >
          View Website ↗
        </a>
      </div>


      <div class="cards">

        <div class="card">
          <span>RESTAURANT</span>
          <strong>${escapeHtml(data.brand?.name || "Dutta Restaurant")}</strong>
          <small>${escapeHtml(data.brand?.city || "")}</small>
        </div>

        <div class="card">
          <span>MENU ITEMS</span>
          <strong>${menuCount}</strong>
          <small>Items currently saved</small>
        </div>

        <div class="card">
          <span>GALLERY</span>
          <strong>${galleryCount}</strong>
          <small>Images currently saved</small>
        </div>

      </div>


      <div class="panel">

        <div class="panelHead">
          <div>
            <span class="eyebrow">QUICK ACTIONS</span>
            <h3>Manage your website</h3>
          </div>
        </div>


        <div class="quickGrid">

          <button
            type="button"
            class="quick"
            data-go="brand"
          >
            <b>Restaurant Info</b>
            <span>Name, phone, address, hours and UPI.</span>
          </button>


          <button
            type="button"
            class="quick"
            data-go="hero"
          >
            <b>Homepage</b>
            <span>Hero text, story and experience section.</span>
          </button>


          <button
            type="button"
            class="quick"
            data-go="menu"
          >
            <b>Menu & Prices</b>
            <span>Add, edit or remove menu items.</span>
          </button>


          <button
            type="button"
            class="quick"
            data-go="gallery"
          >
            <b>Gallery</b>
            <span>Change restaurant gallery images.</span>
          </button>

        </div>

      </div>


      <div class="notice">
        <b>Important:</b>
        Changes made here are stored in this browser's local storage.
        They do not automatically update the live website for every visitor.
        A real multi-device owner dashboard can be connected later to
        Firebase or Supabase.
      </div>
    `;


    $all("[data-go]").forEach(function (button) {
      button.addEventListener("click", function () {
        page(button.dataset.go);
      });
    });
  }


  /* =========================================================
     RESTAURANT INFO
  ========================================================= */

  function renderBrand(container) {
    const data = getData();

    if (!data.brand) {
      data.brand = {};
    }


    container.innerHTML = `
      <div class="pageHead">
        <div>
          <span class="eyebrow">RESTAURANT</span>
          <h2>Restaurant Info</h2>
          <p>Update your basic restaurant and contact details.</p>
        </div>
      </div>


      <div class="panel">

        <div class="formGrid">

          <label>
            Restaurant Name
            <input id="brand_name" value="${escapeHtml(data.brand.name || "")}">
          </label>


          <label>
            Tagline
            <input id="brand_tagline" value="${escapeHtml(data.brand.tagline || "")}">
          </label>


          <label>
            Owner
            <input id="brand_owner" value="${escapeHtml(data.brand.owner || "")}">
          </label>


          <label>
            Phone
            <input id="brand_phone" value="${escapeHtml(data.brand.phone || "")}">
          </label>


          <label>
            WhatsApp Number
            <input id="brand_whatsapp" value="${escapeHtml(data.brand.whatsapp || "")}">
          </label>


          <label>
            UPI ID
            <input id="brand_upi" value="${escapeHtml(data.brand.upi || "")}">
          </label>


          <label>
            City
            <input id="brand_city" value="${escapeHtml(data.brand.city || "")}">
          </label>


          <label>
            Opening Hours
            <input id="brand_hours" value="${escapeHtml(data.brand.hours || "")}">
          </label>


          <label class="full">
            Address
            <textarea id="brand_address">${escapeHtml(data.brand.address || "")}</textarea>
          </label>

        </div>


        <div class="actions">
          <button
            type="button"
            class="primary"
            id="saveBrand"
          >
            Save Restaurant Info
          </button>
        </div>

      </div>
    `;


    $("#saveBrand").addEventListener("click", function () {
      const current = getData();

      current.brand = current.brand || {};

      current.brand.name = $("#brand_name").value.trim();
      current.brand.tagline = $("#brand_tagline").value.trim();
      current.brand.owner = $("#brand_owner").value.trim();
      current.brand.phone = $("#brand_phone").value.trim();
      current.brand.whatsapp = $("#brand_whatsapp").value.trim();
      current.brand.upi = $("#brand_upi").value.trim();
      current.brand.city = $("#brand_city").value.trim();
      current.brand.hours = $("#brand_hours").value.trim();
      current.brand.address = $("#brand_address").value.trim();

      saveData(
        current,
        "Restaurant information saved"
      );
    });
  }


  /* =========================================================
     HOMEPAGE
  ========================================================= */

  function renderHero(container) {
    const data = getData();

    data.hero = data.hero || {};
    data.story = data.story || {};
    data.experience = data.experience || {};


    container.innerHTML = `
      <div class="pageHead">
        <div>
          <span class="eyebrow">HOMEPAGE</span>
          <h2>Homepage Content</h2>
          <p>Edit the main content shown on the website.</p>
        </div>
      </div>


      <div class="panel">

        <div class="panelHead">
          <h3>Hero Section</h3>
        </div>


        <div class="formGrid">

          <label class="full">
            Eyebrow
            <input id="hero_eyebrow" value="${escapeHtml(data.hero.eyebrow || "")}">
          </label>


          <label>
            Main Title
            <input id="hero_title" value="${escapeHtml(data.hero.title || "")}">
          </label>


          <label>
            Highlight Text
            <input id="hero_emphasis" value="${escapeHtml(data.hero.emphasis || "")}">
          </label>


          <label class="full">
            Description
            <textarea id="hero_description">${escapeHtml(data.hero.description || "")}</textarea>
          </label>


          <label class="full">
            Hero Image URL
            <input id="hero_image" value="${escapeHtml(data.hero.image || "")}">
          </label>

        </div>


        <hr>


        <div class="panelHead">
          <h3>Story Section</h3>
        </div>


        <div class="formGrid">

          <label>
            Eyebrow
            <input id="story_eyebrow" value="${escapeHtml(data.story.eyebrow || "")}">
          </label>


          <label>
            Title
            <input id="story_title" value="${escapeHtml(data.story.title || "")}">
          </label>


          <label>
            Highlight
            <input id="story_emphasis" value="${escapeHtml(data.story.emphasis || "")}">
          </label>


          <label class="full">
            Paragraph 1
            <textarea id="story_p1">${escapeHtml(data.story.p1 || "")}</textarea>
          </label>


          <label class="full">
            Paragraph 2
            <textarea id="story_p2">${escapeHtml(data.story.p2 || "")}</textarea>
          </label>

        </div>


        <hr>


        <div class="panelHead">
          <h3>Experience Section</h3>
        </div>


        <div class="formGrid">

          <label>
            Title
            <input id="experience_title" value="${escapeHtml(data.experience.title || "")}">
          </label>


          <label>
            Highlight
            <input id="experience_emphasis" value="${escapeHtml(data.experience.emphasis || "")}">
          </label>


          <label class="full">
            Experience Image URL
            <input id="experience_image" value="${escapeHtml(data.experience.image || "")}">
          </label>

        </div>


        <div class="actions">
          <button
            type="button"
            class="primary"
            id="saveHero"
          >
            Save Homepage
          </button>
        </div>

      </div>
    `;


    $("#saveHero").addEventListener("click", function () {
      const current = getData();

      current.hero = current.hero || {};
      current.story = current.story || {};
      current.experience = current.experience || {};


      current.hero.eyebrow = $("#hero_eyebrow").value.trim();
      current.hero.title = $("#hero_title").value.trim();
      current.hero.emphasis = $("#hero_emphasis").value.trim();
      current.hero.description = $("#hero_description").value.trim();
      current.hero.image = $("#hero_image").value.trim();


      current.story.eyebrow = $("#story_eyebrow").value.trim();
      current.story.title = $("#story_title").value.trim();
      current.story.emphasis = $("#story_emphasis").value.trim();
      current.story.p1 = $("#story_p1").value.trim();
      current.story.p2 = $("#story_p2").value.trim();


      current.experience.title =
        $("#experience_title").value.trim();

      current.experience.emphasis =
        $("#experience_emphasis").value.trim();

      current.experience.image =
        $("#experience_image").value.trim();


      saveData(
        current,
        "Homepage saved"
      );
    });
  }


  /* =========================================================
     MENU
  ========================================================= */

  function renderMenu(container) {
    const data = getData();

    if (!Array.isArray(data.menu)) {
      data.menu = [];
    }


    container.innerHTML = `
      <div class="pageHead">
        <div>
          <span class="eyebrow">FOOD MENU</span>
          <h2>Menu & Prices</h2>
          <p>Edit dishes, descriptions, categories, prices and images.</p>
        </div>

        <button
          type="button"
          class="primary"
          id="addMenu"
        >
          + Add Item
        </button>
      </div>


      <div id="menuList"></div>
    `;


    const list = $("#menuList");


    if (data.menu.length === 0) {
      list.innerHTML = `
        <div class="panel">
          <h3>No menu items yet.</h3>
          <p>Add your first menu item using the button above.</p>
        </div>
      `;
    } else {
      data.menu.forEach(function (item, index) {
        list.insertAdjacentHTML(
          "beforeend",
          menuEditor(item, index)
        );
      });
    }


    $("#addMenu").addEventListener(
      "click",
      function () {
        const current = getData();

        current.menu = Array.isArray(current.menu)
          ? current.menu
          : [];

        current.menu.push({
          cat: "Signature",
          name: "New Dish",
          desc: "Describe this dish.",
          price: "0",
          image: ""
        });

        saveData(
          current,
          "New menu item added"
        );

        renderMenu(container);
      }
    );


    attachMenuEvents();
  }


  function menuEditor(item, index) {
    return `
      <div
        class="panel menuEditor"
        data-menu-index="${index}"
      >

        <div class="panelHead">

          <div>
            <span class="eyebrow">
              ITEM ${index + 1}
            </span>

            <h3>
              ${escapeHtml(item.name || "Menu Item")}
            </h3>
          </div>

          <button
            type="button"
            class="danger deleteMenu"
            data-index="${index}"
          >
            Delete
          </button>

        </div>


        <div class="formGrid">

          <label>
            Category
            <input
              class="menu-cat"
              value="${escapeHtml(item.cat || "")}"
            >
          </label>


          <label>
            Dish Name
            <input
              class="menu-name"
              value="${escapeHtml(item.name || "")}"
            >
          </label>


          <label>
            Price ₹
            <input
              class="menu-price"
              inputmode="decimal"
              value="${escapeHtml(item.price || "")}"
            >
          </label>


          <label>
            Image URL
            <input
              class="menu-image"
              value="${escapeHtml(item.image || "")}"
            >
          </label>


          <label class="full">
            Description
            <textarea class="menu-desc">${escapeHtml(item.desc || "")}</textarea>
          </label>

        </div>


        <div class="actions">

          <button
            type="button"
            class="primary saveMenu"
            data-index="${index}"
          >
            Save Item
          </button>

        </div>

      </div>
    `;
  }


  function attachMenuEvents() {

    $all(".saveMenu").forEach(
      function (button) {

        button.addEventListener(
        
