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

    // دوال الحصول على بيانات الأحزاب
    function getHizbSurah(number) {
const surahs = {
  1: "الفاتحة",
    2: "البقرة",
    3: "البقرة",
    4: "البقرة",
    5: "البقرة",
    6: "آل عمران",
    7: "آل عمران",
    8: "آل عمران",
    9: "النساء",
    10: "النساء",
    11: "النساء",
    12: "المائدة",
    13: "المائدة",
    14: "الأنعام",
    15: "الأنعام",
    16: "الأعراف",
    17: "الأعراف",
    18: "الأعراف",
    19: "الأنفال",
    20: "التوبة",
    21: "التوبة",
    22: "يونس",
    23: "هود",
    24: "هود",
    25: "يوسف",
    26: "الرعد",
    27: "الحجر",
    28: "النحل",
    29: "الإسراء",
    30: "الإسراء",
    31: "الكهف",
    32: "طه",
    33: "الأنبياء",
    34: "الحج",
    35: "المؤمنون",
    36: "النور",
    37: "الفرقان",
    38: "الشعراء",
    39: "النمل",
    40: "القصص",
    41: "العنكبوت",
    42: "لقمان",
    43: "الأحزاب",
    44: "سبأ",
    45: "يس",
    46: "الصافات",
    47: "الزمر",
    48: "غافر",
    49: "فصلت",
    50: "الزخرف",
    51: "الأحقاف",
    52: "الفتح",
    53: "الذاريات",
    54: "الرحمن",
    55: "المجادلة",
    56: "الجمعة",
    57: "الملك",
    58: "الجن",
    59: "النبأ",
    60: "الأعلى",
};
        return surahs[number] || "غير محدد";
    }

    function getHizbPage(number) {
const pages = {
    1: "1",
    2: "11",
    3: "22",
    4: "32",
    5: "42",
    6: "51",
    7: "62",
    8: "72",
    9: "82",
    10: "92",
    11: "102",
    12: "112",
    13: "121",
    14: "132",
    15: "142",
    16: "151",
    17: "162",
    18: "173",
    19: "182",
    20: "192",
    21: "201",
    22: "212",
    23: "222",
    24: "231",
    25: "242",
    26: "252",
    27: "262",
    28: "272",
    29: "282",
    30: "292",
    31: "302",
    32: "312",
    33: "322",
    34: "332",
    35: "342",
    36: "352",
    37: "362",
    38: "371",
    39: "382",
    40: "392",
    41: "402",
    42: "413",
    43: "422",
    44: "431",
    45: "442",
    46: "451",
    47: "462",
    48: "472",
    49: "482",
    50: "491",
    51: "502",
    52: "513",
    53: "522",
    54: "531",
    55: "542",
    56: "553",
    57: "562",
    58: "572",
    59: "582",
    60: "591"
};
        return pages[number] || "غير محدد";
    }

    function getHizbVerse(number) {
        const verses = {
            1: "1",
            2: "75",
    3: 142, // "سيقول السفهاء من الناس ما ولاهم"
    4: 197, // "واذكروا الله في أيام معدودات"
    5: 253, // "تلك الرسل فضلنا بعضهم على بعض"
    6: 15, // "قل أؤنبئكم بخير من ذلكم للذين اتقوا" (آل عمران)
    7: 93, // "كل الطعام كان حلا لبني إسرائيل"
    8: 170, // "يستبشرون بنعمة من الله وفضل"
    9: 24, // "والمحصنات من النساء إلا ما ملكت أيمانكم" (النساء)
    10: 88, // "فما لكم في المنافقين فئتين والله أركسهم"
    11: 148, // "لا يحب الله الجهر بالسوء من القول"
    12: 27, // "واتل عليهم نبأ ابني آدم بالحق" (المائدة)
    13: 82, // "لتجدن أشد الناس عداوة للذين آمنوا اليهود"
    14: 36, // "إنما يستجيب الذين يسمعون والموتى يبعثهم الله" (الأنعام)
    15: 111, // "ولو أننا نزلنا إليهم الملائكة وكلمهم الموتى"
    16: 1, // "المص, كتاب أنزل إليك" (الأعراف)
    17: 73, // "قال الملأ الذين استكبروا من قومه لنخرجنك"
    18: 171, // "وإذ نتقنا الجبل فوقهم كأنه ظلة"
    19: 41, // "واعلموا أنما غنمتم من شيء فأن لله خمسه" (الأنفال)
    20: 34, // "يا أيها الذين آمنوا إن كثيرا من الأحبار" (التوبة)
    21: 93, // "إنما السبيل على الذين يستأذنونك وهم أغنياء"
    22: 26, // "للذين أحسنوا الحسنى وزيادة" (يونس)
    23: 6, // "وما من دابة في الأرض إلا على رزقها" (هود)
    24: 84, // "وإلى مدين أخاهم شعيبا"
    25: 53, // "وما أبرئ نفسي إن النفس لأمارة بالسوء" (يوسف)
    26: 19, // "أفمن يعلم أنما أنزل إليك من ربك الحق" (الرعد)
    27: 1, // "الر تلك آيات الكتاب وقرآن مبين" (الحجر)
    28: 51, // "وقال الله لا تتخذوا إلهين اثنين" (النحل)
    29: 1, // "سبحان الذي أسرى بعبده ليلا" (الإسراء)
    30: 90, // "أولم يروا أن الله الذي خلق السماوات"
    31: 60, // "قال ألم أقل لك إنك لن تستطيع" (الكهف)
    32: 1, // "طه, ما أنزلنا عليك القرآن لتشقى" (طه)
    33: 1, // "اقترب للناس حسابهم وهم في غفلة معرضون" (الأنبياء)
    34: 1, // "يا أيها الناس اتقوا ربكم إن زلزلة" (الحج)
    35: 1, // "قد أفلح المؤمنون, الذين هم في" (المؤمنون)
    36: 21, // "يا أيها الذين آمنوا لا تتبعوا خطوات" (النور)
    37: 7, // "وقال الذين لا يرجون لقاءنا" (الفرقان)
    38: 111, // "قالوا أنؤمن لك واتبعك الأرذلون" (الشعراء)
    39: 54, // "فما كان جواب قومه إلا أن قالوا" (النمل)
    40: 33, // "ولقد وصلنا لهم القول لعلهم يتذكرون" (القصص)
    41: 46, // "ولا تجادلوا أهل الكتاب إلا بالتي هي أحسن" (العنكبوت)
    42: 22, // "ومن يسلم وجهه إلى الله وهو محسن" (لقمان)
    43: 31, // "ومن يقنت منكن لله ورسوله وتعمل صالحا" (الأحزاب)
    44: 9, // "قل من يرزقكم من السماوات والأرض" (سبأ)
    45: 28, // "وما أنزلنا على قومه من بعده من جند" (يس)
    46: 139, // "فنبذناه بالعراء وهو سقيم" (الصافات)
    47: 32, // "فمن أظلم ممن كذب على الله وكذب" (الزمر)
    48: 10, // "ويا قوم ما لي أدعوكم إلى النجاة" (غافر)
    49: 47, // "إليه يرد علم الساعة" (فصلت)
    50: 24, // "قال أولو جئتكم بأهدى مما وجدتم" (الزخرف)
    51: 1, // "حم, تنزيل الكتاب من الله العزيز الحكيم" (الأحقاف)
    52: 18, // "لقد رضي الله عن المؤمنين إذ يبايعونك" (الفتح)
    53: 31, // "قال فما خطبكم أيها المرسلون" (الذاريات)
    54: 1, // "الرحمن, علم القرآن" (الرحمن)
    55: 1, // "قد سمع الله قول التي تجادلك" (المجادلة)
    56: 1, // "يسبح لله ما في السماوات وما في الأرض" (الجمعة)
    57: 1, // "تبارك الذي بيده الملك" (الملك)
    58: 1, // "قل أوحي إلي أنه استمع نفر من الجن" (الجن)
    59: 1, // "عم يتساءلون, عن النبإ العظيم" (النبأ)
    60: 1  // "سبح اسم ربك الأعلى, الذي خلق فسوى" (الأعلى)
};
        return verses[number] || "غير محدد";
    }

    function getHizbText(number) {
        const texts = {
            1: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
            2: "أَفَتَطْمَعُونَ أَن يُؤْمِنُوا لَكُمْ",
    3: "سيقول السفهاء من الناس ما ولاهم",
    4: "واذكروا الله في أيام معدودات",
    5: "تلك الرسل فضلنا بعضهم على بعض",
    6: "قل أؤنبئكم بخير من ذلكم للذين اتقوا",
    7: "كل الطعام كان حلا لبني إسرائيل",
    8: "يستبشرون بنعمة من الله وفضل",
    9: "والمحصنات من النساء إلا ما ملكت أيمانكم",
    10: "فما لكم في المنافقين فئتين والله أركسهم",
    11: "لا يحب الله الجهر بالسوء من القول",
    12: "واتل عليهم نبأ ابني آدم بالحق",
    13: "لتجدن أشد الناس عداوة للذين آمنوا اليهود",
    14: "إنما يستجيب الذين يسمعون والموتى يبعثهم الله",
    15: "ولو أننا نزلنا إليهم الملائكة وكلمهم الموتى",
    16: "المص, كتاب أنزل إليك",
    17: "قال الملأ الذين استكبروا من قومه لنخرجنك",
    18: "وإذ نتقنا الجبل فوقهم كأنه ظلة",
    19: "واعلموا أنما غنمتم من شيء فأن لله خمسه",
    20: "يا أيها الذين آمنوا إن كثيرا من الأحبار",
    21: "إنما السبيل على الذين يستأذنونك وهم أغنياء",
    22: "للذين أحسنوا الحسنى وزيادة",
    23: "وما من دابة في الأرض إلا على رزقها",
    24: "وإلى مدين أخاهم شعيبا",
    25: "وما أبرئ نفسي إن النفس لأمارة بالسوء",
    26: "أفمن يعلم أنما أنزل إليك من ربك الحق",
    27: "الر تلك آيات الكتاب وقرآن مبين",
    28: "وقال الله لا تتخذوا إلهين اثنين",
    29: "سبحان الذي أسرى بعبده ليلا",
    30: "أولم يروا أن الله الذي خلق السماوات",
    31: "قال ألم أقل لك إنك لن تستطيع",
    32: "طه, ما أنزلنا عليك القرآن لتشقى",
    33: "اقترب للناس حسابهم وهم في غفلة معرضون",
    34: "يا أيها الناس اتقوا ربكم إن زلزلة",
    35: "قد أفلح المؤمنون, الذين هم في",
    36: "يا أيها الذين آمنوا لا تتبعوا خطوات",
    37: "وقال الذين لا يرجون لقاءنا",
    38: "قالوا أنؤمن لك واتبعك الأرذلون",
    39: "فما كان جواب قومه إلا أن قالوا",
    40: "ولقد وصلنا لهم القول لعلهم يتذكرون",
    41: "ولا تجادلوا أهل الكتاب إلا بالتي هي أحسن",
    42: "ومن يسلم وجهه إلى الله وهو محسن",
    43: "ومن يقنت منكن لله ورسوله وتعمل صالحا",
    44: "قل من يرزقكم من السماوات والأرض",
    45: "وما أنزلنا على قومه من بعده من جند",
    46: "فنبذناه بالعراء وهو سقيم",
    47: "فمن أظلم ممن كذب على الله وكذب",
    48: "ويا قوم ما لي أدعوكم إلى النجاة",
    49: "إليه يرد علم الساعة",
    50: "قال أولو جئتكم بأهدى مما وجدتم",
    51: "حم, تنزيل الكتاب من الله العزيز الحكيم",
    52: "لقد رضي الله عن المؤمنين إذ يبايعونك",
    53: "قال فما خطبكم أيها المرسلون",
    54: "الرحمن, علم القرآن",
    55: "قد سمع الله قول التي تجادلك",
    56: "يسبح لله ما في السماوات وما في الأرض",
    57: "تبارك الذي بيده الملك",
    58: "قل أوحي إلي أنه استمع نفر من الجن",
    59: "عم يتساءلون, عن النبإ العظيم",
    60: "سبح اسم ربك الأعلى, الذي خلق فسوى"
};
        return texts[number] || "غير محدد";
    }

    // دوال الحصول على بيانات الأجزاء
    function getJuzSurah(number) {
        const surahs = {
    1: "الفاتحة",
    2: "البقرة",
    3: "البقرة",
    4: "آل عمران",
    5: "النساء",
    6: "النساء",
    7: "المائدة",
    8: "الأنعام",
    9: "الأعراف",
    10: "الأنفال",
    11: "التوبة",
    12: "هود",
    13: "يوسف",
    14: "الحجر",
    15: "الإسراء",
    16: "الكهف",
    17: "الأنبياء",
    18: "المؤمنون",
    19: "الفرقان",
    20: "النمل",
    21: "العنكبوت",
    22: "الأحزاب",
    23: "يس",
    24: "الزمر",
    25: "فصلت",
    26: "الأحقاف",
    27: "الذاريات",
    28: "المجادلة",
    29: "الملك",
    30: "النبأ"
};
        return surahs[number] || "غير محدد";
    }

