const origin = window.location.origin;

function injectStyle() {
    if (document.getElementById("force-text-selection")) return;

    const style = document.createElement("style");
    style.id = "force-text-selection";
    style.textContent = `
    * {
        user-select: text !important;
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        cursor: text !important;
    }
    [unselectable="on"], [contenteditable="false"] {
        user-select: text !important;
    }
    `;
    (document.head || document.documentElement).appendChild(style);
}

function removeStyle() {
    const style = document.getElementById("force-text-selection");
    if (style) style.remove();
}

async function checkAndApply() {
    if (!origin || !origin.startsWith("http")) return;

    const data = await browser.storage.local.get("allowedOrigins");
    const list = data.allowedOrigins || [];
    const shouldEnable = list.includes(origin);

    if (shouldEnable) {
        injectStyle();
    } else {
        removeStyle();
    }
}

// Sayfa açılır açılmaz kontrol
checkAndApply();

// Listede değişiklik olursa (popup’tan ekle/kaldır) anında güncelle
browser.storage.onChanged.addListener((changes) => {
    if (changes.allowedOrigins) checkAndApply();
});
