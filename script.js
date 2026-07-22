let nickname = "";
let love = 0;
let level = 1;
let maxLove = 100;

let petting = false;
let lastX = 0;
let lastY = 0;
let petDistance = 0;

// DOM 요소
const loginScreen = document.getElementById("login-screen");
const gameScreen = document.getElementById("game-screen");
const nicknameInput = document.getElementById("nickname-input");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const playerNameText = document.getElementById("player-name");

const hamster = document.getElementById("hamster");
const loveText = document.getElementById("love");
const levelText = document.getElementById("level");

// --- 1. 저장 및 불러오기 기능 ---

function loadData(inputName) {
    nickname = inputName;
    const saveData = localStorage.getItem(`hamsterData_${nickname}`);

    if (saveData) {
        const parsed = JSON.parse(saveData);
        level = parsed.level || 1;
        love = parsed.love || 0;
        maxLove = parsed.maxLove || 100;
    } else {
        level = 1;
        love = 0;
        maxLove = 100;
    }

    playerNameText.textContent = nickname;
    updateUI();
    updateHamsterImage();

    loginScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
}

function saveData() {
    if (!nickname) return;
    const data = {
        level: level,
        love: love,
        maxLove: maxLove
    };
    localStorage.setItem(`hamsterData_${nickname}`, JSON.stringify(data));
}

// 레벨 구간별 이미지 설정
function updateHamsterImage() {
    if (level >= 40) {
        hamster.src = "maid_hamster.png";
    } else if (level >= 30) {
        hamster.src = "soldier_hamster.png";
    } else if (level >= 20) {
        hamster.src = "T_hamster.png";
    } else if (level >= 10) {
        hamster.src = "gyaru_hamster.png";
    } else {
        hamster.src = "hamster.png";
    }
}

function updateUI() {
    if (loveText) loveText.textContent = `${love} / ${maxLove}`;
    if (levelText) levelText.textContent = level;
}

startBtn.addEventListener("click", () => {
    const inputVal = nicknameInput.value.trim();
    if (!inputVal) {
        alert("닉네임을 입력해 주세요!");
        return;
    }
    loadData(inputVal);
});

resetBtn.addEventListener("click", () => {
    if (confirm("정말 로그아웃하고 다른 닉네임으로 접속하시겠습니까?")) {
        loginScreen.classList.remove("hidden");
        gameScreen.classList.add("hidden");
        nicknameInput.value = "";
    }
});

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

        updateHamsterImage();

        if (level % 10 === 0) {
            let message = "🎉 대박! Lv." + level + " 달성!";
            
            if (level === 10) {
                message = "🎉 Lv.10 달성! 햄스터가 갸루로 변신했습니다! ✨";
            } else if (level === 20) {
                message = "🎉 Lv.20 달성! 햄스터가 공룡으로 진화했습니다! 🚀";
            } else if (level === 30) {
                message = "🎉 Lv.30 달성! 햄스터가 군대로 입대했습니다! 🫡";
            } else if (level === 40) {
                message = "🎉 Lv.40 달성! 햄스터가 메이드햄으로 변신했습니다! 🧹";
            }
            
            alert(message);
        }
    }

    updateUI();
    saveData();

    hamster.classList.remove("bounce");
    void hamster.offsetWidth;
    hamster.classList.add("bounce");
}