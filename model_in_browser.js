import {Math_model} from "./intertemporal_choice";

class Model_in_browser{
    /*
    * Составление математической модели в браузере 
    */
    constructor(canvas, text, m_1, m_2, rate) {
        /*
        *   Конструктор
        *   canvas -- элемент холст 
        *   text -- элемент текст для информации
        */
            this.canvas = canvas;
            this.context = canvas.getContext('2d');
            this.text = text;
            this.math_model = new Math_model(m_1, m_2, rate);
            this.make_graph();
        }

    make_graph(){
        /*
        * Рисуем график
        */
        // Заполняем белым цветом
        this.context.fillStyle = "#ffffff";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    

}
