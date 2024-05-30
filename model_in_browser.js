import { Math_model } from "./intertemporal_choice.js";

export class Model_in_browser {
    /*
    * Составление математической модели в браузере 
    */
    constructor(сanvas, text, m_1, m_2, rate) {
        /*
        *   Конструктор
        *   canvas -- элемент холст 
        *   text -- элемент текст для информации
        */
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.text = text;
        this.ctx = this.canvas.getContext('2d');

        //Центральная точка холста находится в нижнем левом углу
        this.c_1Null = 35;
        this.c_2Null = this.canvas.height - 15;

        this.math_model = new Math_model(m_1, m_2, rate);
        this.math_model.find_optim_c();

        this.make_graph(); // рисуем график

        this.suitcase = document.getElementById('фото3'); //фото чемодана
        this.suitcase_x = 0;  // Начальная позиция чемодана (по x)
        this.suitcase_y = 0;  // Начальная позиция чемодана (по y)
        this.current_status = this.math_model.check_lender_borrower();

        this.place_suitcase(this.current_status); // Размещаем чемодан в начальной позиции

        this.animation_id = null;  // Инициализируем animation_id
    }

    updateGraph(m1, m2, r) {
        this.math_model.m_1 = m1;
        this.math_model.m_2 = m2;
        this.math_model.r = r;
        this.make_graph();
    }

