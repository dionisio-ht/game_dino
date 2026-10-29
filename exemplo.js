/* Classe abstrata simulada com new.target. */
class Objetogame {
    constructor(x, y, largura, altura) {
        if (new.target === Objetogame) {
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

    atualizar() {
        throw new Error("Não é possivel realizar esse método com esse objeto!");
    }
}

class Player extends Objetogame {
    constructor(x, y, largura, altura) {
        super(x, y, largura, altura);
        this.yInicial = y;
        this.velocidadeY = 0;
        this.gravidade = 0.7;
        this.estaPulando = false;
    }

    pular() {
        if (!this.estaPulando) {
            this.velocidadeY = -12;
            this.estaPulando = true;
        }
    }

    atualizar() {
        this.y += this.velocidadeY;

        if (this.y < this.yInicial) {
            this.velocidadeY += this.gravidade;
        } else {
            this.y = this.yInicial;
            this.velocidadeY = 0;
            this.estaPulando = false;
        }
    }

    desenhar(ctx) {
        ctx.fillStyle = "#5a17a7";
        ctx.fillRect(this.x, this.y, this.largura, this.altura);
    }
}

class Obstaculo extends Objetogame {
    constructor(x, y, largura, altura, velocidade) {
        super(x, y, largura, altura);
        this.velocidade = velocidade;
    }

    atualizar() {
        this.x -= this.velocidade;
    }

    desenhar(ctx) {
        ctx.fillStyle = "#ff0202";
        ctx.fillRect(this.x, this.y, this.largura, this.altura);
    }
}

class Jogo {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.scoreElement = document.getElementById("score");
        this.resetar();
    }

    resetar() {
        this.dino = new Player(50, 180, 30, 50);
        this.obstaculos = [];
        this.emExecucao = false;
        this.gameOver = false;
        this.tempo = 0;
        this.score = 0;
        this.ultimoTempo = null;
        this.tempoDesdeUltimoObstaculo = 0;
        this.evento10SegundosAtivado = false;
    }

    iniciar() {
        this.resetar();
        this.emExecucao = true;

        // O navegador fornece o primeiro timestamp ao callback.
        requestAnimationFrame((timestamp) => this.loop(timestamp));
    }

    gerarObstaculo(tempoDecorrido) {
        this.tempoDesdeUltimoObstaculo += tempoDecorrido;

        // Gera um obstáculo a cada 1,5 segundo.
        if (this.tempoDesdeUltimoObstaculo >= 1.5) {
            this.tempoDesdeUltimoObstaculo = 0;
            const alturaCacto = Math.floor(Math.random() * 20) + 30;
            const yCacto = 230 - alturaCacto;
            this.obstaculos.push(
                new Obstaculo(this.canvas.width, yCacto, 20, alturaCacto, 6)
            );
        }
    }

    loop(timestamp) {
        if (!this.emExecucao) return;

        // No primeiro quadro apenas registra a referência de tempo.
        if (this.ultimoTempo === null) {
            this.ultimoTempo = timestamp;
        }

        // Diferença entre o quadro atual e o anterior, em segundos.
        const tempoDecorrido = Math.min(
            (timestamp - this.ultimoTempo) / 1000,
            0.5
        );

        // Essencial: atualiza a referência para o próximo quadro.
        this.ultimoTempo = timestamp;
        this.tempo += tempoDecorrido;
        this.score = Math.floor(this.tempo * 10);

        if (this.scoreElement) {
            this.scoreElement.textContent = `Score: ${this.score}`;
        }

        if (this.tempo >= 10 && !this.evento10SegundosAtivado) {
            this.evento10SegundosAtivado = true;
            console.log("10 segundos! Evento ativado!");
        }

        this.gerarObstaculo(tempoDecorrido);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.dino.atualizar();
        this.dino.desenhar(this.ctx);

        for (const obstaculo of this.obstaculos) {
            obstaculo.atualizar();
            obstaculo.desenhar(this.ctx);
        }

        // Remove os obstáculos que já saíram do canvas.
        this.obstaculos = this.obstaculos.filter(
            (obstaculo) => obstaculo.x + obstaculo.largura >= 0
        );

        requestAnimationFrame((novoTimestamp) => this.loop(novoTimestamp));
    }
}

window.onload = () => {
    const jogo = new Jogo("gameCanvas");
    jogo.iniciar();
};