function getJuzPage(number) {
    const pages = {
        1: "1",
        2: "22",
        3: "42",
        4: "62",
        5: "82",
        6: "102",
        7: "121",
        8: "142",
        9: "162",
        10: "182",
        11: "201",
        12: "222",
        13: "242",
        14: "262",
        15: "282",
        16: "302",
        17: "322",
        18: "342",
        19: "362",
        20: "382",
        21: "402",
        22: "422",
        23: "442",
        24: "462",
        25: "482",
        26: "502",
        27: "522",
        28: "542",
        29: "562",
        30: "582"
    };
    return pages[number] || "غير محدد";
}

function getJuzVerse(number) {
    const verses = {
        1: "1", // الفاتحة
        2: "142", // البقرة
        3: "253", // البقرة
        4: "93", // آل عمران
        5: "24", // النساء
        6: "148", // النساء
        7: "82", // المائدة
        8: "111", // الأنعام
        9: "73", // الأعراف
        10: "41", // الأنفال
        11: "93", // التوبة
        12: "6", // هود
        13: "53", // يوسف
        14: "1", // الحجر
        15: "1", // الإسراء
        16: "60", // الكهف
        17: "1", // الأنبياء
        18: "1", // المؤمنون
        19: "7", // الفرقان
        20: "54", // النمل
        21: "46", // العنكبوت
        22: "31", // الأحزاب
        23: "28", // يس
        24: "32", // الزمر
        25: "47", // فصلت
        26: "1", // الأحقاف
        27: "31", // الذاريات
        28: "1", // المجادلة
        29: "1", // الملك
        30: "1" // النبأ
    };
    return verses[number] || "غير محدد";
}

