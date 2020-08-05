'use strict';

var SuperMock;
var Promise;

(function() {
    SuperMock = {
        mockarBackend: _mockarBackend,
        mockarRespostaBackend: _mockarRespostaBackend,
        executarTodosProcessosAssincronosDoAngular: _flushAllPendingTasks,
        verificarNenhumProcessoAssincronoDoAngularPendenteDeExecucao: _verifyNoPendingTasks
    };
    Promise = _Promise;


    var _BACKEND;
    var _MOCKS;

    function _mockarBackend() {
        _BACKEND = {};
        _MOCKS = {};
        return function() {
            return _BACKEND;
        };
    }

    function _mockarRespostaBackend(prop, p1, p2, p3) {
        var request = undefined;
        var responseSucesso = undefined;
        var responseErro = undefined;
        if (arguments.length <= 1) {
            throw Error("Informe no mínimo o nome do backend e a resposta de sucesso");
        } else if (arguments.length == 2) {
            responseSucesso = arguments[1];
        } else if (arguments.length == 3) {
            responseSucesso = arguments[1];
            responseErro = arguments[2];
        } else if (arguments.length >= 4) {
            request = arguments[1];
            responseSucesso = arguments[2];
            responseErro = arguments[3];
        }
        _mockarRespostaBackend2(prop, request, responseSucesso, responseErro);
    }

    function _mockarRespostaBackend2(prop, request, responseSucesso, responseErro) {
        var mock = _obterOuCriarNovoMock(prop, request);
        if (typeof responseSucesso !== "undefined") {
            mock.responseSucesso.push(responseSucesso);
        } else {
            mock.responseSucesso.push(undefined);
        }
        if (typeof responseErro !== "undefined") {
            mock.responseErro.push(responseErro);
        } else {
            mock.responseErro.push(undefined);
        }
        _mockarServico(prop);
    }

    function _obterOuCriarNovoMock(prop, request) {
        _criarMockSeNecessario(prop);

        var key = JSON.stringify(request);

        if (!_MOCKS[prop][key]) {
            _MOCKS[prop][key] = {
                indiceExecucao: -1,
                responseSucesso: [],
                responseErro: []
            };
        } else {
            _MOCKS[prop][key].indiceExecucao = -1;
        }

        return _MOCKS[prop][key];
    }

    function _obterMockDoRequestOuMockDefault(prop, request) {
        _criarMockSeNecessario(prop);

        var key = JSON.stringify(request);

        if (key in _MOCKS[prop]) {
            return _MOCKS[prop][key];
        } else {
            // obs: "undefined" é a chave de pesquisa do mock default
            return _MOCKS[prop]["undefined"];
        }
    }

    function _criarMockSeNecessario(prop) {
        if (!_MOCKS[prop]) {
            // obs: "undefined" é a chave de pesquisa do mock default
            _MOCKS[prop] = {
                "undefined": {
                    indiceExecucao: -1,
                    responseSucesso: [],
                    responseErro: []
                }
            };
        }
    }

    function _mockarServico(prop) {
        if (!_BACKEND[prop]) {
            _BACKEND[prop] = function(request) {
                var mock = _obterMockDoRequestOuMockDefault(prop, request);
                mock.indiceExecucao++;
                if (mock.indiceExecucao >= mock.responseSucesso.length) {
                    mock.indiceExecucao = mock.responseSucesso.length - 1;
                }

                var indiceExecucao = mock.indiceExecucao;
                var responseSucesso = mock.responseSucesso[indiceExecucao];
                var responseErro = mock.responseErro[indiceExecucao];

                var deferred = _obterDeferred();

                if (responseErro) {
                    deferred.reject(responseErro);
                } else {
                    deferred.resolve(responseSucesso);
                }

                return deferred.promise;
            };
        }
    }

    function _obterDeferred() {
        var deferred;
        inject(function($q) {
            deferred = $q.defer();
        });
        return deferred;
    }

    function _Promise(callback) {
        var deferred;
        inject(function($q) {
            deferred = $q.defer();
        });
        callback(deferred.resolve, deferred.reject);
        return deferred.promise;
    }

    function _flushAllPendingTasks() {
        inject(function($flushPendingTasks) {
            for (var i = 0; i < 1000; i++) {
                try {
                    $flushPendingTasks();
                } catch (e) {
                    //ignore
                    //console.log("flush de tarefas executado " + i + " vezes.");
                    return;
                }
            }
        });
    }

    function _verifyNoPendingTasks() {
        inject(function($verifyNoPendingTasks) {
            try {
                $verifyNoPendingTasks();
            } catch (e) {
                throw Error("*** Nem todas as promises / timeouts / processos assíncronos foram executados. Execute a função SuperMock.executarTodosProcessosAssincronosDoAngular() para executar estes processos ***");
            }
        });
    }

})();