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
    const searchInput = document.getElementById("search");
    const scrollToTopButton = document.getElementById("scroll-to-top");
    const toggleStatisticsButton = document.getElementById("toggle-statistics");
    const statisticsTable = document.getElementById("statistics-table");
    const settingsContent = document.getElementById("settings-content");

    // عناصر الإحصائيات
    const lastCompletedItem = document.getElementById("last-completed-item");
    const lastCompletedTime = document.getElementById("last-completed-time");
    const lastCompletedVerseFrom = document.getElementById("last-completed-verse-from");
    const lastCompletedVerseTo = document.getElementById("last-completed-verse-to");

    let currentMode = "hizb";
    let itemsData = {
        hizb: JSON.parse(localStorage.getItem("hizbData")) || [],
        juz: JSON.parse(localStorage.getItem("juzData")) || []
    };
    let isSettingsVisible = JSON.parse(localStorage.getItem("isSettingsVisible")) ?? true;
    let isStatisticsVisible = JSON.parse(localStorage.getItem("isStatisticsVisible")) ?? true;

    // استعادة الوضع المحفوظ
    const savedMode = localStorage.getItem("currentMode");
    if (savedMode) {
        currentMode = savedMode;
        viewModeSelect.value = savedMode;
        itemsSection.style.borderColor = savedMode === "hizb" ? "green" : "red";
    }

    // تحديث حالة الإعدادات عند التحميل
    const savedSettingsVisibility = JSON.parse(localStorage.getItem("isSettingsVisible"));
    if (savedSettingsVisibility !== null) {
        isSettingsVisible = savedSettingsVisibility;
        settingsContent.style.display = isSettingsVisible ? "block" : "none";
    }

    // تحديث حالة الإحصائيات عند التحميل
    const savedStatisticsVisibility = JSON.parse(localStorage.getItem("isStatisticsVisible"));
    if (savedStatisticsVisibility !== null) {
        isStatisticsVisible = savedStatisticsVisibility;
        statisticsTable.style.display = isStatisticsVisible ? "table" : "none";
        toggleStatisticsButton.textContent = isStatisticsVisible ? "إخفاء الإحصائيات" : "إظهار الإحصائيات";
    }

    // زر إخفاء/إظهار الإعدادات
    toggleSettingsButton.onclick = () => {
        isSettingsVisible = !isSettingsVisible;
        settingsContent.style.display = isSettingsVisible ? "block" : "none";
        toggleSettingsButton.textContent = isSettingsVisible ? "⚙️إخفاء" : "⚙️إظهار";
        localStorage.setItem("isSettingsVisible", JSON.stringify(isSettingsVisible));
    };

    // زر إخفاء/إظهار الإحصائيات
    toggleStatisticsButton.onclick = () => {
        isStatisticsVisible = !isStatisticsVisible;
        statisticsTable.style.display = isStatisticsVisible ? "table" : "none";
        toggleStatisticsButton.textContent = isStatisticsVisible ? "إخفاء الإحصائيات" : "إظهار الإحصائيات";
        localStorage.setItem("isStatisticsVisible", JSON.stringify(isStatisticsVisible));
    };

    resetButton.onclick = () => {
        if (confirm("هل أنت متأكد من تهيئة الصفحة؟ سيتم حذف جميع البيانات.")) {
            localStorage.removeItem("hizbData");
            localStorage.removeItem("juzData");
            localStorage.removeItem("isSettingsVisible");
            localStorage.removeItem("isStatisticsVisible");
            itemsData = {
                hizb: [],
                juz: []
            };
            isSettingsVisible = true;
            isStatisticsVisible = true;
            loadData();
        }
    };

    function loadData() {
        itemsList.innerHTML = "";
        const currentItems = itemsData[currentMode];
        if (currentItems.length > 0) {
            currentItems.forEach((item, index) => {
                if (index < 10) { // تحميل أول 10 عناصر فقط
                    createItemElement(item);
                }
            });
            if (currentItems.length > 10) {
                const loadMoreButton = document.createElement("button");
                loadMoreButton.textContent = "تحميل المزيد";
                loadMoreButton.onclick = () => {
                    currentItems.slice(10).forEach(createItemElement);
                    loadMoreButton.remove();
                };
                itemsList.appendChild(loadMoreButton);
            }
        }
        updateReport();
        updateStatistics();
    }

    function updateInputLimits() {
        const maxValue = currentMode === "hizb" ? 60 : 30;
        fromInput.max = maxValue;
        toInput.max = maxValue;
        itemsTitle.textContent = currentMode === "hizb" ? "قائمة الأحزاب" : "قائمة الأجزاء";
    }

    function saveData() {
        localStorage.setItem(currentMode === "hizb" ? "hizbData" : "juzData", JSON.stringify(itemsData[currentMode]));
        localStorage.setItem("isSettingsVisible", JSON.stringify(isSettingsVisible));
        localStorage.setItem("isStatisticsVisible", JSON.stringify(isStatisticsVisible));
        updateReport();
        updateStatistics();
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
        restoreButton.innerHTML = currentMode === "hizb" ? `استرجاع حزب ${item.number}` : `استرجاع جزء ${item.number}`;
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
        title.textContent = currentMode === "hizb" ? `حزب ${item.number}` : `جزء ${item.number}`;
        info.appendChild(title);

        const day = document.createElement("span");
        day.className = "item-day";
        day.textContent = item.day;
        info.appendChild(day);

        header.appendChild(info);

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

        const details = document.createElement("div");
        details.className = "item-details visible";

        const actions = document.createElement("div");
        actions.className = "item-actions";

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

        const detailsButton = document.createElement("button");
        detailsButton.textContent = "تفاصيل";
        detailsButton.onclick = () => showDetails(item);
        actions.appendChild(detailsButton);

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

        if (item.completed && item.completedTime) {
            const completedInfo = document.createElement("div");
            completedInfo.className = "completed-info";
            completedInfo.textContent = `تم الانتهاء: ${item.completedTime}`;
            details.appendChild(completedInfo);
        }

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

    function showDetails(item) {
        const existingPopups = document.querySelectorAll('.details-popup');
        existingPopups.forEach(popup => popup.remove());

        const popup = document.createElement('div');
        popup.className = 'details-popup';

        const closeButton = document.createElement('button');
        closeButton.className = 'details-close';
        closeButton.textContent = '×';
        closeButton.onclick = () => popup.remove();
        popup.appendChild(closeButton);

        const table = document.createElement('table');
        table.className = 'details-table';

        const details = getItemDetails(item);
        
        Object.entries(details).forEach(([key, value]) => {
            const row = table.insertRow();
            const headerCell = row.insertCell();
            const valueCell = row.insertCell();
            
            headerCell.textContent = key;
            valueCell.textContent = value;
        });

        popup.appendChild(table);

        document.body.appendChild(popup);

        const rect = event.target.getBoundingClientRect();
        popup.style.top = `${rect.bottom + window.scrollY + 10}px`;
        popup.style.left = `${rect.left + window.scrollX}px`;

        setTimeout(() => popup.classList.add('visible'), 10);

        document.addEventListener('click', function closePopup(e) {
            if (!popup.contains(e.target) && e.target !== event.target) {
                popup.remove();
                document.removeEventListener('click', closePopup);
            }
        });
    }

    function getItemDetails(item) {
        if (currentMode === 'hizb') {
            return {
                "الحزب": item.number,
                "السورة": getHizbSurah(item.number),
                "رقم الصفحة": getHizbPage(item.number),
                "رقم الآية": getHizbVerse(item.number),
                "من الآية": getHizbText(item.number)
            };
        } else {
            return {
                "الجزء": item.number,
                "السورة": getJuzSurah(item.number),
                "رقم الصفحة": getJuzPage(item.number),
                "رقم الآية": getJuzVerse(item.number),
                "من الآية": getJuzText(item.number)
            };
        }
    }

    function getHizbSurah(number) {
        return hizbData.surahs[number] || "غير محدد";
    }

    function getHizbPage(number) {
        return hizbData.pages[number] || "غير محدد";
    }

    function getHizbVerse(number) {
        return hizbData.verses[number] || "غير محدد";
    }

    function getHizbText(number) {
        return hizbData.texts[number] || "غير محدد";
    }

    function getJuzSurah(number) {
        return juzData.surahs[number] || "غير محدد";
    }

    function getJuzPage(number) {
        return juzData.pages[number] || "غير محدد";
    }

    function getJuzVerse(number) {
        return juzData.verses[number] || "غير محدد";
    }

    function getJuzText(number) {
        return juzData.texts[number] || "غير محدد";
    }

    function updateReport() {
        const currentItems = itemsData[currentMode];
        const completed = currentItems.filter((item) => item.completed).length;
        completedCount.textContent = completed;
        remainingCount.textContent = currentItems.length - completed;
    }

    function updateStatistics() {
        const currentItems = itemsData[currentMode];
        const lastCompleted = currentItems.filter(item => item.completed).pop();
        if (lastCompleted) {
            const date = new Date();
            const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
            const dayName = days[date.getDay()];
            const formattedTime = `${dayName}، ${date.toLocaleString()}`;

            lastCompletedItem.textContent = currentMode === "hizb" ? `حزب ${lastCompleted.number}` : `جزء ${lastCompleted.number}`;
            lastCompletedTime.textContent = formattedTime;
            lastCompletedVerseFrom.textContent = getHizbVerse(lastCompleted.number);
            lastCompletedVerseTo.textContent = getHizbVerse(lastCompleted.number + 1);
        } else {
            lastCompletedItem.textContent = "لا يوجد";
            lastCompletedTime.textContent = "لا يوجد";
            lastCompletedVerseFrom.textContent = "لا يوجد";
            lastCompletedVerseTo.textContent = "لا يوجد";
        }
    }

    viewModeSelect.onchange = () => {
        currentMode = viewModeSelect.value;
        updateInputLimits();
        loadData();
        itemsSection.style.borderColor = currentMode === "hizb" ? "green" : "red";
        localStorage.setItem("currentMode", currentMode);
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

    searchInput.oninput = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredItems = itemsData[currentMode].filter(item => 
            item.number.toString().includes(searchTerm) || 
            item.day.toLowerCase().includes(searchTerm)
        );
        itemsList.innerHTML = "";
        filteredItems.forEach(createItemElement);
    };

    window.onscroll = () => {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            scrollToTopButton.style.display = "block";
        } else {
            scrollToTopButton.style.display = "none";
        }
    };

    scrollToTopButton.onclick = () => {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    };

    updateInputLimits();
    loadData();
});