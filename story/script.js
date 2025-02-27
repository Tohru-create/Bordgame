let scrolling = false;
const container = document.getElementById("scrollContainer");

function scrollStep() {
    if (!scrolling) return;

    if (container.scrollTop + container.clientHeight >= container.scrollHeight) {
        container.scrollTop = 0; // 最上部に戻る
    } else {
        container.scrollTop += 0.7; // スクロールの速度（調整可）
    }

    setTimeout(() => requestAnimationFrame(scrollStep), 10); // 速度調整
}

function toggleScroll() {
    scrolling = !scrolling;
    if (scrolling) scrollStep();
}
