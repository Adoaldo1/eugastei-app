# Sistema de Filtros para Transações Financeiras

## Visão Geral

O sistema de filtros para transações financeiras permite que os usuários filtrem suas transações usando múltiplos critérios combinados, facilitando a análise e organização de seus dados financeiros.

## Funcionalidades Implementadas

### Backend (services/transactions.ts)
- Adicionada nova função `getAllWithFilters()` que aceita um objeto com os filtros selecionados
- Interface TypeScript `TransactionFilters` que define todos os filtros possíveis
- Suporte para os seguintes filtros:
  - Tipo de transação (receita/despesa)
  - Categoria (ID da categoria)
  - Data (intervalo entre duas datas)
  - Valor (mínimo e máximo)
  - Método de pagamento
  - Busca por texto no nome da transação
  - Ordenação por data ou valor (crescente/decrescente)

### Frontend
#### Componentes
- `TransactionFiltersPanel`: Componente dedicado para seleção de filtros
  - Interface intuitiva com campos apropriados para cada tipo de filtro
  - Carrega categorias dinâmicamente do usuário autenticado
  - Suporte para limpar todos os filtros

#### Integração
- Página de transações atualizada para usar o sistema de filtros
- Botão para mostrar/ocultar o painel de filtros
- Indicador visual do número de filtros ativos
- Mensagens informativas sobre os resultados filtrados
- Atualização automática da lista ao alterar filtros

## Como Usar

1. Navegue até a página de Transações
2. Clique no botão "Mostrar Filtros" para exibir o painel de filtros
3. Selecione os filtros desejados:
   - Tipo de transação: Receitas ou Despesas
   - Categoria: Selecione entre suas categorias cadastradas
   - Data: Defina um intervalo de datas (inicial e final)
   - Valor: Defina valores mínimo e máximo
   - Método de pagamento: Escolha entre os métodos disponíveis
   - Ordenação: Escolha como ordenar os resultados
   - Busca por texto: Digite termos para buscar nos nomes das transações
4. A lista de transações será atualizada automaticamente conforme os filtros são aplicados
5. Use o botão "Limpar filtros" para resetar todos os filtros de uma vez

## Funcionamento Técnico

Os filtros são aplicados no backend usando a API do Supabase, o que garante:
- Melhor performance por filtrar no banco de dados, não no frontend
- Redução do volume de dados transmitidos
- Operações seguras com validação de usuário

As consultas Supabase aplicam os seguintes modificadores conforme necessário:
- `.eq()` para filtros exatos (tipo, categoria, método)
- `.gte()` e `.lte()` para intervalos (data, valor)
- `.ilike()` para busca de texto
- `.order()` para ordenação

## Possíveis Melhorias Futuras

- Salvar perfis de filtros frequentemente usados
- Adicionar filtros avançados (tags, descrição)
- Gerar relatórios baseados nos filtros aplicados
- Exportar resultados filtrados para CSV/Excel 