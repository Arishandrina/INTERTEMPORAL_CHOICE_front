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

        this.math_model = new Math_model(m_1, m_2, rate); //создаем объект класса
        this.math_model.find_optim_c(); //ищем оптимальную точку потребяления в обоих периодах

        this.make_graph(); // рисуем график 

        this.suitcase = document.getElementById('фото3'); //фото чемодана
        this.suitcase_x = 0;  // Начальная позиция чемодана (по с1)
        this.suitcase_y = 0;  // Начальная позиция чемодана (по с2)
        this.current_status = this.math_model.check_lender_borrower();

        this.place_suitcase(this.current_status); // Размещаем чемодан в начальной позиции

        this.animation_id = null;  // Инициализируем animation_id
        
    }

    updateGraph(m1, m2, r) {
    /*
    При впервые заданных значениях m1, m2, r или их изменении на ползунках обновляется график
    */
        this.math_model.m_1 = m1;
        this.math_model.m_2 = m2;
        this.math_model.r = r;
        this.make_graph();
    }

    make_graph() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); //очищаем холст
        this.ctx.fillStyle = '#fff3e6'; //устанавливаем его цвет
        this.ctx.fillRect(0, 0, canvas.width, canvas.height); //заливаем фон

        const axis = () => { 
            /*
            Функция рисует оси с1 и с2
            */
            this.ctx.lineWidth = 0.5; // ширина линий на графике - 0,5 пикселя
            //Oс1
            this.ctx.beginPath(); // запуск нового пути для рисования оси х
            this.ctx.strokeStyle = "black"; //ось х черного цвета
            this.ctx.moveTo(10, this.c_2Null); // перемещает «перо» в начальную точку оси с1
            this.ctx.lineTo(this.canvas.width - 5, this.c_2Null); //рисует линию до конечной точки оси с1
            this.ctx.closePath(); //заканчивает путь
            this.ctx.stroke(); // фактически рисует линию на холсте

            //Oс2 - аналогично
            this.ctx.beginPath();
            this.ctx.strokeStyle = "black";
            this.ctx.moveTo(this.c_1Null, 5);
            this.ctx.lineTo(this.c_1Null, this.canvas.height - 5);
            this.ctx.closePath();
            this.ctx.stroke();
        }

        const dashes = () => { //эта функция рисует черточки для каждого значения по осям с1 и с2
            //Oс1
            for (var c_1 = this.c_1Null; c_1 < this.canvas.width; c_1 += 50) { //пока не дошли до конца линии оси, делаем черточки с шагом в 50px
                this.ctx.beginPath(); // начинаем путь для рисования вдоль значений по оси с1
                this.ctx.moveTo(c_1, this.c_2Null); //берем точку на оси с1
                this.ctx.lineTo(c_1, this.c_2Null + 2); //рисуем линию вниз на 2 px
                this.ctx.closePath(); //заканчивает путь
                this.ctx.stroke(); //прорисовывает линию на графие 
            }

            //Oс2 - аналогично 
            for (var c_1 = this.canvas.height - 15; c_1 > 0; c_1 -= 50) {
                this.ctx.beginPath();
                this.ctx.moveTo(this.c_1Null - 5, c_1);
                this.ctx.lineTo(this.c_1Null, c_1);
                this.ctx.closePath();
                this.ctx.stroke();
            }
        }

        const label_axis = () => { 
            /*
            Функция рисует метки для осей X и Y на основе заданных значений перевода и размера
            */
            this.ctx.font = "10px Verdana"; // устанавливаем размер и стиль текста
            this.ctx.fillStyle = "#000000"; // устанавливаем цвет текста 
            for (var c_1 = 0; c_1 < this.canvas.width; c_1 += 50) { // циклом идем по оси с1 с шагом в 50 пикселей
                if (c_1 != 0) { //не пишем на оси значение 0
                    this.ctx.fillText(c_1 * 4, c_1 + 20, this.canvas.height - 2);
                    // значения располагаются относительно центра холста с учетом небольшого смещения для лучшей читаемости графика
                }
            }

            // аналогино для оси с2
            for (var c_2 = 0; c_2 < this.canvas.width; c_2 += 50) { // циклом идем по оси с2 с шагом в 50 пикселей
                if (c_2 != 0) { // не пишем на графике значение 0
                    this.ctx.fillText(c_2 * 4, 3, this.canvas.height - 12 - c_2);
                }
            }

            this.ctx.font = "bold 10px Verdana"; // делаем шрифт жирным
            // Добавляем подписи осей
            this.ctx.fillText('с1', this.canvas.width - 20, this.c_2Null - 10); // с1 внизу справа
            this.ctx.fillText('с2', this.c_1Null - 18, 13); // с2 слева вверху
            this.ctx.font = "10px Verdana"; // возвращаем шрифт к обычному 
        }

        const plot = () => {
            /*
            Рисуем линии на графике: межвременное бюджетное ограничение и функцию полезности
            */
            // Точка с координатами (с1_1, с2_1) - точка пересечения линии бюджетного ограничения с осью с2
            // Точка с координатами (с1_2, с2_2) - точка пересечения линии бюджетного ограничения с осью с1
            const с1_1 = this.c_1Null;
            const с2_1 = this.c_2Null - (this.math_model.m_2 + this.math_model.m_1 * (1 + this.math_model.r)) / 4; //делим на 4 для соблюдения масштаба
            const с1_2 = this.c_1Null + (this.math_model.m_1 + this.math_model.m_2 / (1 + this.math_model.r)) / 4;
            const с2_2 = this.c_2Null;

            this.ctx.beginPath();
            this.ctx.moveTo(с1_1, с2_1); // Перемещаемся в первую точку
            this.ctx.lineTo(с1_2, с2_2); // Рисуем линию до второй точки
            this.ctx.strokeStyle = "#FF0000"; //Красный цвет бюджетного ограничения
            this.ctx.stroke();
            this.ctx.closePath();

            //График функции ln(c1) + 2ln(c2)
            this.ctx.beginPath();
            this.ctx.strokeStyle = "#0000FF"; // Синий цвет для функции полезности

            // Находим точку касания
            this.math_model.find_optim_c();
            const touch_c1 = this.math_model.c1 / 4; //делим на 4 для масштабирования
            const touch_c2 = this.math_model.c2 / 4;
            const utility = Math.log(touch_c1) + 2 * Math.log(touch_c2); // считаем полезность по точкам с1 и с2

            // Рисуем кривую безразличия
            for (let c1 = 0.1; c1 <= с1_2 + 30; c1 += 0.1) { // такие границы, чтобы кривая безразличия была приблизительно над бюджетным ограничением
                //линии не уходят сильно дальше друг друга
                const c2 = Math.exp((utility - Math.log(c1)) / 2); // Решаем ln(с1) + 2ln(с2) = utility относительно с2
                if (this.c_2Null - c2 >= с2_1 - 20) { // Делаем красивую отрисовку, чтобы линия бюджетной линии не уходила высоко к оси с2
                    // Вычисляем y из уравнения ln(c1) + 2ln(c2) = const
                    // const = ln(touch_c1) + 2ln(touch_c2)

                    const final_c1 = this.c_1Null + c1; //Сдвигаем точки с учетом координат центра
                    const final_c2 = this.c_2Null - c2;

                    // Пропускаем точки, которые выходят за границы холста
                    if (final_c1 > 0 && final_c2 < this.canvas.height) {
                        if (c1 === 0.1) { // проверка на то, не уходит ли график в бесконечность вдоль оси с2
                            this.ctx.moveTo(final_c1, final_c2); // если да, то начинаем рисовать от этой линии
                        } else {
                            this.ctx.lineTo(final_c1, final_c2); //иначе рисуем до этой линии
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
            const touchX = this.math_model.c1 / 4; //делим на 4 для масшатбирования
            const touchY = this.math_model.c2 / 4;

            // Координаты точки касания с учетом центра координат в данной модели
            const final_touchX = this.c_1Null + touchX; 
            const final_touchY = this.c_2Null - touchY;

            this.ctx.setLineDash([5, 5]); // устанавливаем пунктирный стиль линии

            // Линия от оси с1 к точке касания
            this.ctx.beginPath();
            this.ctx.moveTo(final_touchX, this.c_2Null); //начинаем от самой точки
            this.ctx.lineTo(final_touchX, final_touchY); //опускаемся на ось с1
            this.ctx.strokeStyle = "#000000"; // черный цвет линий
            this.ctx.stroke();
            this.ctx.closePath();

            // Линия от оси с2 к точке касания
            this.ctx.beginPath();
            this.ctx.moveTo(this.c_1Null, final_touchY);
            this.ctx.lineTo(final_touchX, final_touchY);
            this.ctx.stroke();
            this.ctx.closePath();

            // Отобразим координаты точки касания в круглых скобках рядом с точкой
            this.ctx.font = "10px Verdana"; //установили размер и шрифт
            this.ctx.fillStyle = "#0000FF"; // Синий цвет для бюджетной линии
            const value = `(${Math.round(touchX * 4)}, ${Math.round(touchY * 4)})`; // строка с координатами в скобках

            this.ctx.fillText(value, final_touchX + 5, final_touchY - 5); //текст выводится справа от точки касания с отступом 5 пикселей

            this.ctx.setLineDash([]); // возвращаем сплошной стиль линии
        }

        const dotted_stock = () => {
            /*
            Отображение точки (m1, m2) - точка запасов, с которой происходит сравнение оптимальной (c1,c2) для определения текущего статуса (кредитор, заемщик)
            */

            // Находим координаты (m1, m2) с учетом масштабировнаия и сдвига начала координат
            const stockX = this.c_1Null + this.math_model.m_1 / 4; 
            const stockY = this.c_2Null - this.math_model.m_2 / 4;

            this.ctx.setLineDash([5, 5]); // устанавливаем пунктирный стиль линии

            // Линия от оси с1 к точке запасов
            this.ctx.beginPath();
            this.ctx.moveTo(stockX, this.c_2Null); //от точки на оси с1
            this.ctx.lineTo(stockX, stockY); //поднимаемся вверх к точке (m1, m2)
            this.ctx.strokeStyle = "#000000"; // черный цвет линий
            this.ctx.stroke();
            this.ctx.closePath();

            // Линия от оси с2 к точке запасов - аналогично
            this.ctx.beginPath();
            this.ctx.moveTo(this.c_1Null, stockY);
            this.ctx.lineTo(stockX, stockY);
            this.ctx.stroke();
            this.ctx.closePath();

            this.ctx.setLineDash([]); // возвращаем сплошной стиль линии

            // Подпись координат точки
            this.ctx.font = "10px Verdana"; //устанавливаем размер и шрифт
            this.ctx.fillStyle = "#FF0000"; // красный цвет для подписи  координат
            const stockLabel = `(${Math.round(this.math_model.m_1)}, ${Math.round(this.math_model.m_2)})`; // строка с координатами в скобках
            this.ctx.fillText(stockLabel, stockX + 5, stockY - 5); //текст выводится справа от точки касания с отступом 5 пикселей

        }

        const set_status = () => {
        /*
        Определяем текущий статус агента и выводим в нужное поле
        */
            const status = this.math_model.check_lender_borrower(); // проверяем текущий статус в модели this.math_model
            if (status == 'borrower') {
                document.getElementById("button3_sec").innerHTML = "ЗАЕМЩИК";
            } else {
                document.getElementById("button3_sec").innerHTML = "КРЕДИТОР";
            }
        }

        // Вызываем все функции при вызове метода make_graph()
        axis();
        dashes();
        label_axis();
        plot();
        dotted_optimum();
        set_status();
        dotted_stock();
    }

    place_suitcase(status) {
        /*
        Устанавливаем первоначальное местоположение чемодана
        */
        if (status == 'borrower') { //если статус - заемщик, чемодан необходимо установить рядом с девочкой
            // Координаты более близкие к координатам девочки
            this.suitcase_x = 150;
            this.suitcase_y = 651;
        } else { // иначе чемодан у банка
            this.suitcase_x = 760;
            this.suitcase_y = 651;
        }
        this.suitcase.style.left = this.suitcase_x + 'px'; // устанавливаем местоположение по пикселям
        this.suitcase.style.top = this.suitcase_y + 'px';
    }

    move_suitcase(new_status) {
        /*
        Двигаем чемодан влево-вправо при изменении статуса на new_status
        */
        clearInterval(this.animation_id); // Останавливаем предыдущую анимацию, если она есть

        if (this.suitcase_y !== 651) {  // Сбрасываем позицию чемодана в исходное состояние, если он улетел
            this.suitcase_y = 651; //его первоначальное положение в соответствии со стилем top
            this.suitcase.style.top = this.suitcase_y + 'px';
        }

        let target_x; //определяем, куда должен уехать чемодан
        if (new_status == 'borrower') { //если стал заемщиком
            target_x = 150;   // то чемодан едет к девочке (налево)
        } else {
            target_x = 760;   // иначе чемодан к едет банку (направо)
        }

        this.animation_id = setInterval(() => { // чемодан двигается к противоположному концу картинки
            if (Math.abs(this.suitcase_x - target_x) < 1) { // проверяем, достиг ли чемодан целевые коордианты
                clearInterval(animation); // если да, то останавливаем анимацию
                this.suitcase_x = target_x; // перезаписываем новые координаты чемодана
                this.animation_id = null; // Сбрасываем animation_id после окончания анимации
            } else {
                this.suitcase_x += 0.1 * (target_x - this.suitcase_x); // если чемодан еще не пришел к цели, нужно его немного сдвинуть в сторону цели
            }
            this.suitcase.style.left = this.suitcase_x + 'px'; // обновляем позицию на странице
        }, 8); // его передвижение выполняется за 8 милисекунд
    }

    jump_suitcase() {
        /*
        Чемодан прыгает при отстутсвия изменения статуса 
        */
        clearInterval(this.animation_id); // останавливаем предыдущую анимацию, если она есть

        if (this.suitcase_y !== 651) { // Возвращаем чемодан в исходную позицию, если он улетел
            this.suitcase_y = 651; // его первонавчальное полшожение по оси у (вверх-вниз)
            this.suitcase.style.top = this.suitcase_y + 'px'; // отображаем на странице
        }

        const orig_y = this.suitcase_y; // изначальное положение чемодана по оси у
        let direction = -1; // направление прыжка чемодана

        this.animation_id = setInterval(() => { // чемодан делает прыжок
            this.suitcase_y += direction * 2; // 
            this.suitcase.style.top = this.suitcase_y + 'px';

            if (this.suitcase_y <= orig_y - 25) {
                direction = 1;
            } else if (this.suitcase_y >= orig_y) {
                clearInterval(this.animation_id);
                this.suitcase_y = orig_y;
            }
        }, 15); //все длится 15 милисекунд
    }

    updateVal() {
        /*
        
        */
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

        // Обновляем график
        const prev = this.math_model.check_lender_borrower();

        temp_choice_model.updateGraph(parseFloat(val_m1), parseFloat(val_m2), parseFloat(val_r));

        // Обновляем current_status здесь
        this.current_status = this.math_model.check_lender_borrower();

        let status;
        var latex_4 = ``;
        var latex_5 = ``;
        var latex_6 = ``;
        var latex_7 = ``;
        var latex_8 = ``;
        var latex_9 = ``;
        var latex_10 = ``;
        if (this.current_status == 'borrower') {
            status = 'заемщиком';
        } else {
            status = 'кредитором';
        }
        latex_4 = `Почему агент является ${status}? <br> <br>`;
        latex_5 = `Для этого необходимо сравнить значения потребления в двух периодах и доходы: </br>`;

        if (c1_star < val_m1) {
            latex_6 = "$$\\text{Оптимальное значение } c_{1} < m_{1} \\text{ и } c_{2} > m_{2}. \\text{Агент}$$";
            latex_7 = "$$\\text{предпочитает меньше потребить в текущем периоде,}$$";
            latex_8 = "$$\\text{положить деньги в банк, а в следующем периоде}$$";
            latex_9 = "$$\\text{ пользоваться отложенными под процент средствами.}$$";
            latex_10 = "$$ \\text{ Таким образом, текущий статус - кредитор}$$";


        } else {
            latex_6 = "$$\\text{Оптимальное значение } c_{1} > m_{1} \\text{ и } c_{2} < m_{2}. \\text{Агент} $$";
            latex_7 = "$$\\text{предпочитает больше потребить в текущем периоде,}$$";
            latex_8 = "$$ \\text{для этого он пользуется текущим доходом, а также берет}$$";
            latex_9 = "$$ \\text{в кредит под процент, который будет возвращать в }$$";
            latex_10 = "$$ \\text{следующем периоде. Текущий статус - заемщик}$$";
        }

        // Обновляем содержимое span с помощью LaTeX строки
        document.getElementById("figure_1").innerHTML = latex_1;
        document.getElementById("figure_2").innerHTML = latex_2;
        document.getElementById("figure_3").innerHTML = latex_3;
        document.getElementById("figure_4").innerHTML = latex_4;
        document.getElementById("figure_5").innerHTML = latex_5;
        document.getElementById("figure_6").innerHTML = latex_6;
        document.getElementById("figure_7").innerHTML = latex_7;
        document.getElementById("figure_8").innerHTML = latex_8;
        document.getElementById("figure_9").innerHTML = latex_9;
        document.getElementById("figure_10").innerHTML = latex_10;


        // Запускаем MathJax для перекомпиляции
        MathJax.typesetPromise();

        if (this.current_status != prev) { // Статус изменился, перемещаем чемодан
            this.move_suitcase(this.current_status);
        } else { // Статус не изменился, чемодан подпрыгивает
            this.jump_suitcase();
        }
        MathJax.typesetPromise().then(() => {
            animateTextLines("why_status"); // Анимируем текст
        });
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
        MathJax.typeset();

    });
});



document.getElementById('Начатьигру').onclick = function () {
    window.location.href = './index3.html';
};

function animateTextLines(elementId, delay = 200) {
    const element = document.getElementById(elementId);  // Находим элемент по id
    const lines = element.querySelectorAll('.animated-line');  // Находим все строки внутри элемента
    lines.forEach((line, index) => {
        setTimeout(() => {
            line.style.opacity = 1;
        }, index * delay);
    });
}

// В вашем коде, после того как текст добавлен в DOM и MathJax обработал формулы, вызовите:
animateTextLines();
