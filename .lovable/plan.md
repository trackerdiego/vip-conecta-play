

# Perfil Funcional + Termos de Uso

## Situação Atual
Ambas as telas de perfil (influencer e driver) usam dados mockados e os botões do menu não fazem nada. Não existe página de Termos de Uso.

## O que será feito

### 1. Perfis com dados reais do banco
- Substituir `mockInfluencer`/`mockDriver` por dados do `useAuthStore` (profile + user)
- Exibir nome real, nível, código de indicação, e-mail, telefone
- Permitir edição de nome e telefone inline (com UPDATE na tabela `profiles`)

### 2. Página de Dados Pessoais
- Nova página `/influencer/personal-data` e `/driver/personal-data`
- Formulário com: nome, telefone, e-mail (read-only)
- Botão salvar que faz UPDATE no `profiles`

### 3. Página de Termos de Uso
- Nova página `/terms` (pública, sem autenticação)
- Conteúdo jurídico completo cobrindo:
  - Natureza da plataforma (intermediação, sem vínculo empregatício)
  - Isenção de responsabilidade por atos de terceiros
  - Uso do programa de indicação por conta e risco do usuário
  - Limitação de responsabilidade da empresa
  - Política de pagamentos e comissões
  - Propriedade intelectual
  - Rescisão e suspensão de conta
  - Proteção de dados (LGPD)
  - Foro e legislação aplicável

### 4. Conectar menu items
- "Dados pessoais" → navega para `/influencer/personal-data` ou `/driver/personal-data`
- "Termos de uso" → navega para `/terms`
- "Ajuda e suporte" → link WhatsApp ou similar
- "Configurações" → placeholder por ora

### 5. Rotas no App.tsx
- Adicionar rota `/terms` (pública)
- Adicionar rotas protegidas para dados pessoais

### Arquivos a criar/editar
- `src/pages/Terms.tsx` — página de termos completa
- `src/pages/influencer/PersonalData.tsx` — edição de dados
- `src/pages/driver/PersonalData.tsx` — edição de dados
- `src/pages/influencer/Profile.tsx` — usar dados reais + navegação
- `src/pages/driver/Profile.tsx` — usar dados reais + navegação
- `src/App.tsx` — novas rotas

