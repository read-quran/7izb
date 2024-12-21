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
        const partyElement = document.createElement("div");
        partyElement.className = "party";
        partyElement.style.backgroundColor = party.color || "#1e1e2f";

        const partyInfo = document.createElement("span");
        partyInfo.textContent = `حزب ${party.number} - ${party.day}`;
        partyElement.appendChild(partyInfo);

        if (party.completedTime) {
            const completedTime = document.createElement("span");
            completedTime.style.fontSize = "0.9rem";
            completedTime.style.color = "#aaa";
            completedTime.textContent = ` (${party.completedTime})`;
            partyElement.appendChild(completedTime);
        }

        const actions = document.createElement("div");
        actions.className = "actions";

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

        const undoButton = document.createElement("button");
        undoButton.textContent = "تراجع";
        undoButton.className = "undo";
        undoButton.onclick = () => {
            party.completed = false;
            party.completedTime = null;
            party.color = "#1e1e2f"; // إرجاع اللون الأصلي
            saveData();
            loadData();
        };
        actions.appendChild(undoButton);

        const noteButton = document.createElement("button");
        noteButton.textContent = "إضافة ملاحظة";
        noteButton.onclick = () => {
            const note = prompt("أدخل الملاحظة:");
            if (note) {
                party.note = note;
                saveData();
                loadData();
            }
        };
        actions.appendChild(noteButton);

        if (party.note) {
            const noteIndicator = document.createElement("span");
            noteIndicator.textContent = "📌";
            noteIndicator.title = "يوجد ملاحظة";
            noteIndicator.style.marginLeft = "10px";
            noteIndicator.style.cursor = "pointer";
            noteIndicator.onclick = () => {
                alert(`ملاحظة: ${party.note}`);
            };

            const deleteNoteButton = document.createElement("span");
            deleteNoteButton.textContent = "❌";
            deleteNoteButton.title = "حذف الملاحظة";
            deleteNoteButton.style.color = "red";
            deleteNoteButton.style.marginLeft = "10px";
            deleteNoteButton.style.cursor = "pointer";
            deleteNoteButton.onclick = () => {
                if (confirm("هل تريد حذف الملاحظة؟")) {
                    party.note = null;
                    saveData();
                    loadData();
                }
            };
            actions.appendChild(noteIndicator);
            actions.appendChild(deleteNoteButton);
        }

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

        partyElement.appendChild(actions);
        partiesList.appendChild(partyElement);
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
