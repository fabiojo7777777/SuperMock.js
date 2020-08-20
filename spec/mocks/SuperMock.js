var SuperMock;
var Promise;

(function() {

    'use strict';

    SuperMock = {
        mockarBackend: _mockarBackend,
        mockarRespostaBackend: _mockarRespostaBackend,
        executarTodosProcessosAssincronosDoAngular: executarTodosProcessosAssincronosDoAngular,
        verificarNenhumProcessoAssincronoDoAngularPendenteDeExecucao: _verificarNenhumProcessoAssincronoDoAngularPendenteDeExecucao,
        mockar$Scope: _mockar$Scope,
        lerJson: _lerJson,
        diretorioJson: _diretorioJson
    };
    Promise = _Promise;

    var _dirJson;
    var _BACKEND;
    var _MOCKS;

    _diretorioJson("spec/mocks-api");

    function _mockarBackend() {
        _BACKEND = {};
        _MOCKS = {};
        return function() {
            return _BACKEND;
        };
    }

    function _mockarRespostaBackend(prop, p1, p2, p3) {
        var request;
        var responseSucesso;
        var responseErro;
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
        if (typeof responseSucesso === "undefined") {
            mock.responseSucesso.push(undefined);
        } else if (typeof responseSucesso === "string") {
            try {
                if (responseSucesso.indexOf(".json") === responseSucesso.length - 5) {
                    mock.responseSucesso.push(_lerJson(responseSucesso));
                } else {
                    throw Error("*** O nome do arquivo json de sucesso deve terminar com a extensão .json. Arquivo informado: \"" + responseSucesso + "\" ***");
                }
            } catch (e) {
                throw Error("Json inválido dentro do arquivo \"" + responseSucesso + "\"");
            }
        } else {
            mock.responseSucesso.push(responseSucesso);
        }
        if (typeof responseErro === "undefined") {
            mock.responseErro.push(undefined);
        } else if (typeof responseSucesso === "string") {
            try {
                if (responseErro.indexOf(".json") === responseErro.length - 5) {
                    mock.responseErro.push(_lerJson(responseErro));
                } else {
                    throw Error("*** O nome do arquivo json de sucesso deve terminar com a extensão .json. Arquivo informado: \"" + responseErro + "\" ***");
                }
            } catch (e) {
                throw Error("Json inválido dentro do arquivo \"" + responseErro + "\"");
            }
        } else {
            mock.responseErro.push(responseErro);
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
            return _MOCKS[prop].undefined;
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
        var deferred = _obterDeferred();
        callback(deferred.resolve, deferred.reject);
        return deferred.promise;
    }

    function executarTodosProcessosAssincronosDoAngular() {
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

    function _verificarNenhumProcessoAssincronoDoAngularPendenteDeExecucao() {
        inject(function($verifyNoPendingTasks) {
            try {
                $verifyNoPendingTasks();
            } catch (e) {
                throw Error("*** Nem todas as promises / timeouts / processos assíncronos foram executados. Execute a função SuperMock.executarTodosProcessosAssincronosDoAngular() para executar estes processos ***");
            }
        });
    }

    function _mockar$Scope(getControllerFunction) {
        if (typeof getControllerFunction !== "function") {
            throw new Error("Chame a função SuperMock.mockar$Scope enviando uma função que retorne a variável que tem o controller a ser testado");
        }
        var scope;
        module(function($rootScopeProvider) {
            scope = $rootScopeProvider.$get().$new();
        });
        for (var property in scope) {
            _wrapProperty(scope, property, getControllerFunction);
        }
        return function() {
            return scope;
        };
    }

    function _wrapProperty(scope, property, getControllerFunction) {
        var oldPropertyValue = scope[property];
        Object.defineProperty(scope, property, {
            get: function() {
                if (!getControllerFunction()) {
                    throw Error("Você deve acessar o $scope." + property + " a partir de uma function do controller que está associada ao ng-init do html ao invés de fazer este acesso durante a construção do controller (para o controller ser testável)");
                }
                return oldPropertyValue;
            },
            set: function(valor) {
                oldPropertyValue = valor;
            }
        });
    }

    function _diretorioJson(dirJson) {
        if (typeof dirJson === "string") {
            _dirJson = dirJson;
            if (_dirJson.length === 0) {
                _dirJson = "/";
            } else {
                if (_dirJson.charAt(_dirJson.length - 1) !== "/") {
                    _dirJson = _dirJson + "/";
                }
                if (_dirJson.charAt(0) !== "/") {
                    _dirJson = "/" + _dirJson;
                }
            }
        }
    }

    function _lerJson(url) {
        var base = "/base" + _dirJson;
        url = base + url;

        var xhr = new XMLHttpRequest();
        var json = null;

        xhr.open("GET", url, false);

        xhr.onload = function(e) {
            if (xhr.status === 200) {
                try {
                    json = JSON.parse(xhr.responseText);
                } catch (e1) {
                    throw Error("Json inválido dentro do arquivo \"" + url + "\".Descrição: " + e1 + "\nJson informado: \"" + xhr.responseText + "\"");
                }
            } else {
                throw Error("Erro ao ler arquivo json \"" + url + "\". Descrição: \"" + xhr.statusText + "\"");
            }
        };

        xhr.onerror = function(e) {
            throw Error("Erro ao ler arquivo json \"" + url + "\". Descrição: \"" + xhr.statusText + "\"");
        };

        xhr.send(null);
        return json;
    }

})();