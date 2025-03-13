function playCardAnimation(card) {
    const animationContainer = document.createElement("div");
    animationContainer.classList.add("card-animation");
    animationContainer.innerHTML = `<p>${card.name} を獲得！</p>`;

    document.body.appendChild(animationContainer);

    setTimeout(() => {
        animationContainer.classList.add("fade-out");
        setTimeout(() => {
            document.body.removeChild(animationContainer);
        }, 1000);
    }, 2000);
}
window.playCardAnimation = playCardAnimation;