    make_graph() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#fff3e6';
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);

        const axis = () => { //эта функция рисует оси X и Y с указанным перемещением, размером и поворотом
            this.ctx.lineWidth = 0.5; // ширина линий на графике - 2 пикселя
            //OX
            this.ctx.beginPath(); // запуск нового пути для рисования оси х
            this.ctx.strokeStyle = "black"; //ось х черного цвета
            this.ctx.moveTo(10, this.c_2Null); // перемещает «перо» в начальную точку оси х
            this.ctx.lineTo(this.canvas.width - 5, this.c_2Null); //рисует линию до конечной точки оси х
            this.ctx.closePath();
            this.ctx.stroke(); // фактически рисует линию на холсте

            //OY - аналогично
            this.ctx.beginPath();
            this.ctx.strokeStyle = "black";
            this.ctx.moveTo(this.c_1Null, 5);
            this.ctx.lineTo(this.c_1Null, this.canvas.height - 5);
            this.ctx.closePath();
            this.ctx.stroke();
        }

        const dashes = () => { //эта функция рисует черточки для каждого значения по осям х и у
            //OX
            for (var c_1 = this.c_1Null; c_1 < this.canvas.width; c_1 += 50) {
                this.ctx.beginPath(); // начинаем путь для рисования вдоль значений по оси х
                this.ctx.moveTo(c_1, this.c_2Null);
                this.ctx.lineTo(c_1, this.c_2Null + 2);
                this.ctx.closePath();
                this.ctx.stroke();
            }

            //OY
            for (var c_1 = this.canvas.height - 15; c_1 > 0; c_1 -= 50) {
                this.ctx.beginPath();
                this.ctx.moveTo(this.c_1Null - 5, c_1);
                this.ctx.lineTo(this.c_1Null, c_1);
                this.ctx.closePath();
                this.ctx.stroke();
            }
        }

        const labelAxis = () => { //эта функция рисует метки для осей X и Y на основе заданных значений перевода и размера
            this.ctx.font = "10px Verdana";
            this.ctx.fillStyle = "#000000";
            for (var c_1 = 0; c_1 < this.canvas.width; c_1 += 50) { // циклом идем по оси х с шагом в 50 пикселей
                if (c_1 != 0) {
                    this.ctx.fillText(c_1 * 4, c_1 + 20, this.canvas.height - 2);
                    // значения располагаются относительно центра холста с учетом небольшого смещения для лучшей читаемости графика
                }
            }

            // аналогино для оси y
            for (var c_2 = 0; c_2 < this.canvas.width; c_2 += 50) { // циклом идем по оси у с шагом в 50 пикселей
                if (c_2 != 0) { // не пишем на графике значение 0
                    this.ctx.fillText(c_2 * 4, 3, this.canvas.height - 12 - c_2);
                }
            }
        }

        const plot = () => {
            // Расчет координат точек с учетом масштабирования графика
            const x1 = this.c_1Null;
            const y1 = this.c_2Null - (this.math_model.m_2 + this.math_model.m_1 * (1 + this.math_model.r)) / 4;
            const x2 = this.c_1Null + (this.math_model.m_1 + this.math_model.m_2 / (1 + this.math_model.r)) / 4;
            const y2 = this.c_2Null;

            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1); // Перемещаемся в первую точку
            this.ctx.lineTo(x2, y2); // Рисуем линию до второй точки
            this.ctx.strokeStyle = "#FF0000";
            this.ctx.stroke();
            this.ctx.closePath();

            //График функции ln(c1) + 2ln(c2)
            this.ctx.beginPath();
            this.ctx.strokeStyle = "#0000FF"; // Синий цвет для кривой безразличия

            // Находим точку касания
            this.math_model.find_optim_c();
            const touch_x = this.math_model.c1 / 4;
            const touch_y = this.math_model.c2 / 4;
            const utility = Math.log(touch_x) + 2 * Math.log(touch_y);

            // Рисуем кривую безразличия
            for (let x = 0.1; x <= x2 + 30; x += 0.1) {
                const y = Math.exp((utility - Math.log(x)) / 2); // Решаем ln(с1) + 2ln(с2) = utility относительно с2
                if (this.c_2Null - y >= y1 - 20) { // Делаем красивую отрисовку, чтобы линия бюджетной линии не уходила высоко к оси с2
                    // Вычисляем y из уравнения ln(x) + 2ln(y) = const
                    // const = ln(touchX) + 2ln(touchY)

                    const final_x = this.c_1Null + x; //Сдвигаем точки с учетом координат центра
                    const final_y = this.c_2Null - y;

                    // Пропускаем точки, которые выходят за границы холста
                    if (final_x > 0 && final_y < this.canvas.height) {
                        if (x === 0.1) {
                            this.ctx.moveTo(final_x, final_y);
                        } else {
                            this.ctx.lineTo(final_x, final_y);
                        }
                    }
                }
            }
            this.ctx.stroke();
            this.ctx.closePath();
        }

        const dotted_optimum = () => {
            // Находим точку касания
            this.math_model.find_optim_c();
            const touchX = this.math_model.c1 / 4;
            const touchY = this.math_model.c2 / 4;

            const final_touchX = this.c_1Null + touchX;
            const final_touchY = this.c_2Null - touchY;

            // Устанавливаем пунктирный стиль линии
            this.ctx.setLineDash([5, 5]);

            // Линия от оси X к точке касания
            this.ctx.beginPath();
            this.ctx.moveTo(final_touchX, this.c_2Null);
            this.ctx.lineTo(final_touchX, final_touchY);
            this.ctx.strokeStyle = "#000000"; // Черный цвет линий
            this.ctx.stroke();
            this.ctx.closePath();

            // Линия от оси Y к точке касания
            this.ctx.beginPath();
            this.ctx.moveTo(this.c_1Null, final_touchY);
            this.ctx.lineTo(final_touchX, final_touchY);
            this.ctx.stroke();
            this.ctx.closePath();

            // Координаты точки касания в круглых скобках
            this.ctx.font = "10px Verdana";
            this.ctx.fillStyle = "#000000";
            const value = `(${Math.round(touchX * 4)}, ${Math.round(touchY * 4)})`;

            // Выводим текст справа от точки касания
            this.ctx.fillText(value, final_touchX + 5, final_touchY - 5); //текст выводится справа от точки касания с отступом 5 пикселей

            // Возвращаем сплошной стиль линии
            this.ctx.setLineDash([]);
        }

        const set_status = () => {
            const status = this.math_model.check_lender_borrower();
            if (status == 'borrower') {
                document.getElementById("button3_sec").innerHTML = "BORROWER";
            } else {
                document.getElementById("button3_sec").innerHTML = "LENDER";
            }
        }

        axis();
        dashes();
        labelAxis();
        plot();
        dotted_optimum();
        set_status();
    }

    place_suitcase(status) {
        if (status == 'borrower') {
            // Чемодан у девочки
            this.suitcase_x = 150;
            this.suitcase_y = 651;
        } else {
            // Чемодан у банка
            this.suitcase_x = 760;
            this.suitcase_y = 651;
        }
        this.suitcase.style.left = this.suitcase_x + 'px';
        this.suitcase.style.top = this.suitcase_y + 'px';
    }
    move_suitcase(current_status) {
        clearInterval(this.animation_id); // Очищаем предыдущую анимацию
        let target_x;
        if (current_status == 'borrower') {
            target_x = 150;   // Чемодан к девочке (слева)
        } else {
            target_x = 760;   // Чемодан к банку (справа)
        }

        this.animation_id = setInterval(() => { // чемодан двигается к противоположному концу картинки
            if (Math.abs(this.suitcase_x - target_x) < 1) {
                clearInterval(animation);
                this.suitcase_x = target_x;
            } else {
                this.suitcase_x += 0.1 * (target_x - this.suitcase_x);
            }
            this.suitcase.style.left = this.suitcase_x + 'px';
        }, 20);
    }

    jump_suitcase() {
        clearInterval(this.animation_id); // Очищаем предыдущую анимацию
        const orig_y = this.suitcase_y;
        let direction = -1;

        this.animation_id = setInterval(() => { // чемодан делает прыжок
            this.suitcase_y += direction * 2;
            this.suitcase.style.top = this.suitcase_y + 'px';

            if (this.suitcase_y <= orig_y - 25) {
                direction = 1;
            } else if (this.suitcase_y >= orig_y) {
                clearInterval(this.animation_id);
                this.suitcase_y = orig_y;
            }
        }, 20);
    }

    updateVal() {
        var val_m1 = document.getElementById("FUNCM1").value;
        var val_m2 = document.getElementById("FUNCM2").value;
        var val_r = document.getElementById("FUNCR").value / 100;

        // Собираем LaTeX строку с обновленным значением
        var latex_1 = `\\begin{cases}
        \\max_{c1, c2 \\geq 0} ln(c_{1}) + 2 ln(c_{2})\\\\
        s.t. (1+${val_r})c_{1} + c_{2} = (1+${val_r})${val_m1} + ${val_m2}
        \\end{cases}`;

        var latex_2 = `\\begin{cases}
        c_2 = 2c_1(1+r)\\\\
        (1+r)c_{1} + c_{2} = (1+r)m_{1} + m_{2}
        \\end{cases}`;

        const c1_star = val_m1 / 3 + val_m2 / (3 * (1 + val_r));
        const c2_star = 2 * val_m1 / 3 + 2 * val_m1 * val_r / 3 + 2 * val_m2 / 3;

        var latex_3 = `\\begin{cases}
        c_1^* = \\dfrac{(1+r)m_1 + m_2}{3(1+r)} = \\dfrac{(1+${val_r})${val_m1} + ${val_m2}}{3(1+${val_r})} = ${Math.round(c1_star)}\\\\
        c_2^* = \\dfrac{2}{3} ((1+r)m_{1} + m_{2}) = \\dfrac{2}{3} ((1+${val_r})${val_m1} + ${val_m2}) = ${Math.round(c2_star)}
        \\end{cases}`;

        // Обновляем содержимое span с помощью LaTeX строки
        document.getElementById("figure_1").innerHTML = latex_1;
        document.getElementById("figure_2").innerHTML = latex_2;
        document.getElementById("figure_3").innerHTML = latex_3;

        // Запускаем MathJax для перекомпиляции
        MathJax.typesetPromise();

        // Обновляем график
        const prev = this.math_model.check_lender_borrower();

        temp_choice_model.updateGraph(parseFloat(val_m1), parseFloat(val_m2), parseFloat(val_r));

        const current_status = this.math_model.check_lender_borrower();

        if (current_status != prev) { // Статус изменился, перемещаем чемодан
            this.move_suitcase(current_status);
        } else { // Статус не изменился, чемодан подпрыгивает
            this.jump_suitcase();
        }

    }

}

