# SuperMock.js
Biblioteca com funções para melhorar o acesso e a legibilidade às funções do karma/jasmine em testes unitários de forma mais intuitiva.

# Executando o projeto
Clone o projeto e execute os seguintes comandos no terminal, na pasta do projeto baixado:

        npm install
        
        npx karma start

# Funcionalidades providas

SuperMock
        Variável global que provê as funcionalidades desta biblioteca

SuperMock.mockarRespostaBackend()
        Provê um factory angular que emula um backend.

SuperMock.mockarRespostaBackend()
        Inclui uma resposta de erro ou sucesso para execução posterior durante a execução do teste unitário
        
        primeiro parâmetro: nome do serviço backend a ser mockado
        segundo parâmetro: response de sucesso ao executar o serviço do backend mockado
        terceiro parâmetro: response de erro ao executar o serviço do backend mockado

        Chamadas consecutivas a este método farão com que durante as execuções de testes a este mesmo backend, tenham respostas diferentes, na sequencia em que foi mockado o backend. 
        Caso especifique um response de erro e sucesso ao mesmo tempo, a execução do backend dará erro. Entretanto, se houver um then após o catch de tratamento deste erro, o response de sucesso será executado na recuperação do erro de execução.
