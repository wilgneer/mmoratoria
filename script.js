// ===============================
// MODAL (Abrir / Fechar)
// ===============================
const modalOverlay = document.getElementById("leadModal");
const modalClose = document.getElementById("modalClose");
const openModalButtons = document.querySelectorAll("[data-open-modal]");

function openModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.add("is-open");
}

function closeModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.remove("is-open");
}

// abre modal em todos os CTAs com data-open-modal
openModalButtons.forEach((btn) => {
  btn.addEventListener("click", openModal);
});

if (modalClose) modalClose.addEventListener("click", closeModal);

// fechar clicando fora do modal
if (modalOverlay) {
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });
}

// fechar com ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalOverlay && modalOverlay.classList.contains("is-open")) {
    closeModal();
  }
});

// ===============================
// CONFIG (Sheets + Greenn)
// ===============================

// 1) Cole aqui a URL do seu Google Apps Script (Web App /exec)
const GOOGLE_SHEETS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwf2SRnf-TGksjBRsmOodiq-J14IA3DnKtNtFBz95HXowYwwkXOdwLIL8puOkePo_R1Eg/exec";

// 2) Link da Greenn (checkout)
const GREENN_CHECKOUT_URL = "https://payfast.greenn.com.br/pre-checkout/149180";

// ===============================
// FORMULÁRIO / INTEGRAÇÃO
// ===============================
const leadForm = document.getElementById("leadForm");
const formFeedback = document.getElementById("formFeedback");

if (leadForm) {
  leadForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = leadForm.nome?.value.trim() || "";
    const email = leadForm.email?.value.trim() || "";
    const profissao = leadForm.profissao?.value.trim() || "";
    const whatsapp = leadForm.whatsapp?.value.trim() || "";

    // validação simples
    if (!nome || !email || !profissao || !whatsapp) {
      if (formFeedback) {
        formFeedback.textContent = "Preencha todos os campos obrigatórios.";
        formFeedback.classList.remove("ok");
        formFeedback.classList.add("error");
      }
      return;
    }

    const leadData = {
      nome,
      email,
      profissao,
      whatsapp,
      origem: "LP Destrave Sua Voz",
      datahora: new Date().toISOString(),
    };

    // trava botão para evitar duplo clique
    const submitBtn = leadForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = "0.75";
      submitBtn.style.cursor = "not-allowed";
    }

    if (formFeedback) {
      formFeedback.textContent = "Enviando...";
      formFeedback.classList.remove("error", "ok");
    }

    // 1) Envia para Google Sheets (rápido / não bloqueia)
    sendToGoogleSheets(leadData);

    // 2) Feedback + redirect Greenn (rápido)
    if (formFeedback) {
      formFeedback.textContent = "Pronto! Redirecionando para o pagamento...";
      formFeedback.classList.remove("error");
      formFeedback.classList.add("ok");
    }

    // fecha modal (opcional) antes de redirecionar
    // fecha o modal e mostra os planos
    setTimeout(() => {
      closeModal();
      mostrarPlanos();
    }, 120);

    // NÃO redireciona automaticamente
    // (deixe o usuário escolher o plano)

    // redireciona rápido para aumentar percepção de velocidade
    //setTimeout(() => {
      //window.location.href = GREENN_CHECKOUT_URL;
    //}, 250);
    
  });
  const planosSection = document.getElementById("planos");

  function mostrarPlanos() {
    if (!planosSection) return;

    planosSection.classList.remove("hidden");
    planosSection.classList.add("show");

    planosSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

// ===============================
// ENVIAR PARA GOOGLE SHEETS (RÁPIDO)
// - sendBeacon (melhor para redirect)
// - fallback fetch no-cors + keepalive
// ===============================
function sendToGoogleSheets(data) {
  if (!GOOGLE_SHEETS_WEBAPP_URL || GOOGLE_SHEETS_WEBAPP_URL.includes("COLE_AQUI")) {
    console.warn("GOOGLE_SHEETS_WEBAPP_URL não configurada. Lead não foi enviado ao Sheets.");
    return;
  }

  try {
    const payload = JSON.stringify(data);

    // Melhor opção quando vai ocorrer navegação/redirect
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "text/plain;charset=utf-8" });
      const ok = navigator.sendBeacon(GOOGLE_SHEETS_WEBAPP_URL, blob);
      if (ok) {
        console.log("Lead enviado para Google Sheets (sendBeacon).");
        return;
      }
      console.warn("sendBeacon falhou. Tentando fetch como fallback...");
    }

    // Fallback
    fetch(GOOGLE_SHEETS_WEBAPP_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch (err) {
    console.error("Erro ao enviar para Sheets:", err);
  }
}

