@echo off
chcp 65001 >nul
title PyCampus - Lumi online
echo.
echo  Abrindo um endereco https para a IA do Lumi.
echo  Deixe esta janela aberta enquanto estiver estudando pelo celular.
echo.
echo  Quando aparecer um endereco terminado em trycloudflare.com,
echo  copie e cole em Configuracoes ^> Onde a IA do Lumi mora.
echo.
set OLLAMA_ORIGINS=https://jaoabyo.github.io,http://localhost:*,http://127.0.0.1:*
cloudflared tunnel --url http://127.0.0.1:11434 --http-host-header 127.0.0.1:11434
pause
