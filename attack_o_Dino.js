class Player{
    constructor(x, y, largura, altura){
        this.x = x;
        this.y = y;
        this.yInicial = y;
        this.largura = largura;
        this.altura = altura;
        this.velocidadeY = 0;
        this.gravidade = 0.7;
        this.estaPulando = false;
    }

    pular(){
        if(!this.estaPulando){
            this.velocidadeY = -12;
            this.estaPulando = true;
        }
    }

    atualizarPular(){
        this.y += this.velocidadeY;

        if(this.y < this.yInicial){
            this.velocidadeY += this.gravidade
        } else {
            this.y = this.yInicial;
            this.velocidadeY = 0;
            this.estaPulando = false;
        }
    }

    desenhar(ctx){
        pass;
    }
}

class Jogo{
    constructor(canvasId){
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.startScreen = document.getElementById('startScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.escutarTeclas();
        this.resetar();
    }

    resetar() {
    this.dino = new Dino(50, 180, 30, 50);
    this.emExecucao = false;
    this.gameOver = false;
  }

}
