function slugify(text) {
    return text
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

async function loadExperience() {

    const response = await fetch("./experience.json");
    const experiences = await response.json();

    const container = document.getElementById("experience-container");

    experiences.forEach((exp, index) => {

        const section = document.createElement("section");

        section.id = slugify(
            `${exp.organization}-${exp.role}`
        );

        section.className =
            index === experiences.length - 1
                ? "py-10"
                : "py-10 border-b border-stone-300";

        const bulletsHTML = exp.bullets
            .map(bullet => `<p class="mt-3">${bullet}</p>`)
            .join("");

        let projectsHTML = "";

        if (exp.projects?.length) {

            projectsHTML = `
                <div class="mt-6 flex flex-wrap gap-x-2 gap-y-2">

                    <span class="font-[650]">
                        Related Projects:
                    </span>

                    ${exp.projects.map((project, index) => `
                        <a
                            href="../Projects/#${slugify(project)}"
                            class="font-[650] text-sky-700 underline"
                        >
                            ${project}
                        </a>${index < exp.projects.length - 1 ? '<span>,</span>' : ''}
                    `).join('')}

                </div>
            `;
        }

        section.innerHTML = `
            <div class="flex justify-between items-start gap-4 flex-wrap">

                <h3 class="text-3xl font-[650]">
                    ${exp.role}
                </h3>

                <p class="text-stone-500 shrink-0">
                    ${exp.dates}
                </p>

            </div>

            <p class="mt-2 text-sky-700">

                <a
                    href="${exp.organizationUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="font-[650] text-sky-700 underline"
                >
                    ${exp.organization}
                </a>

            </p>

            <div class="mt-5 text-stone-700 leading-8">
                ${bulletsHTML}
            </div>

            ${projectsHTML}
        `;

        container.appendChild(section);
    });
}

loadExperience();
