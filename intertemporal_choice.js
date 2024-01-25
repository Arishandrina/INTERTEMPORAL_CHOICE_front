export class Math_model{
    /*
    *   Описание математической модели, составление системы уравнений и ее решение 
    */
    constructor(m_1, m_2, rate){
        this.m1 = m_1; //Доход в первом периоде
        this.m2 = m_2; //Доход во втором периоде
        this.r = rate; //Ставка процента
    }

    find_optim_c(){
    /*
    *   Находим решение системы уравнений из максимизации полезности и бюджетного ограничения 
    */
        this.c1 = ((1 + this.r) * this.m1 + m2) / (3 * (1 + r));
        this.c2 = (2 * ((1 + this.r) * this.m1 + this.m2)) / 3;
    }

    check_lender_borrower(){
    /*
    *   Проверяем, являяется ли на данном этапе потребитель кредитором или заемщиком 
    */
        if (this.c1 < this.m1 && this.c2 > this.m2){
            return 'lender';
        } else {
            return 'borrower';
        }
    }
}

export class Game{
    constructor(){
        this.scores = 0;
    }

    new_game(){
    /*
    *   Новая игра, пользователь будет участвовать в 15 раундах 
    */



    }
}
