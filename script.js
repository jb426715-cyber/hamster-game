// 🔥 Firebase 설정 정보
const firebaseConfig = {
    apiKey: "AIzaSyBe9k_PBhDr7bxAngUetgFtBONGiXQQCEU",
    authDomain: "hamster-4ade3.firebaseapp.com",
    databaseURL: "https://hamster-4ade3-default-rtdb.firebaseio.com",
    projectId: "hamster-4ade3",
    storageBucket: "hamster-4ade3.firebasestorage.app",
    messagingSenderId: "655738496764",
    appId: "1:655738496764:web:e3sdfd2c61dd454a019979",
    measurementId: "G-TH75123TVD"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let nickname = "";
let password = "";
let love = 0;
let level = 1;
let maxLove = 100;

let petting = false;
let lastX = 0;
let lastY = 0;
let petDistance = 0;

const loginScreen = document.getElementById("login-screen");
const gameScreen = document.getElementById("game-screen");
const nicknameInput = document.getElementById("nickname-input");
const passwordInput = document.getElementById("password-input");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const changeNickBtn = document.getElementById("change-nick-btn");
const rankBtn = document.getElementById("rank-btn");
const closeRankBtn = document.getElementById("close-rank-btn");
const rankModal = document.getElementById("rank-modal");
const rankList = document.getElementById("rank-list");
const playerNameText = document.getElementById("player-name");

const hamster = document.getElementById("hamster");
const loveText = document.getElementById("love");
const levelText = document.getElementById("level");

function loadData(inputName, inputPw) {
    nickname = inputName;
    password = inputPw;
    
    database.ref("users/" + nickname).once("value").then((snapshot) => {
        const data = snapshot.val();
        
        if (data) {
            if (data.password && data.password !== password) {
                alert("❌ 비밀번호가 올바르지 않습니다!");
                return;
            }
            
            level = data.level || 1;
            love = data.love || 0;
            maxLove = data.maxLove || 100;
        } else {
            level = 1;
            love = 0;
            maxLove = 100;
            alert("✨ 신규 계정이 등록되었습니다!");
        }

        playerNameText.textContent = nickname;
        updateUI();
        updateHamsterImage();

        loginScreen.classList.add("hidden");
        gameScreen.classList.remove("hidden");
        
        saveData();
    });
}

function saveData() {
    if (!nickname) return;
    
    database.ref("users/" + nickname).set({
        nickname: nickname,
        password: password,
        level: level,
        love: love,
        maxLove: maxLove
    });
}

function changeNickname() {
    const inputPw = prompt("🔒 닉네임을 변경하려면 현재 비밀번호를 입력하세요:");
    if (inputPw === null) return;

    if (inputPw !== password) {
        alert("❌ 비밀번호가 일치하지 않습니다. 닉네임을 변경할 수 없습니다.");
        return;
    }

    const newNick = prompt("새로운 닉네임을 입력하세요 (최대 10자):", nickname);
    if (!newNick) return;
    
    const trimmedNick = newNick.trim();
    if (!trimmedNick) {
        alert("올바른 닉네임을 입력해 주세요.");
        return;
    }
    
    if (trimmedNick === nickname) {
        alert("기존 닉네임과 동일합니다.");
        return;
    }

    if (trimmedNick.length > 10) {
        alert("닉네임은 10자 이하여야 합니다.");
        return;
    }

    database.ref("users/" + trimmedNick).once("value").then((snapshot) => {
        if (snapshot.exists()) {
            alert("❌ 이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해 주세요.");
            return;
        }

        const oldNick = nickname;
        nickname = trimmedNick;

        saveData();
        database.ref("users/" + oldNick).remove();

        playerNameText.textContent = nickname;
        alert(`✅ 닉네임이 '${nickname}'(으)로 변경되었습니다!`);
    });
}

function loadRanking() {
    rankList.innerHTML = "로딩 중...";
    database.ref("users").orderByChild("level").limitToLast(10).once("value", (snapshot) => {
        rankList.innerHTML = "";
        const players = [];

        snapshot.forEach((child) => {
            players.push(child.val());
        });

        players.reverse();

        players.forEach((player) => {
            const li = document.createElement("li");
            if (player.level >= 110) {
                li.textContent = `${player.nickname} - Lv.110 (❤️${player.love})`;
            } else {
                li.textContent = `${player.nickname} - Lv.${player.level}`;
            }
            rankList.appendChild(li);
        });
    });
}

function updateHamsterImage() {
    if (level >= 110) {
        hamster.src = "hamster100.png";      // 110렙: 햄스터100
    } else if (level >= 100) {
        hamster.src = "golden_hamster.png";   // 100렙: 골든골든햄스터
    } else if (level >= 90) {
        hamster.src = "orchestra_hamster.png"; // 90렙: 오케스트라햄
    } else if (level >= 80) {
        hamster.src = "gangster_hamster.png";  // 80렙: 갱스터햄
    } else if (level >= 70) {
        hamster.src = "bikini_hamster.png";    // 70렙: 비키니햄
    } else if (level >= 60) {
        hamster.src = "otaku_hamster.png";     // 60렙: 오타쿠햄
    } else if (level >= 50) {
        hamster.src = "david_hamster.png";     // 50렙: 데이비드햄
    } else if (level >= 40) {
        hamster.src = "maid_hamster.png";      // 40렙: 메이드햄
    } else if (level >= 30) {
        hamster.src = "soldier_hamster.png";   // 30렙: 군인햄
    } else if (level >= 20) {
        hamster.src = "T_hamster.png";         // 20렙: T_hamster
    } else if (level >= 10) {
        hamster.src = "gyaru_hamster.png";     // 10렙: 갸루햄
    } else {
        hamster.src = "hamster.png";           // 기본 햄스터
    }
}

function updateUI() {
    if (loveText) {
        if (level >= 110) {
            loveText.textContent = `${love} (MAX!)`;
        } else {
            loveText.textContent = `${love} / ${maxLove}`;
        }
    }
    if (levelText) levelText.textContent = level;
}

startBtn.addEventListener("click", () => {
    const inputVal = nicknameInput.value.trim();
    const pwVal = passwordInput.value.trim();
    
    if (!inputVal) {
        alert("닉네임을 입력해 주세요!");
        return;
    }
    if (!pwVal) {
        alert("비밀번호를 입력해 주세요!");
        return;
    }
    
    loadData(inputVal, pwVal);
});

resetBtn.addEventListener("click", () => {
    if (confirm("정말 로그아웃하고 다른 계정으로 접속하시겠습니까?")) {
        loginScreen.classList.remove("hidden");
        gameScreen.classList.add("hidden");
        nicknameInput.value = "";
        passwordInput.value = "";
    }
});

changeNickBtn.addEventListener("click", changeNickname);

rankBtn.addEventListener("click", () => {
    rankModal.classList.remove("hidden");
    loadRanking();
});

closeRankBtn.addEventListener("click", () => {
    rankModal.classList.add("hidden");
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

    if (level < 110) {
        if (love >= maxLove) {
            level++;
            love = 0;
            maxLove += 20;

            updateHamsterImage();

            if (level === 110) {
                alert("👑 최종 신화 달성! Lv.110 (햄스터100)에 도달하셨습니다!\n이제부터 행복도는 한도 없이 무제한으로 증가합니다! ✨");
            } else if (level % 10 === 0) {
                let message = "🎉 대박! Lv." + level + " 달성!";
                if (level === 10) message = "🎉 Lv.10 달성! 햄스터가 갸루로 변신했습니다! ✨";
                else if (level === 20) message = "🎉 Lv.20 달성! 햄스터가 공룡으로 진화했습니다! 🚀";
                else if (level === 30) message = "🎉 Lv.30 달성! 햄스터가 군대로 입대했습니다! 🫡";
                else if (level === 40) message = "🎉 Lv.40 달성! 햄스터가 메이드햄으로 변신했습니다! 🧹";
                else if (level === 50) message = "🎉 Lv.50 달성! 햄스터가 데이비드햄으로 변신했습니다! 🗿";
                else if (level === 60) message = "🎉 Lv.60 달성! 햄스터가 오타쿠햄으로 변신했습니다! 🤓";
                else if (level === 70) message = "🎉 Lv.70 달성! 햄스터가 비키니햄으로 변신했습니다! 👙";
                else if (level === 80) message = "🎉 Lv.80 달성! 햄스터가 갱스터햄으로 변신했습니다! 😎";
                else if (level === 90) message = "🎉 Lv.90 달성! 햄스터가 오케스트라햄으로 변신했습니다! 🎻";
                else if (level === 100) message = "🎉 Lv.100 달성! 햄스터가 영롱한 골든골든햄스터로 진화했습니다! 🌟";
                alert(message);
            }
        }
    }

    updateUI();
    saveData();

    hamster.classList.remove("bounce");
    void hamster.offsetWidth;
    hamster.classList.add("bounce");
}