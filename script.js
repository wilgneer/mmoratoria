// ==================================================
// Destrave Sua Voz — Script (limpo)
// - Modal único (lead)
// - CTA: destino depende da cidade selecionada no modal
// - Planos: "Comprar" abre modal já com cidade do filtro selecionada e usa o link do próprio botão
// - Ver Planos -> mostra apenas cards BH/BSB -> clique revela planos com transição
// - FAQ accordion + Galeria + Lite YouTube + Service Worker
// ==================================================

// ===============================
// CONFIG (Sheets + Destinos) 
// ===============================
// WebApps (Apps Script) — UMA URL PARA CADA PLANILHA
const SHEETS_BH_URL  = "https://script.google.com/macros/s/AKfycbyCc_2MgAYfn1DBVWueCZrlKfHLf2nRD_mE1JMv7CxGD1N4MV-b-MajKn4kut5lZH8I/exec";
const SHEETS_BSB_URL = "https://script.google.com/macros/s/AKfycbzmqjQX8iZf60rhAIdrpMEA3UgACjvnkFXeDZcDLuSEQDKhqcdlC5KeKcgiae5-tucmHQ/exec";

// Destinos dos CTAs (após o obrigado) — por cidade
const CTA_NEXT_BH_URL  = "https://payfast.greenn.com.br/pre-checkout/154259";
const CTA_NEXT_BSB_URL = "https://payfast.greenn.com.br/pre-checkout/158548";

// ===============================
// HELPERS
// ===============================
function normCity(v){
  v = String(v || "").toLowerCase().trim();
  if (v === "bsb" || v === "brasilia" || v === "brasília") return "bsb";
  return "bh";
}
function isValidHttp(url){
  return /^https?:\/\//i.test(String(url || "").trim());
}
function sheetsUrlByCity(city){
  return normCity(city) === "bsb" ? SHEETS_BSB_URL : SHEETS_BH_URL;
}
function ctaNextByCity(city){
  return normCity(city) === "bsb" ? CTA_NEXT_BSB_URL : CTA_NEXT_BH_URL;
}

// ===============================
// MODAL (único) — abrir / fechar
// ===============================
const leadModal     = document.getElementById("leadModal");
const leadForm      = document.getElementById("leadForm");
const formFeedback  = document.getElementById("formFeedback");
const selectCidade  = document.getElementById("cidade");

let FLOW_TYPE = "cta"; // "cta" | "plan"
let NEXT_URL  = "";    // destino final após obrigado

function openModal(){
  if (!leadModal) return;
  leadModal.classList.add("is-open");
  document.body.style.overflow = "hidden";
}
function closeModal(){
  if (!leadModal) return;
  leadModal.classList.remove("is-open");
  document.body.style.overflow = "";
}

// Abre modal em qualquer elemento com data-open-modal
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-open-modal]");
  if (!btn) return;

  e.preventDefault();

  FLOW_TYPE = (btn.getAttribute("data-open-modal") === "plan") ? "plan" : "cta";

  // limpa feedback
  if (formFeedback){
    formFeedback.textContent = "";
    formFeedback.classList.remove("error","ok");
  }

  if (FLOW_TYPE === "cta") {
    NEXT_URL = ""; // decidido no submit
    if (selectCidade) selectCidade.value = "";
    openModal();
    return;
  }

  // FLOW_TYPE === "plan"
  // Cidade vem do filtro atual da seção de planos (#planos data-city)
  const planos = document.getElementById("planos");
  const city = normCity(planos?.getAttribute("data-city") || "bh");
  if (selectCidade) selectCidade.value = city;

  // destino vem do próprio botão (data-checkout-bh/bsb)
  const url = (city === "bsb")
    ? (btn.getAttribute("data-checkout-bsb") || btn.getAttribute("data-checkout-url") || "")
    : (btn.getAttribute("data-checkout-bh")  || btn.getAttribute("data-checkout-url") || "");

  NEXT_URL = String(url || "").trim();

  openModal();
});

// Fechar (x) e clique fora
document.addEventListener("click", (e) => {
  const closeBtn = e.target.closest("[data-close-modal]");
  if (closeBtn){
    e.preventDefault();
    closeModal();
    return;
  }
  if (e.target === leadModal) closeModal();
});

