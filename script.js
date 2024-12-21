document.addEventListener("DOMContentLoaded", () => {
    const fromInput = document.getElementById("from");
    const toInput = document.getElementById("to");
    const firstDaySelect = document.getElementById("first-day");
    const generateButton = document.getElementById("generate");
    const resetButton = document.getElementById("reset");
    const partiesList = document.getElementById("parties-list");
    const completedCount = document.getElementById("completed-count");
    const remainingCount = document.getElementById("remaining-count");
    const toggleSettingsButton = document.getElementById("toggle-settings");

    let partiesData = JSON.parse(localStorage.getItem("partiesData")) || [];
    let isSettingsVisible = JSON.parse(localStorage.getItem("isSettingsVisible")) ?? true;

    function saveData() {
        localStorage.setItem("partiesData", JSON.stringify(partiesData));
        localStorage.setItem("isSettingsVisible", JSON.stringify(isSettingsVisible));
        updateReport();
    }

    function loadData() {
        partiesList.innerHTML = "";
        if (partiesData.length > 0) {
            partiesData.forEach((party) => createPartyElement(party));
        }
        updateReport();
        updateSettingsVisibility();
    }

    function createPartyElement(party) {
        const container = document.createElement("div");
        container.className = "party-container";

        const partyElement = document.createElement("div");
        partyElement.className = "party";
        partyElement.style.backgroundColor = party.color || "#1e1e2f";

        // تعيين حالة الإخفاء المحفوظة
        if (party.hidden) {
            partyElement.style.display = "none";
        } else {
            partyElement.style.display = "flex";
        }

        // زر الاسترجاع
        const restoreButton = document.createElement("button");
        restoreButton.className = "restore-button";
        restoreButton.innerHTML = `استرجاع حزب ${party.number}`;
        restoreButton.style.display = party.hidden ? "block" : "none";
        restoreButton.onclick = () => {
            party.hidden = false;
            partyElement.style.display = "flex";
            restoreButton.style.display = "none";
            toggleButton.textContent = "إخفاء";
            saveData();
        };
        container.appendChild(restoreButton);

        // إنشاء رأس العنصر
        const header = document.createElement("div");
        header.className = "party-header";

        const info = document.createElement("div");
        info.className = "party-info";
        
        const title = document.createElement("span");
        title.className = "party-title";
        title.textContent = `حزب ${party.number}`;
        info.appendChild(title);

        const day = document.createElement("span");
        day.className = "party-day";
        day.textContent = party.day;
        info.appendChild(day);

        header.appendChild(info);

        // زر الإخفاء/الإظهار
        const toggleButton = document.createElement("button");
        toggleButton.textContent = party.hidden ? "إظهار" : "إخفاء";
        toggleButton.onclick = () => {
            party.hidden = !party.hidden;
            if (party.hidden) {
                partyElement.style.display = "none";
                restoreButton.style.display = "block";
                toggleButton.textContent = "إظهار";
            } else {
                partyElement.style.display = "flex";
                restoreButton.style.display = "none";
                toggleButton.textContent = "إخفاء";
            }
            saveData();
        };
        header.appendChild(toggleButton);

        partyElement.appendChild(header);

        // إنشاء قسم التفاصيل
        const details = document.createElement("div");
        details.className = "party-details";
        details.classList.add("visible");

        const actions = document.createElement("div");
        actions.className = "party-actions";

        // زر إنهاء الحزب
        const completeButton = document.createElement("button");
        completeButton.textContent = party.completed ? "تم الانتهاء" : "إنهاء";
        completeButton.className = "complete";
        completeButton.disabled = party.completed;
        completeButton.onclick = () => {
            party.completed = true;
            party.completedTime = new Date().toLocaleString();
            saveData();
            loadData();
        };
        actions.appendChild(completeButton);

        // زر التراجع
        const undoButton = document.createElement("button");
        undoButton.textContent = "تراجع";
        undoButton.className = "undo";
        undoButton.onclick = () => {
            party.completed = false;
            party.completedTime = null;
            party.color = "#1e1e2f";
            saveData();
            loadData();
        };
        actions.appendChild(undoButton);

        // زر إضافة ملاحظة
        const noteButton = document.createElement("button");
        noteButton.textContent = party.note ? "تعديل الملاحظة" : "إضافة ملاحظة";
        noteButton.onclick = () => {
            const note = prompt("أدخل الملاحظة:", party.note || "");
            if (note !== null) {
                party.note = note.trim() || null;
                saveData();
                loadData();
            }
        };
        actions.appendChild(noteButton);

        // زر تغيير اللون
        const colorButton = document.createElement("input");
        colorButton.type = "color";
        colorButton.value = party.color || "#1e1e2f";
        colorButton.title = "تغيير لون الحزب";
        colorButton.onchange = (e) => {
            party.color = e.target.value;
            saveData();
            loadData();
        };
        actions.appendChild(colorButton);

        details.appendChild(actions);

        // معلومات الإنجاز
        if (party.completed && party.completedTime) {
            const completedInfo = document.createElement("div");
            completedInfo.className = "completed-info";
            completedInfo.textContent = `تم الانتهاء: ${party.completedTime}`;
            details.appendChild(completedInfo);
        }

        // عرض الملاحظة
        if (party.note) {
            const noteText = document.createElement("div");
            noteText.className = "note-text";
            noteText.textContent = party.note;
            details.appendChild(noteText);
        }

        partyElement.appendChild(details);
        container.appendChild(partyElement);
        partiesList.appendChild(container);
    }

    function updateReport() {
        const completed = partiesData.filter((p) => p.completed).length;
        completedCount.textContent = completed;
        remainingCount.textContent = partiesData.length - completed;
    }

    function updateSettingsVisibility() {
        if (isSettingsVisible) {
            document.querySelector(".settings").style.display = "block";
            toggleSettingsButton.textContent = "إخفاء قائمة الإعدادات";
        } else {
            document.querySelector(".settings").style.display = "none";
            toggleSettingsButton.textContent = "إظهار قائمة الإعدادات";
        }
    }

    toggleSettingsButton.onclick = () => {
        isSettingsVisible = !isSettingsVisible;
        saveData();
        updateSettingsVisibility();
    };

    generateButton.onclick = () => {
        const from = parseInt(fromInput.value);
        const to = parseInt(toInput.value);
        const firstDay = firstDaySelect.value;

        if (isNaN(from) || isNaN(to) || from < 1 || to > 60 || from > to) {
            alert("يرجى إدخال نطاق صحيح.");
            return;
        }

        const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
        let currentDayIndex = days.indexOf(firstDay);

        partiesData = [];
        for (let i = from; i <= to; i++) {
            partiesData.push({
                number: i,
                day: days[currentDayIndex],
                completed: false,
                completedTime: null,
                note: null,
                color: "#1e1e2f",
                hidden: false // خاصية الإخفاء الجديدة
            });
            currentDayIndex = (currentDayIndex + 1) % days.length;
        }

        saveData();
        loadData();
    };

    resetButton.onclick = () => {
        if (confirm("هل أنت متأكد من تهيئة الصفحة؟")) {
            localStorage.removeItem("partiesData");
            localStorage.removeItem("isSettingsVisible");
            partiesData = [];
            isSettingsVisible = true;
            loadData();
        }
    };

    loadData();
});