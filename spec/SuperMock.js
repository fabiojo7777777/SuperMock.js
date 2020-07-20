'use strict'

var SuperMock = {};

(function() {

    SuperMock.mockarBackend = mockarBackend;
    SuperMock.mockarRespostaBackend = mockarRespostaBackend;

    var MOCKS = {};
    var BACKEND = {};
    var EXECUTANDO_BACKEND = false;

    function mockarBackend() {
        inicializarBackend();
        return function() {
            return BACKEND;
        };
    }

    function inicializarBackend() {
        if (EXECUTANDO_BACKEND) {
            for (var prop in BACKEND) {
                delete BACKEND[prop];
            }
            for (var prop in MOCKS) {
                delete MOCKS[prop];
            }
            EXECUTANDO_BACKEND = false;
        }
    }

    function mockarRespostaBackend(prop, sucessoBackend, erroBackend) {
        obterOuCriarNovoMock(prop);
        if (sucessoBackend) {
            mockarSucessoBackend(prop, sucessoBackend);
        } else {
            mockarSucessoBackend(prop, null);
        }
        if (erroBackend) {
            mockarErroBackend(prop, erroBackend);
        } else {
            mockarErroBackend(prop, null);
        }
        mockarServico(prop);
    }

    function mockarSucessoBackend(prop, sucessoBackend) {
        obterOuCriarNovoMock(prop);
        MOCKS[prop].responseSucesso.push(sucessoBackend);
        mockarServico(prop);
    }

    function mockarErroBackend(prop, erroBackend) {
        obterOuCriarNovoMock(prop);
        MOCKS[prop].responseErro.push(erroBackend);
        mockarServico(prop);
    }

    function mockarServico(prop) {
        obterOuCriarNovoMock(prop);
        if (!BACKEND[prop]) {
            BACKEND[prop] = function(request) {
                EXECUTANDO_BACKEND = true;
                equalizarTamanhoResponseSucessoEErro(prop);
                MOCKS[prop].indiceExecucao++;
                if (MOCKS[prop].indiceExecucao >= MOCKS[prop].responseSucesso.length) {
                    MOCKS[prop].indiceExecucao = MOCKS[prop].responseSucesso.length - 1;
                }
                return getPromise(prop, MOCKS[prop].indiceExecucao);
            };
        }
    }

    function obterOuCriarNovoMock(prop) {
        if (!MOCKS[prop]) {
            MOCKS[prop] = criarMock();
        } else {
            MOCKS[prop].indiceExecucao = -1;
            MOCKS[prop].erroThen = [];
        }
        return MOCKS[prop];
    }

    function criarMock() {
        return {
            indiceExecucao: -1,
            erroThen: [],
            request: [],
            responseSucesso: [],
            responseErro: []
        };
    }

    function equalizarTamanhoResponseSucessoEErro(prop) {
        // deixar o array de response sucesso com o mesmo tamanho do array de erros
        while (MOCKS[prop].responseSucesso.length < MOCKS[prop].responseErro.length) {
            MOCKS[prop].responseSucesso.push(MOCKS[prop].responseSucesso[MOCKS[prop].responseSucesso.length - 1]);
        }
        while (MOCKS[prop].responseErro.length < MOCKS[prop].responseSucesso.length) {
            MOCKS[prop].responseErro.push(MOCKS[prop].responseErro[MOCKS[prop].responseErro.length - 1]);
        }
    }

    function getPromise(prop, indiceExecucao) {
        var promise = {
            then: function(callbackSucesso) {
                var retornoPromiseThen = undefined;
                if (!MOCKS[prop].erroThen[indiceExecucao]) {
                    if (!MOCKS[prop].responseErro[indiceExecucao]
					|| promise.catchTratado) {
                        try {
                            retornoPromiseThen = callbackSucesso(MOCKS[prop].responseSucesso[indiceExecucao]);
                        } catch (e) {
                            MOCKS[prop].erroThen[indiceExecucao] = e;
                        }
                    }
                }
                if (isPromise(retornoPromiseThen)) {
                    return retornoPromiseThen;
                } else {
                    return promise;
                }
            },
            catch: function(callbackErro) {
                if (MOCKS[prop].erroThen[indiceExecucao]) {
                    var erroThen = MOCKS[prop].erroThen[indiceExecucao];
                    MOCKS[prop].erroThen[indiceExecucao] = undefined;
                    callbackErro(erroThen.toString());
                } else if (MOCKS[prop].responseErro[indiceExecucao]
						&& !promise.catchTratado) {
                    callbackErro(MOCKS[prop].responseErro[indiceExecucao]);
                }
				promise.catchTratado = true;
                return promise;
            },
			catchTratado: false
        };
        return promise;
    }

    function isPromise(obj) {
        return obj && typeof obj.then === "function" && typeof obj.catch === "function";
    }

})();