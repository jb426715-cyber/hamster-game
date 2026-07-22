let love = 0;
let level = 1;
let maxLove = 100;

let petting = false;
let lastX = 0;
let lastY = 0;
let petDistance = 0;

const hamster = document.getElementById("hamster");
const loveText = document.getElementById("love");
const levelText = document.getElementById("level");

if (loveText) loveText.textContent = `${love} / ${maxLove}`;
if (levelText) levelText.textContent = level;

function startPetting(x, y) {
    petting = true;
    lastX = x;
    lastY = y;
    petDistance = 0;
    addLove();
}

function movePetting(x, y) {
    if (!petting) return;

    const dx = x - lastX;
    const dy = y - lastY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    petDistance += distance;

    while (petDistance >= 50) {
        petDistance -= 50;
        addLove();
    }

    lastX = x;
    lastY = y;
}

function stopPetting() {
    petting = false;
}

hamster.addEventListener("mousedown", (e) => startPetting(e.clientX, e.clientY));
document.addEventListener("mouseup", stopPetting);
hamster.addEventListener("mousemove", (e) => movePetting(e.clientX, e.clientY));

hamster.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    startPetting(touch.clientX, touch.clientY);
}, { passive: false });

document.addEventListener("touchend", stopPetting);
document.addEventListener("touchcancel", stopPetting);

hamster.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (!petting) return;
    const touch = e.touches[0];
    movePetting(touch.clientX, touch.clientY);
}, { passive: false });

function addLove() {
    love++;

    if (love >= maxLove) {
        level++;
        love = 0;
        maxLove += 20;

        if (levelText) levelText.textContent = level;

        // 🔥 레벨 10 달성 시 갸루 햄스터 이미지로 교체!
        if (level === 10) {
            hamster.src = "gyaru_hamster.png";
            alert("🎉 레벨 10 달성! 햄스터가 갸루로 변신했습니다! ✨");
        } else {
            alert("🎉 레벨 업! Lv." + level);
        }
    }

    if (loveText) loveText.textContent = `${love} / ${maxLove}`;

    hamster.classList.remove("bounce");
    void hamster.offsetWidth;
    hamster.classList.add("bounce");
}