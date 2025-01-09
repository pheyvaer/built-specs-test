window.addEventListener("DOMContentLoaded", async () => {
  new PagefindUI({element: "#search", showSubResults: true});

  const responseConfig = await fetch("./config.json");
  const {warningMessage} = await responseConfig.json();
  if (warningMessage) {
    document.getElementById("warning-message").innerText = warningMessage;
  } else {
    document.getElementById("warning-container").remove();
  }

  const response = await fetch("./history.json");
  const history = await response.json();
  const {specs, orchestrator} = history;
  const $allSpecs = document.getElementById("all-specs");
  let counter = 0;

  const typeComment = {
    redirect: "This publication is of the type \"redirect\" and redirects only to the latest build of the linked publication.",
    specific: "This publication is of the type \"specific\" and only has one build that doesn't change unless specifically requested."
  };

  for (const spec of specs) {
    $allSpecs.innerHTML += `<h3 class="mt-3">${spec.name}</h3>`;
    let accordion = `<div class="accordion" id="${spec.id}">`;

    for (const pub of spec.publications) {
      if (pub.type === "redirect" || pub.type === "specific") {
        const build = pub.builds[pub.builds.length - 1];

        accordion += `
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${counter}"
                aria-expanded="false" aria-controls="collapse${counter}">
              ${pub.name}
              </button>
            </h2>
            <div id="collapse${counter}" class="accordion-collapse collapse" data-bs-parent="#${spec.id}">
              <div class="accordion-body">
                <p><a href="${build.path}">${build.path}</a> (${dateFns.format(new Date(build.date), "yyyy-MM-dd kk:mm O")})</p>
                <p>${typeComment[pub.type]}</p>
              </div>
            </div>
          </div>
          `;
      } else {
        accordion += `
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${counter}"
                aria-expanded="false" aria-controls="collapse${counter}">
              ${pub.name}
              </button>
            </h2>
            <div id="collapse${counter}" class="accordion-collapse collapse" data-bs-parent="#${spec.id}">
              <div class="accordion-body">
        `;

        let ul = "<ul>";
        for (const build of pub.builds) {
          ul += `<li><a href="${build.path}">${build.path}</a> (${dateFns.format(new Date(build.date), "yyyy-MM-dd kk:mm O")})</li>`;
        }
        ul += "</ul>";
        accordion += ul;
        accordion += `
           </div>
          </div>
        </div>
        `;
      }

      counter++;
    }

    accordion += "</div>";
    $allSpecs.innerHTML += accordion;
  }

  document.getElementById("latest-run").innerText = dateFns.format(new Date(orchestrator["latest-run"]), "yyyy-MM-dd kk:mm O");
});
