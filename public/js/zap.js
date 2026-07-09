/** Lightning zap via server-side LNURL proxy (/api/zap/invoice). */
(function () {
  const btn = document.querySelector("[data-zap-btn]");
  const modal = document.getElementById("zap-modal");
  if (!btn || !modal) return;

  const address = btn.getAttribute("data-zap-address");
  const title = btn.getAttribute("data-zap-title") || "DuaCrypto News";
  const invoiceEl = modal.querySelector("[data-zap-invoice]");
  const copyBtn = modal.querySelector("[data-zap-copy]");
  const errorEl = modal.querySelector("[data-zap-error]");
  const closeEls = modal.querySelectorAll("[data-zap-close], [data-zap-close-btn]");

  function showModal() {
    modal.classList.remove("hidden");
  }
  function hideModal() {
    modal.classList.add("hidden");
    if (invoiceEl) {
      invoiceEl.hidden = true;
      invoiceEl.textContent = "";
    }
    if (copyBtn) copyBtn.hidden = true;
    if (errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = "";
    }
  }

  closeEls.forEach((el) => el.addEventListener("click", hideModal));

  copyBtn?.addEventListener("click", async () => {
    const text = invoiceEl?.textContent || "";
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = "Copied!";
      setTimeout(() => {
        copyBtn.textContent = "Copy invoice";
      }, 1500);
    } catch {
      /* ignore */
    }
  });

  btn.addEventListener("click", async () => {
    if (!address) return;
    showModal();
    btn.setAttribute("disabled", "true");
    try {
      const res = await fetch("/api/zap/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          amountMsat: 21000,
          comment: title.slice(0, 160),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.pr) {
        throw new Error(data.error || "Could not create invoice");
      }
      if (invoiceEl) {
        invoiceEl.textContent = data.pr;
        invoiceEl.hidden = false;
      }
      if (copyBtn) copyBtn.hidden = false;
      if (window.location.protocol.startsWith("http") && data.pr.startsWith("lnbc")) {
        const payLink = document.createElement("a");
        payLink.href = "lightning:" + data.pr;
        payLink.textContent = "Open in wallet";
        payLink.className = "text-primary underline text-sm";
        invoiceEl?.after(payLink);
      }
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = err.message || "Zap failed";
        errorEl.hidden = false;
      }
    } finally {
      btn.removeAttribute("disabled");
    }
  });
})();
