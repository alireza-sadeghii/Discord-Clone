document.addEventListener("DOMContentLoaded", function() {
    const currentPage = window.location.pathname;
    const links = document.querySelectorAll('#header-menu a');
    links.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            console.log(link.getAttribute('href') + "   " + currentPage);
            link.classList.add('active');
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const faqCards = document.querySelectorAll(".faq-card");

    faqCards.forEach((card) => {
        const question = card.querySelector("h3");

        question.addEventListener("click", () => {
            card.classList.toggle("active");
        });
    });
});




