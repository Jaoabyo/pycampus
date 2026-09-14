import { Icon } from './ui.jsx';
import { lessons, projects } from './curriculum.js';
import { practiceProjects } from './practice-content.js';
import { PYTHON_VERSAO, SQLITE_VERSAO, mudancas } from './sobre.js';
import './sobre.css';

// Página pedida pelo mediador da disciplina: quem chega pelo link precisa saber o que isto é,
// em que versão do Python roda, o que o ambiente não faz, e por onde reclamar quando algo
// estiver errado. Sem isso, um colega encontra uma limitação e conclui que a plataforma mente.
const REPO = 'https://github.com/Jaoabyo/pycampus';

export default function Sobre({ navigate }) {
  return <>
    <div className="page-heading">
      <div className="lesson-title">
        <span className="icon-tile purple"><Icon name="Info" size={25} /></span>
        <div><div className="eyebrow">O QUE É E COMO USAR</div><h1>Sobre o PyCampus</h1>
          <p>Feito por um estudante, para estudar. Aberto para quem quiser usar.</p></div>
      </div>
    </div>

    <div className="settings-list">
    <section className="card sobre-aviso">
      <div className="step-head"><span className="icon-tile yellow"><Icon name="Lightbulb" size={21} /></span>
        <div><div className="eyebrow">ANTES DE MAIS NADA</div><h3>Isto é material complementar</h3></div></div>
      <p>O PyCampus <strong>não substitui</strong> o roteiro, o material nem as aulas da sua disciplina. Ele serve para praticar entre uma aula e outra. Quando algo aqui divergir do que seu professor ensinou, <strong>o material da disciplina vale</strong>.</p>
      <p>Não há diploma, certificado nem correção docente. As conferências automáticas comparam a saída do seu programa com a esperada — isso mostra que um caso funciona, não que você domina o assunto.</p>
    </section>

    <section className="card">
      <div className="step-head"><span className="icon-tile blue"><Icon name="SquareTerminal" size={21} /></span>
        <div><div className="eyebrow">O AMBIENTE</div><h3>Qual Python roda aqui</h3></div></div>
      <ul className="sobre-lista">
        <li><strong>Python {PYTHON_VERSAO}</strong>, compilado para o navegador (Pyodide). É CPython de verdade, não um simulador.</li>
        <li><strong>SQLite {SQLITE_VERSAO}</strong>, usado nas aulas de banco de dados.</li>
        <li>A biblioteca padrão está disponível. <strong>Pacotes externos não</strong>: nada de <code>pip install</code>, <code>requests</code>, <code>pandas</code> ou <code>numpy</code>.</li>
        <li>Seu programa <strong>não acessa a internet</strong> nem a rede.</li>
        <li>Arquivos criados pelo seu código são <strong>temporários</strong>: somem quando a aba fecha.</li>
        <li>Cada execução tem limite de <strong>15 segundos</strong>. Laço infinito é interrompido em vez de travar o navegador.</li>
      </ul>
      <p className="small">Diferenças entre versões do Python existem. Se seu professor usar outra versão, algo pode se comportar diferente — e nesse caso a versão da disciplina é a que vale para a prova.</p>
    </section>

    <section className="card">
      <div className="step-head"><span className="icon-tile orange"><Icon name="TriangleAlert" size={21} /></span>
        <div><div className="eyebrow">SEJA AVISADO</div><h3>Limitações conhecidas</h3></div></div>
      <ul className="sobre-lista">
        <li><strong>Sem ligar a nuvem, seu progresso é deste aparelho</strong> e vive no navegador — limpar os dados do navegador apaga tudo. Em Configurações dá para guardá-lo num Gist privado da sua conta do GitHub, ou exportar um backup.</li>
        <li><strong>O Lumi, o ajudante com IA, precisa de um modelo rodando no computador de quem estuda.</strong> Sem isso ele mostra as dicas escritas, que funcionam sempre, mas não conversa.</li>
        <li><strong>Responder ao <code>input()</code> durante a execução depende do navegador.</strong> O site publicado consegue isso a partir da segunda abertura, quando o service worker já está instalado; em navegador que não permite, a plataforma avisa e as respostas são preenchidas antes de executar, no campo próprio. As duas formas funcionam — o exercício é o mesmo.</li>
        <li><strong>O primeiro carregamento do Python leva alguns segundos</strong> e precisa de internet. Depois disso, as aulas abrem offline.</li>
        <li><strong>As explicações escritas não são corrigidas automaticamente.</strong> A plataforma não julga se o seu texto demonstra entendimento.</li>
      </ul>
    </section>

    <section className="card">
      <div className="step-head"><span className="icon-tile teal"><Icon name="Hammer" size={21} /></span>
        <div><div className="eyebrow">ENCONTROU UM ERRO?</div><h3>Me avise, por favor</h3></div></div>
      <p>Conteúdo errado é pior que conteúdo ausente. Se uma explicação confundir, um exercício pedir algo que nunca foi ensinado, ou uma resposta certa for recusada, avise:</p>
      <div className="button-row">
        <a className="button primary" href={`${REPO}/issues/new`} target="_blank" rel="noreferrer"><Icon name="Link" size={16} /> Relatar um problema</a>
        <a className="button outline" href={REPO} target="_blank" rel="noreferrer"><Icon name="FolderCode" size={16} /> Ver o código</a>
      </div>
      <p className="small">Ao relatar, diga em qual aula ou exercício aconteceu e o que você esperava. Se der, cole o código e a mensagem de erro.</p>
    </section>

    <section className="card">
      <div className="step-head"><span className="icon-tile pink"><Icon name="BookOpenCheck" size={21} /></span>
        <div><div className="eyebrow">O QUE TEM AQUI</div><h3>{lessons.length} aulas, {practiceProjects.length} miniprojetos e {projects.length} projetos</h3></div></div>
      <p>A sequência segue o método PRIMM: prever a saída, investigar por que ela acontece, mudar uma parte e só então criar a sua versão. Cada exercício é conferido comparando a saída do seu programa com a esperada, no Python de verdade.</p>
      <div className="button-row"><button className="button outline" onClick={() => navigate('course')}>Ver a formação <Icon name="ArrowRight" size={15} /></button></div>
    </section>

    <section className="card">
      <div className="step-head"><span className="icon-tile purple"><Icon name="Sparkles" size={21} /></span>
        <div><div className="eyebrow">O QUE MUDOU</div><h3>Histórico de melhorias</h3></div></div>
      <ul className="sobre-mudancas">{mudancas.map(item => (
        <li key={item.data}>
          <span className="sobre-data">{item.data.split('-').reverse().join('/')}</span>
          <span>{item.texto}</span>
        </li>
      ))}</ul>
      <p className="small">Este é um projeto em desenvolvimento. Correções e melhorias entram conforme aparecem.</p>
    </section>
    </div>
  </>;
}
