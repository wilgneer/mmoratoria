// ===============================
// MODAL (Abrir / Fechar)
// ===============================
const modalOverlay = document.getElementById("leadModal");
const modalClose = document.getElementById("modalClose");
const openModalButtons = document.querySelectorAll("[data-open-modal]");

function openModal() {
  modalOverlay.classList.add("is-open");
}

function closeModal() {
  modalOverlay.classList.remove("is-open");
}

// abre modal em todos os CTAs com data-open-modal
openModalButtons.forEach((btn) => {
  btn.addEventListener("click", openModal);
});

modalClose.addEventListener("click", closeModal);

// fechar clicando fora do modal
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});

// fechar com ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalOverlay.classList.contains("is-open")) closeModal();
});

// ===============================
// CONFIG (Sheets + Greenn)
// ===============================

// 1) Cole aqui a URL do seu Google Apps Script (Web App /exec)
const GOOGLE_SHEETS_WEBAPP_URL = "COLE_AQUI_SUA_URL_DO_APPS_SCRIPT";

// 2) Link da Greenn (checkout)
const GREENN_CHECKOUT_URL = "https://payfast.greenn.com.br/pre-checkout/149180";

// ===============================
// FORMULÁRIO / INTEGRAÇÃO
// ===============================
const leadForm = document.getElementById("leadForm");
const formFeedback = document.getElementById("formFeedback");

leadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = leadForm.nome.value.trim();
  const email = leadForm.email.value.trim();
  const profissao = leadForm.profissao.value.trim();
  const whatsapp = leadForm.whatsapp.value.trim();

  // validação simples
  if (!nome || !email || !profissao || !whatsapp) {
    formFeedback.textContent = "Preencha todos os campos obrigatórios.";
    formFeedback.classList.remove("ok");
    formFeedback.classList.add("error");
    return;
  }

  const leadData = {
    nome,
    email,
    profissao,
    whatsapp,
    origem: "LP Destrave Sua Voz",
    datahora: new Date().toISOString()
  };

  // trava botão para evitar duplo clique
  const submitBtn = leadForm.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.style.opacity = "0.75";
    submitBtn.style.cursor = "not-allowed";
  }

  formFeedback.textContent = "Enviando...";
  formFeedback.classList.remove("error");
  formFeedback.classList.remove("ok");

  // 1) Envia pro Google Sheets
  await sendToGoogleSheets(leadData);

  // 2) Feedback + redirect Greenn
  formFeedback.textContent = "Pronto! Redirecionando para o pagamento...";
  formFeedback.classList.remove("error");
  formFeedback.classList.add("ok");

  // opcional: fecha modal antes de redirecionar
  setTimeout(() => {
    closeModal();
  }, 300);

  // redireciona (delay curto pra UX)
  setTimeout(() => {
    window.location.href = GREENN_CHECKOUT_URL;
  }, 650);
});

// ===============================
// ENVIAR PARA GOOGLE SHEETS
// ===============================
async function sendToGoogleSheets(data) {
  // se não configurou a URL ainda, não quebra
  if (!GOOGLE_SHEETS_WEBAPP_URL || GOOGLE_SHEETS_WEBAPP_URL.includes("COLE_AQUI")) {
    console.warn("GOOGLE_SHEETS_WEBAPP_URL não configurada. Lead não foi enviado ao Sheets.");
    return;
  }

  try {
    /**
     * Usamos text/plain + no-cors para evitar problemas de CORS em LP estática.
     * O envio ocorre, mas o browser não permite ler resposta (normal).
     */
    await fetch(GOOGLE_SHEETS_WEBAPP_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(data),
    });

    console.log("Lead enviado para Google Sheets.");
  } catch (err) {
    console.error("Erro ao enviar para Sheets:", err);
  }
}

// ==========================
// FAQ (accordion otimizado)
// ==========================
const faqList = document.querySelector(".faq-list");

if (faqList) {
  faqList.addEventListener("click", (e) => {
    const btn = e.target.closest(".faq-question");
    if (!btn) return;

    const item = btn.closest(".faq-item");
    const answer = item.querySelector(".faq-answer");
    const icon = btn.querySelector(".faq-icon");

    const isOpen = item.classList.contains("is-open");

    // Fecha o que estiver aberto (apenas 1, sem varrer tudo)
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

      if (answer) {
        // define altura real para animar suave
        answer.style.height = answer.scrollHeight + "px";
      }
    }
  });
}

// Ajusta altura quando a tela muda (evita travar resposta aberta)
window.addEventListener("resize", () => {
  const openAnswer = document.querySelector(".faq-item.is-open .faq-answer");
  if (openAnswer) {
    openAnswer.style.height = openAnswer.scrollHeight + "px";
  }
});

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
}
