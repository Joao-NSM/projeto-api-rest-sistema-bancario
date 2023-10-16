const bancodedados = require("../bancodedados")
let idDaConta = 101;

const verificarSenha = (req, res) => {
    const { senha_banco } = req.query;

    if (!senha_banco) { return res.status(400).json({ mensagem: "A Senha não foi informada" }); }
    if (senha_banco !== "Cubos123Bank") { return res.status(404).json({ mensagem: "Senha incorreta!" }) }
    if (senha_banco === "Cubos123Bank") { return res.status(200).json(bancodedados.contas); }
}
const cadastrarConta = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    if (nome && cpf && data_nascimento && telefone && email && senha) {
        const confirmaCpfEEmail = bancodedados.contas.find((conta) => {
            return conta.usuario.cpf === cpf || conta.usuario.email === email;
        })

        if (!confirmaCpfEEmail) {

            const novaConta = {
                numero: idDaConta++,
                saldo: 10,
                usuario: {
                    nome,
                    cpf,
                    data_nascimento,
                    telefone,
                    email,
                    senha
                }
            }
            bancodedados.contas.push(novaConta);
            res.status(201).json();
        } else { res.status(404).json({ mensagem: "Já existe uma conta com o cpf ou e-mail informado!" }); }

    } else { res.status(404).json({ mensagem: "todos os campos precisam ser preenchidos!" }); }
}
const atualizarUsuario = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    if (nome && cpf && data_nascimento && telefone && email && senha) {

        const { numeroConta } = req.params;

        const conta = bancodedados.contas.find((conta) => {
            return conta.numero === Number(numeroConta);
        });
        if (conta) {
            const confirmaCpfEEmail = bancodedados.contas.find((conta) => {
                return conta.usuario.cpf === cpf || conta.usuario.email === email;
            });

            if (!confirmaCpfEEmail) {

                conta.usuario = {
                    nome,
                    cpf,
                    data_nascimento,
                    telefone,
                    email,
                    senha
                }
                res.status(201).json();
            } else { res.status(404).json({ mensagem: "O CPF ou email informado já existe cadastrado!" }); }
        } else { res.status(404).json({ mensagem: "conta invalida" }); }
    } else { res.status(404).json({ mensagem: "Preencha todos os campos!" }); }
}
const deletarConta = (req, res) => {
    const { numeroConta } = req.params;
    const conta = bancodedados.contas.find((contas) => {
        return contas.numero === Number(numeroConta);
    });

    if (conta) {
        if (conta.saldo === 0) {
            bancodedados.contas = bancodedados.contas.filter((contas) => {
                return contas.numero !== Number(conta.numero);
            })
            res.status(200).json();

        } else { res.status(404).json({ mensagem: "A conta só pode ser removida se o saldo for zero!" }); }
    } else { res.status(404).json({ mensagem: "A conta não existe!" }) };
}

