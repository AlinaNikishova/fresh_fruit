import time

import gradio as gr
from PIL import Image

from .model import predict


CSS = """
body {
    background: #050816;
}

.gradio-container {
    max-width: 1200px !important;
}

.result-good {
    color: #10b981;
    font-size: 32px;
    font-weight: bold;
}

.result-defect {
    color: #ef4444;
    font-size: 32px;
    font-weight: bold;
}
"""


def gradio_predict(img: Image.Image):

    start_time = time.time()

    if img is None:
        return (
            "Нет изображения",
            "",
            "",
            ""
        )

    label, confidence, demo = predict(img)

    confidence_percent = round(confidence * 100, 2)

    elapsed = round(
        time.time() - start_time,
        2
    )

    if label == "defect":

        verdict = """
        <div class="result-defect">
        ⚠ DEFECT
        </div>
        """

        damage = "Гниль / пятна / повреждение"

        comment = (
            "На изображении обнаружены признаки дефекта."
        )

    else:

        verdict = """
        <div class="result-good">
        ✓ GOOD
        </div>
        """

        damage = "Не обнаружено"

        comment = (
            "Явных дефектов не обнаружено."
        )

    info = (
        f"Уверенность: {confidence_percent}% | "
        f"Время: {elapsed} сек"
    )

    return (
        verdict,
        damage,
        comment,
        info
    )


with gr.Blocks(css=CSS) as demo:

    gr.Markdown(
        "# Детекция повреждений плодов по фото"
    )

    gr.Markdown(
        "Загрузите изображение фрукта или овоща."
    )

    with gr.Row():

        with gr.Column(scale=3):

            image_input = gr.Image(
                type="pil",
                label="Изображение"
            )

            analyze_button = gr.Button(
                "Анализировать"
            )

        with gr.Column(scale=2):

            result_output = gr.HTML(
                label="Вердикт"
            )

            damage_output = gr.Textbox(
                label="Тип повреждения"
            )

            comment_output = gr.Textbox(
                label="Комментарий"
            )

            info_output = gr.Textbox(
                label="Информация"
            )

    analyze_button.click(
        fn=gradio_predict,
        inputs=image_input,
        outputs=[
            result_output,
            damage_output,
            comment_output,
            info_output,
        ],
    )


if __name__ == "__main__":
    demo.launch(
        server_port=7861
    )