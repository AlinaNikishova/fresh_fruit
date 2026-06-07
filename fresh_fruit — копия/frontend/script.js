const themeToggle = document.getElementById("theme-toggle");

const fileInput = document.getElementById("file-input");
const dropArea = document.getElementById("drop-area");

const analyzeBtn = document.getElementById("analyze-btn");
const resetBtn = document.getElementById("reset-btn");
const downloadBtn = document.getElementById("download-btn");

const statusBlock = document.getElementById("status");

const resultCard = document.getElementById("result-card");
const verdict = document.getElementById("verdict");
const damageType = document.getElementById("damage-type");
const comment = document.getElementById("comment");
const confidenceText = document.getElementById("confidence");
const timeText = document.getElementById("time");

let selectedFile = null;
let lastResult = null;

// смена темы
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    document.body.classList.toggle("dark-theme");
});

// выбор файла по клику
dropArea.addEventListener("click", () => {
    fileInput.click();
});

// выбор файла через окно
fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    handleFile(file);
});

// drag over
dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropArea.style.borderColor = "#2dd4bf";
});

// drag leave
dropArea.addEventListener("dragleave", () => {
    dropArea.style.borderColor = "rgba(148, 163, 184, 0.35)";
});

// drop file
dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    dropArea.style.borderColor = "rgba(148, 163, 184, 0.35)";

    const file = event.dataTransfer.files[0];
    handleFile(file);
});

function handleFile(file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Выберите изображение.");
        return;
    }

    selectedFile = file;

    const reader = new FileReader();

    reader.onload = function (event) {
        dropArea.innerHTML = `
            <img src="${event.target.result}" class="preview-image" alt="Предпросмотр">
        `;
    };

    reader.readAsDataURL(file);

    statusBlock.textContent = "Статус: изображение загружено";
    resetResult();
}

// анализ
analyzeBtn.addEventListener("click", async () => {
    if (!selectedFile) {
        alert("Сначала загрузите изображение.");
        return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    const startTime = performance.now();

    try {
        statusBlock.textContent = "Статус: отправка изображения в API...";

        const response = await fetch("http://127.0.0.1:8000/predict", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Ошибка API");
        }

        statusBlock.textContent = "Статус: анализ изображения...";

        const data = await response.json();

        const endTime = performance.now();
        const elapsed = ((endTime - startTime) / 1000).toFixed(2);
        const confidence = Math.round(data.confidence * 100);

        if (data.label === "good") {
            verdict.textContent = "✓ GOOD";
            verdict.className = "good";

            damageType.textContent = "Тип результата: качественный продукт";

            comment.textContent =
                "Комментарий: явных внешних дефектов не обнаружено. Продукт можно отнести к качественной партии.";
        } else {
            verdict.textContent = "⚠ DEFECT";
            verdict.className = "defect";

            damageType.textContent = "Тип результата: обнаружены признаки дефекта";

            comment.textContent =
                "Комментарий: на изображении обнаружены признаки повреждения, пятен, гнили или деформации. Рекомендуется ручная проверка.";
        }

        confidenceText.textContent = `Уверенность модели: ${confidence}%`;
        timeText.textContent = `Время обработки: ${elapsed} c`;

        statusBlock.textContent = "Статус: анализ завершён";

        lastResult = {
            fileName: selectedFile.name,
            verdict: data.label,
            confidence: `${confidence}%`,
            damageType: damageType.textContent,
            comment: comment.textContent,
            time: `${elapsed} c`
        };

    } catch (error) {
        console.error(error);
        statusBlock.textContent = "Статус: ошибка обработки";
        alert("Не удалось получить ответ от API. Проверь, что FastAPI запущен.");
    }
});

// сброс
resetBtn.addEventListener("click", () => {
    selectedFile = null;
    lastResult = null;
    fileInput.value = "";

    dropArea.innerHTML = `
        <img src="upload_icon.png" alt="Иконка загрузки" class="upload-icon">
        <p>Перетащите изображение сюда или нажмите для выбора</p>
    `;

    statusBlock.textContent = "Статус: ожидание изображения";
    resetResult();
});

function resetResult() {
    verdict.textContent = "Нет данных";
    verdict.className = "";

    damageType.textContent = "Тип повреждения: -";
    comment.textContent = "Комментарий: -";
    confidenceText.textContent = "Уверенность модели: -";
    timeText.textContent = "Время обработки: -";
}

// скачать результат
downloadBtn.addEventListener("click", () => {
    if (!lastResult) {
        alert("Сначала выполните анализ изображения.");
        return;
    }

    const text = `
Результат анализа изображения

Файл: ${lastResult.fileName}
Вердикт: ${lastResult.verdict}
Уверенность модели: ${lastResult.confidence}
${lastResult.damageType}
${lastResult.comment}
Время обработки: ${lastResult.time}
`;

    const blob = new Blob([text], {
        type: "text/plain;charset=utf-8"
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "fruit_analysis_result.txt";
    link.click();

    URL.revokeObjectURL(link.href);
});