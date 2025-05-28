const form        = document.getElementById("decision-form");
const submitBtn   = document.getElementById("submitBtn");
const spinner     = document.getElementById("spinner");
const resultsDiv  = document.getElementById("results");
const verdictDiv  = document.getElementById("verdict");
const prosDiv     = document.getElementById("pros");
const consDiv     = document.getElementById("cons");
const rationaleDiv= document.getElementById("rationale");
const restartBtn  = document.getElementById("restartBtn");

form.addEventListener("submit", async e => {
  e.preventDefault();
  const decision = document.getElementById("decisionInput").value.trim();
  if (!decision) return alert("Tell me what decision you’re facing!");

  submitBtn.disabled = true;
  spinner.classList.remove("hidden");

  const payload = {
    decision,
    context: document.getElementById("infoInput").value,
    risk: document.getElementById("riskTolerance").value
  };

  try {
    const res = await fetch("/api/decide", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    // render
    verdictDiv.innerHTML   = `<h3>AI Verdict:</h3><p>${data.verdict}</p>`;
    prosDiv.innerHTML      = `<h3>👍 Pros</h3><ul>${data.pros.map(p=>`<li>${p}</li>`).join("")}</ul>`;
    consDiv.innerHTML      = `<h3>👎 Cons</h3><ul>${data.cons.map(c=>`<li>${c}</li>`).join("")}</ul>`;
    rationaleDiv.innerHTML = `<h3>Why?</h3><p>${data.rationale}</p>`;

    form.classList.add("hidden");
    resultsDiv.classList.remove("hidden");
  } catch(err) {
    alert("Error: "+err.message);
  } finally {
    submitBtn.disabled = false;
    spinner.classList.add("hidden");
  }
});

restartBtn.addEventListener("click", () => {
  form.reset();
  resultsDiv.classList.add("hidden");
  form.classList.remove("hidden");
});
