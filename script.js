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

loveText.textContent = `${love} / ${maxLove}`;
levelText.textContent = level;

hamster.addEventListener("mousedown", (e) => {

    petting = true;

    lastX = e.clientX;
    lastY = e.clientY;
    petDistance = 0;

    addLove();

});

document.addEventListener("mouseup", () => {

    petting = false;

});

hamster.addEventListener("mousemove", (e) => {

    if (!petting) return;

    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;

    const distance = Math.sqrt(dx * dx + dy * dy);

    petDistance += distance;

    while (petDistance >= 100) {
        petDistance -= 100;
        addLove();
    }

    lastX = e.clientX;
    lastY = e.clientY;

});

function addLove() {

    love++;

    if (love >= maxLove) {

        level++;
        love = 0;

        maxLove += 20;

        levelText.textContent = level;

        alert("🎉 레벨 업! Lv." + level);

    }

    loveText.textContent = `${love} / ${maxLove}`;

    hamster.classList.remove("bounce");
    void hamster.offsetWidth;
    hamster.classList.add("bounce");

}