const deposito = (req, res) => {
    let { numero_conta, valor } = req.body;
    if (numero_conta && valor) {
        const conta = bancodedados.contas.find((contas) => {
            return contas.numero === Number(numero_conta);
        });
        valor = Number(valor);
        if (conta) {
            if (valor > 0) {
                conta.saldo = conta.saldo + valor
                const depositoAtualizado = {
                    data: new Date().toJSON().replace("T", " ").slice(0, -5),
                    numero_conta,
                    valor
                }
                bancodedados.depositos.push(depositoAtualizado);
                res.status(201).json();
            } else { res.status(404).json({ mensagem: "Valor invalido!" }) };
        } else { res.status(404).json({ mensagem: "A conta informada não existe!" }) };
    } else { res.status(404).json({ mensagem: "O número da conta e o valor são obrigatórios!" }) };
}
const saque = (req, res) => {
    let { numero_conta, valor, senha } = req.body;
    if (numero_conta && valor && senha) {
        const conta = bancodedados.contas.find((contas) => {
            return contas.numero === Number(numero_conta);
        });
        valor = Number(valor);
        if (conta) {
            if (conta.usuario.senha === senha) {
                if (conta.saldo > 0 && conta.saldo >= valor) {
                    conta.saldo = conta.saldo - valor
                    const saqueAtualizado = {
                        data: new Date().toJSON().replace("T", " ").slice(0, -5),
                        numero_conta,
                        valor
                    }
                    bancodedados.saques.push(saqueAtualizado);
                    res.status(201).json();
                } else { res.status(404).json({ mensagem: "Saldo insuficiente!" }) };
            } else { res.status(404).json({ mensagem: "Senha incorreta!" }) };
        } else { res.status(404).json({ mensagem: "A conta informada não existe!" }) };
    } else { res.status(404).json({ mensagem: "Preencha todos os campos!" }) };
}
const transferir = (req, res) => {
    let { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;
    if (numero_conta_origem && numero_conta_destino && valor && senha) {
        const contaOrigem = bancodedados.contas.find((contas) => {
            return contas.numero === Number(numero_conta_origem);
        });
        const contaDestino = bancodedados.contas.find((contas) => {
            return contas.numero === Number(numero_conta_destino);
        });

        if (contaOrigem && contaDestino) {
            if (contaOrigem.usuario.senha === senha) {
                if (contaOrigem.numero !== contaDestino.numero) {
                    if (contaOrigem.saldo > 0 && contaOrigem.saldo >= valor) {
                        contaOrigem.saldo = contaOrigem.saldo - valor
                        contaDestino.saldo = contaDestino.saldo + valor
                        const transferenciaRealizada = {
                            data: new Date().toJSON().replace("T", " ").slice(0, -5),
                            numero_conta_origem,
                            numero_conta_destino,
                            valor
                        }
                        bancodedados.transferencias.push(transferenciaRealizada);
                        res.status(201).json();
                    } else { res.status(404).json({ mensagem: "Saldo insuficiente!" }) };
                } else { res.status(404).json({ mensagem: "Conta invalida!" }) };
            } else { res.status(404).json({ mensagem: "Senha incorreta!" }) };
        } else { res.status(404).json({ mensagem: "A conta informada não existe!" }) };
    } else { res.status(404).json({ mensagem: "Preencha todos os campos!" }) };
}
const saldo = (req, res) => {
    const { numero_conta, senha } = req.query;
    if (numero_conta && senha) {
        const conta = bancodedados.contas.find((contas) => {
            return contas.numero === Number(numero_conta);
        });
        if (conta) {
            if (conta.usuario.senha === senha) {
                res.status(200).json({ mensagem: `${conta.saldo}` });
            } else { res.status(404).json({ mensagem: "Senha incorreta!" }) };
        } else { res.status(404).json({ mensagem: "A conta informada não existe!" }) };
    } else { res.status(404).json({ mensagem: "Conta bancária não encontada!" }) };
}
const extrato = (req, res) => {
    const { numero_conta, senha } = req.query;
    if (numero_conta && senha) {
        const conta = bancodedados.contas.find((contas) => {
            return contas.numero === Number(numero_conta);
        });
        if (conta) {
            if (conta.usuario.senha === senha) {
                res.status(200).json({
                    transferenciasEnviadas: bancodedados.transferencias.filter((transferir) => { return transferir.numero_conta_origem === Number(conta.numero) }),
                    transferenciasRecebidas: bancodedados.transferencias.filter((transferir) => { return transferir.numero_conta_destino === Number(conta.numero) }),
                    depositos: bancodedados.depositos.filter((deposito) => { return deposito.numero_conta === Number(conta.numero) }),
                    saques: bancodedados.saques.filter((saque) => { return saque.numero_conta === Number(conta.numero) })
                });
            } else { res.status(404).json({ mensagem: "Senha incorreta!" }) };
        } else { res.status(404).json({ mensagem: "A conta informada não existe!" }) };
    } else { res.status(404).json({ mensagem: "Conta bancária não encontada!" }) };
}


module.exports = {
    verificarSenha,
    cadastrarConta,
    atualizarUsuario,
    deletarConta,
    deposito,
    saque,
    transferir,
    saldo,
    extrato
}