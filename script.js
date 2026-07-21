/* ============================================================
   SISTEMA DE BLOCOS GENÉRICOS
   Funciona para qualquer bloco (loja, servicos, portfolio, etc.)
   Basta ter um ficheiro dados/<nome>.json e chamar mostrarBloco()
   ============================================================ */

// galeria atualmente aberta no lightbox (para os botões anterior/seguinte)
var galeriaAtual = [];
var indiceAtual = 0;

// Descobre o nome da página atual a partir do endereço (ex: loja.html -> "loja")
function paginaAtual() {
  var caminho = window.location.pathname;
  var ficheiro = caminho.split("/").pop();
  if (ficheiro === "" || ficheiro === "index.html") return "index";
  return ficheiro.replace(".html", "");
}

// Vai buscar TODAS as secções criadas no painel e desenha só as desta página
document.addEventListener("DOMContentLoaded", function () {
  var container = document.getElementById("todas-as-seccoes");
  var estaPagina = paginaAtual();

  fetch("dados/site.json")
    .then(function (resposta) {
      if (!resposta.ok) throw new Error("ficheiro não encontrado");
      return resposta.json();
    })
    .then(function (dados) {
      var blocos = (dados.blocos || []).filter(function (b) {
        return (b.pagina || "index") === estaPagina;
      });

      if (blocos.length === 0) {
        container.innerHTML = "<p class='aviso-vazio' style='padding:24px 20px;'>Ainda não há secções para esta página.</p>";
        return;
      }

      blocos.forEach(function (bloco) {
        var secao = document.createElement("section");
        secao.className = "bloco";

        var titulo = document.createElement("h2");
        titulo.className = "titulo-bloco";
        titulo.textContent = bloco.nome;
        secao.appendChild(titulo);

        var conteudo = document.createElement("div");
        conteudo.className = "conteudo-bloco";
        secao.appendChild(conteudo);

        container.appendChild(secao);

        desenharCategorias(bloco.categorias || [], conteudo, bloco.slug, dados);
      });
    })
    .catch(function () {
      container.innerHTML = "<p class='aviso-vazio' style='padding:24px 20px;'>Ainda não há conteúdo aqui.</p>";
    });

  document.getElementById("modal-fechar").addEventListener("click", fecharModal);
  document.getElementById("lightbox-fechar").addEventListener("click", fecharLightbox);
  document.getElementById("lightbox-anterior").addEventListener("click", function () {
    navegarLightbox(-1);
  });
  document.getElementById("lightbox-seguinte").addEventListener("click", function () {
    navegarLightbox(1);
  });
});

// Desenha os retângulos das categorias (foto + nome)
function desenharCategorias(categorias, container, slugBloco, dadosCompletos) {
  container.innerHTML = "";

  if (categorias.length === 0) {
    container.innerHTML = "<p class='aviso-vazio'>Ainda não há categorias.</p>";
    return;
  }

  var grelha = document.createElement("div");
  grelha.className = "grelha-categorias";

  categorias.forEach(function (categoria) {
    var cartao = document.createElement("div");
    cartao.className = "cartao-categoria";
    cartao.innerHTML =
      (categoria.foto
        ? "<img loading='lazy' src='" + categoria.foto + "' alt='" + categoria.nome + "'>"
        : "<div class='sem-foto'></div>") +
      "<span class='nome-categoria'>" + categoria.nome + "</span>";

    cartao.addEventListener("click", function () {
      desenharItens(categoria, container, categorias, slugBloco, dadosCompletos);
    });

    grelha.appendChild(cartao);
  });

  container.appendChild(grelha);
}

// Desenha os itens de dentro de uma categoria, com botão de voltar
function desenharItens(categoria, container, todasCategorias, slugBloco, dadosCompletos) {
  container.innerHTML = "";

  var voltar = document.createElement("button");
  voltar.className = "botao-voltar";
  voltar.textContent = "‹ Voltar";
  voltar.addEventListener("click", function () {
    desenharCategorias(todasCategorias, container, slugBloco, dadosCompletos);
  });
  container.appendChild(voltar);

  var titulo = document.createElement("h3");
  titulo.className = "titulo-categoria-ativa";
  titulo.textContent = categoria.nome;
  container.appendChild(titulo);

  var itens = (categoria.itens || []).slice().sort(function (a, b) {
    return (a.ordem || 0) - (b.ordem || 0);
  });

  if (itens.length === 0) {
    var vazio = document.createElement("p");
    vazio.className = "aviso-vazio";
    vazio.textContent = "Ainda não há itens nesta categoria.";
    container.appendChild(vazio);
    return;
  }

  var grelha = document.createElement("div");
  grelha.className = "grelha-itens";

  itens.forEach(function (item) {
    var cartao = document.createElement("div");
    cartao.className = "cartao-item";

    var precoHtml = item.preco ? "<p class='preco-item'>" + item.preco + "</p>" : "";
    var promocaoHtml = item.promocao ? "<span class='etiqueta-promocao'>" + item.promocao + "</span>" : "";
    var disponivelHtml =
      item.disponivel === false ? "<span class='etiqueta-esgotado'>Esgotado</span>" : "";

    cartao.innerHTML =
      (item.fotoPrincipal
        ? "<img loading='lazy' src='" + item.fotoPrincipal + "' alt='" + item.nome + "'>"
        : "<div class='sem-foto'></div>") +
      promocaoHtml + disponivelHtml +
      "<h4>" + item.nome + "</h4>" +
      (item.descricaoCurta ? "<p class='descricao-curta'>" + item.descricaoCurta + "</p>" : "") +
      precoHtml;

    cartao.addEventListener("click", function () {
      abrirModal(item);
    });

    grelha.appendChild(cartao);
  });

  container.appendChild(grelha);
}