// ==========================
// FAQ (accordion otimizado)
// - Um único listener
// - Altura real via scrollHeight (anima suave)
// ==========================
const faqList = document.querySelector(".faq-list");

if (faqList) {
  faqList.addEventListener("click", (e) => {
    const btn = e.target.closest(".faq-question");
    if (!btn) return;

    const item = btn.closest(".faq-item");
    if (!item) return;

    const answer = item.querySelector(".faq-answer");
    const icon = item.querySelector(".faq-icon");
    const isOpen = item.classList.contains("is-open");

    // Fecha o que estiver aberto (apenas 1)
    const openItem = faqList.querySelector(".faq-item.is-open");
    if (openItem && openItem !== item) {
      const openBtn = openItem.querySelector(".faq-question");
      const openAnswer = openItem.querySelector(".faq-answer");
      const openIcon = openItem.querySelector(".faq-icon");

      openItem.classList.remove("is-open");
      if (openBtn) openBtn.setAttribute("aria-expanded", "false");
      if (openIcon) openIcon.textContent = "+";
      if (openAnswer) openAnswer.style.height = "0px";
    }

    // Alterna o clicado
    if (isOpen) {
      item.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      if (icon) icon.textContent = "+";
      if (answer) answer.style.height = "0px";
    } else {
      item.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      if (icon) icon.textContent = "−";
      if (answer) answer.style.height = answer.scrollHeight + "px";
    }
  });

  // Ajusta altura quando a tela muda
  window.addEventListener("resize", () => {
    const openAnswer = document.querySelector(".faq-item.is-open .faq-answer");
    if (openAnswer) openAnswer.style.height = openAnswer.scrollHeight + "px";
  });
}

// ===============================
// CARRETEL / GALERIA
// ===============================
const galleryTrack = document.getElementById("galleryTrack");
const galleryPrev = document.getElementById("galleryPrev");
const galleryNext = document.getElementById("galleryNext");

if (galleryTrack && galleryPrev && galleryNext) {
  galleryPrev.addEventListener("click", () => {
    galleryTrack.scrollBy({
      left: -galleryTrack.clientWidth,
      behavior: "smooth",
    });
  });

  galleryNext.addEventListener("click", () => {
    galleryTrack.scrollBy({
      left: galleryTrack.clientWidth,
      behavior: "smooth",
    });
  });

// ===============================
// LITE YOUTUBE (carrega iframe só no clique)
// ===============================
function setupLiteYouTube() {
  const nodes = document.querySelectorAll(".yt-lite[data-id]");
  if (!nodes.length) return;

  nodes.forEach((el) => {
    const id = el.getAttribute("data-id");
    const label = el.getAttribute("data-label") || "Depoimento";

    // Thumb melhor. Se não existir maxres, o YouTube retorna 404; então usamos hqdefault por padrão.
    const thumbHQ = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    el.style.backgroundImage = `url("${thumbHQ}")`;

    // UI (play + label)
    el.innerHTML = `
      <svg class="yt-play" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 5v14l11-7z"></path>
      </svg>
      <div class="yt-label">${label}</div>
    `;

    const activate = () => {
      el.classList.add("is-playing");

      const iframe = document.createElement("iframe");
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
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

// === Links da Greenn por plano (troque pelas URLs reais) ===
const GREENN_URLS = {
  prata: "https://payfast.greenn.com.br/pre-checkout/149180",
  ouro: "https://payfast.greenn.com.br/pre-checkout/149180",
  diamante: "https://payfast.greenn.com.br/pre-checkout/149180",
};

// clique nos botões de plano -> redireciona para a Greenn
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".plan-btn");
  if (!btn) return;

  const plan = btn.getAttribute("data-plan");
  const url = GREENN_URLS[plan];

  if (!url || url.includes("SEU-LINK-GREENN")) {
    alert("Link do checkout ainda não configurado para este plano.");
    return;
  }

  window.location.href = url;
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
}

}
