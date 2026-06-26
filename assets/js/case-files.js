(function () {
  const box = document.querySelector('[data-case-files], #caseFiles');
  if (!box) return;
  box.innerHTML = `
    <section class="info-card">
      <h2>Aptitude Case Files</h2>
      <p>Case-based aptitude practice will appear here. This file no longer loads VSA or trading content.</p>
    </section>
  `;
})();
