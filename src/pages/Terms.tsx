import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Termos de Uso</h1>
        <p className="text-xs text-muted-foreground mb-6">Última atualização: 14 de março de 2026</p>

        <div className="prose prose-sm max-w-none text-foreground/90 space-y-6">
          <section>
            <h2 className="text-lg font-bold text-foreground">1. Aceitação dos Termos</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Ao acessar ou utilizar a plataforma Parada VIP ("Plataforma"), incluindo o aplicativo móvel e quaisquer serviços relacionados, você ("Usuário") concorda integralmente com os presentes Termos de Uso. Caso não concorde com qualquer disposição, não utilize a Plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">2. Natureza da Plataforma</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A Parada VIP atua exclusivamente como <strong>plataforma de intermediação tecnológica</strong>, conectando estabelecimentos comerciais, entregadores autônomos e divulgadores independentes. A Plataforma <strong>não é empregadora, não mantém vínculo empregatício, societário ou de qualquer outra natureza</strong> com os Usuários cadastrados, sejam eles entregadores, influenciadores digitais ou parceiros comerciais.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Os entregadores e divulgadores são profissionais autônomos que utilizam a Plataforma por livre e espontânea vontade, assumindo integralmente os riscos de sua atividade profissional, incluindo, mas não se limitando a, despesas com veículo, combustível, manutenção, equipamentos de proteção e encargos tributários.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">3. Cadastro e Responsabilidade do Usuário</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              O Usuário é integralmente responsável pela veracidade, exatidão e atualização das informações fornecidas no cadastro. A Plataforma reserva-se o direito de suspender ou cancelar contas que contenham informações falsas, incompletas ou que violem estes Termos.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              O Usuário compromete-se a manter a confidencialidade de suas credenciais de acesso, sendo o único responsável por qualquer atividade realizada em sua conta.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">4. Programa de Indicação e Comissões</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A Plataforma disponibiliza um programa de indicação ("Programa de Afiliados") no qual divulgadores podem compartilhar links de referência e receber comissões sobre vendas realizadas por meio de seus códigos. As taxas de comissão são definidas exclusivamente pela Plataforma e podem ser alteradas a qualquer momento, sem aviso prévio.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              O Usuário reconhece que a participação no programa de indicação é <strong>por sua conta e risco</strong>, não havendo garantia de renda mínima, volume de vendas ou retorno financeiro. A Plataforma <strong>não se responsabiliza</strong> por expectativas de ganho não concretizadas.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              É expressamente proibida qualquer prática de spam, publicidade enganosa, uso indevido de marca ou criação de conteúdo que possa prejudicar a imagem da Plataforma ou de terceiros. A violação desta cláusula resultará em cancelamento imediato da conta e perda de comissões pendentes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">5. Limitação de Responsabilidade</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A Parada VIP <strong>não se responsabiliza</strong>, em nenhuma hipótese, por:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>Danos diretos, indiretos, incidentais, especiais ou consequenciais decorrentes do uso ou impossibilidade de uso da Plataforma;</li>
              <li>Atos, omissões, condutas ou comportamentos de terceiros, incluindo entregadores, consumidores e estabelecimentos parceiros;</li>
              <li>Acidentes, furtos, roubos, avarias ou qualquer outro incidente ocorrido durante a prestação de serviços de entrega;</li>
              <li>Qualidade, segurança, legalidade ou adequação dos produtos entregues pelos estabelecimentos parceiros;</li>
              <li>Interrupções, falhas técnicas, indisponibilidade temporária ou erros da Plataforma;</li>
              <li>Perdas financeiras, lucros cessantes ou danos morais decorrentes da participação no programa de indicação;</li>
              <li>Conteúdo gerado, publicado ou compartilhado pelos Usuários em redes sociais ou outros meios.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">6. Política de Pagamentos e Saques</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Os valores creditados na carteira digital do Usuário estarão disponíveis para saque conforme as regras vigentes na Plataforma. A Parada VIP reserva-se o direito de reter pagamentos em caso de suspeita de fraude, irregularidade ou violação destes Termos, podendo realizar auditorias e solicitar documentação comprobatória.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Os saques serão processados exclusivamente via PIX, para chaves cadastradas e validadas pelo Usuário. A Plataforma não se responsabiliza por transferências realizadas para chaves incorretas informadas pelo Usuário.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">7. Propriedade Intelectual</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Todo o conteúdo da Plataforma, incluindo marca, logotipo, design, textos, imagens, código-fonte e funcionalidades, é de propriedade exclusiva da Parada VIP ou de seus licenciadores, protegido pela legislação brasileira de propriedade intelectual. É vedada a reprodução, distribuição ou modificação sem autorização expressa e por escrito.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">8. Suspensão e Encerramento de Conta</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A Plataforma reserva-se o direito de, a seu exclusivo critério e sem necessidade de justificativa prévia, suspender temporariamente ou encerrar definitivamente a conta de qualquer Usuário que viole estes Termos, pratique atividades fraudulentas, comprometa a segurança da Plataforma ou cause prejuízos a terceiros.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Em caso de encerramento por violação, o Usuário perderá o direito a quaisquer valores pendentes de saque, sem direito a indenização.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">9. Proteção de Dados (LGPD)</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A Parada VIP está comprometida com a proteção de dados pessoais em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD). Os dados coletados serão utilizados exclusivamente para a operação da Plataforma, processamento de pagamentos e comunicação com o Usuário.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              O Usuário poderá solicitar acesso, correção ou exclusão de seus dados pessoais entrando em contato através dos canais de suporte da Plataforma. A exclusão de dados poderá resultar na impossibilidade de utilização de determinadas funcionalidades.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">10. Indenização</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              O Usuário concorda em indenizar, defender e manter indene a Parada VIP, seus diretores, funcionários, agentes e parceiros de quaisquer reclamações, demandas, perdas, responsabilidades, danos, custos e despesas (incluindo honorários advocatícios) decorrentes de: (i) uso da Plataforma pelo Usuário; (ii) violação destes Termos; (iii) violação de direitos de terceiros; (iv) conteúdo gerado pelo Usuário.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">11. Modificações dos Termos</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A Parada VIP reserva-se o direito de modificar estes Termos a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação na Plataforma. O uso continuado da Plataforma após tais modificações constitui aceitação dos novos Termos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">12. Disposições Gerais</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A eventual invalidade ou inexequibilidade de qualquer cláusula destes Termos não afetará a validade das demais disposições. A tolerância quanto ao descumprimento de qualquer obrigação não implica renúncia ao direito de exigi-la posteriormente.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">13. Foro e Legislação Aplicável</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca da sede da empresa como competente para dirimir quaisquer controvérsias oriundas destes Termos, com renúncia expressa a qualquer outro, por mais privilegiado que seja.
            </p>
          </section>

          <div className="border-t border-border pt-4 mt-8">
            <p className="text-xs text-muted-foreground text-center">
              © 2026 Parada VIP. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
