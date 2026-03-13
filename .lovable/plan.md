

# Estratégia de Funcionalidades para Maximizar Divulgação e Vendas

Analisei o app atual e identifiquei que vocês já têm a base (auth, wallet, missões, referral codes, integração Multipedidos). Aqui estão as abordagens que considero mais impactantes, organizadas por prioridade:

---

## 1. Rastreamento de Vendas por Link (Prioritário)

Hoje o link de referral existe mas não rastreia vendas reais. Precisamos conectar o pedido do Multipedidos ao influenciador que indicou.

- **Como funciona**: O link `paradadoacai.app/r/CODIGO` redireciona para o cardápio online (pedir.delivery) com o código salvo em cookie/UTM. Quando o pedido chega via webhook, a edge function identifica o influenciador e credita a comissão automaticamente na wallet dele.
- **Impacto**: Sem isso, nada funciona. É o motor do sistema.

## 2. Gerador de Criativos para Stories

Tela onde o influenciador gera imagens prontas para postar nos stories com seu link/QR code embutido.

- **Templates pré-prontos** com promoções do dia (puxadas do cardápio via API pública do Multipedidos)
- **QR Code** gerado automaticamente com o link do influenciador
- **Botão "Postar Agora"** usando Web Share API (que vocês já usam)
- **Impacto**: Remove a barreira de "o que postar". Quanto mais fácil, mais stories.

## 3. Missões Diárias Gamificadas (já existe base)

Expandir o sistema de missões atual para incentivar postagens:

- "Poste 3 stories hoje" → R$ 5 de bônus
- "Faça 5 vendas esta semana" → desbloqueie nível
- "Indique outro influenciador" → bônus duplo
- **Streak system**: dias consecutivos postando = multiplicador de comissão
- **Impacto**: Engajamento diário constante.

## 4. Ranking e Competição Social

Leaderboard semanal/mensal dos influenciadores que mais venderam.

- **Top 10** visível para todos (motivação por competição)
- **Prêmios semanais** para os primeiros colocados
- **Impacto**: Competição saudável gera mais esforço.

## 5. Notificações de Venda em Tempo Real

Push notification + animação no app quando uma venda é feita pelo link do influenciador.

- "🎉 Você acabou de ganhar R$ 5,00! Maria comprou pelo seu link"
- **Som de "cha-ching"** + confetti animation
- **Impacto**: Dopamina instantânea = mais motivação para continuar postando.

---

## Recomendação de Implementação

Sugiro começar por **1 (Rastreamento de Vendas)** + **2 (Gerador de Criativos)**, pois juntos formam o ciclo completo: o influenciador tem o que postar E recebe quando vende.

### O que seria construído tecnicamente:

1. **Landing page `/r/:code`** que salva o referral code em cookie e redireciona para o cardápio
2. **Webhook aprimorado** que vincula pedidos ao influenciador e credita wallet
3. **Tela "Criar Story"** com templates, QR code e integração com Web Share
4. **Tabela `referral_sales`** para rastrear cada venda por influenciador
5. **Leaderboard** com query agregada das vendas

Quer que eu implemente essa abordagem?

