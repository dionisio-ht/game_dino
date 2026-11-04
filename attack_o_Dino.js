import { sprite_player } from "./constantes.js";

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

    pegarImagem(){
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
        this.sprite = this.pegarImagem(sprite_player);
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
        //ctx.fillStyle = "#5a17a7";
        //ctx.fillRect(this.x, this.y, this.largura, this.altura);
        ctx.drawImage(this.sprite, this.x, this.y, this.largura, this.altura);
    }

    pegarImagem(caminho){
        const imagem = new Image()
        imagem.src = caminho;
        return imagem;
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
        this.startScreen = document.getElementById('startScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.resetar();
        this.escutarTeclas();
    }

    resetar() {
        this.dino = new Player(50, 192, 49, 38);
        this.obstaculos = [];
        this.emExecucao = false;
        this.gameOver = false;
        this.evento10SegundosAtivado = false;
        this.tempo = 0;
        this.tempoObs = 0;
        this.score = 0;
        this.ultimotempo = 0;
    }

    iniciar(){
        this.resetar();
        this.emExecucao = true;
        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        /* "=>" é a abreviação de "function", além disso, 
        em casos de jogos, utilizar function faz com que 
        o JavaScript perdesse em algum momento o "this", 
        fazendo com que não reconhecesse o loop */ 
        requestAnimationFrame((timestamp) => this.loop(timestamp));
    }

    escutarTeclas() {
        window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            if (!this.emExecucao) {
            this.iniciar();
            } else {
            this.dino.pular();
            }
        }
        });
    }    

    gerarObstaculo(temporizador){
        this.tempoObs += temporizador;
        if(this.tempoObs >= 0.5 && !this.evento10SegundosAtivado){
            this.tempoObs = 0;
            const alturaCacto = Math.floor(Math.random() * 20) + 30;
            const yCacto = 230 - alturaCacto;
            this.obstaculos.push(
                new Obstaculo(this.canvas.width, yCacto, 20, alturaCacto, 6)
            );
        }
    }

    checarColisao(dino, obs) {
        return (
            dino.x < obs.x + obs.largura &&
            dino.x + dino.largura > obs.x &&
            dino.y < obs.y + obs.altura &&
            dino.y + dino.altura > obs.y
        );
    }

    finalizarJogo() {
        this.gameOver = true;
        this.emExecucao = false;
        this.gameOverScreen.classList.remove('hidden');
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
            this.obstaculos.push(
                new Obstaculo(this.canvas.width, 0, this.canvas.width, this.canvas.height, 1)
            );
        }

    this.gerarObstaculo(temporizador);

    //Limpa o canvas para desenhar o próximo quadro
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    //Atualiza e desenha o Player (Dino)
    if (this.dino) {
            this.dino.atualizar(); 
            this.dino.desenhar(this.ctx); 
        }
    
    //realiza uma funçao para cada obstaculo na lista de obstaculos
    this.obstaculos.forEach((obs, index) => {
        obs.atualizar();
        obs.desenhar(this.ctx);

        /*realiza uma filtragem nos obstaculos presentes
        na lista de obstaculos retornando outra lista
        com os obstaculos que passaram no teste*/
        this.obstaculos = this.obstaculos.filter(
            (obstaculo) => obstaculo.x + obstaculo.largura >= 0
        ); 

        //chama a funçao para checar a colisao do player com um obstaculo
        if (this.checarColisao(this.dino, obs)) {
        this.finalizarJogo();
        }

    })

    //Pede para o navegador rodar o próximo quadro da animação
    requestAnimationFrame((timestamp) => this.loop(timestamp));
  }
}

// Inicializa a instância do jogo quando a página carregar
window.onload = () => {
  const jogo = new Jogo("gameCanvas");
};
