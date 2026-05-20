async function loadPosts() {

    const response = await fetch('./posts.json');
    const posts = await response.json();

    const container = document.getElementById('posts-container');

    posts.forEach((post, index) => {

        const article = document.createElement('article');

        article.className =
            `
            relative
            py-6
            border-b
            border-stone-300
            lg:odd:pr-6
            lg:even:pl-6
            `;

        article.innerHTML = `
            <div class="relative">

                ${index % 2 === 1 ? `
                    <div class="hidden lg:block absolute left-[-24px] top-[1px] bottom-[1px] w-px bg-stone-300"></div>
                ` : ''}

                <a href="${post.link}"
                   target="_blank"
                   rel="noopener noreferrer"
                   class="group block">

                    <div class="flex gap-5 items-start">

                        ${post.image ? `
                            <img
                                src="${post.image}"
                                alt="${post.title}"
                                class="
                                    w-36
                                    h-24
                                    object-cover
                                    object-center
                                    rounded-md
                                    shrink-0
                                    overflow-hidden
                                "
                            />
                        ` : ''}

                        <div class="flex-1">

                            <h2 class="text-3xl font-bold mb-2 group-hover:text-sky-700 transition-colors duration-200">
                                ${post.title}
                            </h2>

                            <p class="text-sm text-stone-500 mb-3 tracking-wide">
                                ${post.date}
                            </p>

                            <p class="text-stone-700 leading-7 text-lg min-h-[3.5em]">
                                ${post.description}
                            </p>

                            <div class="mt-4 text-sky-700 font-semibold">
                                Read Post →
                            </div>

                        </div>

                    </div>

                </a>

            </div>
        `;

        container.appendChild(article);

    });
}

loadPosts();