var temp_choice_model;
const canvas = document.getElementById('canvas'); // Получаем элемент холст по идентификатору
const text = document.getElementById('text');
const sliderM1 = document.getElementById("FUNCM1");
const sliderM2 = document.getElementById("FUNCM2");
const sliderR = document.getElementById("FUNCR");

document.getElementById('start').onclick = function () {
    var imported1 = parseFloat(document.getElementById('m1_first').value);
    var imported2 = parseFloat(document.getElementById('m2_first').value);
    var imported3 = parseFloat(document.getElementById('r_first').value);

    // Передаем значение в ползунок
    var sliderM1 = document.getElementById("FUNCM1");
    sliderM1.value = imported1;

    // Обновляем отображаемое значение ползунка
    var outputM1 = document.getElementById("imported1");
    outputM1.innerHTML = sliderM1.value;

    var sliderM2 = document.getElementById("FUNCM2");
    sliderM2.value = imported2;

    var outputM2 = document.getElementById("imported2");
    outputM2.innerHTML = sliderM2.value;

    var sliderR = document.getElementById("FUNCR");
    sliderR.value = imported3;

    var outputR = document.getElementById("imported3");
    outputR.innerHTML = sliderR.value;

    document.getElementById('страница1').hidden = true;
    document.getElementById('страница2').style.display = "block";

    // Создаем объект Model_in_browser один раз
    temp_choice_model = new Model_in_browser(canvas, text, imported1, imported2, imported3 / 100);
    temp_choice_model.updateVal();
};

[sliderM1, sliderM2, sliderR].forEach(slider => {
    slider.addEventListener("mouseup", () => { // Вызываем updateVal только после того, как отпустили ползунок 
        temp_choice_model.updateVal();
    });
});
