// Abrir / fechar modal ---------------------------------------------------
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
openModalButtons.forEach(btn => {
    btn.addEventListener("click", openModal);
});

modalClose.addEventListener("click", closeModal);

// fechar clicando fora do modal
modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

// fechar com ESC
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay.classList.contains("is-open")) {
        closeModal();
    }
});

// Formulário / integração ------------------------------------------------
const leadForm = document.getElementById("leadForm");
const formFeedback = document.getElementById("formFeedback");

leadForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = leadForm.nome.value.trim();
    const email = leadForm.email.value.trim();
    const profissao = leadForm.profissao.value.trim();
    const whatsapp = leadForm.whatsapp.value.trim();

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
        origem: "LP Destrave Sua Voz"
    };

    // Chamar integrações (quando você configurar)
    // sendToGoogleSheets(leadData);
    // sendToGetPages(leadData);

    console.log("Lead capturado:", leadData);

    formFeedback.textContent = "Pronto! Seus dados foram enviados. Em breve entraremos em contato.";
    formFeedback.classList.remove("error");
    formFeedback.classList.add("ok");

    leadForm.reset();
});

// Função para Google Sheets (placeholder)
function sendToGoogleSheets(data) {
    /*
    fetch("SUA_URL_APPS_SCRIPT_AQUI", {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(() => {
        console.log("Lead enviado para Google Sheets");
      })
      .catch((err) => console.error("Erro ao enviar para Sheets:", err));
    */
}

// Função para GetPages (placeholder)
function sendToGetPages(data) {
    /*
    fetch("SUA_URL_INTEGRACAO_GETPAGES_AQUI", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log("Lead enviado para GetPages", res);
      })
      .catch((err) => console.error("Erro ao enviar para GetPages:", err));
    */
}

// Carretel / galeria -----------------------------------------------------
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
