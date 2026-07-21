 
    // ⚠️ Isto é só uma barreira simples para uso local (proteção de "cortesia"),
    // não é segurança a sério. Muda o NOME e a SENHA aqui quando quiseres.
    var NOME_CORRETO = "Beldino";
    var SENHA_CORRETA = "Sami14mi11";
    var MAX_TENTATIVAS = 3;
    var MINUTOS_BLOQUEIO = 5;

    // se já entraste antes neste navegador, não pede outra vez
    if (localStorage.getItem("painel-autenticado") === "sim") {
      iniciarPainel();
    } else {
      atualizarEstadoBloqueio();
    }

    document.getElementById("botao-entrar").addEventListener("click", tentarEntrar);
    document.getElementById("campo-senha").addEventListener("keydown", function (e) {
      if (e.key === "Enter") tentarEntrar();
    });

    function agoraEmMs() {
      return new Date().getTime();
    }

    function estaBloqueado() {
      var fimBloqueio = parseInt(localStorage.getItem("painel-bloqueado-ate") || "0", 10);
      return fimBloqueio > agoraEmMs();
    }

    function atualizarEstadoBloqueio() {
      var botao = document.getElementById("botao-entrar");
      var erro = document.getElementById("mensagem-erro");

      if (!estaBloqueado()) {
        botao.disabled = false;
        return;
      }

      botao.disabled = true;
      var intervalo = setInterval(function () {
        var restanteMs = parseInt(localStorage.getItem("painel-bloqueado-ate") || "0", 10) - agoraEmMs();
        if (restanteMs <= 0) {
          clearInterval(intervalo);
          botao.disabled = false;
          erro.textContent = "";
          localStorage.removeItem("painel-tentativas");
          return;
        }
        var minutos = Math.floor(restanteMs / 60000);
        var segundos = Math.floor((restanteMs % 60000) / 1000);
        erro.textContent = "Demasiadas tentativas erradas. Tenta outra vez em " + minutos + "m " + segundos + "s.";
      }, 1000);
    }

    function tentarEntrar() {
      if (estaBloqueado()) return;

      var nome = document.getElementById("campo-nome").value.trim();
      var senha = document.getElementById("campo-senha").value;

      if (nome === NOME_CORRETO && senha === SENHA_CORRETA) {
        localStorage.removeItem("painel-tentativas");
        localStorage.removeItem("painel-bloqueado-ate");
        localStorage.setItem("painel-autenticado", "sim");
        iniciarPainel();
        return;
      }

      var tentativas = parseInt(localStorage.getItem("painel-tentativas") || "0", 10) + 1;
      localStorage.setItem("painel-tentativas", tentativas);

      var restantes = MAX_TENTATIVAS - tentativas;

      if (restantes <= 0) {
        var fimBloqueio = agoraEmMs() + MINUTOS_BLOQUEIO * 60000;
        localStorage.setItem("painel-bloqueado-ate", fimBloqueio);
        atualizarEstadoBloqueio();
      } else {
        document.getElementById("mensagem-erro").textContent =
          "Nome ou senha incorretos. Tentativas restantes: " + restantes;
      }
    }

    function iniciarPainel() {
      document.getElementById("ecra-login").style.display = "none";
      document.getElementById("app-decap").style.display = "block";

      var script = document.createElement("script");
      script.src = "decap-dist/decap-cms.js";
      document.getElementById("app-decap").appendChild(script);
    }