// ESC fecha
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// ===============================
// Envio para Google Sheets (por cidade)
// ===============================
function sendToGoogleSheets(webAppUrl, data){
  if (!isValidHttp(webAppUrl)) {
    console.warn("WebApp URL inválida:", webAppUrl);
    return false;
  }

  try {
    const payload = JSON.stringify(data);

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "text/plain;charset=utf-8" });
      const ok = navigator.sendBeacon(webAppUrl, blob);
      if (ok) return true;
    }

    fetch(webAppUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: payload,
      keepalive: true,
    }).catch(() => {});

    return true;
  } catch (err) {
    console.error("Erro ao enviar para Sheets:", err);
    return false;
  }
}

// ===============================
// SUBMIT do Modal
// ===============================
if (leadForm) {
  leadForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const city = normCity(selectCidade?.value || "");
    if (!selectCidade?.value) {
      if (formFeedback){
        formFeedback.textContent = "Selecione a cidade.";
        formFeedback.classList.add("error");
      }
      return;
    }

    const nome      = leadForm.querySelector("#nome")?.value.trim() || "";
    const email     = leadForm.querySelector("#email")?.value.trim() || "";
    const profissao = leadForm.querySelector("#profissao")?.value.trim() || "";
    const whatsapp  = leadForm.querySelector("#whatsapp")?.value.trim() || "";

    if (!nome || !email || !profissao || !whatsapp) {
      if (formFeedback){
        formFeedback.textContent = "Preencha todos os campos obrigatórios.";
        formFeedback.classList.add("error");
      }
      return;
    }

    // Decide destino final
    const destino = (FLOW_TYPE === "plan") ? NEXT_URL : ctaNextByCity(city);

    if (!isValidHttp(destino)) {
      if (formFeedback){
        formFeedback.textContent = "Destino não configurado. Verifique os links no script.js.";
        formFeedback.classList.add("error");
      }
      console.warn("Destino inválido:", { FLOW_TYPE, destino, NEXT_URL, city });
      return;
    }

    const cidadeFinal = (city === "bsb") ? "Brasília" : "Belo Horizonte";

    const payload = {
      nome,
      email,
      profissao,
      whatsapp,
      cidade: cidadeFinal,
      origem: "LP Destrave sua Voz",
      pagina: location.pathname,
      datahora: new Date().toISOString(),
      lgpd: true
    };

    // planilha correta
    sendToGoogleSheets(sheetsUrlByCity(city), payload);

    if (formFeedback){
      formFeedback.textContent = "Recebido! Redirecionando...";
      formFeedback.classList.remove("error");
      formFeedback.classList.add("ok");
    }

    closeModal();

    // passa pelo obrigado e redireciona
    setTimeout(() => {
      window.location.href = `obrigado.html?to=${encodeURIComponent(destino)}`;
    }, 150);
  });
}

