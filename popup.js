async function getCurrentOrigin() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const url = tabs[0]?.url;
  if (!url || !url.startsWith("http")) return null;
  try { return new URL(url).origin; } catch { return null; }
}

async function loadPopup() {
  const origin = await getCurrentOrigin();
  const data = await browser.storage.local.get("allowedOrigins");
  let list = data.allowedOrigins || [];

  // Şu anki site bölümü
  const currentDiv = document.getElementById("current");
  const toggleBtn = document.getElementById("toggle-btn");

  if (origin) {
    currentDiv.innerHTML = `<strong>Şu anki site:</strong><br>${origin}`;
    const isEnabled = list.includes(origin);
    toggleBtn.textContent = isEnabled ? "❌ Bu siteden kaldır" : "✅ Bu siteye ekle";

    toggleBtn.onclick = async () => {
      if (isEnabled) {
        list = list.filter(o => o !== origin);
      } else {
        if (!list.includes(origin)) list.push(origin);
      }
      await browser.storage.local.set({ allowedOrigins: list });
      loadPopup(); // UI’yi yenile
    };
  } else {
    currentDiv.textContent = "Bu sayfada çalışmaz (chrome://, about: vs.)";
    toggleBtn.style.display = "none";
  }

  // Kayıtlı siteler listesi
  const ul = document.getElementById("site-list");
  ul.innerHTML = "";
  list.forEach(o => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${o}
      <button class="remove" data-origin="${o}">Sil</button>
    `;
    ul.appendChild(li);
  });

  // Sil butonları
  document.querySelectorAll(".remove").forEach(btn => {
    btn.onclick = async () => {
      const toRemove = btn.dataset.origin;
      list = list.filter(o => o !== toRemove);
      await browser.storage.local.set({ allowedOrigins: list });
      loadPopup();
    };
  });

  // Özel site ekle
  document.getElementById("add-custom").onclick = async () => {
    let val = document.getElementById("custom-input").value.trim();
    if (!val) return;
    if (!val.startsWith("http")) val = "https://" + val;
    try {
      const o = new URL(val).origin;
      if (!list.includes(o)) {
        list.push(o);
        await browser.storage.local.set({ allowedOrigins: list });
        loadPopup();
      }
    } catch {
      alert("Geçersiz URL!");
    }
  };
}

document.addEventListener("DOMContentLoaded", loadPopup);
