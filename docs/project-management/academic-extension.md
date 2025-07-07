### **1. Diagnóstico e Teorização**

- **1.1 - Identificação das partes envolvidas e parceiros**
    - Selecionar uma comunidade/parceiro local (ex.: lanchonete, mercadinho, ONG etc.).
    - Coletar informações básicas (nome, endereço, CNPJ, site, contatos).
    - Levantar perfil dos envolvidos (idade, gênero, escolaridade, etc.)
    
    ### Resposta
    
    **Público-alvo:** Brasileiros inadimplentes.
    
    **Localização:** Presentes em todos os estados do Brasil, abrangendo áreas urbanas e rurais.
    
    **Perfil dos envolvidos:**
    
    Segundo o Mapa da Inadimplência da Serasa (2024), os inadimplentes no Brasil se concentram principalmente nas seguintes faixas etárias:
    
    - 41 a 60 anos – 35,1%
    - 26 a 40 anos – 34%
    - Acima de 60 anos – 18,9%
    - 18 a 25 anos – 11,7%
        
        Fonte: [Serasa](https://www.serasa.com.br/limpa-nome-online/blog/mapa-da-inadimplencia-e-renogociacao-de-dividas-no-brasil/)
        
    
    **Parceiro Institucional:** Nenhum parceiro fixo institucional (CNPJ), por se tratar de um público generalizado. O projeto terá abordagem digital com acesso aberto à população inadimplente.
    
- **1.2 - Situação problema identificada**
    - Observar/entrevistar os parceiros para identificar problemas práticos.
    - Redigir o diagnóstico do problema
    
    ### Resposta
    
    A inadimplência no Brasil tem atingido níveis elevados, com milhões de cidadãos enfrentando restrições no nome, dificultando o acesso ao crédito, à contratação de serviços essenciais e ao planejamento financeiro. Um dos principais entraves enfrentados por essa população é a **falta de organização financeira**, aliada à **dificuldade em compreender juros, renegociações e projeções de orçamento**.
    
    Atualmente, muitos brasileiros utilizam métodos pouco eficientes para controle financeiro, como anotações em cadernos ou o uso limitado de aplicativos bancários. Estes, embora úteis para transações básicas, não oferecem funcionalidades como **projeção de gastos e economia futura**, **simulação de reserva de emergência** ou **planejamento anual com base na renda real**.
    
    A ausência de uma ferramenta acessível, simples e segura que centralize essas funcionalidades contribui para a perpetuação do ciclo de endividamento e a falta de autonomia financeira.
    
- **1.3 - Demanda sociocomunitária e motivação acadêmica**
    - Analisar como o problema impacta a comunidade
    - Relacionar a solução com a formação acadêmica (uso de Android, etc.)
    
    ### Resposta
    
    A situação-problema impacta diretamente a qualidade de vida dos inadimplentes brasileiros, afetando não apenas sua **saúde financeira**, mas também seu bem-estar emocional, acesso ao consumo básico, crédito e dignidade social.
    
    A implementação de um **aplicativo Android voltado para o planejamento financeiro e a projeção de gastos futuros** surge como resposta à demanda sociocomunitária por maior controle e clareza sobre suas finanças pessoais. O aplicativo será desenvolvido com foco em usabilidade, educação financeira e funcionalidades práticas, como:
    
    - Cadastro de dívidas e metas de pagamento;
    - Planejamento financeiro mensal e anual;
    - Simulação de reserva de emergência;
    
    Além disso, o projeto proporciona ao aluno uma **vivência prática interdisciplinar**, envolvendo conceitos de programação mobile (React Native), design de interfaces (UI/UX), modelagem de dados, desenvolvimento ágil e aplicação de princípios de educação financeira — alinhando-se com a formação acadêmica no campo da tecnologia e extensão universitária.
    
- **1.4 - Objetivos a serem alcançados**
    - Definir objetivos claros e mensuráveis
    - Relacionar os objetivos com as necessidades identificadas
    
    ### Resposta
    
    ### **Objetivo Geral:**
    
    Desenvolver um aplicativo Android que permita ao usuário organizar suas finanças pessoais, planejar metas, projetar economias e visualizar suas dívidas de forma clara e intuitiva.
    
    ### **Objetivos Específicos:**
    
    - Criar um sistema de cadastro e visualização de dívidas e despesas recorrentes;
    - Implementar uma funcionalidade de projeção de economia futura, considerando cenários de 3, 6 e 12 meses;
    - Permitir ao usuário cadastrar metas financeiras (ex: quitar dívida, montar reserva);
    - Reduzir o uso de métodos manuais (como anotações em papel) entre os usuários envolvidos no projeto;
    - Promover o aprendizado de boas práticas de desenvolvimento Android e educação financeira;
    - Validar a eficácia do aplicativo através de testes com usuários reais e análise comparativa do comportamento financeiro antes e depois do uso.

---

### **2. Planejamento para Desenvolvimento do Projeto**

- **2.1 - Plano de trabalho com cronograma**
    - Esboçar etapas do projeto (ex: levantamento, design, desenvolvimento, testes)
    - Definir prazos realistas e recursos necessários
    - Criar um cronograma (tabela ou lista com datas)
    
    ### Resposta
    
    **Fases do projeto:**
    
    | Etapa | Descrição | Duração Estimada | Ferramentas/Recursos |
    | --- | --- | --- | --- |
    | Levantamento de requisitos | Definição das funcionalidades com base nas dores identificadas | 1 semana | Entrevistas, pesquisas, canvas |
    | Design (UI/UX) | Protótipos no Figma com base na jornada do usuário | 1 semana | Figma, feedback dos usuários |
    | Configuração do banco | Modelagem e implementação no MongoDB Realm (sync & offline ready) | 1 semana | MongoDB Realm |
    | Back-end | Criação dos controladores, regras de negócio e testes | 2 semanas | Realm Functions (serverless) |
    | Front-end | Construção das telas em React Native, conexão com Realm | 2 semanas | React Native, Realm SDK |
    | Testes | Testes de usabilidade e correções | 1 semana | Expo Go, emuladores, feedback |
    | Deploy | Publicação em loja (ou via Expo) + documentação | 1 semana | Expo, GitHub, Notion |
- **2.2 - Metodologia**
    - Listar os métodos utilizados (entrevistas, prototipação, programação, testes)
    - Explicar como cada um será aplicado
    
    ### Resposta
    
    A metodologia adotada para o desenvolvimento deste projeto será baseada em práticas ágeis, com foco iterativo, centrado no usuário, e utilizando ferramentas modernas que favorecem a produtividade, a validação rápida e a acessibilidade offline.
    
    **Etapas metodológicas:**
    
    - **1. Entrevistas e pesquisa com usuários reais**
        
        Serão realizadas entrevistas e observações com pessoas inadimplentes ou com dificuldades financeiras, buscando entender:
        
        - Dores e dificuldades com planejamento financeiro
        - Barreiras tecnológicas
        - Preferências por interfaces e funcionalidades
        
        Essas informações orientarão o escopo inicial e a criação de personas.
        
    - **2. Prototipação (UI/UX no Figma)**
        
        Após o levantamento dos requisitos, serão criados protótipos de alta fidelidade no **Figma**, simulando as principais telas e fluxos da aplicação. Esses protótipos serão validados com usuários para garantir clareza, acessibilidade e usabilidade antes do desenvolvimento.
        
    - **3. Desenvolvimento incremental com testes contínuos**
        - **Back-end**: Usando **MongoDB Realm**, serão criadas as coleções e regras de acesso, com funções serverless para lógica de negócio. Realm permite sincronização offline, ideal para uso em dispositivos móveis sem conexão constante.
        - **Front-end**: Será utilizado **React Native** com o SDK do Realm para construir interfaces nativas. A lógica será baseada nos protótipos aprovados, com foco em simplicidade e clareza visual.
        - As etapas de desenvolvimento seguirão um modelo iterativo, com pequenas entregas funcionais sendo testadas e avaliadas em ciclos curtos.
    - **4. Testes (funcionais e de usabilidade)**
        - **Testes manuais** serão realizados a cada nova funcionalidade (inserção de dados, navegação, simulações).
        - **Testes com usuários** serão conduzidos com versões publicadas via **Expo**, utilizando QR code para facilitar o acesso e simular o uso real.
        - Será priorizado o feedback direto do público-alvo, com ajustes baseados em dificuldades observadas e sugestões.
    
    Essa metodologia garante um desenvolvimento eficiente, com foco prático e constante validação com os usuários finais.
    
- **2.3 - Avaliação dos resultados**
    - Estabelecer métricas (ex: redução de erros, aumento da eficiência)
    - Criar questionários, comparativos ou observações diretas
    
    ### Respostas:
    
    - **Métricas principais:**
        - Número de usuários que conseguem inserir e visualizar suas dívidas
        - Quantos conseguiram simular uma reserva até o fim do ano
        - Percentual de compreensão da interface sem ajuda externa
        - Quantos passaram a acompanhar sua vida financeira mensalmente após 1 mês de uso
    - **Ferramentas de avaliação:**
        - **Questionário** simples via Google Forms ou diretamente no app
        - **Comparação antes/depois**: comportamento antes de usar o app x depois (auto-relato)
        - **Observação direta** de uso em protótipos, acompanhando tempo de interação e dificuldades
        - **Feedbacks abertos** sobre o impacto na organização das finanças pessoais

---

### **3. Encerramento do Projeto**

- **3.1 - Evidências das atividades**
    - Reunir materiais comprobatórios (prints, fotos, vídeos, links do repositório, etc.)
    - Escrever descrições contextualizadas para cada evidência
- **3.2 - Redigir o Termo de Responsabilidade**
    - Confirmar a realização com participação comunitária
    - Preencher os dados (nome completo e local)