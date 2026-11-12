import { sprite_asteroide, sprite_bolafeno, sprite_cacto, sprite_player2, sprite_predio } from "./constantes.js";
import { Sprite, SpriteAnimado, Animador } from "./animacao.js";

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
    
    atualizar(){
        throw new Error("Não é possivel realizar esse método com esse objeto!");
    }

    // this.sprite pode ser Sprite, SpriteAnimado ou Animador (polimorfismo)
    desenhar(ctx) {
        this.sprite.desenhar(ctx, this.x, this.y, this.largura, this.altura);
    }

    pegarImagem(caminho){
        return new Sprite(caminho);
    }
}

class Player extends Objetogame{
    constructor(x, y, largura, altura){
        super(x, y, largura, altura);
        this.yInicial = y;
        this.velocidadeY = 0;
        this.gravidade = 0.5;
        this.estaPulando = false;

        /* Composição: o Player "tem" um Animador com suas animações.
        Para animar, troque por uma spritesheet, ex.:
        new SpriteAnimado("Sprites/dino_correndo.png", 4, 10)
        (4 quadros lado a lado, 10 quadros por segundo). */
        this.sprite = new Animador({
            correndo: new SpriteAnimado("Sprites/dino_correndo.png", 3, 10),
            // 0 quadros por segundo: fica parado no primeiro quadro
            pulando: new SpriteAnimado("Sprites/dino_correndo.png", 3, 0),
        }, "correndo");
    }

    pular(){
        if(!this.estaPulando){
            this.velocidadeY = -15;
            this.estaPulando = true;
        }
    }

    atualizar(temporizador){
        this.y += this.velocidadeY;

        if(this.y < this.yInicial){
            this.velocidadeY += this.gravidade
        } else {
            this.y = this.yInicial;
            this.velocidadeY = 0;
            this.estaPulando = false;
        }

        this.sprite.trocar(this.estaPulando ? "pulando" : "correndo");
        this.sprite.atualizar(temporizador);
    }

    /*
    desenhar(ctx){
        //ctx.fillStyle = "#5a17a7";
        //ctx.fillRect(this.x, this.y, this.largura, this.altura);
        ctx.drawImage(this.sprite, this.x, this.y, this.largura, this.altura);
    }*/
}

class Obstaculo extends Objetogame{
    constructor(x, y, largura, altura, velocidade, sprite){
        super(x, y, largura, altura);
        this.velocidade = velocidade;
        this.sprite = this.pegarImagem(sprite);
    }

    atualizar(){
        this.x -= this.velocidade;
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
        this.dino = new Player(50, 180, 47, 50);
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
        const obstaculosDisponiveis = [
            sprite_bolafeno,
            sprite_cacto,
            sprite_predio
        ];
        if(this.tempoObs >= 1 && !this.evento10SegundosAtivado){
            this.tempoObs = 0;
            const indice = Math.floor(
            Math.random() * obstaculosDisponiveis.length
            );
            const spriteescolida = obstaculosDisponiveis[indice];

            if(indice == 0){
                this.obstaculos.push(
                    new Obstaculo(this.canvas.width, 210, 32, 32, 6, spriteescolida)
                );
            }
            else if (indice == 1){
                this.obstaculos.push(
                    new Obstaculo(this.canvas.width, 180, 64, 64, 6, spriteescolida)
                );
            }
            else if (indice == 2){
                this.obstaculos.push(
                    new Obstaculo(this.canvas.width, 130, 128, 128, 6, spriteescolida)
                );
            }
            else {
                throw new Error("Erro na criação do objeto!");
            }
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
                new Obstaculo(this.canvas.width, 0, 512, 512, 1, sprite_asteroide)
            );
        }

    this.gerarObstaculo(temporizador);

    //Limpa o canvas para desenhar o próximo quadro
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Desenha a linha do chão
    this.ctx.strokeStyle = '#e0e0e0';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 230);
    this.ctx.lineTo(this.canvas.width, 230);
    this.ctx.stroke();

    //Atualiza e desenha o Player (Dino)
    if (this.dino) {
            this.dino.atualizar(temporizador); 
            this.dino.desenhar(this.ctx); 
        }
    
    //realiza uma funçao para cada obstaculo na lista de obstaculos
    this.obstaculos.forEach((obs) => {
        obs.atualizar();
        obs.desenhar(this.ctx);

        //chama a funçao para checar a colisao do player com um obstaculo
        if (this.checarColisao(this.dino, obs)) {
            this.finalizarJogo();
        }
    });

    /*filtra uma vez por quadro, mantendo só os obstaculos
    que ainda estão na tela*/
    this.obstaculos = this.obstaculos.filter(
        (obstaculo) => obstaculo.x + obstaculo.largura >= 0
    );

    //Pede para o navegador rodar o próximo quadro da animação
    requestAnimationFrame((timestamp) => this.loop(timestamp));
  }
}

// Inicializa a instância do jogo quando a página carregar
window.onload = () => {
  const jogo = new Jogo("gameCanvas");
};
