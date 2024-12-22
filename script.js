document.addEventListener("DOMContentLoaded", () => {
    const viewModeSelect = document.getElementById("view-mode");
    const fromInput = document.getElementById("from");
    const toInput = document.getElementById("to");
    const firstDaySelect = document.getElementById("first-day");
    const generateButton = document.getElementById("generate");
    const resetButton = document.getElementById("reset");
    const itemsList = document.getElementById("items-list");
    const completedCount = document.getElementById("completed-count");
    const remainingCount = document.getElementById("remaining-count");
    const toggleSettingsButton = document.getElementById("toggle-settings");
    const itemsTitle = document.getElementById("items-title");
    const itemsSection = document.querySelector(".items-section");

    let currentMode = "hizb";
    let itemsData = {
        hizb: JSON.parse(localStorage.getItem("hizbData")) || [],
        juz: JSON.parse(localStorage.getItem("juzData")) || []
    };
    let isSettingsVisible = JSON.parse(localStorage.getItem("isSettingsVisible")) ?? true;

    // استعادة الوضع المحفوظ
    const savedMode = localStorage.getItem("currentMode");
    if (savedMode) {
        currentMode = savedMode;
        viewModeSelect.value = savedMode;
        itemsSection.style.borderColor = savedMode === "hizb" ? "green" : "red";
    }

    function updateInputLimits() {
        const maxValue = currentMode === "hizb" ? 60 : 30;
        fromInput.max = maxValue;
        toInput.max = maxValue;
        itemsTitle.textContent = currentMode === "hizb" ? "قائمة الأحزاب" : "قائمة الأجزاء";
    }

    function saveData() {
        localStorage.setItem(currentMode === "hizb" ? "hizbData" : "juzData", 
            JSON.stringify(itemsData[currentMode]));
        localStorage.setItem("isSettingsVisible", JSON.stringify(isSettingsVisible));
        updateReport();
    }

    function loadData() {
        itemsList.innerHTML = "";
        const currentItems = itemsData[currentMode];
        if (currentItems.length > 0) {
            currentItems.forEach((item) => createItemElement(item));
        }
        updateReport();
        updateSettingsVisibility();
    }

    function createItemElement(item) {
        const container = document.createElement("div");
        container.className = "item-container";

        const itemElement = document.createElement("div");
        itemElement.className = "item";
        itemElement.style.backgroundColor = item.color || "#1e1e2f";

        if (item.hidden) {
            itemElement.style.display = "none";
        } else {
            itemElement.style.display = "flex";
        }

        // زر الاسترجاع
        const restoreButton = document.createElement("button");
        restoreButton.className = "restore-button";
        restoreButton.innerHTML = currentMode === "hizb" ? 
            `استرجاع حزب ${item.number}` : 
            `استرجاع جزء ${item.number}`;
        restoreButton.style.display = item.hidden ? "block" : "none";
        restoreButton.onclick = () => {
            item.hidden = false;
            itemElement.style.display = "flex";
            restoreButton.style.display = "none";
            toggleButton.textContent = "إخفاء";
            saveData();
        };
        container.appendChild(restoreButton);

        // رأس العنصر
        const header = document.createElement("div");
        header.className = "item-header";

        const info = document.createElement("div");
        info.className = "item-info";
        
        const title = document.createElement("span");
        title.className = "item-title";
        title.textContent = currentMode === "hizb" ? 
            `حزب ${item.number}` : 
            `جزء ${item.number}`;
        info.appendChild(title);

        const day = document.createElement("span");
        day.className = "item-day";
        day.textContent = item.day;
        info.appendChild(day);

        header.appendChild(info);

        // زر الإخفاء/الإظهار
        const toggleButton = document.createElement("button");
        toggleButton.textContent = item.hidden ? "إظهار" : "إخفاء";
        toggleButton.onclick = () => {
            item.hidden = !item.hidden;
            if (item.hidden) {
                itemElement.style.display = "none";
                restoreButton.style.display = "block";
                toggleButton.textContent = "إظهار";
            } else {
                itemElement.style.display = "flex";
                restoreButton.style.display = "none";
                toggleButton.textContent = "إخفاء";
            }
            saveData();
        };
        header.appendChild(toggleButton);

        itemElement.appendChild(header);

        // قسم التفاصيل
        const details = document.createElement("div");
        details.className = "item-details visible";

        const actions = document.createElement("div");
        actions.className = "item-actions";

        // زر إنهاء
        const completeButton = document.createElement("button");
        completeButton.textContent = item.completed ? "تم الانتهاء" : "إنهاء";
        completeButton.className = "complete";
        completeButton.disabled = item.completed;
        completeButton.onclick = () => {
            item.completed = true;
            item.completedTime = new Date().toLocaleString();
            saveData();
            loadData();
        };
        actions.appendChild(completeButton);

        // زر التراجع
        const undoButton = document.createElement("button");
        undoButton.textContent = "تراجع";
        undoButton.className = "undo";
        undoButton.onclick = () => {
            item.completed = false;
            item.completedTime = null;
            item.color = "#1e1e2f";
            saveData();
            loadData();
        };
        actions.appendChild(undoButton);

        // زر إضافة ملاحظة
        const noteButton = document.createElement("button");
        noteButton.textContent = item.note ? "تعديل الملاحظة" : "إضافة ملاحظة";
        noteButton.onclick = () => {
            const note = prompt("أدخل الملاحظة:", item.note || "");
            if (note !== null) {
                item.note = note.trim() || null;
                saveData();
                loadData();
            }
        };
        actions.appendChild(noteButton);

        // زر تغيير اللون
        const colorButton = document.createElement("input");
        colorButton.type = "color";
        colorButton.value = item.color || "#1e1e2f";
        colorButton.title = "تغيير اللون";
        colorButton.onchange = (e) => {
            item.color = e.target.value;
            saveData();
            loadData();
        };
        actions.appendChild(colorButton);

        details.appendChild(actions);

        // معلومات الإنجاز
        if (item.completed && item.completedTime) {
            const completedInfo = document.createElement("div");
            completedInfo.className = "completed-info";
            completedInfo.textContent = `تم الانتهاء: ${item.completedTime}`;
            details.appendChild(completedInfo);
        }

        // عرض الملاحظة
        if (item.note) {
            const noteText = document.createElement("div");
            noteText.className = "note-text";
            noteText.textContent = item.note;
            details.appendChild(noteText);
        }

        itemElement.appendChild(details);
        container.appendChild(itemElement);
        itemsList.appendChild(container);
    }

    function updateReport() {
        const currentItems = itemsData[currentMode];
        const completed = currentItems.filter((item) => item.completed).length;
        completedCount.textContent = completed;
        remainingCount.textContent = currentItems.length - completed;
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

viewModeSelect.onchange = () => {
    currentMode = viewModeSelect.value;
    updateInputLimits();
    loadData();
    const itemsSection = document.querySelector(".items-section");
    if (currentMode === "hizb") {
        itemsSection.style.borderColor = "green";
    } else if (currentMode === "juz") {
        itemsSection.style.borderColor = "red";
    }

    // حفظ النوع في localStorage
    localStorage.setItem("currentMode", currentMode);
};


    toggleSettingsButton.onclick = () => {
        isSettingsVisible = !isSettingsVisible;
        saveData();
        updateSettingsVisibility();
    };

    generateButton.onclick = () => {
        const from = parseInt(fromInput.value);
        const to = parseInt(toInput.value);
        const firstDay = firstDaySelect.value;
        const maxValue = currentMode === "hizb" ? 60 : 30;

        if (isNaN(from) || isNaN(to) || from < 1 || to > maxValue || from > to) {
            alert("يرجى إدخال نطاق صحيح.");
            return;
        }

        const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
        let currentDayIndex = days.indexOf(firstDay);

        itemsData[currentMode] = [];
        for (let i = from; i <= to; i++) {
            itemsData[currentMode].push({
                number: i,
                day: days[currentDayIndex],
                completed: false,
                completedTime: null,
                note: null,
                color: "#1e1e2f",
                hidden: false
            });
            currentDayIndex = (currentDayIndex + 1) % days.length;
        }

        saveData();
        loadData();
    };

    resetButton.onclick = () => {
        if (confirm("هل أنت متأكد من تهيئة الصفحة؟")) {
            localStorage.removeItem("hizbData");
            localStorage.removeItem("juzData");
            localStorage.removeItem("isSettingsVisible");
            itemsData = {
                hizb: [],
                juz: []
            };
            isSettingsVisible = true;
            loadData();
        }
    };

    updateInputLimits();
    loadData();
});
