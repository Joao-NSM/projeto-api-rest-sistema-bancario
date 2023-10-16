const express = require("express");
const controladores = require("./controladores/controladores")

const rotas = express();

rotas.get("/contas", controladores.verificarSenha);
rotas.post("/contas", controladores.cadastrarConta);
rotas.put("/contas/:numeroConta/usuario", controladores.atualizarUsuario);
rotas.delete("/contas/:numeroConta", controladores.deletarConta);
rotas.post("/transacoes/depositar", controladores.deposito);
rotas.post("/transacoes/sacar", controladores.saque);
rotas.post("/transacoes/transferir", controladores.transferir);
rotas.get("/contas/saldo", controladores.saldo);
rotas.get("/contas/extrato", controladores.extrato);

module.exports = rotas