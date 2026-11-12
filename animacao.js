/* Sprite estático: uma imagem inteira desenhada no objeto.
Serve de classe base para os sprites animados (herança). */
export class Sprite {
    constructor(caminho) {
        this.imagem = new Image();
        this.imagem.src = caminho;
    }

    carregado() {
        return this.imagem.complete && this.imagem.naturalWidth > 0;
    }

    // Sprite estático não muda com o tempo
    atualizar(temporizador) {}

    reiniciar() {}

    desenhar(ctx, x, y, largura, altura) {
        if (!this.carregado()) return;
        ctx.drawImage(this.imagem, x, y, largura, altura);
    }
}

/* Sprite animado a partir de uma spritesheet: os quadros ficam
lado a lado na mesma imagem, todos com a mesma largura.
Sobrescreve atualizar(), reiniciar() e desenhar() (polimorfismo). */
export class SpriteAnimado extends Sprite {
    constructor(caminho, totalQuadros, quadrosPorSegundo = 10) {
        super(caminho);
        this.totalQuadros = totalQuadros;
        this.duracaoQuadro = 1 / quadrosPorSegundo;
        this.quadroAtual = 0;
        this.acumulado = 0;
    }

    reiniciar() {
        this.quadroAtual = 0;
        this.acumulado = 0;
    }

    atualizar(temporizador) {
        this.acumulado += temporizador;
        while (this.acumulado >= this.duracaoQuadro) {
            this.acumulado -= this.duracaoQuadro;
            this.quadroAtual = (this.quadroAtual + 1) % this.totalQuadros;
        }
    }

    desenhar(ctx, x, y, largura, altura) {
        if (!this.carregado()) return;
        const larguraQuadro = this.imagem.naturalWidth / this.totalQuadros;
        ctx.drawImage(
            this.imagem,
            this.quadroAtual * larguraQuadro, 0,          // recorte na spritesheet
            larguraQuadro, this.imagem.naturalHeight,
            x, y, largura, altura                         // posição no canvas
        );
    }
}

/* Controla várias animações de um objeto (ex.: "correndo", "pulando")
e sabe qual está ativa. O objeto do jogo "tem" um Animador (composição). */
export class Animador {
    constructor(animacoes, inicial) {
        this.animacoes = animacoes;
        this.atual = animacoes[inicial];
    }

    trocar(nome) {
        const nova = this.animacoes[nome];
        if (nova && nova !== this.atual) {
            this.atual = nova;
            nova.reiniciar();
        }
    }

    atualizar(temporizador) {
        this.atual.atualizar(temporizador);
    }

    desenhar(ctx, x, y, largura, altura) {
        this.atual.desenhar(ctx, x, y, largura, altura);
    }
}