// ===============================
// VER PLANOS -> mostra só cards BH/BSB
// ===============================
function showPlansAndScroll(){
  const section = document.getElementById("planos");
  const content = document.getElementById("plansContent");
  const pills   = document.querySelectorAll("[data-plans-city]");
  if (!section) return;

  section.classList.remove("hidden");

  // mostra somente os 2 cards e mantém planos ocultos até escolher a cidade
  if (content) content.classList.add("is-hidden");
  section.setAttribute("data-city", "");
  pills.forEach((p) => {
    p.classList.remove("is-active");
    p.setAttribute("aria-selected", "false");
  });

  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

const btnVerPlanos = document.getElementById("btnVerPlanos");
if (btnVerPlanos) btnVerPlanos.addEventListener("click", (e) => { e.preventDefault(); showPlansAndScroll(); });

const btnVerPlanosHero = document.getElementById("btnVerPlanosHero");
if (btnVerPlanosHero) btnVerPlanosHero.addEventListener("click", (e) => { e.preventDefault(); showPlansAndScroll(); });

// ===============================
// PLANOS — BH/BSB (aparece/some com transição)
// ===============================
(function initPlansCityToggle(){
  const section = document.getElementById("planos");
  const content = document.getElementById("plansContent");
  const pills = Array.from(document.querySelectorAll("[data-plans-city]"));
  if (!section || !content || !pills.length) return;

  let currentCity = "";
  let revealed = false;

  function setActive(city){
    pills.forEach((p) => {
      const active = p.getAttribute("data-plans-city") === city;
      p.classList.toggle("is-active", active);
      p.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  function setCity(city){
    section.setAttribute("data-city", city);
    currentCity = city;
    setActive(city);
  }

  function reveal(){
    content.classList.remove("is-hidden");
    revealed = true;
  }

  document.addEventListener("click", (e) => {
    const pill = e.target.closest("[data-plans-city]");
    if (!pill) return;

    e.preventDefault();
    const nextCity = normCity(pill.getAttribute("data-plans-city"));

    if (!revealed) {
      setCity(nextCity);
      requestAnimationFrame(reveal);
      return;
    }

    if (nextCity === currentCity) return;

    content.classList.add("is-switching");
    setTimeout(() => {
      setCity(nextCity);
      content.classList.remove("is-switching");
    }, 170);
  });
})();

// ==========================
// FAQ (accordion)
// ==========================
const faqList = document.querySelector(".faq-list");
if (faqList) {
  faqList.addEventListener("click", (e) => {
    const btn = e.target.closest(".faq-question");
    if (!btn) return;

    const item = btn.closest(".faq-item");
    const answer = item?.querySelector(".faq-answer");
    const icon = item?.querySelector(".faq-icon");
    const isOpen = item?.classList.contains("is-open");

    const openItem = faqList.querySelector(".faq-item.is-open");
    if (openItem && openItem !== item) {
      const openBtn = openItem.querySelector(".faq-question");
      const openAnswer = openItem.querySelector(".faq-answer");
      const openIcon = openItem.querySelector(".faq-icon");
      openItem.classList.remove("is-open");
      openBtn?.setAttribute("aria-expanded", "false");
      if (openIcon) openIcon.textContent = "+";
      if (openAnswer) openAnswer.style.height = "0px";
    }

    if (!item || !answer) return;

    if (isOpen) {
      item.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      if (icon) icon.textContent = "+";
      answer.style.height = "0px";
    } else {
      item.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      if (icon) icon.textContent = "−";
      answer.style.height = answer.scrollHeight + "px";
    }
  });

  window.addEventListener("resize", () => {
    const openAnswer = document.querySelector(".faq-item.is-open .faq-answer");
    if (openAnswer) openAnswer.style.height = openAnswer.scrollHeight + "px";
  });
}

// ===============================
// CARRETEL / GALERIA
// ===============================
const galleryTrack = document.getElementById("galleryTrack");
const galleryPrev  = document.getElementById("galleryPrev");
const galleryNext  = document.getElementById("galleryNext");

if (galleryTrack && galleryPrev && galleryNext) {
  galleryPrev.addEventListener("click", () => {
    galleryTrack.scrollBy({ left: -galleryTrack.clientWidth, behavior: "smooth" });
  });
  galleryNext.addEventListener("click", () => {
    galleryTrack.scrollBy({ left: galleryTrack.clientWidth, behavior: "smooth" });
  });
}

// ===============================
// LITE YOUTUBE
// ===============================
function setupLiteYouTube() {
  const nodes = document.querySelectorAll(".yt-lite[data-id]");
  if (!nodes.length) return;

  nodes.forEach((el) => {
    const id = el.getAttribute("data-id");
    const label = el.getAttribute("data-label") || "Depoimento";

    const thumbHQ = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    el.style.backgroundImage = `url("${thumbHQ}")`;

    el.innerHTML = `
      <svg class="yt-play" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 5v14l11-7z"></path>
      </svg>
      <div class="yt-label">${label}</div>
    `;

    const activate = () => {
      el.classList.add("is-playing");
      const iframe = document.createElement("iframe");
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      iframe.loading = "lazy";
      iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
      iframe.style.position = "absolute";
      iframe.style.inset = "0";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.border = "0";
      el.innerHTML = "";
      el.appendChild(iframe);
    };

    el.addEventListener("click", activate, { passive: true });
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") activate();
    });

    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("aria-label", `Reproduzir ${label}`);
  });
}
setupLiteYouTube();

// ===============================
// Service Worker
// ===============================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
}
