describe("teste", function() {

    'use strict'

    var ctrl;

    // importar o módulo que tem o controller a ser testado
    beforeEach(module("controller-exemplos"));

    // mockar o backend inteiro usando o SuperMock
    beforeEach(module(function($provide) {
        $provide.factory("BackendService", SuperMock.mockarBackend());
    }));

    // criar controller
    beforeEach(inject(function(_$controller_) {
        ctrl = _$controller_("controllerExemplo");
    }));

    it("teste de execução com todas as chamadas dando sucesso", inject(function() {

        // todas execuções retornam o mesmo response de sucesso
        // primeiro parametro é o nome do backend mockado
        // segundo parâmetro resposta de sucesso
        // terceiro parâmetro erro de execução
        // Obs 1: chamando o método várias vezes para uma mesma transação 
        // fará com que as respostas consecutivas sejam acumuladas para serem chamadas 
        // na sequência de execução
        SuperMock.mockarRespostaBackend("contas", { execucao: 1, data: { data: [1, 2] } });
        SuperMock.mockarRespostaBackend("login", { execucao: 1, data: { data: [3, 4] } });
        SuperMock.mockarRespostaBackend("acessos", { execucao: 1, data: { data: [5, 6] } });

        ctrl.testarExecucaoBackend();

		expect(ctrl.retornosBackend).toEqual(
			[
				{"execucao":1,"data":{"data":[1,2]}},
				{"execucao":1,"data":{"data":[1,2]}},
				{"execucao":1,"data":{"data":[3,4]}},
				{"execucao":1,"data":{"data":[3,4]}},
				{"execucao":1,"data":{"data":[1,2]}},
				{"execucao":1,"data":{"data":[1,2]}},
				{"execucao":1,"data":{"data":[1,2]}},
				{"execucao":1,"data":{"data":[1,2]}},
				{"execucao":1,"data":{"data":[3,4]}},
				{"execucao":1,"data":{"data":[3,4]}},
				{"execucao":1,"data":{"data":[5,6]}}
			]
		);
		
    }));

    it("teste de execução com todas as chamadas dando erro", inject(function() {

        // todas execuções com erro
        // primeiro parametro é o nome do backend mockado
        // segundo parâmetro resposta de sucesso
        // terceiro parâmetro erro de execução
        // Obs 1: chamando o método várias vezes para uma mesma transação 
        // fará com que as respostas consecutivas sejam acumuladas para serem chamadas 
        // na sequência de execução
        SuperMock.mockarRespostaBackend("contas", null, { execucao: 2, data: { messages: ["Teste erro 1"] } });
        SuperMock.mockarRespostaBackend("login", null, { execucao: 2, data: { messages: ["Teste erro 2"] } });
        SuperMock.mockarRespostaBackend("acessos", null, { execucao: 2, data: { messages: ["Teste erro 3"] } });

        ctrl.testarExecucaoBackend();

		expect(ctrl.retornosBackend).toEqual(
			[
				{"execucao":2,"data":{"messages":["Teste erro 1"]}},
				null,
				{"execucao":2,"data":{"messages":["Teste erro 1"]}},
				{"execucao":2,"data":{"messages":["Teste erro 2"]}},
				{"execucao":2,"data":{"messages":["Teste erro 2"]}},
				{"execucao":2,"data":{"messages":["Teste erro 3"]}}
			]
		);

    }));

    it("teste de execução com sucessos consecutivos diferentes e erro após um certo número de chamadas", inject(function() {

        // primeira, segunda e terceira com responses de sucessos diferentes, quarta em diante dará erro
        SuperMock.mockarRespostaBackend("contas", { execucao: 3, data: { data: [1, 2] } });
        SuperMock.mockarRespostaBackend("contas", { execucao: 3, data: { data: [2, 1] } });
        SuperMock.mockarRespostaBackend("contas", { execucao: 3, data: { data: [3, 4] } });
        SuperMock.mockarRespostaBackend("contas", null, { execucao: 3, data: { messages: ["Teste erro 1"] } });

        // primeira com um response de sucesso, segunda em diante com erro
        SuperMock.mockarRespostaBackend("login", { execucao: 3, data: { data: [3, 4] } });
        SuperMock.mockarRespostaBackend("login", null, { execucao: 3, data: { messages: ["Teste erro 2"] } });

        // sempre dará erro
        SuperMock.mockarRespostaBackend("acessos", null, { execucao: 3, data: { messages: ["Teste erro 3"] } });

        ctrl.testarExecucaoBackend();

		expect(ctrl.retornosBackend).toEqual(
			[
				{"execucao":3,"data":{"data":[1,2]}},
				{"execucao":3,"data":{"data":[2,1]}},
				{"execucao":3,"data":{"data":[3,4]}},
				{"execucao":3,"data":{"messages":["Teste erro 2"]}},
				null,
				{"execucao":3,"data":{"data":[3,4]}},
				{"execucao":3,"data":{"messages":["Teste erro 1"]}},
				{"execucao":3,"data":{"messages":["Teste erro 2"]}},
				{"execucao":3,"data":{"messages":["Teste erro 2"]}},
				{"execucao":3,"data":{"messages":["Teste erro 3"]}}
			]
		);
		
    }));

    it("teste de execução com sucessos consecutivos diferentes e erro após um certo número de chamadas", inject(function() {

        // todas as respostas até a sexta chamada serão com sucessos diferentes, após a sexta chamadas, todos response e sucesso iguais
        SuperMock.mockarRespostaBackend("contas", { execucao: 4, data: { data: [1, 1] } });
        SuperMock.mockarRespostaBackend("contas", { execucao: 4, data: { data: [2, 1] } });
        SuperMock.mockarRespostaBackend("contas", { execucao: 4, data: { data: [3, 1] } });
        SuperMock.mockarRespostaBackend("contas", { execucao: 4, data: { data: [4, 1] } });
        SuperMock.mockarRespostaBackend("contas", { execucao: 4, data: { data: [5, 1] } });
        SuperMock.mockarRespostaBackend("contas", { execucao: 4, data: { data: [6, 1] } });

        // primeira com um response de sucesso, segunda com erro, terceira e quarta com response de sucessos diferentes
		// da quarta em diante, com o mesmo response de sucesso da quarta chamada
        SuperMock.mockarRespostaBackend("login", { execucao: 4, data: { data: [9, 1] } });
        SuperMock.mockarRespostaBackend("login", { execucao: 4, data: { data: [10, 1] } }, { execucao: 4, data: { messages: ["Teste erro 2"] } });
        SuperMock.mockarRespostaBackend("login", { execucao: 4, data: { data: [11, 1] } });
        SuperMock.mockarRespostaBackend("login", { execucao: 4, data: { data: [12, 1] } });

        // sempre dará erro
        SuperMock.mockarRespostaBackend("acessos", null, { execucao: 4, data: { messages: ["Teste erro 3"] } });

        ctrl.testarExecucaoBackend();
		console.log(JSON.stringify(ctrl.retornosBackend));

		expect(ctrl.retornosBackend).toEqual(
			[
				{"execucao":4,"data":{"data":[1,1]}},
				{"execucao":4,"data":{"data":[2,1]}},
				{"execucao":4,"data":{"data":[9,1]}},
				{"execucao":4,"data":{"messages":["Teste erro 2"]}},
				{"execucao":4,"data":{"data":[10,1]}},
				{"execucao":4,"data":{"data":[3,1]}},
				{"execucao":4,"data":{"data":[11,1]}},
				{"execucao":4,"data":{"data":[12,1]}},
				{"execucao":4,"data":{"messages":["Teste erro 3"]}}
			]
		);

    }));

});