function getJuzText(number) {
    const texts = {
        1: "بسم الله الرحمن الرحيم الحمد لله رب العالمين",
        2: "سيقول السفهاء",
        3: "تلك الرسل فضلنا بعضهم على بعض",
        4: "كل الطعام كان حلا لبني اسرائيل",
        5: "والمحصنات من النساء الا ما ملكت ايمانكم",
        6: "لا يحب الله الجهر بالسوء من القول",
        7: "لتجدن اشد الناس عداوة للذين امنوا",
        8: "ولو اننا نزلنا اليهم الملائكة",
        9: "قال الملأ الذين استكبروا",
        10: "واعلموا انما غنمتم من شيء فان لله خمسه",
        11: "انما السبيل على الذين يستأذنونك",
        12: "وما من دابة في الارض الا على الله رزقها",
        13: "وما ابرئ نفسي ان النفس لامارة بالسوء",
        14: "الر تلك ايات الكتاب وقرآن مبين",
        15: "سبحان الذي اسرى بعبده ليلا",
        16: "قال الم اقل لك انك لن تستطيع",
        17: "اقترب للناس حسابهم وهم في غفلة",
        18: "قد افلح المؤمنون",
        19: "وقال الذين لا يرجون لقاءنا",
        20: "فما كان جواب قومه الا ان قالوا",
        21: "ولا تجادلوا اهل الكتاب الا بالتي هي احسن",
        22: "ومن يقنت منكن لله ورسوله",
        23: "وما انزلنا على قومه من بعده",
        24: "فمن اظلم ممن كذب على الله",
        25: "اليه يرد علم الساعة",
        26: "حم تنزيل الكتاب",
        27: "قال فما خطبكم ايها المرسلون",
        28: "قد سمع الله قول التي تجادلك",
        29: "تبارك الذي بيده الملك",
        30: "عم يتساءلون"
    };
    return texts[number] || "غير محدد";
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
        itemsSection.style.borderColor = currentMode === "hizb" ? "green" : "red";
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
