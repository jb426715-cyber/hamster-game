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
let seeds = 0;
let lastMaxLoveReward = 0; 

let petting = false;
let lastX = 0;
let lastY = 0;
let petDistance = 0;

let isBoostActive = false;
let boostTimeLeft = 0;
let boostTimer = null;

let isAutoActive = false;
let autoTimeLeft = 0;
let autoCooldownLeft = 3 * 60 * 60;
let autoInterval = null;
let autoCooldownTimer = null;

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
const seedsText = document.getElementById("seeds");

const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const sendChatBtn = document.getElementById("send-chat-btn");

const useBoostBtn = document.getElementById("use-boost-btn");
const boostStatusText = document.getElementById("boost-status");
const autoStatusText = document.getElementById("auto-status");

function requestNotificationPermission() {
    if ("Notification" in window && "serviceWorker" in navigator) {
        navigator.serviceWorker.register("sw.js")
            .then((reg) => console.log("서비스 워커 등록 성공:", reg))
            .catch((err) => console.error("서비스 워커 등록 실패:", err));

        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                console.log("🔔 푸시 알림 권한 허용됨");
            }
        });
    }
}

function sendLocalPushNotification(title, body) {
    if ("Notification" in window && Notification.permission === "granted") {
        navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(title, {
                body: body,
                icon: "hamster.png",
                badge: "hamster.png"
            });
        });
    }
}

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
            
            level = parseInt(data.level, 10) || 1;
            love = parseInt(data.love, 10) || 0;
            maxLove = parseInt(data.maxLove, 10) || 100;
            seeds = parseInt(data.seeds, 10) || 0;
            lastMaxLoveReward = parseInt(data.lastMaxLoveReward, 10) || 0;

            const expectedSeedsFromLevel = Math.floor(level / 10);
            if (level < 110 && seeds < expectedSeedsFromLevel) {
                seeds = expectedSeedsFromLevel;
            }
        } else {
            level = 1;
            love = 0;
            maxLove = 100;
            seeds = 0;
            lastMaxLoveReward = 0;
            alert("✨ 신규 계정이 등록되었습니다!");
        }

        playerNameText.textContent = nickname;
        updateUI();
        updateHamsterImage();

        loginScreen.classList.add("hidden");
        gameScreen.classList.remove("hidden");
        
        saveData();
        initChat();
        requestNotificationPermission();
        startAutoSystem();
    });
}

function saveData() {
    if (!nickname) return;
    
    database.ref("users/" + nickname).set({
        nickname: nickname,
        password: password,
        level: level,
        love: love,
        maxLove: maxLove,
        seeds: seeds,
        lastMaxLoveReward: lastMaxLoveReward
    });
}