// Abre a janela com todos os detalhes do item
function abrirModal(item) {
  var conteudo = document.getElementById("modal-conteudo");
  var html = "";

  html += "<h2>" + item.nome + "</h2>";

  if (item.fotoPrincipal) {
    html += "<img class='modal-foto-principal' loading='lazy' src='" + item.fotoPrincipal + "' alt='" + item.nome + "'>";
  }

  if (item.galeria && item.galeria.length > 0) {
    html += "<div class='modal-galeria' id='modal-galeria'>";
    item.galeria.forEach(function (foto, indice) {
      html += "<img loading='lazy' class='miniatura-galeria' data-indice='" + indice + "' src='" + foto.src + "' alt=''>";
    });
    html += "</div>";
  }

  if (item.video) {
    html += "<div class='video-wrapper'><iframe src='" + converterLinkVideo(item.video) + "' allowfullscreen loading='lazy'></iframe></div>";
  }

  if (item.audio) {
    html += "<audio controls src='" + item.audio + "'></audio>";
  }

  if (item.descricaoLonga) {
    html += "<div class='descricao-longa'>" + item.descricaoLonga.replace(/\n/g, "<br>") + "</div>";
  } else if (item.descricaoCurta) {
    html += "<p>" + item.descricaoCurta + "</p>";
  }

  if (item.tags && item.tags.length > 0) {
    html += "<div class='lista-tags'>";
    item.tags.forEach(function (t) {
      html += "<span class='tag'>" + t.tag + "</span>";
    });
    html += "</div>";
  }

  if (item.preco) html += "<p class='preco-item'>" + item.preco + "</p>";
  if (item.duracao) html += "<p class='duracao-item'>Duração: " + item.duracao + "</p>";
  if (item.data) html += "<p class='data-item'>" + new Date(item.data).toLocaleDateString("pt-PT") + "</p>";

  if (item.documento) {
    html += "<a class='link-documento' href='" + item.documento + "' target='_blank' rel='noopener'>📄 Ver </a>";
  }

  if (item.link && item.botaoTexto) {
    html += "<a class='botao-acao' href='" + item.link + "' target='_blank' rel='noopener'>" + item.botaoTexto + "</a>";
  } else if (item.link) {
    html += "<a class='botao-acao' href='" + item.link + "' target='_blank' rel='noopener'>Saber mais</a>";
  }

  conteudo.innerHTML = html;

  // liga os cliques nas miniaturas da galeria ao lightbox
  var miniaturas = conteudo.querySelectorAll(".miniatura-galeria");
  miniaturas.forEach(function (img) {
    img.addEventListener("click", function () {
      galeriaAtual = item.galeria.map(function (f) { return f.src; });
      abrirLightbox(parseInt(img.getAttribute("data-indice"), 10));
    });
  });

  document.getElementById("modal-item").classList.remove("escondido");
}

function fecharModal() {
  document.getElementById("modal-item").classList.add("escondido");
}

// Converte um link normal do YouTube num link de "embed"
function converterLinkVideo(link) {
  if (link.indexOf("watch?v=") !== -1) {
    return link.replace("watch?v=", "embed/");
  }
  if (link.indexOf("youtu.be/") !== -1) {
    return link.replace("youtu.be/", "www.youtube.com/embed/");
  }
  return link;
}

function abrirLightbox(indice) {
  indiceAtual = indice;
  document.getElementById("lightbox-imagem").src = galeriaAtual[indiceAtual];
  document.getElementById("lightbox").classList.remove("escondido");
}

function fecharLightbox() {
  document.getElementById("lightbox").classList.add("escondido");
}

function navegarLightbox(direcao) {
  indiceAtual = (indiceAtual + direcao + galeriaAtual.length) % galeriaAtual.length;
  document.getElementById("lightbox-imagem").src = galeriaAtual[indiceAtual];
}


var foto=document.querySelector(div.sem-foto)
foto.innerHTML=`${fotoPrincipal}`