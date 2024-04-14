import { Math_model } from "./intertemporal_choice";


class Model_in_browser {
    /*
    * Составление математической модели в браузере 
    */
    constructor(m_1, m_2, rate, canvas) {
        /*
        *   Конструктор
        *   canvas -- элемент холст 
        *   text -- элемент текст для информации
        */
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.ctx = canvas.getContext('2d');

        //Зададим размер поля
        this.canvas.width = 700;
        this.canvas.height = 700;

        //Переменные для хранения координат х и н
        var c_1;
        var c_2;

        //Центральная точка холста находится в нижнем левом углу
        this.c_1Null = 50;
        this.c_2Null = this.canvas.height - 50;

        this.size = 10; // начальный размер графика

        this.math_model = new Math_model(m_1, m_2, rate);

        // сдвиг самого графика по осям х и у
        this.transferFunc_m_1 = this.math_model.m_1;
        this.transferFunc_m_2 = this.math_model.m_2;
        this.transferFunc_r = this.math_model.r;

        this.make_graph(); // рисуем график
    }

    make_graph() {
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(0, 0, 2*this.canvas.width, 2*this.canvas.height);
        const labelAxis = () => { //эта функция рисует метки для осей X и Y на основе заданных значений перевода и размера
            // size - коэффициент масштабирования, применяемый к графику

            this.ctx.strokeStyle = "black"; // Метки черного цвета
            this.ctx.lineWidth = 1; // толщина текста - 1 пиксель
            for (var c_1 = 0; c_1 < this.canvas.width; c_1 += 50) { // циклом идем по оси х с шагом в 50 пикселей
                label_c_1 = c_1 * 0.1; //Умножение x на 0,1 уменьшает значения в 10 раз (при каждых 50 пикселях по оси x значение метки 
                //увеличивается на 5 (50 * 0,1 = 5))
                if (label_c_1 != 0) {
                    this.ctx.strokeText((label_c_1 / (this.size * 0.1)), 45 + c_1, (this.canvas.height - 50) + 15);
                    // делим на (size * 0.1), что точки соответствовали правильным значениям, учитывая масштаб
                    // значения располагаются относительно центра холста с учетом небольшого смещения для лучшей читаемости графика
                }
            }

            // аналогино для оси y
            for (var c_2 = 0; c_2 < this.canvas.width; c_2 += 50) { // циклом идем по оси у с шагом в 50 пикселей
                label_c_2 = c_2 * 0.1;
                if (label_c_2 != 0) { // не пишем на графике значение 0
                    this.ctx.strokeText((label_c_2 / (this.size * 0.1)), 25, (this.canvas.height - 45) - c_2);
                }
            }
        }

        const axis = () => { //эта функция рисует оси X и Y с указанным перемещением, размером и поворотом
            this.ctx.lineWidth = 2; // ширина линий на графике - 2 пикселя
            //OX
            this.ctx.beginPath(); // запуск нового пути для рисования оси х
            this.ctx.strokeStyle = "black"; //ось х черного цвета
            this.ctx.moveTo(0, (this.canvas.height - 50)); // перемещает «перо» в начальную точку оси х
            this.ctx.lineTo(this.canvas.width, (this.canvas.height - 50)); //рисует линию до конечной точки оси х
            this.ctx.closePath();
            this.ctx.stroke(); // фактически рисует линию на холсте 
            //OY - аналогично
            this.ctx.beginPath();
            this.ctx.strokeStyle = "black";
            this.ctx.moveTo(50, 0);
            this.ctx.lineTo(50, this.canvas.height);
            this.ctx.closePath();
            this.ctx.stroke();
        }

        const dashes = () => { //эта функция рисует черточки для каждого значения по осям х и у
            //OY
            for (var c_1 = 50; c_1 < this.canvas.width; c_1 += 50) {
                this.ctx.beginPath(); // начинаем путь для рисования вдоль значений по оси х
                this.ctx.strokeStyle = "black";
                this.ctx.moveTo(c_1, this.canvas.height - 50);
                this.ctx.lineTo(c_1, this.canvas.height - 50 + 5);
                this.ctx.closePath();
                this.ctx.stroke();
            }

            //OX
            for (var c_1 = this.canvas.height - 50; c_1 > 0; c_1 -= 50) {
                this.ctx.beginPath();
                this.ctx.strokeStyle = "black";
                this.ctx.moveTo(45, c_1);
                this.ctx.lineTo(45 + 5, c_1);
                this.ctx.closePath();
                this.ctx.stroke();
            }
        }

        //Вызовем определенные выше функции для рисования графика с осями, сеткой, метками и самой функцией

        labelAxis();
        dashes();
        axis();
        plot();

        const plot = () => { //Эта функция строит параметрическое уравнение, 
            //вычисляя координаты x и y для различных значений параметра t, применяя сдвиг, 
            //масштабирование и вращение, а затем рисуя линии, соединяющие эти точки.
            var c_1;
            var c_2;
            this.ctx.beginPath();
            this.ctx.moveTo(this.c_1Null, this.c_2Null - ((1 + this.transferFunc_r) * this.transferFunc_m_1 + this.transferFunc_m_2));
            this.ctx.lineTo(this.transferFunc_m_1 + this.transferFunc_m_2 / (1 + this.transferFunc_r), this.c_2Null);
            this.ctx.strokeStyle = "#FF0000";
            this.ctx.stroke();
            this.ctx.closePath();

        }

        //Эти строки извлекают ссылки на элементы HTML, которые позволяют пользователям вводить значения для перевода, 
        // масштабирования и вращения. Затем он добавляет прослушиватель событий, который срабатывает при каждом изменении любого 
        // из этих входных значений. Внутри прослушивателя событий холст очищается, и функции рисования вызываются снова 
        // с обновленными значениями из элементов пользовательского ввода, таким образом перерисовывая график с новыми преобразованиями.

        this.transferFunc_m_1 = document.getElementById("FUNCM1");
        this.transferFunc_m_2 = document.getElementById("FUNCM2");
        this.transferFunc_r = document.getElementById("FUNCR");
        this.size = document.getElementById("SIZE");

        addEventListener("input", function () {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            labelAxis();
            dashes();
            axis();
            plot();
        }, false);

    }
}

var temp_choice_model;
const canvas = document.getElementById('canvas'); // Получаем элемент холст по идентификатору

document.getElementById('start').onclick = function() {
    let m_1 = parseInt(document.getElementById('m1').value); // Читаем m1
    let m_2 = parseInt(document.getElementById('m2').value); // Читаем m2
    let r = parseInt(document.getElementById('r').value); // Читаем r

    localStorage.setItem('pi', m_1);
    temp_choice_model = new Model_in_browser(m_1, m_2, r, canvas); // Запускаем модель
  };
