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

    // عناصر جديدة
    const restoreDropdown = document.getElementById("restore-dropdown");

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
        updateBorderColors();
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

    function showNotePopup(item) {
        const existingPopups = document.querySelectorAll('.note-popup');
        existingPopups.forEach(popup => popup.remove());

        const popup = document.createElement('div');
        popup.className = 'note-popup';

        const closeButton = document.createElement('button');
        closeButton.className = 'note-close';
        closeButton.textContent = '×';
        closeButton.onclick = () => popup.remove();
        popup.appendChild(closeButton);

        const textarea = document.createElement('textarea');
        textarea.value = item.note || '';
        textarea.className = 'note-textarea';
        textarea.setAttribute('rows', '5');
        textarea.setAttribute('resize', 'both');
        popup.appendChild(textarea);

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'note-buttons';

        const saveButton = document.createElement('button');
        saveButton.textContent = 'حفظ';
        saveButton.onclick = () => {
            item.note = textarea.value.trim() || null;
            saveData();
            loadData();
            popup.remove();
        };
        buttonContainer.appendChild(saveButton);

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'إلغاء';
        cancelButton.onclick = () => popup.remove();
        buttonContainer.appendChild(cancelButton);

        popup.appendChild(buttonContainer);

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
        container.setAttribute("data-number", item.number);

        const itemElement = document.createElement("div");
        itemElement.className = "item";
        itemElement.style.backgroundColor = item.color || "#1e1e2f";

        if (item.hidden) {
            itemElement.style.display = "none";
        } else {
            itemElement.style.display = "flex";
        }

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
            } else {
                itemElement.style.display = "flex";
            }
            saveData();
            updateRestoreDropdown();
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
        noteButton.onclick = () => showNotePopup(item);
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

    function loadData() {
        itemsList.innerHTML = "";
        const currentItems = itemsData[currentMode];
        let visibleCount = 0;
        const initialLoadCount = 5;

        if (currentItems.length > 0) {
            currentItems.forEach((item, index) => {
                if (!item.hidden && visibleCount < initialLoadCount) {
                    createItemElement(item);
                    visibleCount++;
                }
            });

            if (currentItems.length > initialLoadCount || currentItems.some(item => item.hidden)) {
                const loadMoreButton = document.createElement("button");
                loadMoreButton.textContent = "إظهار الكل";
                loadMoreButton.onclick = () => {
                    currentItems.forEach((item) => {
                        if (!itemsList.querySelector(`[data-number="${item.number}"]`)) {
                            createItemElement(item);
                        }
                    });
                    loadMoreButton.remove();
                };
                itemsList.appendChild(loadMoreButton);
            }
        }
        updateReport();
        updateStatistics();
        updateRestoreDropdown();
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

    function updateBorderColors() {
        const modeClass = currentMode === "hizb" ? "hizb" : "juz";
        itemsSection.classList.remove("hizb", "juz");
        itemsSection.classList.add(modeClass);
        document.querySelector(".statistics").classList.remove("hizb", "juz");
        document.querySelector(".statistics").classList.add(modeClass);
        document.querySelector(".settings").classList.remove("hizb", "juz");
        document.querySelector(".settings").classList.add(modeClass);
        document.querySelector(".report-box").classList.remove("hizb", "juz");
        document.querySelector(".report-box").classList.add(modeClass);
        document.getElementById("scroll-to-top").classList.remove("hizb", "juz");
        document.getElementById("scroll-to-top").classList.add(modeClass);
    }

    viewModeSelect.onchange = () => {
        currentMode = viewModeSelect.value;
        updateInputLimits();
        loadData();
        updateBorderColors();
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

    // تحديث القائمة المنسدلة بالعناصر المخفية
    function updateRestoreDropdown() {
        restoreDropdown.innerHTML = '<option value="">اختر عنصرًا لاسترجاعه</option>';
        const hiddenItems = itemsData[currentMode].filter(item => item.hidden);
        hiddenItems.forEach(item => {
            const option = document.createElement("option");
            option.value = item.number;
            option.textContent = currentMode === "hizb" ? `حزب ${item.number}` : `جزء ${item.number}`;
            restoreDropdown.appendChild(option);
        });
        restoreDropdown.style.display = hiddenItems.length > 0 ? "block" : "none";
    }

    // استرجاع العنصر المحدد
    restoreDropdown.onchange = () => {
        const selectedNumber = parseInt(restoreDropdown.value);
        if (isNaN(selectedNumber)) return;

        const selectedItem = itemsData[currentMode].find(item => item.number === selectedNumber);
        if (selectedItem) {
            selectedItem.hidden = false;
            saveData();
            loadData();
            updateRestoreDropdown();
        }
    };

    updateInputLimits();
    loadData();
});
