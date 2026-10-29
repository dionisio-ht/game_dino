/*classe Abstrata (não existe uma palavra chave, apenas simulando
utilizando o new.target, que impede a instanciação de objetos 
e lança erros em métodos que precisam ser implementados pelas 
classes filhas)*/
class Objetogame {    
    constructor(x, y, largura, altura){
        if(new.target === Objetogame){
            throw new Error("Nao eh possivel gerar um objeto dessa classe!");
        }

        this.x = x;
        this.y = y;
        this.largura = largura;
        this.altura = altura;
    }
    
    desenhar(ctx) {
        throw new Error("Não é possivel realizar esse método com esse objeto!");
    }

    atualizar(){
        throw new Error("Não é possivel realizar esse método com esse objeto!");
    }
}

class Player extends Objetogame{
    constructor(x, y, largura, altura){
        super(x, y, largura, altura);
        this.yInicial = y;
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

    atualizar(){
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
        ctx.fillStyle = "#5a17a7";
        ctx.fillRect(this.x, this.y, this.largura, this.altura);
    }
}

class Obstaculo extends Objetogame{
    constructor(x, y, largura, altura, velocidade){
        super(x, y, largura, altura);
        this.velocidade = velocidade;
    }

    atualizar(){
        this.x -= this.velocidade;
    }

    desenhar(ctx){
        ctx.fillStyle = "#ff0202";
        ctx.fillRect(this.x, this.y, this.largura, this.altura);
    }
}

class Jogo{
    constructor(canvasId){
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.obstaculos = [];
        this.resetar();
        //this.startScreen = document.getElementById('startScreen');
        //this.gameOverScreen = document.getElementById('gameOverScreen');
        //this.escutarTeclas();
        //this.resetar();
    }

    escutarTeclas(){

    }

    resetar() {
        this.dino = new Player(50, 180, 30, 50);
        this.obstaculos = [];
        this.emExecucao = false;
        this.gameOver = false;
        this.evento10SegundosAtivado = false;
        this.tempo = 0;
        this.tempoObs = 0;
        this.score = 0;
        this.ultimotempo = 0;
        this.loop;

    }

    iniciar(){
        this.resetar();
        this.emExecucao = true;
        this.tempo = 0;
        this.ultimotempo = 0;
        /* "=>" é a abreviação de "function", além disso, 
        em casos de jogos, utilizar function faz com que 
        o JavaScript perdesse em algum momento o "this", 
        fazendo com que não reconhecesse o loop */ 
        requestAnimationFrame((timestamp) => this.loop(timestamp));
    }

    gerarObstaculo(temporizador){
        this.tempoObs += temporizador;
        if(this.tempoObs >= 0.5){
            this.tempoObs = 0;
            const alturaCacto = Math.floor(Math.random() * 20) + 30;
            const yCacto = 230 - alturaCacto;
            this.obstaculos.push(
                new Obstaculo(this.canvas.width, yCacto, 20, alturaCacto, 6)
            );
        }
    }

    loop(timestamp) {
    // Se o jogo parou, interrompe o loop
    if (!this.emExecucao) return;

    // Calcula o tempo decorrido entre os quadros
    if (this.ultimotempo === 0) {
        this.ultimotempo = timestamp;
    }

    const temporizador = Math.min((timestamp - this.ultimotempo) / 1000, 0.5);

    this.ultimotempo = timestamp;

    //atualizar contador de segundos
    this.tempo += temporizador;

    //Score: 10 Pontos por segundo
    this.score = Math.floor(this.tempo * 10);

        if (this.scoreElement) {
             this.scoreElement.textContent = `Score: ${this.score}`;
        }
    
    // Evento de exemplo: ocorre uma única vez aos 10 segundos
        if (this.tempo >= 10 && !this.evento10SegundosAtivado) {
            this.evento10SegundosAtivado = true;
            console.log("10 segundos! Evento ativado!");
        }

    this.gerarObstaculo(temporizador);

    //Limpa o canvas para desenhar o próximo quadro
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    //Atualiza e desenha o Player (Dino)
    if (this.dino) {
            this.dino.atualizar(); 
            this.dino.desenhar(this.ctx); 
        }

    for (const obstaculo of this.obstaculos){
        obstaculo.atualizar();
        obstaculo.desenhar(this.ctx);
    }
    
    this.obstaculos = this.obstaculos.filter(
            (obstaculo) => obstaculo.x + obstaculo.largura >= 0
    ); 

    //teste para ver se o Player esta pulando
    this.dino.pular();

    


    //Pede para o navegador rodar o próximo quadro da animação
    requestAnimationFrame((timestamp) => this.loop(timestamp));
  }
}

// Inicializa a instância do jogo quando a página carregar
window.onload = () => {
  const jogo = new Jogo("gameCanvas");
  jogo.iniciar();
};
