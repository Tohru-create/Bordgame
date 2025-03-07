// window.roomID = roomID; 
// window.playerToken = token;
// window.userID = userID;
// window.username = username;
// window.hostsettings = hostsettings;

const storyContainer = document.getElementById("story");
const storyLines = document.querySelectorAll(".story-line");
let currentLine = 0;
let isHost = false;
let room = roomID; // 実際のルームIDを取得する必要あり

function showStory() {
    storyContainer.style.display = "block";
    storyLines.forEach((line, index) => {
        line.style.display = index === 0 ? "block" : "none";
    });
}

function nextStoryLine() {
    if (currentLine < storyLines.length - 1) {
        storyLines[currentLine].style.display = "none";
        currentLine++;
        storyLines[currentLine].style.display = "block";

        if (isHost) {
            socket.emit("story-progress", { room, index: currentLine });
        }
    } else {
        storyContainer.style.display = "none";
        if (isHost) {
            socket.emit("story-end", { room });
        }
    }
}

document.addEventListener("click", () => {
    if (isHost) {
        nextStoryLine();
    }
});

socket.on("showStory", () => {
    showStory();
});

socket.on("story-progress", (data) => {
    storyLines[currentLine].style.display = "none";
    currentLine = data.index;
    storyLines[currentLine].style.display = "block";
});

socket.on("story-end", () => {
    storyContainer.style.display = "none";
});
