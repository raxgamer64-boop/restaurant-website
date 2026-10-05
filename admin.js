function attachMenuEvents() {
  $all(".saveMenu").forEach(function (button) {
    button.addEventListener("click", function () {
      const index = Number(button.dataset.index);
      const editor = document.querySelector(
        '[data-menu-index="' + index + '"]'
      );

      if (!editor) return;

      const current = getData();

      current.menu[index] = {
        cat: editor.querySelector(".menu-cat").value.trim(),
        name: editor.querySelector(".menu-name").value.trim(),
        desc: editor.querySelector(".menu-desc").value.trim(),
        price: editor.querySelector(".menu-price").value.trim(),
        image: editor.querySelector(".menu-image").value.trim()
      };

      saveData(current, "Menu item saved");
      renderMenu(editor.parentElement);
    });
  });

  $all(".deleteMenu").forEach(function (button) {
    button.addEventListener("click", function () {
      const index = Number(button.dataset.index);

      if (!confirm("Delete this menu item?")) return;

      const current = getData();
      current.menu.splice(index, 1);

      saveData(current, "Menu item deleted");

      const pageElement = $("#page");
      if (pageElement) renderMenu(pageElement);
    });
  });
}


/* =========================================================
   GALLERY
========================================================= */

function renderGallery(container) {
  const data = getData();

  container.innerHTML = `
    <div class="pageHead">
      <div>
        <span class="eyebrow">VISUALS</span>
        <h2>Gallery</h2>
        <p>Add or replace restaurant gallery images.</p>
      </div>

      <button type="button" class="primary" id="addGallery">
        + Add Image
      </button>
    </div>

    <div id="galleryList"></div>
  `;

  const list = $("#galleryList");

  if (!Array.isArray(data.gallery)) {
    data.gallery = [];
  }

  if (data.gallery.length === 0) {
    list.innerHTML = `
      <div class="panel">
        <h3>No gallery images yet.</h3>
        <p>Add your first image using the button above.</p>
      </div>
    `;
  } else {
    data.gallery.forEach(function (url, index) {
      list.insertAdjacentHTML(
        "beforeend",
        `
        <div class="panel galleryItem"
             data-gallery-index="${index}">

          <div class="panelHead">
            <div>
              <span class="eyebrow">IMAGE ${index + 1}</span>
              <h3>Gallery Image</h3>
            </div>

            <button
              type="button"
              class="danger deleteGallery"
              data-index="${index}">
              Delete
            </button>
          </div>

          <div class="formGrid">
            <label class="full">
              Image URL
              <input
                class="gallery-url"
                value="${escapeHtml(url || "")}">
            </label>
          </div>

          ${
            url
              ? `
                <img
                  class="galleryPreview"
                  src="${escapeHtml(url)}"
                  alt="Gallery preview"
                  onerror="this.style.display='none'">
              `
              : ""
          }

          <div class="actions">
            <button
              type="button"
              class="primary saveGallery"
              data-index="${index}">
              Save Image
            </button>
          </div>

        </div>
        `
      );
    });
  }

  $("#addGallery").addEventListener("click", function () {
    const current = getData();

    if (!Array.isArray(current.gallery)) {
      current.gallery = [];
    }

    current.gallery.push("");

    saveData(current, "Gallery image added");
    renderGallery(container);
  });

  $all(".saveGallery").forEach(function (button) {
    button.addEventListener("click", function () {
      const index = Number(button.dataset.index);

      const editor = document.querySelector(
        '[data-gallery-index="' + index + '"]'
      );

      if (!editor) return;

      const current = getData();

      current.gallery[index] =
        editor.querySelector(".gallery-url").value.trim();

      saveData(current, "Gallery image saved");
      renderGallery(container);
    });
  });

  $all(".deleteGallery").forEach(function (button) {
    button.addEventListener("click", function () {
      const index = Number(button.dataset.index);

      if (!confirm("Delete this gallery image?")) return;

      const current = getData();

      current.gallery.splice(index, 1);

      saveData(current, "Gallery image deleted");
      renderGallery(container);
    });
  });
}


/* =========================================================
   BACKUP & RESET
========================================================= */

function renderSettings(container) {
  container.innerHTML = `
    <div class="pageHead">
      <div>
        <span class="eyebrow">SYSTEM</span>
        <h2>Backup & Reset</h2>
        <p>
          Backup your restaurant data or restore the original sample data.
        </p>
      </div>
    </div>

    <div class="panel">
      <div class="panelHead">
        <h3>Backup</h3>
      </div>

      <p>
        Download the current restaurant data as a JSON backup.
      </p>

      <div class="actions">
        <button
          type="button"
          class="primary"
          id="downloadBackup">
          Download Backup
        </button>

        <button
          type="button"
          class="primary"
          id="restoreBackup">
          Restore Backup
        </button>

        <input
          id="backupFile"
          type="file"
          accept="application/json"
          hidden>
      </div>
    </div>

    <div class="panel">
      <div class="panelHead">
        <h3>Reset</h3>
      </div>

      <p>
        Restore the original restaurant data from data.js.
      </p>

      <div class="actions">
        <button
          type="button"
          class="danger"
          id="resetData">
          Reset to Default Data
        </button>
      </div>
    </div>
  `;

  $("#downloadBackup").addEventListener("click", function () {
    const data = getData();

    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "dutta-restaurant-backup.json";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 500);

    toast("Backup downloaded");
  });


  $("#restoreBackup").addEventListener("click", function () {
    $("#backupFile").click();
  });


  $("#backupFile").addEventListener("change", function (event) {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function () {
      try {
        const imported = JSON.parse(reader.result);

        if (
          !imported ||
          typeof imported !== "object"
        ) {
          throw new Error("Invalid backup");
        }

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(imported)
        );

        toast("Backup restored");

        page("overview");

      } catch (error) {
        console.error(error);
        toast("Invalid backup file");
      }
    };

    reader.readAsText(file);

    event.target.value = "";
  });


  $("#resetData").addEventListener("click", function () {
    if (
      !confirm(
        "Reset all saved restaurant data to the original defaults?"
      )
    ) {
      return;
    }

    localStorage.removeItem(STORAGE_KEY);

    toast("Data reset");

    page("overview");
  });
}


/* =========================================================
   INITIALIZATION
========================================================= */

function initAdmin() {
  const loginButton = $("#loginBtn");
  const logoutButton = $("#logoutBtn");
  const pinInput = $("#pin");

  if (loginButton) {
    loginButton.addEventListener(
      "click",
      login
    );
  }

  if (logoutButton) {
    logoutButton.addEventListener(
      "click",
      logout
    );
  }

  if (pinInput) {
    pinInput.addEventListener(
      "keydown",
      function (event) {
        if (event.key === "Enter") {
          login();
        }
      }
    );
  }

  $all(".side[data-page]").forEach(
    function (button) {
      button.addEventListener(
        "click",
        function () {
          page(button.dataset.page);
        }
      );
    }
  );

  if (
    localStorage.getItem(AUTH_KEY) === "1"
  ) {
    showApp();
  } else {
    showLogin();
  }
}


/* =========================================================
   START
========================================================= */

if (
  document.readyState === "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    initAdmin
  );
} else {
  initAdmin();
}

})();
