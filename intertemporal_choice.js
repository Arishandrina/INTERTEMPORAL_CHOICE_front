export class Math_model{
    /*
    *   Описание математической модели, составление системы уравнений и ее решение 
    */
    constructor(m_1, m_2, rate){
        this.m_1 = m_1; //Доход в первом периоде
        this.m_2 = m_2; //Доход во втором периоде
        this.r = rate; //Ставка процента
    }

    find_optim_c(){ //Находим решение системы уравнений из максимизации полезности и бюджетного ограничения 
        this.c1 = ((1 + this.r) * this.m_1 + this.m_2) / (3 * (1 + this.r));
        this.c2 = (2 * ((1 + this.r) * this.m_1 + this.m_2)) / 3;
    }

    check_lender_borrower(){ // Проверяем, являяется ли на данном этапе потребитель кредитором или заемщиком 
        this.find_optim_c();
        if (this.c1 < this.m_1 && this.c2 > this.m_2){
            return 'lender';
        } else {
            return 'borrower';
        }
    }
}
