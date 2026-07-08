// Lokaler Speicher für Mitteilungen und Termine
const NEWS_STORAGE_KEY = "ers_mitteilungen";
const TERMS_STORAGE_KEY = "ers_termine";

// --- Hilfsfunktionen: Mitteilungen ---

function loadNews() {
  try {
    const raw = localStorage.getItem(NEWS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Fehler beim Lesen der Mitteilungen:", err);
    return [];
  }
}

function saveNews(list) {
  try {
    localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error("Fehler beim Speichern der Mitteilungen:", err);
    alert(
      "Beim Speichern der Mitteilung ist ein Fehler aufgetreten (möglicherweise ist der Speicher voll)."
    );
  }
}

function addNewsEntry({ title, date, content, imageData, statusEl, form, imageInput }) {
  const list = loadNews();

  list.push({
    id: Date.now(),
    title,
    content,
    date,
    image: imageData || null,
    createdAt: new Date().toISOString()
  });

  saveNews(list);

  if (form) form.reset();
  if (imageInput) imageInput.value = "";

  if (statusEl) {
    statusEl.textContent =
      "Mitteilung gespeichert. Öffne oder aktualisiere die Startseite, um sie zu sehen.";
    statusEl.style.color = "#16a34a";
  }
}

// --- Hilfsfunktionen: Termine ---

function loadTerms() {
  try {
    const raw = localStorage.getItem(TERMS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Fehler beim Lesen der Termine:", err);
    return [];
  }
}

function saveTerms(list) {
  try {
    localStorage.setItem(TERMS_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error("Fehler beim Speichern der Termine:", err);
    alert(
      "Beim Speichern des Termins ist ein Fehler aufgetreten (möglicherweise ist der Speicher voll)."
    );
  }
}

function addTermEntry({ title, date, time, place, description, statusEl, form }) {
  const list = loadTerms();

  list.push({
    id: Date.now(),
    title,
    date,
    time: time || "",
    place: place || "",
    description: description || "",
    createdAt: new Date().toISOString()
  });

  saveTerms(list);

  if (form) form.reset();

  if (statusEl) {
    statusEl.textContent =
      "Termin gespeichert. Öffne oder aktualisiere die Startseite, um ihn zu sehen.";
    statusEl.style.color = "#16a34a";
  }
}

// --- Hilfsfunktionen: Formatierungen ---

function formatDateDE(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("de-DE");
}

document.addEventListener("DOMContentLoaded", () => {
  const newsForm = document.getElementById("news-form");
  const adminStatus = document.getElementById("admin-status");
  const termForm = document.getElementById("term-form");
  const termStatus = document.getElementById("term-status");

  // --- ADMIN: Mitteilung anlegen ---
  if (newsForm) {
    newsForm.addEventListener("submit", event => {
      event.preventDefault();

      const title = document.getElementById("title").value.trim();
      const dateInput = document.getElementById("date").value;
      const content = document.getElementById("content").value.trim();
      const imageInput = document.getElementById("image");
      const file = imageInput && imageInput.files ? imageInput.files[0] : null;

      if (!title || !content) {
        if (adminStatus) {
          adminStatus.textContent =
            "Bitte gib mindestens einen Titel und einen kurzen Text ein.";
          adminStatus.style.color = "#dc2626";
        }
        return;
      }

      const today = new Date();
      const date =
        dateInput || today.toISOString().substring(0, 10); // yyyy-mm-dd

      if (!file) {
        addNewsEntry({
          title,
          date,
          content,
          imageData: null,
          statusEl: adminStatus,
          form: newsForm,
          imageInput
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const imageData = reader.result; // base64-Data-URL
        addNewsEntry({
          title,
          date,
          content,
          imageData,
          statusEl: adminStatus,
          form: newsForm,
          imageInput
        });
      };
      reader.onerror = () => {
        console.error("Fehler beim Lesen der Bilddatei.");
        if (adminStatus) {
          adminStatus.textContent =
            "Das Bild konnte nicht gelesen werden. Bitte versuche es erneut oder wähle eine andere Datei.";
          adminStatus.style.color = "#dc2626";
        }
      };

      reader.readAsDataURL(file);
    });
  }

  // --- ADMIN: Termin anlegen ---
  if (termForm) {
    termForm.addEventListener("submit", event => {
      event.preventDefault();

      const title = document.getElementById("term-title").value.trim();
      const date = document.getElementById("term-date").value;
      const time = document.getElementById("term-time").value;
      const place = document.getElementById("term-place").value.trim();
      const description = document
        .getElementById("term-description")
        .value.trim();

      if (!title || !date) {
        if (termStatus) {
          termStatus.textContent =
            "Bitte gib mindestens Titel und Datum für den Termin ein.";
          termStatus.style.color = "#dc2626";
        }
        return;
      }

      addTermEntry({
        title,
        date,
        time,
        place,
        description,
        statusEl: termStatus,
        form: termForm
      });
    });
  }

  // --- STARTSEITE: Mitteilungen (nur 2 neueste) ---
  const homeNewsList = document.getElementById("home-news-list");
  const homeNoNewsMsg = document.getElementById("home-no-news-msg");

  if (homeNewsList) {
    const list = loadNews();

    if (!list.length) {
      if (homeNoNewsMsg) homeNoNewsMsg.style.display = "block";
    } else {
      if (homeNoNewsMsg) homeNoNewsMsg.style.display = "none";

      const maxItems = 2; // csak 2 legfrissebb

      list
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, maxItems)
        .forEach(item => {
          const card = document.createElement("article");
          card.className = "news-card";

          if (item.image) {
            const img = document.createElement("img");
            img.src = item.image;
            img.alt = item.title || "Mitteilung Bild";
            img.className = "news-image";
            card.appendChild(img);
          }

          const meta = document.createElement("div");
          meta.className = "news-meta";
          meta.textContent = `Datum: ${item.date}`;

          const titleEl = document.createElement("h3");
          titleEl.textContent = item.title;

          const contentEl = document.createElement("p");
          const fullText = item.content || "";
          const maxLen = 220;
          const preview =
            fullText.length > maxLen
              ? fullText.slice(0, maxLen).trim() + "…"
              : fullText;

          contentEl.textContent = preview;

          card.appendChild(meta);
          card.appendChild(titleEl);
          card.appendChild(contentEl);

          if (fullText.length > maxLen) {
            const moreLink = document.createElement("a");
            moreLink.href = `mitteilung.html?id=${encodeURIComponent(item.id)}`;
            moreLink.className = "news-more";
            moreLink.textContent = "Mehr lesen";
            card.appendChild(moreLink);
          }

          homeNewsList.appendChild(card);
        });
    }
  }

  // --- STARTSEITE: Termine (max. 4) ---
  const homeTermsList = document.getElementById("home-terms-list");
  const homeNoTermsMsg = document.getElementById("home-no-terms-msg");

  if (homeTermsList) {
    const terms = loadTerms();

    if (!terms.length) {
      if (homeNoTermsMsg) homeNoTermsMsg.style.display = "block";
    } else {
      if (homeNoTermsMsg) homeNoTermsMsg.style.display = "none";

      const maxItems = 4; // csak 4 Termin

      terms
        .sort((a, b) => {
          const da = new Date(a.date || a.createdAt);
          const db = new Date(b.date || b.createdAt);
          return da - db; // legközelebbi először
        })
        .slice(0, maxItems)
        .forEach(term => {
          const card = document.createElement("article");
          card.className = "term-card";

          const meta = document.createElement("div");
          meta.className = "term-meta";

          const parts = [];
          if (term.date) {
            parts.push(formatDateDE(term.date));
          }
          if (term.time) {
            parts.push(term.time + " Uhr");
          }
          if (term.place) {
            parts.push(term.place);
          }
          meta.textContent = parts.join(" · ");

          const titleEl = document.createElement("h3");
          titleEl.textContent = term.title;

          card.appendChild(meta);
          card.appendChild(titleEl);

          if (term.description) {
            const descEl = document.createElement("p");
            descEl.textContent = term.description;
            card.appendChild(descEl);
          }

          homeTermsList.appendChild(card);
        });
    }
  }

  // --- ARCHIV: Mitteilungen (mitteilungen.html) ---
  const archiveNewsList = document.getElementById("archive-news-list");
  const archiveNoNewsMsg = document.getElementById("archive-no-news-msg");

  if (archiveNewsList) {
    const list = loadNews();

    if (!list.length) {
      if (archiveNoNewsMsg) archiveNoNewsMsg.style.display = "block";
    } else {
      if (archiveNoNewsMsg) archiveNoNewsMsg.style.display = "none";

      list
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .forEach(item => {
          const card = document.createElement("article");
          card.className = "news-card";

          if (item.image) {
            const img = document.createElement("img");
            img.src = item.image;
            img.alt = item.title || "Mitteilung Bild";
            img.className = "news-image";
            card.appendChild(img);
          }

          const meta = document.createElement("div");
          meta.className = "news-meta";
          meta.textContent = `Datum: ${item.date}`;

          const titleEl = document.createElement("h3");
          titleEl.textContent = item.title;

          const contentEl = document.createElement("p");
          const fullText = item.content || "";
          const maxLen = 360;
          const preview =
            fullText.length > maxLen
              ? fullText.slice(0, maxLen).trim() + "…"
              : fullText;
          contentEl.textContent = preview;

          card.appendChild(meta);
          card.appendChild(titleEl);
          card.appendChild(contentEl);

          if (fullText.length > maxLen) {
            const moreLink = document.createElement("a");
            moreLink.href = `mitteilung.html?id=${encodeURIComponent(item.id)}`;
            moreLink.className = "news-more";
            moreLink.textContent = "Mehr lesen";
            card.appendChild(moreLink);
          }

          archiveNewsList.appendChild(card);
        });
    }
  }

  // --- ARCHIV: Termine (termine.html) ---
  const archiveTermsList = document.getElementById("archive-terms-list");
  const archiveNoTermsMsg = document.getElementById("archive-no-terms-msg");

  if (archiveTermsList) {
    const terms = loadTerms();

    if (!terms.length) {
      if (archiveNoTermsMsg) archiveNoTermsMsg.style.display = "block";
    } else {
      if (archiveNoTermsMsg) archiveNoTermsMsg.style.display = "none";

      terms
        .sort((a, b) => {
          const da = new Date(a.date || a.createdAt);
          const db = new Date(b.date || b.createdAt);
          return da - db;
        })
        .forEach(term => {
          const card = document.createElement("article");
          card.className = "term-card";

          const meta = document.createElement("div");
          meta.className = "term-meta";

          const parts = [];
          if (term.date) {
            parts.push(formatDateDE(term.date));
          }
          if (term.time) {
            parts.push(term.time + " Uhr");
          }
          if (term.place) {
            parts.push(term.place);
          }
          meta.textContent = parts.join(" · ");

          const titleEl = document.createElement("h3");
          titleEl.textContent = term.title;

          card.appendChild(meta);
          card.appendChild(titleEl);

          if (term.description) {
            const descEl = document.createElement("p");
            descEl.textContent = term.description;
            card.appendChild(descEl);
          }

          archiveTermsList.appendChild(card);
        });
    }
  }

  // --- EINZELANSICHT: Mitteilung (mitteilung.html?id=...) ---
  const detailContainer = document.getElementById("news-detail");
  const detailNotFound = document.getElementById("news-not-found");

  if (detailContainer) {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");

    const list = loadNews();
    let item = null;

    if (idParam) {
      item = list.find(entry => String(entry.id) === String(idParam));
    }

    if (!item) {
      if (detailNotFound) detailNotFound.style.display = "block";
      return;
    }

    if (detailNotFound) detailNotFound.style.display = "none";

    try {
      document.title =
        "Mitteilung – " + item.title + " | Ernst-Reuter-Schule Karlsruhe";
    } catch (e) {}

    const card = document.createElement("article");
    card.className = "news-card";

    if (item.image) {
      const img = document.createElement("img");
      img.src = item.image;
      img.alt = item.title || "Mitteilung Bild";
      img.className = "news-image";
      card.appendChild(img);
    }

    const meta = document.createElement("div");
    meta.className = "news-meta";
    meta.textContent = `Datum: ${item.date}`;

    const titleEl = document.createElement("h2");
    titleEl.textContent = item.title;

    const contentEl = document.createElement("p");
    contentEl.textContent = item.content;

    const backLink = document.createElement("a");
    backLink.href = "index.html#aktuelles";
    backLink.className = "news-more";
    backLink.textContent = "Zurück zur Startseite";

    card.appendChild(meta);
    card.appendChild(titleEl);
    card.appendChild(contentEl);
    card.appendChild(backLink);

    detailContainer.appendChild(card);
  }
});