function changeNickname() {
    const inputPw = prompt("🔒 닉네임을 변경하려면 현재 비밀번호를 입력하세요:");
    if (inputPw === null) return;

    if (inputPw !== password) {
        alert("❌ 비밀번호가 일치하지 않습니다.");
        return;
    }

    const newNick = prompt("새로운 닉네임을 입력하세요 (최대 10자):", nickname);
    if (!newNick) return;
    
    const trimmedNick = newNick.trim();
    if (!trimmedNick || trimmedNick === nickname || trimmedNick.length > 10) {
        alert("유효하지 않은 닉네임입니다.");
        return;
    }

    database.ref("users/" + trimmedNick).once("value").then((snapshot) => {
        if (snapshot.exists()) {
            alert("❌ 이미 사용 중인 닉네임입니다.");
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

function initChat() {
    if (!chatBox) return;

    database.ref("messages").limitToLast(50).on("child_added", (snapshot) => {
        const msgData = snapshot.val();
        displayMessage(msgData.sender, msgData.text);
    });
}

function sendChatMessage() {
    if (!chatInput) return;
    const text = chatInput.value.trim();
    if (!text) return;

    database.ref("messages").push({
        sender: nickname,
        text: text,
        timestamp: Date.now()
    });

    chatInput.value = "";
}

function displayMessage(sender, text) {
    if (!chatBox) return;
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("chat-msg");
    msgDiv.innerHTML = `<strong>[${sender}]</strong>: ${text}`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

if (useBoostBtn) {
    useBoostBtn.addEventListener("click", () => {
        if (isBoostActive) {
            alert("⚠️ 이미 부스터가 작동 중입니다!");
            return;
        }
        if (seeds < 1) {
            alert("❌ 해바라기씨가 부족합니다!");
            return;
        }

        seeds -= 1;
        isBoostActive = true;
        boostTimeLeft = 10;
        updateUI();
        saveData();

        if (boostTimer) clearInterval(boostTimer);

        if (boostStatusText) {
            boostStatusText.textContent = `🔥 2배 피버 타임! (남은 시간: ${boostTimeLeft}초)`;
        }

        boostTimer = setInterval(() => {
            boostTimeLeft--;
            if (boostStatusText) {
                boostStatusText.textContent = `🔥 2배 피버 타임! (남은 시간: ${boostTimeLeft}초)`;
            }

            if (boostTimeLeft <= 0) {
                clearInterval(boostTimer);
                isBoostActive = false;
                if (boostStatusText) boostStatusText.textContent = "";
                alert("⏰ 피버 타임이 종료되었습니다!");
            }
        }, 1000);
    });
}

function startAutoSystem() {
    if (autoCooldownTimer) clearInterval(autoCooldownTimer);

    autoCooldownTimer = setInterval(() => {
        if (!isAutoActive) {
            autoCooldownLeft--;

            if (autoStatusText) {
                const hours = Math.floor(autoCooldownLeft / 3600);
                const mins = Math.floor((autoCooldownLeft % 3600) / 60);
                const secs = autoCooldownLeft % 60;
                autoStatusText.textContent = `🤖 자동 쓰다듬기 대기 중 (${hours}시간 ${mins}분 ${secs}초 남음)`;
            }

            if (autoCooldownLeft <= 0) {
                triggerAutoPetting();
            }
        }
    }, 1000);
}

function triggerAutoPetting() {
    isAutoActive = true;
    autoTimeLeft = 300;
    sendLocalPushNotification("🤖 자동 클릭 작동!", "5분간 자동으로 햄스터를 쓰다듬습니다!");

    if (autoInterval) clearInterval(autoInterval);

    autoInterval = setInterval(() => {
        addLove();
    }, 200);

    const autoActiveTimer = setInterval(() => {
        autoTimeLeft--;
        if (autoStatusText) {
            const mins = Math.floor(autoTimeLeft / 60);
            const secs = autoTimeLeft % 60;
            autoStatusText.textContent = `⚡ 자동 쓰다듬기 가동 중! (${mins}분 ${secs}초 남음)`;
        }

        if (autoTimeLeft <= 0) {
            clearInterval(autoInterval);
            clearInterval(autoActiveTimer);
            isAutoActive = false;
            autoCooldownLeft = 3 * 60 * 60;
            if (autoStatusText) autoStatusText.textContent = "";
            alert("🤖 5분간의 자동 쓰다듬기가 종료되었습니다!");
        }
    }, 1000);
}

function loadRanking() {
    rankList.innerHTML = "로딩 중...";
    database.ref("users").once("value").then((snapshot) => {
        rankList.innerHTML = "";
        const players = [];

        snapshot.forEach((child) => {
            const val = child.val();
            players.push({
                nickname: val.nickname || "익명",
                level: parseInt(val.level, 10) || 1,
                love: parseInt(val.love, 10) || 0
            });
        });

        players.sort((a, b) => {
            if (a.level !== b.level) {
                return b.level - a.level;
            }
            return b.love - a.love;
        });

        const top10 = players.slice(0, 10);

        if (top10.length === 0) {
            rankList.innerHTML = "<li>등록된 유저가 없습니다.</li>";
            return;
        }

        top10.forEach((player) => {
            const li = document.createElement("li");
            if (player.level >= 110) {
                li.textContent = `${player.nickname} - Lv.110 (❤️ ${player.love.toLocaleString()})`;
            } else {
                li.textContent = `${player.nickname} - Lv.${player.level}`;
            }
            rankList.appendChild(li);
        });
    });
}

function updateHamsterImage() {
    if (level >= 110) hamster.src = "hamster100.png";
    else if (level >= 100) hamster.src = "golden_hamster.png";
    else if (level >= 90) hamster.src = "orchestra_hamster.png";
    else if (level >= 80) hamster.src = "gangster_hamster.png";
    else if (level >= 70) hamster.src = "bikini_hamster.png";
    else if (level >= 60) hamster.src = "otaku_hamster.png";
    else if (level >= 50) hamster.src = "david_hamster.png";
    else if (level >= 40) hamster.src = "maid_hamster.png";
    else if (level >= 30) hamster.src = "soldier_hamster.png";
    else if (level >= 20) hamster.src = "T_hamster.png";
    else if (level >= 10) hamster.src = "gyaru_hamster.png";
    else hamster.src = "hamster.png";
}

function updateUI() {
    if (loveText) {
        if (level >= 110) {
            loveText.textContent = `${love.toLocaleString()}`;
        } else {
            loveText.textContent = `${love.toLocaleString()} / ${maxLove.toLocaleString()}`;
        }
    }
    if (levelText) levelText.textContent = level;
    if (seedsText) seedsText.textContent = seeds;
}

startBtn.addEventListener("click", () => {
    const inputVal = nicknameInput.value.trim();
    const pwVal = passwordInput.value.trim();
    
    if (!inputVal || !pwVal) {
        alert("닉네임과 비밀번호를 입력해 주세요!");
        return;
    }
    loadData(inputVal, pwVal);
});

resetBtn.addEventListener("click", () => {
    if (confirm("정말 로그아웃하시겠습니까?")) {
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

if (sendChatBtn) sendChatBtn.addEventListener("click", sendChatMessage);
if (chatInput) {
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendChatMessage();
    });
}

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
    const amount = isBoostActive ? 2 : 1;
    love += amount;

    if (level >= 110) {
        // 만렙 달성 이후 행복도 25,000당 해바라기씨 1개 지급
        const currentRewardLevel = Math.floor(love / 25000);
        if (currentRewardLevel > lastMaxLoveReward) {
            const gainedSeeds = currentRewardLevel - lastMaxLoveReward;
            seeds += gainedSeeds;
            lastMaxLoveReward = currentRewardLevel;
            sendLocalPushNotification("🌻 해바라기씨 획득!", `행복도 25,000 달성으로 해씨 ${gainedSeeds}개를 받았습니다!`);
        }
    } else {
        if (love >= maxLove) {
            level++;
            love = 0;
            maxLove += 20;

            updateHamsterImage();

            if (level % 10 === 0) {
                seeds += 1;
                sendLocalPushNotification("🌻 해바라기씨 획득!", `Lv.${level} 달성 보상으로 해씨 1개를 받았습니다!`);
            }

            if (level === 110) {
                const msg = "👑 최종 신화 달성! Lv.110 (햄스터100)에 도달하셨습니다!";
                alert(msg);
                sendLocalPushNotification("🎉 만렙 달성!", msg);
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
                sendLocalPushNotification(`🐹 레벨업! (Lv.${level})`, message);
            }
        }
    }

    updateUI();
    saveData();

    hamster.classList.remove("bounce");
    void hamster.offsetWidth;
    hamster.classList.add("bounce");
}