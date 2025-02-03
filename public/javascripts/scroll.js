let currentSection = 0;
const sections = document.querySelectorAll(".main-page");

document.addEventListener("wheel", (event) => {
    if (event.deltaY > 0 && currentSection === 0) { // Scroll down
        sections[1].style.transform = "translateY(0)";
        currentSection = 1;
    } else if (event.deltaY < 0 && currentSection === 1) { // Scroll up
        sections[0].style.transform = "translateY(0)";
        sections[1].style.transform = "translateY(100%)";
        currentSection = 0;
    }
});

document.getElementById("mouse-scroller").addEventListener("click", () => {
    sections[1].style.transform = "translateY(0)";
    currentSection = 1;
});
