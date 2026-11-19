import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, Plus, Trash2, CheckCircle2, GraduationCap,
  LayoutDashboard, ClipboardList, BookOpen, Layers, Edit2, LogOut,
  Lock, UserCheck, Calendar, Printer, FileText, Download, Check, X,
  Clock, ShieldAlert, Sparkles, Smartphone, Monitor, ChevronRight, RefreshCw, Copy, User, AlertTriangle, Bell,
  Award, BarChart3, TrendingUp, Archive, ArrowUpRight
} from 'lucide-react';

// --- MOTOR DE PERSISTÊNCIA 100% WEB (LOCAL STORAGE) ---
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Erro ao ler ${key} do localStorage`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Erro ao gravar ${key} no localStorage`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [viewMode, setViewMode] = useState('login'); 
  const [loginEmailOuNumero, setLoginEmailOuNumero] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [loginErro, setLoginErro] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard'); // Nova aba padrão de Boas-Vindas
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  
  const [dialog, setDialog] = useState({ isOpen: false, message: '', onConfirm: null });

  // --- BASE DE DADOS 100% WEB ---
  const [credenciaisDiretor, setCredenciaisDiretor] = useLocalStorage('sigep_credenciais', {
    email: 'admin', senha: 'admin', nome: 'Diretor Pedagógico'
  });
  const [dadosEscola, setDadosEscola] = useLocalStorage('sigep_escola', {
    nome: 'Complexo Escolar • Lunda-Sul', provincia: 'Lunda-Sul', municipio: 'Saurimo', diretorPedagogico: 'Diretor Geral', codigoEscola: 'EP-12345'
  });
  const [ciclos, setCiclos] = useLocalStorage('sigep_ciclos', [
    { id: 'c1', nome: 'Ensino Primário', tipo: 'primario', disciplinas: ['Língua Portuguesa', 'Matemática', 'Estudo do Meio', 'Educação Física', 'Educação Musical e Plástica'] },
    { id: 'c2', nome: 'Primeiro Ciclo do Ensino Secundário', tipo: 'secundario', disciplinas: ['Língua Portuguesa', 'Matemática', 'Física', 'Química', 'Biologia', 'História', 'Geografia'] }
  ]);
  const [turmas, setTurmas] = useLocalStorage('sigep_turmas', [
    { id: 't1', nome: '1ª Classe - Turma A', cicloId: 'c1', vagas: 35, perfilIdade: 'regular' }
  ]);
  const [alunos, setAlunos] = useLocalStorage('sigep_alunos', [
    { id: 'a1', nome: 'Ana Costa', numero: '1', idade: 6, turmaId: 't1', senha: '123', status: 'aprovado' }
  ]);
  const [pedidosAlunos, setPedidosAlunos] = useLocalStorage('sigep_pedidos_alunos', []);
  const [reconfirmacoesPendentes, setReconfirmacoesPendentes] = useLocalStorage('sigep_reconfirmacoes', []);
  const [arquivoFinalistas, setArquivoFinalistas] = useLocalStorage('sigep_finalistas', []);
  const [professores, setProfessores] = useLocalStorage('sigep_professores', []);
  const [pedidosProfessores, setPedidosProfessores] = useLocalStorage('sigep_pedidos_professores', [
    { id: 'ped_1', nome: 'Prof. Carlos Mendes', email: 'carlos@escola.com', contacto: '+244 923 000 111', especialidade: 'Física', turmasAtribuidas: ['t1'], atribuicoes: [{turmaId: 't1', disciplina: 'Física'}], status: 'pendente' }
  ]);
  const [notas, setNotas] = useLocalStorage('sigep_notas', {});
  const [comportamentos, setComportamentos] = useLocalStorage('sigep_comportamentos', {});
  const [faltas, setFaltas] = useLocalStorage('sigep_faltas', {
    'f_ex': { id: 'f_ex', alunoId: 'a1', turmaId: 't1', data: '2026-11-01', quantidade: 4, justificada: false, trimestre: '1º Trimestre', temposSemanais: 2 }
  });
  const [manutencaoTrimestral, setManutencaoTrimestral] = useLocalStorage('sigep_manutencao', {});
  const [anoLetivoAtual, setAnoLetivoAtual] = useLocalStorage('sigep_ano_atual', '2026');

  // Estados Temporários
  const [formSeguranca, setFormSeguranca] = useState({ ...credenciaisDiretor });
  const [formEscola, setFormEscola] = useState({ ...dadosEscola });
  const [novoRegistoAluno, setNovoRegistoAluno] = useState({ nome: '', numero: '', idade: '', turmaId: 't1', senha: '' });
  const [erroRegistoAluno, setErroRegistoAluno] = useState('');
  const [novoRegistoProf, setNovoRegistoProf] = useState({ nome: '', email: '', senha: '', contacto: '', especialidade: '', turmaId: 't1', disciplina: 'Matemática' });
  const [atribuicoesRegistoTemp, setAtribuicoesRegistoTemp] = useState([{ turmaId: 't1', disciplina: 'Língua Portuguesa' }]);
  const [novaAtribRegisto, setNovaAtribRegisto] = useState({ turmaId: 't1', disciplina: '' });
  const [novaTurma, setNovaTurma] = useState({ nome: '', cicloId: 'c1', vagas: 35, perfilIdade: 'regular' });
  const [editingTurma, setEditingTurma] = useState(null);
  const [novoAluno, setNovoAluno] = useState({ nome: '', numero: '', idade: '', turmaId: '', senha: '123' });
  const [editingAluno, setEditingAluno] = useState(null);
  const [filtroAlunoPesquisa, setFiltroAlunoPesquisa] = useState('');
  const [filtroAlunoTurma, setFiltroAlunoTurma] = useState('');
  const [estatisticaTurmaId, setEstatisticaTurmaId] = useState('');

  // Estados para Ciclos e Disciplinas (CRUD 100%)
  const [novoCiclo, setNovoCiclo] = useState({ nome: '', tipo: 'primario', disciplinasStr: '' });
  const [editingCiclo, setEditingCiclo] = useState(null);
  const [novaDisciplinaCiclo, setNovaDisciplinaCiclo] = useState({});
  const [editingDisciplina, setEditingDisciplina] = useState({ cicloId: null, index: null, nome: '' });

  // Estados para Professores (CRUD 100%)
  const [novoProfessorDireto, setNovoProfessorDireto] = useState({ nome: '', email: '', senha: '123', contacto: '', especialidade: '' });
  const [editingProfessor, setEditingProfessor] = useState(null);
  const [novaAtribuicaoProf, setNovaAtribuicaoProf] = useState({ turmaId: '', disciplina: '' });

  // Estados para Faltas (CRUD 100%)
  const [lancamentoFalta, setLancamentoFalta] = useState({ cicloId: '', turmaId: '', data: new Date().toISOString().split('T')[0], quantidade: 1, temposSemanais: 2, trimestre: '1º Trimestre', justificada: false });
  const [numerosSelecionadosFalta, setNumerosSelecionadosFalta] = useState([]);
  const [editingFalta, setEditingFalta] = useState(null);
  const [filtroFalta, setFiltroFalta] = useState({ cicloId: '', turmaId: '', pesquisa: '', estado: 'todos', trimestre: '' });
  const [faltasSelecionadasLote, setFaltasSelecionadasLote] = useState([]);

  const [pautaCicloId, setPautaCicloId] = useState('');
  const [pautaClasseFiltro, setPautaClasseFiltro] = useState('');
  const [pautaTurmaId, setPautaTurmaId] = useState('');
  const [pautaDisciplina, setPautaDisciplina] = useState('');
  const [trimestreSelecionado, setTrimestreSelecionado] = useState('1º Trimestre');
  const [turmaSelecionadaManut, setTurmaSelecionadaManut] = useState('');
  const [trimestreFaltaSelecionado, setTrimestreFaltaSelecionado] = useState('1º Trimestre');
  const [boletimTurmaId, setBoletimTurmaId] = useState('');
  const [boletimAlunoId, setBoletimAlunoId] = useState('');

  const pedirConfirmacao = (message, onConfirm) => {
    setDialog({ isOpen: true, message, onConfirm });
  };

  const mostrarSucesso = (msg) => {
    setMensagemSucesso(msg);
    setTimeout(() => setMensagemSucesso(''), 3500);
  };

  const checkNegativa = (nota, tipoCiclo) => {
    if (nota === '-' || nota === '') return false;
    const v = parseFloat(nota);
    return tipoCiclo === 'primario' ? v < 5 : v < 10;
  };

  const calcularMedia = (av1, av2) => {
    const v1 = parseFloat(av1);
    const v2 = parseFloat(av2);
    if (isNaN(v1) || isNaN(v2)) return '-';
    return Math.round((v1 + v2) / 2).toString();
  };

  // --- MOTOR DE INTELIGÊNCIA DE VAGAS, IDADES E CLASSE ---
  const extrairNumeroClasse = (nomeTurma) => {
    const m = (nomeTurma || '').match(/(\d{1,2})/);
    return m ? parseInt(m[1], 10) : 1;
  };

  // Idade de referência oficial por classe (Ex: 1ª Classe = 6 anos, 7ª Classe = 12 anos, 12ª Classe = 17 anos)
  const idadeIdealPorClasse = (numClasse) => 5 + (numClasse || 1);

  const obterOcupacaoTurma = (turmaId) => {
    return alunos.filter(a => a.turmaId === turmaId).length;
  };

  const obterVagasRestantes = (turmaId) => {
    const t = turmas.find(x => x.id === turmaId);
    if (!t) return 0;
    const cap = parseInt(t.vagas, 10) || 35;
    return Math.max(0, cap - obterOcupacaoTurma(turmaId));
  };

  // Sugere automaticamente a melhor turma disponível com base na idade do aluno (e opcionalmente na classe alvo)
  const sugerirTurmaPorIdade = (idadeInput, classeAlvoOpcional = null) => {
    const idade = parseInt(idadeInput, 10);
    if (isNaN(idade) || idade < 4 || turmas.length === 0) return null;

    const classeEstimada = classeAlvoOpcional || Math.min(12, Math.max(1, idade - 5));
    const idadeIdeal = idadeIdealPorClasse(classeEstimada);
    const isIdadeAvancada = idade >= idadeIdeal + 2;

    // Filtra apenas turmas com vagas disponíveis
    const turmasComVagas = turmas.filter(t => obterVagasRestantes(t.id) > 0);
    if (turmasComVagas.length === 0) return null;

    // Pontua cada turma conforme proximidade da classe, compatibilidade etária e vagas livres
    const ordenadas = [...turmasComVagas].sort((a, b) => {
      const cA = extrairNumeroClasse(a.nome);
      const cB = extrairNumeroClasse(b.nome);
      const distA = Math.abs(cA - classeEstimada);
      const distB = Math.abs(cB - classeEstimada);

      // Prioriza turma de faixa etária maior ("mais_velhos") para repetentes/idade avançada, e "regular" para mais novos
      const bonusPerfilA = (isIdadeAvancada && a.perfilIdade === 'mais_velhos') || (!isIdadeAvancada && (a.perfilIdade || 'regular') === 'regular') ? -0.5 : 0;
      const bonusPerfilB = (isIdadeAvancada && b.perfilIdade === 'mais_velhos') || (!isIdadeAvancada && (b.perfilIdade || 'regular') === 'regular') ? -0.5 : 0;

      // Calcula média de idade atual da turma para agrupar faixas etárias compatíveis
      const alunosA = alunos.filter(al => al.turmaId === a.id);
      const alunosB = alunos.filter(al => al.turmaId === b.id);
      const mediaIdadeA = alunosA.length > 0 ? alunosA.reduce((s, al) => s + (parseInt(al.idade, 10) || idadeIdeal), 0) / alunosA.length : idadeIdeal;
      const mediaIdadeB = alunosB.length > 0 ? alunosB.reduce((s, al) => s + (parseInt(al.idade, 10) || idadeIdeal), 0) / alunosB.length : idadeIdeal;

      const scoreA = distA * 3 + bonusPerfilA + Math.abs(mediaIdadeA - idade) * 0.25;
      const scoreB = distB * 3 + bonusPerfilB + Math.abs(mediaIdadeB - idade) * 0.25;
      return scoreA - scoreB;
    });

    return {
      turma: ordenadas[0],
      vagasRestantes: obterVagasRestantes(ordenadas[0].id),
      isIdadeAvancada,
      classeEstimada
    };
  };

  // Calcula a Média Final Anual (MFD) global do aluno em todas as disciplinas do seu ciclo
  const calcularDesempenhoAnualAluno = (alunoObj) => {
    const tObj = turmas.find(t => t.id === alunoObj.turmaId);
    const cObj = ciclos.find(c => c.id === tObj?.cicloId);
    const discs = cObj?.disciplinas || [];
    const limiarAprovacao = cObj?.tipo === 'primario' ? 5 : 10;

    let somaMedias = 0;
    let totalComNota = 0;
    let negativas = 0;

    discs.forEach(d => {
      const mt1 = calcularMedia(notas[`${alunoObj.id}-${d}-1º Trimestre`]?.av1 || '', notas[`${alunoObj.id}-${d}-1º Trimestre`]?.av2 || '');
      const mt2 = calcularMedia(notas[`${alunoObj.id}-${d}-2º Trimestre`]?.av1 || '', notas[`${alunoObj.id}-${d}-2º Trimestre`]?.av2 || '');
      const mt3 = calcularMedia(notas[`${alunoObj.id}-${d}-3º Trimestre`]?.av1 || '', notas[`${alunoObj.id}-${d}-3º Trimestre`]?.av2 || '');
      const validas = [mt1, mt2, mt3].filter(v => v !== '-').map(Number);
      if (validas.length > 0) {
        const mfd = Math.round(validas.reduce((acc, v) => acc + v, 0) / validas.length);
        somaMedias += mfd;
        totalComNota += 1;
        if (mfd < limiarAprovacao) negativas += 1;
      }
    });

    const faltasInjust = Object.values(faltas)
      .filter(f => f.alunoId === alunoObj.id && !f.justificada)
      .reduce((acc, f) => acc + (parseInt(f.quantidade, 10) || 0), 0);

    const mediaGeral = totalComNota > 0 ? Number((somaMedias / totalComNota).toFixed(2)) : 0;
    const aprovado = totalComNota > 0 && negativas <= 2 && faltasInjust < 15;

    return { mediaGeral, totalComNota, negativas, faltasInjust, aprovado };
  };

  const handleNotaChange = (alunoId, disciplina, trimestre, campo, valor, tipoCiclo) => {
    const maxVal = tipoCiclo === 'primario' ? 10 : 20;
    const valInt = valor === '' ? '' : Math.min(maxVal, Math.max(0, Math.round(parseFloat(valor) || 0))).toString();
    const key = `${alunoId}-${disciplina}-${trimestre}`;
    setNotas(prev => ({
      ...prev,
      [key]: {
        av1: campo === 'av1' ? valInt : (prev[key]?.av1 ?? ''),
        av2: campo === 'av2' ? valInt : (prev[key]?.av2 ?? '')
      }
    }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginErro('');
    
    if (loginEmailOuNumero === credenciaisDiretor.email && loginSenha === credenciaisDiretor.senha) {
      setUsuarioLogado({ tipo: 'diretor', nome: credenciaisDiretor.nome, email: credenciaisDiretor.email });
      setViewMode('app');
      setActiveTab('dashboard');
      return;
    }

    const profEncontrado = professores.find(p => p.email === loginEmailOuNumero && p.senha === loginSenha);
    if (profEncontrado) {
      if (profEncontrado.status !== 'aprovado') {
        setLoginErro('O seu registo ainda aguarda aprovação pelo Diretor Pedagógico.');
        return;
      }
      setUsuarioLogado({
        tipo: 'professor', id: profEncontrado.id, nome: profEncontrado.nome,
        email: profEncontrado.email, turmasAtribuidas: profEncontrado.turmasAtribuidas, atribuicoes: profEncontrado.atribuicoes
      });
      setViewMode('app');
      setActiveTab('dashboard');
      return;
    }

    const pedidoAlunoPendente = pedidosAlunos.find(
      p => (p.numero === loginEmailOuNumero || p.nome.toLowerCase() === loginEmailOuNumero.toLowerCase()) && p.senha === loginSenha
    );
    if (pedidoAlunoPendente) {
      setLoginErro('O seu pedido de matrícula ainda está PENDENTE e aguarda aprovação pelo Diretor Pedagógico.');
      return;
    }

    const alunoEncontrado = alunos.find(a => (a.numero === loginEmailOuNumero || a.nome.toLowerCase() === loginEmailOuNumero.toLowerCase()) && a.senha === loginSenha);
    if (alunoEncontrado) {
      if (alunoEncontrado.status === 'pendente') {
        setLoginErro('O seu registo ainda está PENDENTE e aguarda aprovação pelo Diretor Pedagógico.');
        return;
      }
      setUsuarioLogado({
        tipo: 'aluno', id: alunoEncontrado.id, nome: alunoEncontrado.nome,
        numero: alunoEncontrado.numero, turmaId: alunoEncontrado.turmaId
      });
      setViewMode('app');
      setActiveTab('painel_aluno');
      return;
    }

    setLoginErro('Credenciais inválidas. Verifique os dados introduzidos.');
  };

  // --- BLOQUEIO DE CÓPIA, PRINT, IMPRESSÃO E EXTRAÇÃO PARA ALUNOS ---
  useEffect(() => {
    if (usuarioLogado?.tipo !== 'aluno') return;

    const bloquearEvento = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const bloquearTeclas = (e) => {
      const tecla = e.key?.toLowerCase();
      // Bloqueia PrintScreen, Ctrl+P (Imprimir), Ctrl+C (Copiar), Ctrl+S (Guardar), Ctrl+U (Código), F12 / DevTools
      if (
        e.key === 'PrintScreen' ||
        e.keyCode === 44 ||
        ((e.ctrlKey || e.metaKey) && ['p', 'c', 's', 'u', 'a', 'x'].includes(tecla)) ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c', 's'].includes(tecla)) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        e.stopPropagation();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('').catch(() => {});
        }
        mostrarSucesso('Ação bloqueada: Cópia, captura de ecrã e impressão estão desativadas para alunos.');
        return false;
      }
    };

    const bloquearBeforePrint = () => {
      document.body.style.display = 'none';
      setTimeout(() => {
        document.body.style.display = '';
      }, 500);
    };

    document.addEventListener('copy', bloquearEvento);
    document.addEventListener('cut', bloquearEvento);
    document.addEventListener('contextmenu', bloquearEvento);
    document.addEventListener('selectstart', bloquearEvento);
    document.addEventListener('dragstart', bloquearEvento);
    document.addEventListener('keydown', bloquearTeclas, true);
    window.addEventListener('beforeprint', bloquearBeforePrint);

    return () => {
      document.removeEventListener('copy', bloquearEvento);
      document.removeEventListener('cut', bloquearEvento);
      document.removeEventListener('contextmenu', bloquearEvento);
      document.removeEventListener('selectstart', bloquearEvento);
      document.removeEventListener('dragstart', bloquearEvento);
      document.removeEventListener('keydown', bloquearTeclas, true);
      window.removeEventListener('beforeprint', bloquearBeforePrint);
    };
  }, [usuarioLogado]);

  const handleLogout = () => {
    setUsuarioLogado(null); setLoginEmailOuNumero(''); setLoginSenha(''); setViewMode('login');
  };

  const exportarCSV = (filename, rows) => {
    let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    mostrarSucesso("Ficheiro exportado com sucesso!");
  };

  const copiarTextoParaClipboard = (texto) => {
    navigator.clipboard.writeText(texto);
    mostrarSucesso("Dados copiados para a área de transferência!");
  };

  const renderDialog = () => {
    if (!dialog.isOpen) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-sm w-full space-y-4 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">!</div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">Confirmação</h3>
              <p className="text-sm text-slate-500">{dialog.message}</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setDialog({ isOpen: false, message: '', onConfirm: null })} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-xl font-medium">Cancelar</button>
            <button onClick={() => { if (dialog.onConfirm) dialog.onConfirm(); setDialog({ isOpen: false, message: '', onConfirm: null }); }} className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-xl font-medium shadow-md">Confirmar</button>
          </div>
        </div>
      </div>
    );
  };

  // --- GESTÃO E APROVAÇÃO DE PROFESSORES POR TURMA ---
  const renderGestaoPedidosProfessores = () => {
    const handleAprovarAtribuicao = (pedidoId, indexAtrib) => {
      const pedido = pedidosProfessores.find(p => p.id === pedidoId);
      if (!pedido) return;
      const atribAprovada = pedido.atribuicoes[indexAtrib];
      if (!atribAprovada) return;

      const jaExisteProf = professores.find(pr => pr.email === pedido.email);
      if (jaExisteProf) {
        const novasAtribs = [...(jaExisteProf.atribuicoes || [])];
        if (!novasAtribs.some(a => a.turmaId === atribAprovada.turmaId && a.disciplina === atribAprovada.disciplina)) {
          novasAtribs.push(atribAprovada);
        }
        setProfessores(professores.map(pr => pr.id === jaExisteProf.id ? {
          ...pr,
          status: 'aprovado',
          atribuicoes: novasAtribs,
          turmasAtribuidas: Array.from(new Set(novasAtribs.map(a => a.turmaId)))
        } : pr));
      } else {
        setProfessores([...professores, {
          id: `prof_${Date.now()}`,
          nome: pedido.nome,
          email: pedido.email,
          senha: pedido.senha || '123',
          contacto: pedido.contacto || '',
          especialidade: pedido.especialidade || 'Geral',
          status: 'aprovado',
          atribuicoes: [atribAprovada],
          turmasAtribuidas: [atribAprovada.turmaId]
        }]);
      }

      const restantes = pedido.atribuicoes.filter((_, i) => i !== indexAtrib);
      if (restantes.length === 0) {
        setPedidosProfessores(pedidosProfessores.filter(p => p.id !== pedidoId));
      } else {
        setPedidosProfessores(pedidosProfessores.map(p => p.id === pedidoId ? {
          ...p,
          atribuicoes: restantes,
          turmasAtribuidas: Array.from(new Set(restantes.map(a => a.turmaId)))
        } : p));
      }
      mostrarSucesso('Turma/disciplina aprovada para o docente!');
    };

    const handleRecusarAtribuicao = (pedidoId, indexAtrib) => {
      const pedido = pedidosProfessores.find(p => p.id === pedidoId);
      if (!pedido) return;
      const restantes = pedido.atribuicoes.filter((_, i) => i !== indexAtrib);
      if (restantes.length === 0) {
        setPedidosProfessores(pedidosProfessores.filter(p => p.id !== pedidoId));
      } else {
        setPedidosProfessores(pedidosProfessores.map(p => p.id === pedidoId ? {
          ...p,
          atribuicoes: restantes,
          turmasAtribuidas: Array.from(new Set(restantes.map(a => a.turmaId)))
        } : p));
      }
      mostrarSucesso('Solicitação recusada.');
    };

    const handleCadastrarProfDireto = (e) => {
      e.preventDefault();
      if (!novoProfessorDireto.nome.trim() || !novoProfessorDireto.email.trim()) return;
      const criado = {
        id: `prof_${Date.now()}`,
        nome: novoProfessorDireto.nome.trim(),
        email: novoProfessorDireto.email.trim(),
        senha: novoProfessorDireto.senha.trim() || '123',
        contacto: novoProfessorDireto.contacto.trim(),
        especialidade: novoProfessorDireto.especialidade.trim() || 'Geral',
        status: 'aprovado',
        atribuicoes: [],
        turmasAtribuidas: []
      };
      setProfessores([...professores, criado]);
      setNovoProfessorDireto({ nome: '', email: '', senha: '123', contacto: '', especialidade: '' });
      mostrarSucesso(`Professor ${criado.nome} registado com sucesso!`);
    };

    const handleAdicionarAtribEdicaoProf = () => {
      if (!editingProfessor) return;
      const tId = novaAtribuicaoProf.turmaId || turmas[0]?.id || '';
      const tObj = turmas.find(t => t.id === tId);
      const cObj = ciclos.find(c => c.id === tObj?.cicloId);
      const disc = novaAtribuicaoProf.disciplina || cObj?.disciplinas?.[0] || '';
      if (!tId || !disc) return;

      const atribsAtuais = editingProfessor.atribuicoes || [];
      if (atribsAtuais.some(a => a.turmaId === tId && a.disciplina === disc)) return;

      const novas = [...atribsAtuais, { turmaId: tId, disciplina: disc }];
      setEditingProfessor({
        ...editingProfessor,
        atribuicoes: novas,
        turmasAtribuidas: Array.from(new Set(novas.map(a => a.turmaId)))
      });
    };

    return (
      <div className="space-y-6">
        {/* Modal de Edição Total do Professor */}
        {editingProfessor && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-lg w-full space-y-4 border max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><Edit2 className="w-5 h-5 text-indigo-600" /> Editar Professor & Turmas</h3>
                <button onClick={() => setEditingProfessor(null)}><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={e => {
                e.preventDefault();
                setProfessores(professores.map(p => p.id === editingProfessor.id ? editingProfessor : p));
                setEditingProfessor(null);
                mostrarSucesso('Dados do professor atualizados!');
              }} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-bold mb-1">Nome</label><input type="text" value={editingProfessor.nome} onChange={e => setEditingProfessor({...editingProfessor, nome: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" required /></div>
                  <div><label className="block text-xs font-bold mb-1">E-mail</label><input type="email" value={editingProfessor.email} onChange={e => setEditingProfessor({...editingProfessor, email: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" required /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="block text-xs font-bold mb-1">Senha</label><input type="text" value={editingProfessor.senha} onChange={e => setEditingProfessor({...editingProfessor, senha: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" required /></div>
                  <div><label className="block text-xs font-bold mb-1">Especialidade</label><input type="text" value={editingProfessor.especialidade} onChange={e => setEditingProfessor({...editingProfessor, especialidade: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" /></div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Estado</label>
                    <select value={editingProfessor.status || 'aprovado'} onChange={e => setEditingProfessor({...editingProfessor, status: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-xs bg-white">
                      <option value="aprovado">Ativo / Aprovado</option>
                      <option value="suspenso">Suspenso</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase">Atribuições de Turma + Disciplina</label>
                  <div className="grid grid-cols-3 gap-2">
                    <select value={novaAtribuicaoProf.turmaId || turmas[0]?.id || ''} onChange={e => setNovaAtribuicaoProf({ turmaId: e.target.value, disciplina: '' })} className="px-2.5 py-2 border rounded-xl text-xs bg-white">
                      {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                    </select>
                    <select value={novaAtribuicaoProf.disciplina} onChange={e => setNovaAtribuicaoProf({ ...novaAtribuicaoProf, disciplina: e.target.value })} className="px-2.5 py-2 border rounded-xl text-xs bg-white">
                      <option value="">Disciplina...</option>
                      {(ciclos.find(c => c.id === (turmas.find(t => t.id === (novaAtribuicaoProf.turmaId || turmas[0]?.id))?.cicloId))?.disciplinas || []).map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <button type="button" onClick={handleAdicionarAtribEdicaoProf} className="bg-indigo-600 text-white rounded-xl text-xs font-bold">+ Atribuir</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(editingProfessor.atribuicoes || []).map((atr, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-white border px-2.5 py-1 rounded-lg text-[11px] font-bold">
                        {turmas.find(t => t.id === atr.turmaId)?.nome || 'Turma'} • {atr.disciplina}
                        <button type="button" onClick={() => {
                          const filtradas = editingProfessor.atribuicoes.filter((_, idx) => idx !== i);
                          setEditingProfessor({ ...editingProfessor, atribuicoes: filtradas, turmasAtribuidas: Array.from(new Set(filtradas.map(x => x.turmaId))) });
                        }} className="text-red-500 ml-1"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setEditingProfessor(null)} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold">Cancelar</button>
                  <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">Guardar Alterações</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Pedidos Pendentes por Turma */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><UserCheck className="w-6 h-6 text-indigo-600" /> Aprovação de Professores por Turma ({pedidosProfessores.length})</h2>
          {pedidosProfessores.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
              <p className="text-xs font-semibold text-slate-600">Sem pedidos de docentes pendentes.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pedidosProfessores.map(p => (
                <div key={p.id} className="border p-5 rounded-2xl bg-slate-50 space-y-3">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div>
                      <h4 className="font-black text-slate-900">{p.nome}</h4>
                      <p className="text-xs text-slate-500">Email: {p.email} | Esp: {p.especialidade} | Tel: {p.contacto}</p>
                    </div>
                    <button onClick={() => setPedidosProfessores(pedidosProfessores.filter(x => x.id !== p.id))} className="text-xs text-red-600 font-bold hover:underline">Recusar Pedido Inteiro</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(p.atribuicoes || []).map((atr, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-xl border flex justify-between items-center gap-2">
                        <div>
                          <p className="text-xs font-black text-indigo-900">{turmas.find(t => t.id === atr.turmaId)?.nome || 'Turma'}</p>
                          <p className="text-[11px] text-slate-600 font-semibold">Disciplina: {atr.disciplina}</p>
                        </div>
                        <div className="flex gap-1.5">
                          <button onClick={() => handleAprovarAtribuicao(p.id, idx)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold">Aprovar Turma</button>
                          <button onClick={() => handleRecusarAtribuicao(p.id, idx)} className="bg-red-50 text-red-600 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-red-200">Recusar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cadastro Direto de Professor pelo Diretor */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
          <h3 className="text-lg font-black text-slate-900">Cadastrar Novo Professor Diretamente</h3>
          <form onSubmit={handleCadastrarProfDireto} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end bg-slate-50 p-4 rounded-2xl border">
            <div><label className="block text-xs font-bold mb-1">Nome</label><input type="text" value={novoProfessorDireto.nome} onChange={e => setNovoProfessorDireto({...novoProfessorDireto, nome: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm bg-white" required /></div>
            <div><label className="block text-xs font-bold mb-1">E-mail</label><input type="email" value={novoProfessorDireto.email} onChange={e => setNovoProfessorDireto({...novoProfessorDireto, email: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm bg-white" required /></div>
            <div><label className="block text-xs font-bold mb-1">Senha</label><input type="text" value={novoProfessorDireto.senha} onChange={e => setNovoProfessorDireto({...novoProfessorDireto, senha: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm bg-white" required /></div>
            <div><label className="block text-xs font-bold mb-1">Especialidade</label><input type="text" value={novoProfessorDireto.especialidade} onChange={e => setNovoProfessorDireto({...novoProfessorDireto, especialidade: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm bg-white" /></div>
            <button type="submit" className="bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-black shadow">Adicionar Docente</button>
          </form>
        </div>

        {/* Corpo Docente Ativo */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
          <h3 className="text-lg font-black text-slate-900">Corpo Docente Registado ({professores.length})</h3>
          {professores.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6 bg-slate-50 rounded-2xl">Nenhum professor aprovado ainda.</p>
          ) : (
            <div className="space-y-3">
              {professores.map(pr => (
                <div key={pr.id} className="p-4 rounded-2xl border bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{pr.nome} <span className="text-[11px] text-indigo-600 font-bold ml-1">({pr.especialidade})</span></h4>
                    <p className="text-xs text-slate-500">Email: {pr.email} | Senha: {pr.senha}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {(pr.atribuicoes || []).map((a, idx) => (
                        <span key={idx} className="bg-white border px-2 py-0.5 rounded-lg text-[11px] font-bold text-slate-700">
                          {turmas.find(t => t.id === a.turmaId)?.nome || 'Turma'} • {a.disciplina}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setEditingProfessor({...pr})} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1"><Edit2 className="w-3.5 h-3.5" /> Editar / Turmas</button>
                    <button onClick={() => pedirConfirmacao(`Eliminar o professor "${pr.nome}"?`, () => { setProfessores(professores.filter(x => x.id !== pr.id)); mostrarSucesso('Professor eliminado!'); })} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- CONTROLE DE FALTAS, LANÇAMENTO POR Nº DE ORDEM & JUSTIFICAÇÃO EM LOTE ---
  const renderFaltas = () => {
    const cFaltaAtivo = lancamentoFalta.cicloId || ciclos[0]?.id || '';
    const turmasDoCicloFalta = turmas.filter(t => t.cicloId === cFaltaAtivo);
    const tFaltaAtiva = turmasDoCicloFalta.some(t => t.id === lancamentoFalta.turmaId)
      ? lancamentoFalta.turmaId
      : (turmasDoCicloFalta[0]?.id || '');

    const alunosTurmaFalta = alunos
      .filter(a => a.turmaId === tFaltaAtiva)
      .sort((a, b) => (parseInt(a.numero, 10) || 0) - (parseInt(b.numero, 10) || 0));

    const alternarNumeroFalta = (alunoId) => {
      setNumerosSelecionadosFalta(prev =>
        prev.includes(alunoId) ? prev.filter(id => id !== alunoId) : [...prev, alunoId]
      );
    };

    const handleLancarFaltasEmLote = (e) => {
      e.preventDefault();
      if (!tFaltaAtiva || numerosSelecionadosFalta.length === 0) {
        mostrarSucesso('Selecione pelo menos um Nº de Ordem de aluno que faltou.');
        return;
      }

      const novasFaltas = { ...faltas };
      numerosSelecionadosFalta.forEach((alId, idx) => {
        const fId = `f_${Date.now()}_${idx}_${alId}`;
        novasFaltas[fId] = {
          id: fId,
          alunoId: alId,
          turmaId: tFaltaAtiva,
          data: lancamentoFalta.data,
          quantidade: Math.max(1, parseInt(lancamentoFalta.quantidade, 10) || 1),
          justificada: Boolean(lancamentoFalta.justificada),
          trimestre: lancamentoFalta.trimestre || '1º Trimestre',
          temposSemanais: 2
        };
      });

      setFaltas(novasFaltas);
      setNumerosSelecionadosFalta([]);
      mostrarSucesso(`${numerosSelecionadosFalta.length} registo(s) de falta(s) lançado(s) com sucesso!`);
    };

    const listaFaltasFiltrada = Object.values(faltas).filter(f => {
      const al = alunos.find(a => a.id === f.alunoId);
      const tr = turmas.find(t => t.id === f.turmaId);
      if (filtroFalta.cicloId && tr?.cicloId !== filtroFalta.cicloId) return false;
      if (filtroFalta.turmaId && f.turmaId !== filtroFalta.turmaId) return false;
      if (filtroFalta.trimestre && (f.trimestre || '1º Trimestre') !== filtroFalta.trimestre) return false;
      if (filtroFalta.estado === 'injustificadas' && f.justificada) return false;
      if (filtroFalta.estado === 'justificadas' && !f.justificada) return false;
      if (filtroFalta.pesquisa) {
        const q = filtroFalta.pesquisa.toLowerCase();
        const matchNome = al?.nome?.toLowerCase().includes(q);
        const matchNum = al?.numero?.toLowerCase() === q || al?.numero?.toLowerCase().includes(q);
        if (!matchNome && !matchNum) return false;
      }
      return true;
    });

    const toggleSelecionarFaltaLote = (id) => {
      setFaltasSelecionadasLote(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const justificarSelecionadasLote = () => {
      if (faltasSelecionadasLote.length === 0) return;
      const atualizadas = { ...faltas };
      faltasSelecionadasLote.forEach(id => {
        if (atualizadas[id]) atualizadas[id] = { ...atualizadas[id], justificada: true };
      });
      setFaltas(atualizadas);
      setFaltasSelecionadasLote([]);
      mostrarSucesso('Faltas selecionadas marcadas como JUSTIFICADAS!');
    };

    return (
      <div className="space-y-6">
        {/* Lançamento Rápido por Número de Ordem */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-5">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><Users className="w-6 h-6 text-indigo-600" /> Lançamento Rápido de Faltas por Nº de Ordem</h2>
            <p className="text-xs text-slate-500">Escolha o Ciclo e a Turma, clique nos números de ordem dos alunos ausentes e lance tudo de uma só vez.</p>
          </div>

          <form onSubmit={handleLancarFaltasEmLote} className="space-y-4 bg-slate-50 p-5 rounded-2xl border">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">1. Ciclo</label>
                <select value={cFaltaAtivo} onChange={e => { setLancamentoFalta({ ...lancamentoFalta, cicloId: e.target.value, turmaId: '' }); setNumerosSelecionadosFalta([]); }} className="w-full px-3 py-2 border rounded-xl text-xs font-bold bg-white">
                  {ciclos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">2. Turma</label>
                <select value={tFaltaAtiva} onChange={e => { setLancamentoFalta({ ...lancamentoFalta, turmaId: e.target.value }); setNumerosSelecionadosFalta([]); }} className="w-full px-3 py-2 border rounded-xl text-xs font-bold bg-white">
                  {turmasDoCicloFalta.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Data</label>
                <input type="date" value={lancamentoFalta.data} onChange={e => setLancamentoFalta({ ...lancamentoFalta, data: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-xs bg-white" required />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Qtd. Tempos / Faltas</label>
                <input type="number" min="1" max="12" value={lancamentoFalta.quantidade} onChange={e => setLancamentoFalta({ ...lancamentoFalta, quantidade: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-xs font-bold bg-white" required />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Trimestre</label>
                <select value={lancamentoFalta.trimestre} onChange={e => setLancamentoFalta({ ...lancamentoFalta, trimestre: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-xs bg-white">
                  <option>1º Trimestre</option>
                  <option>2º Trimestre</option>
                  <option>3º Trimestre</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black text-slate-700">3. Clique nos Números de Ordem que Faltaram ({numerosSelecionadosFalta.length} selecionado(s)):</label>
                {alunosTurmaFalta.length > 0 && (
                  <button type="button" onClick={() => setNumerosSelecionadosFalta(numerosSelecionadosFalta.length === alunosTurmaFalta.length ? [] : alunosTurmaFalta.map(a => a.id))} className="text-xs font-bold text-indigo-600 hover:underline">
                    {numerosSelecionadosFalta.length === alunosTurmaFalta.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                  </button>
                )}
              </div>

              {alunosTurmaFalta.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center bg-white rounded-xl border border-dashed">Nenhum aluno matriculado nesta turma.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {alunosTurmaFalta.map(al => {
                    const sel = numerosSelecionadosFalta.includes(al.id);
                    return (
                      <button
                        key={al.id}
                        type="button"
                        onClick={() => alternarNumeroFalta(al.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                          sel ? 'bg-red-600 text-white border-red-700 shadow-md' : 'bg-white hover:bg-indigo-50 text-slate-800 border-slate-200'
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${sel ? 'bg-white text-red-600' : 'bg-slate-100 text-slate-800'}`}>
                          {al.numero}
                        </span>
                        <span className="text-xs font-bold truncate">{al.nome}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow">
                Lançar Faltas ({numerosSelecionadosFalta.length})
              </button>
            </div>
          </form>
        </div>

        {/* Central de Justificação Rápida e Histórico de Faltas */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <h3 className="text-lg font-black text-slate-900">Central de Justificação e Histórico ({listaFaltasFiltrada.length})</h3>
              <p className="text-xs text-slate-500">Filtre rapidamente por número, turma ou estado e justifique individualmente ou em lote.</p>
            </div>
            {faltasSelecionadasLote.length > 0 && (
              <button onClick={justificarSelecionadasLote} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-black shadow flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Justificar Selecionadas ({faltasSelecionadasLote.length})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 bg-slate-50 p-3.5 rounded-2xl border">
            <input type="text" placeholder="Nº Ordem ou Nome..." value={filtroFalta.pesquisa} onChange={e => setFiltroFalta({ ...filtroFalta, pesquisa: e.target.value })} className="px-3 py-2 border rounded-xl text-xs bg-white" />
            <select value={filtroFalta.cicloId} onChange={e => setFiltroFalta({ ...filtroFalta, cicloId: e.target.value, turmaId: '' })} className="px-3 py-2 border rounded-xl text-xs bg-white">
              <option value="">Todos os Ciclos</option>
              {ciclos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <select value={filtroFalta.turmaId} onChange={e => setFiltroFalta({ ...filtroFalta, turmaId: e.target.value })} className="px-3 py-2 border rounded-xl text-xs bg-white">
              <option value="">Todas as Turmas</option>
              {turmas.filter(t => !filtroFalta.cicloId || t.cicloId === filtroFalta.cicloId).map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
            <select value={filtroFalta.trimestre} onChange={e => setFiltroFalta({ ...filtroFalta, trimestre: e.target.value })} className="px-3 py-2 border rounded-xl text-xs bg-white">
              <option value="">Todos Trimestres</option>
              <option>1º Trimestre</option>
              <option>2º Trimestre</option>
              <option>3º Trimestre</option>
            </select>
            <select value={filtroFalta.estado} onChange={e => setFiltroFalta({ ...filtroFalta, estado: e.target.value })} className="px-3 py-2 border rounded-xl text-xs bg-white font-bold">
              <option value="todos">Todas as Faltas</option>
              <option value="injustificadas">Apenas Injustificadas</option>
              <option value="justificadas">Apenas Justificadas</option>
            </select>
          </div>

          <div className="overflow-x-auto rounded-2xl border">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 uppercase font-bold text-slate-700">
                  <th className="p-3 border-b text-center w-10">
                    <input
                      type="checkbox"
                      checked={listaFaltasFiltrada.length > 0 && listaFaltasFiltrada.every(f => faltasSelecionadasLote.includes(f.id))}
                      onChange={e => setFaltasSelecionadasLote(e.target.checked ? listaFaltasFiltrada.map(f => f.id) : [])}
                    />
                  </th>
                  <th className="p-3 border-b text-center">Nº</th>
                  <th className="p-3 border-b">Aluno</th>
                  <th className="p-3 border-b">Turma</th>
                  <th className="p-3 border-b">Data / Trim</th>
                  <th className="p-3 border-b text-center">Qtd</th>
                  <th className="p-3 border-b text-center">Estado</th>
                  <th className="p-3 border-b text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {listaFaltasFiltrada.length === 0 ? (
                  <tr><td colSpan="8" className="p-6 text-center text-slate-400">Nenhum registo de falta encontrado.</td></tr>
                ) : (
                  listaFaltasFiltrada.map(f => {
                    const al = alunos.find(a => a.id === f.alunoId);
                    const tr = turmas.find(t => t.id === f.turmaId);
                    return (
                      <tr key={f.id} className="border-b hover:bg-slate-50">
                        <td className="p-3 text-center">
                          <input type="checkbox" checked={faltasSelecionadasLote.includes(f.id)} onChange={() => toggleSelecionarFaltaLote(f.id)} />
                        </td>
                        <td className="p-3 text-center font-black text-indigo-700">{al?.numero || '-'}</td>
                        <td className="p-3 font-bold text-slate-900">{al?.nome || 'Aluno removido'}</td>
                        <td className="p-3">{tr?.nome || '-'}</td>
                        <td className="p-3">{f.data} • <span className="text-slate-500">{f.trimestre || '1º Trimestre'}</span></td>
                        <td className="p-3 text-center font-black">{f.quantidade}</td>
                        <td className="p-3 text-center">
                          {f.justificada ? (
                            <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">Justificada</span>
                          ) : (
                            <span className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full font-bold">Injustificada</span>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setFaltas({ ...faltas, [f.id]: { ...f, justificada: !f.justificada } })}
                            className={`px-3 py-1 rounded-xl font-bold ${f.justificada ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-600 text-white'}`}
                          >
                            {f.justificada ? 'Remover Justif.' : 'Justificar'}
                          </button>
                          {usuarioLogado.tipo === 'diretor' && (
                            <button
                              onClick={() => {
                                const copia = { ...faltas };
                                delete copia[f.id];
                                setFaltas(copia);
                                mostrarSucesso('Registo de falta eliminado!');
                              }}
                              className="p-1.5 bg-red-50 text-red-600 rounded-xl"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // --- TELA DE BOAS-VINDAS / DASHBOARD INTELIGENTE ---
  const renderDashboard = () => {
    const totalAlunos = alunos.length;
    const totalTurmas = turmas.length;
    const pedidosPendentes = pedidosProfessores.length;
    const alertasFaltasCriticas = Object.values(faltas).filter(f => !f.justificada && f.quantidade >= 3);

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 z-10">
            <div className="inline-flex items-center gap-2 bg-indigo-500/30 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold text-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" /> Sistema Integrado de Gestão Pedagógica • RAA {anoLetivoAtual}
            </div>
            <h2 className="text-3xl font-black tracking-tight">Bem-vindo(a), {usuarioLogado.nome}</h2>
            <p className="text-sm text-indigo-200 max-w-xl">
              {usuarioLogado.tipo === 'diretor' && 'Painel de controlo administrativo com gestão inteligente de vagas, idades, aprovações e estatísticas globais.'}
              {usuarioLogado.tipo === 'professor' && 'Painel docente. Registe avaliações, controle faltas por nº de ordem e emita pautas em tempo real.'}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 px-5 py-4 rounded-2xl z-10 text-right">
            <p className="text-xs text-indigo-200 font-medium">Ano Letivo Ativo</p>
            <p className="text-2xl font-black text-white">{anoLetivoAtual}</p>
            <p className="text-[11px] text-emerald-300 font-semibold mt-1">● Sistema Operacional</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0"><Users className="w-6 h-6" /></div>
            <div><p className="text-xs text-slate-500 font-bold uppercase">Alunos Ativos</p><p className="text-2xl font-black text-slate-900 mt-0.5">{totalAlunos}</p></div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold shrink-0"><LayoutDashboard className="w-6 h-6" /></div>
            <div><p className="text-xs text-slate-500 font-bold uppercase">Turmas Ativas</p><p className="text-2xl font-black text-slate-900 mt-0.5">{totalTurmas}</p></div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold shrink-0"><UserCheck className="w-6 h-6" /></div>
            <div><p className="text-xs text-slate-500 font-bold uppercase">Professores</p><p className="text-2xl font-black text-slate-900 mt-0.5">{professores.length}</p></div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold shrink-0"><Bell className="w-6 h-6" /></div>
            <div><p className="text-xs text-slate-500 font-bold uppercase">Pendências</p><p className="text-2xl font-black text-slate-900 mt-0.5">{pedidosPendentes + pedidosAlunos.length + reconfirmacoesPendentes.length}</p></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-black text-slate-900 flex items-center gap-2 text-base"><AlertTriangle className="w-5 h-5 text-amber-500" /> Alertas Pedagógicos</h3>
            <div className="space-y-3">
              {usuarioLogado.tipo === 'diretor' && pedidosAlunos.length > 0 && (
                <div onClick={() => setActiveTab('matricula')} className="p-4 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-between cursor-pointer hover:bg-orange-100/70">
                  <div>
                    <p className="text-xs font-bold text-orange-900">Matrículas de Alunos Pendentes</p>
                    <p className="text-[11px] text-orange-700">{pedidosAlunos.length} aluno(s) aguardam aprovação para ficarem ativos.</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-orange-700" />
                </div>
              )}
              {usuarioLogado.tipo === 'diretor' && reconfirmacoesPendentes.length > 0 && (
                <div onClick={() => setActiveTab('matricula')} className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between cursor-pointer hover:bg-indigo-100/70">
                  <div>
                    <p className="text-xs font-bold text-indigo-900">Reconfirmações do Novo Ano</p>
                    <p className="text-[11px] text-indigo-700">{reconfirmacoesPendentes.length} aluno(s) aprovados aguardam reconfirmação na classe seguinte.</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-indigo-700" />
                </div>
              )}
              {usuarioLogado.tipo === 'diretor' && pedidosPendentes > 0 && (
                <div onClick={() => setActiveTab('pedidos_prof')} className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between cursor-pointer hover:bg-amber-100/70">
                  <div>
                    <p className="text-xs font-bold text-amber-900">Aprovação de Professores por Turma</p>
                    <p className="text-[11px] text-amber-700">{pedidosPendentes} pedido(s) de docentes aguardam validação.</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-700" />
                </div>
              )}
              {alertasFaltasCriticas.length > 0 && (
                <div onClick={() => setActiveTab('faltas')} className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between cursor-pointer hover:bg-red-100/70">
                  <div>
                    <p className="text-xs font-bold text-red-900">Alerta de Faltas Injustificadas</p>
                    <p className="text-[11px] text-red-700">{alertasFaltasCriticas.length} registo(s) com 3 ou mais faltas sem justificação.</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-700" />
                </div>
              )}
              {pedidosAlunos.length === 0 && reconfirmacoesPendentes.length === 0 && pedidosPendentes === 0 && alertasFaltasCriticas.length === 0 && (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">Tudo em ordem! Nenhuma pendência crítica no momento.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-black text-slate-900 flex items-center gap-2 text-base"><Sparkles className="w-5 h-5 text-indigo-600" /> Acesso Rápido</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setActiveTab('pautas')} className="p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-left transition-all">
                <ClipboardList className="w-5 h-5 text-indigo-600 mb-2" />
                <p className="text-xs font-bold text-slate-900">Pautas & Avaliação</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Lançar MAC e NPT</p>
              </button>
              <button onClick={() => setActiveTab('estatisticas')} className="p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-left transition-all">
                <BarChart3 className="w-5 h-5 text-indigo-600 mb-2" />
                <p className="text-xs font-bold text-slate-900">Estatísticas & Rankings</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Melhores alunos e docentes</p>
              </button>
              <button onClick={() => setActiveTab('faltas')} className="p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-left transition-all">
                <Users className="w-5 h-5 text-indigo-600 mb-2" />
                <p className="text-xs font-bold text-slate-900">Faltas por Nº</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Lançar e justificar</p>
              </button>
              {usuarioLogado.tipo === 'diretor' && (
                <button onClick={() => setActiveTab('matricula')} className="p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-left transition-all">
                  <UserPlus className="w-5 h-5 text-indigo-600 mb-2" />
                  <p className="text-xs font-bold text-slate-900">Matrículas & Vagas</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Sugestão por idade</p>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- AUTO-REGISTO DE ALUNO (FICA PENDENTE ATÉ APROVAÇÃO) ---
  const renderRegistoAluno = () => {
    const sugestaoAuto = sugerirTurmaPorIdade(novoRegistoAluno.idade);

    const handleSubmeterRegistoAluno = (e) => {
      e.preventDefault();
      setErroRegistoAluno('');
      const numLimpo = novoRegistoAluno.numero.trim();
      const tId = novoRegistoAluno.turmaId || turmas[0]?.id || '';
      if (!novoRegistoAluno.nome.trim() || !numLimpo || !novoRegistoAluno.senha || !novoRegistoAluno.idade || !tId) return;

      if (obterVagasRestantes(tId) <= 0) {
        setErroRegistoAluno('Esta turma já atingiu o limite máximo de vagas. Escolha outra turma com vagas disponíveis.');
        return;
      }

      const duplicadoAtivo = alunos.some(a => a.turmaId === tId && a.numero.trim().toLowerCase() === numLimpo.toLowerCase());
      const duplicadoPendente = pedidosAlunos.some(p => p.turmaId === tId && p.numero.trim().toLowerCase() === numLimpo.toLowerCase());
      if (duplicadoAtivo || duplicadoPendente) {
        setErroRegistoAluno(`O Nº de Ordem "${numLimpo}" já está ocupado ou pendente nesta turma.`);
        return;
      }

      const novoPedido = {
        id: `peda_${Date.now()}`,
        nome: novoRegistoAluno.nome.trim(),
        numero: numLimpo,
        idade: parseInt(novoRegistoAluno.idade, 10),
        turmaId: tId,
        senha: novoRegistoAluno.senha,
        status: 'pendente',
        dataPedido: new Date().toLocaleDateString('pt-AO')
      };
      setPedidosAlunos([...pedidosAlunos, novoPedido]);
      setNovoRegistoAluno({ nome: '', numero: '', idade: '', turmaId: turmas[0]?.id || '', senha: '' });
      mostrarSucesso('Pedido enviado! Aguarde a aprovação do Diretor Pedagógico para aceder.');
      setViewMode('login');
    };

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full space-y-5">
          <div className="flex items-center justify-between">
            <div><span className="text-xs font-bold text-indigo-600 uppercase">SIGEP RAA {anoLetivoAtual}</span><h2 className="text-2xl font-black text-slate-900">Registo de Aluno</h2></div>
            <button onClick={() => { setErroRegistoAluno(''); setViewMode('login'); }} className="text-xs text-slate-500 hover:text-indigo-600 font-semibold underline">← Voltar</button>
          </div>
          {erroRegistoAluno && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs font-bold">{erroRegistoAluno}</div>
          )}
          <form onSubmit={handleSubmeterRegistoAluno} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Idade</label>
                <input
                  type="number"
                  min="5"
                  max="45"
                  value={novoRegistoAluno.idade}
                  onChange={e => {
                    const idVal = e.target.value;
                    const sug = sugerirTurmaPorIdade(idVal);
                    setNovoRegistoAluno({ ...novoRegistoAluno, idade: idVal, turmaId: sug ? sug.turma.id : novoRegistoAluno.turmaId });
                  }}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nº de Ordem</label>
                <input type="text" value={novoRegistoAluno.numero} onChange={e => setNovoRegistoAluno({ ...novoRegistoAluno, numero: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm" required />
              </div>
            </div>
            {sugestaoAuto && (
              <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 px-3.5 py-2 rounded-xl text-[11px] font-bold">
                Sugestão por idade: {sugestaoAuto.turma.nome} ({sugestaoAuto.vagasRestantes} vaga(s) livre(s))
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Turma (com Vagas)</label>
              <select value={novoRegistoAluno.turmaId} onChange={e => setNovoRegistoAluno({ ...novoRegistoAluno, turmaId: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm bg-white" required>
                {turmas.map(t => {
                  const livres = obterVagasRestantes(t.id);
                  return (
                    <option key={t.id} value={t.id} disabled={livres <= 0}>
                      {t.nome} ({livres > 0 ? `${livres} vagas` : 'LOTADA'})
                    </option>
                  );
                })}
              </select>
            </div>
            <div><label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo</label><input type="text" value={novoRegistoAluno.nome} onChange={e => setNovoRegistoAluno({ ...novoRegistoAluno, nome: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm" required /></div>
            <div><label className="block text-xs font-semibold text-slate-700 mb-1">Senha de Acesso</label><input type="password" value={novoRegistoAluno.senha} onChange={e => setNovoRegistoAluno({ ...novoRegistoAluno, senha: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm" required /></div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg text-sm">Submeter Registo para Aprovação</button>
          </form>
        </div>
      </div>
    );
  };

  // --- AUTO-REGISTO DE PROFESSOR (SOLICITAÇÃO POR TURMA) ---
  const renderRegistoProfessor = () => {
    const tSel = novaAtribRegisto.turmaId || turmas[0]?.id || '';
    const cSel = ciclos.find(c => c.id === (turmas.find(t => t.id === tSel)?.cicloId));
    const discsDisp = cSel?.disciplinas || [];

    const handleAdicionarAtrib = () => {
      const disc = novaAtribRegisto.disciplina || discsDisp[0] || '';
      if (!tSel || !disc) return;
      if (atribuicoesRegistoTemp.some(a => a.turmaId === tSel && a.disciplina === disc)) return;
      setAtribuicoesRegistoTemp([...atribuicoesRegistoTemp, { turmaId: tSel, disciplina: disc }]);
    };

    const handleSubmeterRegisto = (e) => {
      e.preventDefault();
      if (!novoRegistoProf.nome || !novoRegistoProf.email || !novoRegistoProf.senha || atribuicoesRegistoTemp.length === 0) return;
      const novoPedido = {
        id: `ped_${Date.now()}`,
        ...novoRegistoProf,
        atribuicoes: atribuicoesRegistoTemp,
        turmasAtribuidas: Array.from(new Set(atribuicoesRegistoTemp.map(a => a.turmaId))),
        status: 'pendente'
      };
      setPedidosProfessores([...pedidosProfessores, novoPedido]);
      mostrarSucesso('Pedido submetido! O Diretor Pedagógico irá aprovar cada turma solicitada.');
      setViewMode('login');
    };

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full space-y-5">
          <div className="flex items-center justify-between">
            <div><span className="text-xs font-bold text-indigo-600 uppercase">SIGEP RAA {anoLetivoAtual}</span><h2 className="text-2xl font-black text-slate-900">Registo de Professor</h2></div>
            <button onClick={() => setViewMode('login')} className="text-xs text-slate-500 font-semibold underline">← Voltar</button>
          </div>
          <form onSubmit={handleSubmeterRegisto} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold mb-1">Nome</label><input type="text" value={novoRegistoProf.nome} onChange={e => setNovoRegistoProf({ ...novoRegistoProf, nome: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm" required /></div>
              <div><label className="block text-xs font-semibold mb-1">Email</label><input type="email" value={novoRegistoProf.email} onChange={e => setNovoRegistoProf({ ...novoRegistoProf, email: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm" required /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold mb-1">Senha</label><input type="password" value={novoRegistoProf.senha} onChange={e => setNovoRegistoProf({ ...novoRegistoProf, senha: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm" required /></div>
              <div><label className="block text-xs font-semibold mb-1">Contacto</label><input type="text" value={novoRegistoProf.contacto} onChange={e => setNovoRegistoProf({ ...novoRegistoProf, contacto: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm" required /></div>
            </div>
            <div><label className="block text-xs font-semibold mb-1">Especialidade</label><input type="text" value={novoRegistoProf.especialidade} onChange={e => setNovoRegistoProf({ ...novoRegistoProf, especialidade: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm" required /></div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border space-y-2.5">
              <label className="block text-xs font-bold text-slate-700">Turmas e Disciplinas Pretendidas</label>
              <div className="grid grid-cols-3 gap-2">
                <select value={tSel} onChange={e => setNovaAtribRegisto({ turmaId: e.target.value, disciplina: '' })} className="px-2.5 py-2 border rounded-xl text-xs bg-white">
                  {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
                <select value={novaAtribRegisto.disciplina || discsDisp[0] || ''} onChange={e => setNovaAtribRegisto({ ...novaAtribRegisto, disciplina: e.target.value })} className="px-2.5 py-2 border rounded-xl text-xs bg-white">
                  {discsDisp.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <button type="button" onClick={handleAdicionarAtrib} className="bg-indigo-600 text-white rounded-xl text-xs font-bold">+ Adicionar</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {atribuicoesRegistoTemp.map((a, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 bg-white border px-2.5 py-1 rounded-lg text-[11px] font-bold">
                    {turmas.find(t => t.id === a.turmaId)?.nome} • {a.disciplina}
                    <button type="button" onClick={() => setAtribuicoesRegistoTemp(atribuicoesRegistoTemp.filter((_, i) => i !== idx))} className="text-red-500 ml-1"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg text-sm">Submeter Pedido</button>
          </form>
        </div>
      </div>
    );
  };

  // --- PAINEL RESTRITO DO ALUNO (SEM CÓPIA, IMPRESSÃO OU EXPORTAÇÃO) ---
  const renderPainelAluno = () => {
    const alunoLog = alunos.find(a => a.id === usuarioLogado.id) || {};
    const turmaAluno = turmas.find(t => t.id === alunoLog.turmaId) || {};
    const cicloAluno = ciclos.find(c => c.id === turmaAluno.cicloId) || {};
    const disciplinasAluno = cicloAluno.disciplinas || [];
    const faltasAluno = Object.values(faltas).filter(f => f.alunoId === alunoLog.id);

    return (
      <div className="space-y-6 select-none print:hidden">
        <div className="bg-indigo-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs bg-indigo-800 text-indigo-200 px-3 py-1 rounded-full font-bold">Consulta Individual Protegida</span>
            <h2 className="text-2xl font-black mt-2">{alunoLog.nome}</h2>
            <p className="text-xs text-indigo-200 mt-0.5">Turma: {turmaAluno.nome} | Nº de Ordem: {alunoLog.numero} | Idade: {alunoLog.idade} anos</p>
          </div>
          <span className="text-[11px] bg-white/10 border border-white/15 px-3.5 py-2 rounded-xl text-indigo-100 font-semibold">
            Apenas visualização • Extração desativada
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border shadow-sm"><p className="text-xs text-slate-500 font-bold uppercase">Total de Faltas</p><p className="text-2xl font-black text-slate-900 mt-1">{faltasAluno.reduce((acc, f) => acc + f.quantidade, 0)}</p></div>
          <div className="bg-white p-5 rounded-3xl border shadow-sm"><p className="text-xs text-slate-500 font-bold uppercase">Ciclo</p><p className="text-lg font-bold text-indigo-600 mt-1">{cicloAluno.nome}</p></div>
          <div className="bg-white p-5 rounded-3xl border shadow-sm"><p className="text-xs text-slate-500 font-bold uppercase">Comportamento</p><p className="text-lg font-bold text-emerald-600 mt-1">{comportamentos[`${alunoLog.id}-1º Trimestre`] || 'Bom (B)'}</p></div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Minhas Classificações Trimestrais</h3>
          <div className="overflow-x-auto rounded-2xl border">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] uppercase font-bold text-slate-700">
                  <th className="p-4 border-b">Disciplina</th>
                  <th className="p-4 border-b text-center">1º Trim</th>
                  <th className="p-4 border-b text-center">2º Trim</th>
                  <th className="p-4 border-b text-center">3º Trim</th>
                  <th className="p-4 border-b text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {disciplinasAluno.map(disc => {
                  const mt1 = calcularMedia(notas[`${alunoLog.id}-${disc}-1º Trimestre`]?.av1 || '', notas[`${alunoLog.id}-${disc}-1º Trimestre`]?.av2 || '');
                  const mt2 = calcularMedia(notas[`${alunoLog.id}-${disc}-2º Trimestre`]?.av1 || '', notas[`${alunoLog.id}-${disc}-2º Trimestre`]?.av2 || '');
                  const mt3 = calcularMedia(notas[`${alunoLog.id}-${disc}-3º Trimestre`]?.av1 || '', notas[`${alunoLog.id}-${disc}-3º Trimestre`]?.av2 || '');
                  const refNota = mt3 !== '-' ? mt3 : (mt2 !== '-' ? mt2 : mt1);
                  const isNegativa = checkNegativa(refNota, cicloAluno.tipo);
                  return (
                    <tr key={disc} className="border-b border-slate-100">
                      <td className="p-4 font-semibold text-slate-800">{disc}</td>
                      <td className="p-4 text-center font-bold">{mt1}</td>
                      <td className="p-4 text-center font-bold">{mt2}</td>
                      <td className="p-4 text-center font-bold">{mt3}</td>
                      <td className="p-4 text-center">{refNota === '-' ? '-' : (isNegativa ? <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">Negativa</span> : <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">Positiva</span>)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // --- DADOS DA ESCOLA ---
  const renderEscola = () => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-6">
      <h2 className="text-xl font-black flex items-center gap-2"><GraduationCap className="text-indigo-600" /> Dados da Instituição</h2>
      <form onSubmit={e => { e.preventDefault(); setDadosEscola({ ...formEscola }); mostrarSucesso('Dados da escola guardados!'); }} className="space-y-4 max-w-xl">
        <div><label className="block text-xs font-semibold mb-1">Nome da Escola</label><input type="text" value={formEscola.nome} onChange={e => setFormEscola({ ...formEscola, nome: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm" required /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs font-semibold mb-1">Província</label><input type="text" value={formEscola.provincia} onChange={e => setFormEscola({ ...formEscola, provincia: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm" required /></div>
          <div><label className="block text-xs font-semibold mb-1">Município</label><input type="text" value={formEscola.municipio} onChange={e => setFormEscola({ ...formEscola, municipio: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm" required /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs font-semibold mb-1">Diretor Pedagógico</label><input type="text" value={formEscola.diretorPedagogico || ''} onChange={e => setFormEscola({ ...formEscola, diretorPedagogico: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm" /></div>
          <div><label className="block text-xs font-semibold mb-1">Código da Escola</label><input type="text" value={formEscola.codigoEscola || ''} onChange={e => setFormEscola({ ...formEscola, codigoEscola: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm" /></div>
        </div>
        <button type="submit" className="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg">Guardar Dados</button>
      </form>
    </div>
  );

  // --- SEGURANÇA E ACESSOS ---
  const renderSeguranca = () => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-6">
      <h2 className="text-xl font-black flex items-center gap-2"><Lock className="text-indigo-600" /> Segurança e Credenciais do Diretor</h2>
      <form onSubmit={e => { e.preventDefault(); setCredenciaisDiretor(formSeguranca); mostrarSucesso('Credenciais atualizadas!'); }} className="space-y-4 max-w-lg">
        <div><label className="block text-xs font-semibold mb-1">Nome do Administrador</label><input type="text" value={formSeguranca.nome} onChange={e => setFormSeguranca({ ...formSeguranca, nome: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm" required /></div>
        <div><label className="block text-xs font-semibold mb-1">Utilizador / E-mail</label><input type="text" value={formSeguranca.email} onChange={e => setFormSeguranca({ ...formSeguranca, email: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm" required /></div>
        <div><label className="block text-xs font-semibold mb-1">Palavra-passe</label><input type="text" value={formSeguranca.senha} onChange={e => setFormSeguranca({ ...formSeguranca, senha: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm" required /></div>
        <button type="submit" className="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm">Guardar Alterações</button>
      </form>
    </div>
  );

  // --- CICLOS & MATRIZ CURRICULAR (CRUD 100%) ---
  const renderCiclos = () => {
    const handleCriarCiclo = (e) => {
      e.preventDefault();
      if (!novoCiclo.nome.trim()) return;
      const listaDiscs = novoCiclo.disciplinasStr.split(',').map(s => s.trim()).filter(Boolean);
      setCiclos([...ciclos, {
        id: `c_${Date.now()}`,
        nome: novoCiclo.nome.trim(),
        tipo: novoCiclo.tipo,
        disciplinas: listaDiscs.length > 0 ? listaDiscs : ['Língua Portuguesa', 'Matemática']
      }]);
      setNovoCiclo({ nome: '', tipo: 'primario', disciplinasStr: '' });
      mostrarSucesso('Novo ciclo criado!');
    };

    const handleAdicionarDisc = (cicloId) => {
      const nomeD = (novaDisciplinaCiclo[cicloId] || '').trim();
      if (!nomeD) return;
      setCiclos(ciclos.map(c => c.id === cicloId && !c.disciplinas.includes(nomeD) ? { ...c, disciplinas: [...c.disciplinas, nomeD] } : c));
      setNovaDisciplinaCiclo({ ...novaDisciplinaCiclo, [cicloId]: '' });
      mostrarSucesso('Disciplina adicionada!');
    };

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
          <h2 className="text-xl font-black flex items-center gap-2"><Layers className="text-indigo-600" /> Criar Novo Ciclo de Ensino</h2>
          <form onSubmit={handleCriarCiclo} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-slate-50 p-4 rounded-2xl border">
            <div><label className="block text-xs font-bold mb-1">Nome do Ciclo</label><input type="text" placeholder="Ex: II Ciclo Secundário" value={novoCiclo.nome} onChange={e => setNovoCiclo({ ...novoCiclo, nome: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-sm bg-white" required /></div>
            <div>
              <label className="block text-xs font-bold mb-1">Escala de Notas</label>
              <select value={novoCiclo.tipo} onChange={e => setNovoCiclo({ ...novoCiclo, tipo: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-xs bg-white font-bold">
                <option value="primario">0 a 10 Valores (Primário)</option>
                <option value="secundario">0 a 20 Valores (Secundário)</option>
              </select>
            </div>
            <div><label className="block text-xs font-bold mb-1">Disciplinas (separadas por vírgula)</label><input type="text" placeholder="Português, Matemática..." value={novoCiclo.disciplinasStr} onChange={e => setNovoCiclo({ ...novoCiclo, disciplinasStr: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-sm bg-white" /></div>
            <button type="submit" className="bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-black">Criar Ciclo</button>
          </form>
        </div>

        <div className="space-y-4">
          {ciclos.map(ciclo => (
            <div key={ciclo.id} className="bg-white border p-6 rounded-3xl shadow-sm space-y-4">
              {editingCiclo?.id === ciclo.id ? (
                <div className="flex flex-wrap gap-3 items-center">
                  <input type="text" value={editingCiclo.nome} onChange={e => setEditingCiclo({ ...editingCiclo, nome: e.target.value })} className="px-3 py-2 border rounded-xl text-sm font-bold" />
                  <select value={editingCiclo.tipo} onChange={e => setEditingCiclo({ ...editingCiclo, tipo: e.target.value })} className="px-3 py-2 border rounded-xl text-xs bg-white">
                    <option value="primario">0 a 10 Valores</option>
                    <option value="secundario">0 a 20 Valores</option>
                  </select>
                  <button onClick={() => { setCiclos(ciclos.map(c => c.id === ciclo.id ? editingCiclo : c)); setEditingCiclo(null); mostrarSucesso('Ciclo atualizado!'); }} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold">Guardar</button>
                  <button onClick={() => setEditingCiclo(null)} className="bg-slate-100 px-3 py-2 rounded-xl text-xs font-bold">Cancelar</button>
                </div>
              ) : (
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <h3 className="font-black text-lg text-slate-900">{ciclo.nome}</h3>
                    <span className="text-xs font-bold text-indigo-600">Escala: {ciclo.tipo === 'primario' ? '0 a 10 valores' : '0 a 20 valores'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingCiclo({ ...ciclo })} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1"><Edit2 className="w-3.5 h-3.5" /> Editar Ciclo</button>
                    <button onClick={() => pedirConfirmacao(`Eliminar o ciclo "${ciclo.nome}"?`, () => { setCiclos(ciclos.filter(c => c.id !== ciclo.id)); mostrarSucesso('Ciclo eliminado!'); })} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Eliminar</button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {ciclo.disciplinas.map((d, idx) => (
                  <div key={idx} className="inline-flex items-center gap-1.5 bg-slate-50 border px-3 py-1.5 rounded-xl text-xs font-bold">
                    {editingDisciplina.cicloId === ciclo.id && editingDisciplina.index === idx ? (
                      <>
                        <input type="text" value={editingDisciplina.nome} onChange={e => setEditingDisciplina({ ...editingDisciplina, nome: e.target.value })} className="px-2 py-0.5 border rounded text-xs w-32 bg-white" />
                        <button onClick={() => {
                          const atualizadas = [...ciclo.disciplinas];
                          if (editingDisciplina.nome.trim()) atualizadas[idx] = editingDisciplina.nome.trim();
                          setCiclos(ciclos.map(c => c.id === ciclo.id ? { ...c, disciplinas: atualizadas } : c));
                          setEditingDisciplina({ cicloId: null, index: null, nome: '' });
                          mostrarSucesso('Disciplina renomeada!');
                        }} className="text-emerald-600"><Check className="w-3.5 h-3.5" /></button>
                      </>
                    ) : (
                      <>
                        <span>{d}</span>
                        <button onClick={() => setEditingDisciplina({ cicloId: ciclo.id, index: idx, nome: d })} className="text-indigo-500 hover:text-indigo-700 ml-1"><Edit2 className="w-3 h-3" /></button>
                        <button onClick={() => {
                          setCiclos(ciclos.map(c => c.id === ciclo.id ? { ...c, disciplinas: c.disciplinas.filter((_, i) => i !== idx) } : c));
                          mostrarSucesso('Disciplina removida!');
                        }} className="text-red-500 hover:text-red-700"><X className="w-3.5 h-3.5" /></button>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 max-w-md pt-1">
                <input type="text" placeholder="Nova disciplina..." value={novaDisciplinaCiclo[ciclo.id] || ''} onChange={e => setNovaDisciplinaCiclo({ ...novaDisciplinaCiclo, [ciclo.id]: e.target.value })} className="flex-1 px-3 py-2 border rounded-xl text-xs" />
                <button type="button" onClick={() => handleAdicionarDisc(ciclo.id)} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold">+ Adicionar Disciplina</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // --- GESTÃO DE TURMAS (SUGESTÃO SEQUENCIAL & LIMITE DE VAGAS) ---
  const renderTurmas = () => {
    const sugerirProximaTurma = (valorDigitado) => {
      const matchNum = valorDigitado.trim().match(/^(\d{1,2})$/);
      if (!matchNum) {
        setNovaTurma(prev => ({ ...prev, nome: valorDigitado }));
        return;
      }
      const numClasse = parseInt(matchNum[1], 10);
      if (numClasse < 1 || numClasse > 13) {
        setNovaTurma(prev => ({ ...prev, nome: valorDigitado }));
        return;
      }

      const turmasMesmaClasse = turmas.filter(t => extrairNumeroClasse(t.nome) === numClasse);
      const letrasUsadas = turmasMesmaClasse.map(t => {
        const m = t.nome.match(/Turma\s+([A-Z])/i);
        return m ? m[1].toUpperCase() : null;
      }).filter(Boolean);

      let proximaLetra = 'A';
      for (let code = 65; code <= 90; code++) {
        const letra = String.fromCharCode(code);
        if (!letrasUsadas.includes(letra)) {
          proximaLetra = letra;
          break;
        }
      }

      const cicloAuto = numClasse <= 6
        ? (ciclos.find(c => c.tipo === 'primario')?.id || ciclos[0]?.id || 'c1')
        : (ciclos.find(c => c.tipo === 'secundario')?.id || ciclos[0]?.id || 'c1');

      setNovaTurma(prev => ({
        ...prev,
        nome: `${numClasse}ª Classe - Turma ${proximaLetra}`,
        cicloId: cicloAuto
      }));
    };

    return (
      <div className="space-y-6">
        {editingTurma && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-md w-full space-y-4 border">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-lg font-black text-slate-900">Editar Turma & Vagas</h3>
                <button onClick={() => setEditingTurma(null)}><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={e => {
                e.preventDefault();
                setTurmas(turmas.map(t => t.id === editingTurma.id ? { ...editingTurma, vagas: Math.max(1, parseInt(editingTurma.vagas, 10) || 35) } : t));
                setEditingTurma(null);
                mostrarSucesso('Turma e limite de vagas atualizados!');
              }} className="space-y-3">
                <div><label className="block text-xs font-bold mb-1">Nome da Turma</label><input type="text" value={editingTurma.nome} onChange={e => setEditingTurma({ ...editingTurma, nome: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-sm" required /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1">Limite de Vagas</label>
                    <input type="number" min="1" max="200" value={editingTurma.vagas || 35} onChange={e => setEditingTurma({ ...editingTurma, vagas: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-sm font-bold" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Perfil Etário</label>
                    <select value={editingTurma.perfilIdade || 'regular'} onChange={e => setEditingTurma({ ...editingTurma, perfilIdade: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-xs bg-white font-bold">
                      <option value="regular">Idade Regular</option>
                      <option value="mais_velhos">Idades Maiores / Repetentes</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Ciclo</label>
                  <select value={editingTurma.cicloId} onChange={e => setEditingTurma({ ...editingTurma, cicloId: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-xs bg-white">
                    {ciclos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setEditingTurma(null)} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold">Cancelar</button>
                  <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div>
              <h2 className="text-xl font-black flex items-center gap-2"><LayoutDashboard className="text-indigo-600" /> Gestão de Turmas & Limite de Vagas</h2>
              <p className="text-xs text-slate-500">Digite o número da classe (ex: <b>8</b>) para sugerir automaticamente a próxima turma livre (A, B, C...) e defina as vagas.</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                <button key={num} type="button" onClick={() => sugerirProximaTurma(String(num))} className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-black">
                  {num}ª
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={e => {
            e.preventDefault();
            if (!novaTurma.nome.trim()) return;
            setTurmas([...turmas, {
              id: `t_${Date.now()}`,
              nome: novaTurma.nome.trim(),
              cicloId: novaTurma.cicloId,
              vagas: Math.max(1, parseInt(novaTurma.vagas, 10) || 35),
              perfilIdade: novaTurma.perfilIdade || 'regular'
            }]);
            setNovaTurma({ nome: '', cicloId: 'c1', vagas: 35, perfilIdade: 'regular' });
            mostrarSucesso('Turma criada com sucesso!');
          }} className="p-5 border rounded-2xl bg-slate-50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-xs font-bold mb-1">Classe / Nome (Digite nº ex: 8)</label>
              <input type="text" placeholder="Ex: 8 ou 8ª Classe - Turma A" value={novaTurma.nome} onChange={e => sugerirProximaTurma(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm bg-white font-bold" required />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Ciclo</label>
              <select value={novaTurma.cicloId} onChange={e => setNovaTurma({ ...novaTurma, cicloId: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-xs bg-white font-bold">
                {ciclos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Limite de Vagas</label>
              <input type="number" min="1" max="200" value={novaTurma.vagas} onChange={e => setNovaTurma({ ...novaTurma, vagas: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-sm bg-white font-bold" required />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Perfil Etário</label>
              <select value={novaTurma.perfilIdade} onChange={e => setNovaTurma({ ...novaTurma, perfilIdade: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-xs bg-white font-bold">
                <option value="regular">Idade Regular</option>
                <option value="mais_velhos">Idades Maiores / Repetentes</option>
              </select>
            </div>
            <button type="submit" className="bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-black shadow">Criar Turma</button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {turmas.map(t => {
              const ocupados = obterOcupacaoTurma(t.id);
              const cap = parseInt(t.vagas, 10) || 35;
              const lotada = ocupados >= cap;
              return (
                <div key={t.id} className={`border p-5 rounded-2xl flex justify-between items-center gap-3 ${lotada ? 'bg-red-50/40 border-red-200' : 'bg-white'}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-slate-900">{t.nome}</h3>
                      {lotada ? (
                        <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">LOTADA</span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-black">{cap - ocupados} vagas livres</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Ocupação: <b>{ocupados}/{cap}</b> • Ciclo: {ciclos.find(c => c.id === t.cicloId)?.nome || '-'} • {t.perfilIdade === 'mais_velhos' ? 'Idades Maiores' : 'Idade Regular'}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => setEditingTurma({ ...t })} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1"><Edit2 className="w-3.5 h-3.5" /> Editar</button>
                    <button onClick={() => pedirConfirmacao(`Eliminar a turma "${t.nome}"?`, () => { setTurmas(turmas.filter(x => x.id !== t.id)); mostrarSucesso('Turma eliminada!'); })} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // --- MATRÍCULAS, APROVAÇÃO DE PENDENTES, RECONFIRMAÇÃO E SUGESTÃO POR IDADE ---
  const renderMatricula = () => {
    const sugestaoDiretor = sugerirTurmaPorIdade(novoAluno.idade);

    const calcularProximoNumeroLivre = (turmaId) => {
      const nums = alunos.filter(a => a.turmaId === turmaId).map(a => parseInt(a.numero, 10)).filter(n => !isNaN(n));
      return (nums.length > 0 ? Math.max(...nums) + 1 : 1).toString();
    };

    const handleMatricularAluno = (e) => {
      e.preventDefault();
      const tId = novoAluno.turmaId || sugestaoDiretor?.turma?.id || turmas[0]?.id || '';
      if (!novoAluno.nome.trim() || !novoAluno.idade || !tId) return;

      if (obterVagasRestantes(tId) <= 0) {
        mostrarSucesso('Turma lotada! Aumente o limite de vagas na Gestão de Turmas ou escolha outra turma.');
        return;
      }

      const numFinal = novoAluno.numero.trim() || calcularProximoNumeroLivre(tId);
      const duplicado = alunos.some(a => a.turmaId === tId && a.numero.trim().toLowerCase() === numFinal.toLowerCase());
      if (duplicado) {
        mostrarSucesso(`Erro: O Nº de Ordem "${numFinal}" já existe nesta turma.`);
        return;
      }

      setAlunos([...alunos, {
        id: `a_${Date.now()}`,
        nome: novoAluno.nome.trim(),
        numero: numFinal,
        idade: parseInt(novoAluno.idade, 10),
        turmaId: tId,
        senha: novoAluno.senha.trim() || '123',
        status: 'aprovado'
      }]);
      setNovoAluno({ nome: '', numero: '', idade: '', turmaId: tId, senha: '123' });
      mostrarSucesso(`Aluno matriculado com Nº ${numFinal}!`);
    };

    const handleAprovarPedidoAluno = (pedido) => {
      if (obterVagasRestantes(pedido.turmaId) <= 0) {
        mostrarSucesso('A turma escolhida pelo aluno já está lotada! Aumente as vagas ou altere a turma.');
        return;
      }
      const duplicado = alunos.some(a => a.turmaId === pedido.turmaId && a.numero.trim().toLowerCase() === pedido.numero.trim().toLowerCase());
      if (duplicado) {
        mostrarSucesso(`Conflito de número: O Nº ${pedido.numero} já está em uso nessa turma.`);
        return;
      }
      setAlunos([...alunos, {
        id: `a_${Date.now()}`,
        nome: pedido.nome,
        numero: pedido.numero,
        idade: pedido.idade,
        turmaId: pedido.turmaId,
        senha: pedido.senha,
        status: 'aprovado'
      }]);
      setPedidosAlunos(pedidosAlunos.filter(p => p.id !== pedido.id));
      mostrarSucesso(`Aluno ${pedido.nome} aprovado e ativo no sistema!`);
    };

    const handleReconfirmarAluno = (rec, turmaDestinoId) => {
      if (!turmaDestinoId) return;
      if (obterVagasRestantes(turmaDestinoId) <= 0) {
        mostrarSucesso('Turma de destino lotada! Selecione outra turma com vagas ou aumente as vagas.');
        return;
      }
      const numFinal = calcularProximoNumeroLivre(turmaDestinoId);
      setAlunos([...alunos, {
        id: `a_${Date.now()}_${rec.alunoId}`,
        nome: rec.nome,
        numero: numFinal,
        idade: rec.novaIdade,
        turmaId: turmaDestinoId,
        senha: rec.senha || '123',
        status: 'aprovado'
      }]);
      setReconfirmacoesPendentes(reconfirmacoesPendentes.filter(r => r.id !== rec.id));
      mostrarSucesso(`${rec.nome} reconfirmado(a) com Nº ${numFinal}!`);
    };

    const alunosFiltrados = alunos.filter(a => {
      if (filtroAlunoTurma && a.turmaId !== filtroAlunoTurma) return false;
      if (filtroAlunoPesquisa) {
        const q = filtroAlunoPesquisa.toLowerCase();
        return a.nome.toLowerCase().includes(q) || a.numero.toLowerCase().includes(q);
      }
      return true;
    }).sort((a, b) => (parseInt(a.numero, 10) || 0) - (parseInt(b.numero, 10) || 0));

    return (
      <div className="space-y-6">
        {/* Modal Edição Aluno */}
        {editingAluno && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-md w-full space-y-4 border">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-lg font-black text-slate-900">Editar Aluno</h3>
                <button onClick={() => setEditingAluno(null)}><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={e => {
                e.preventDefault();
                const original = alunos.find(x => x.id === editingAluno.id);
                if (original && original.turmaId !== editingAluno.turmaId && obterVagasRestantes(editingAluno.turmaId) <= 0) {
                  mostrarSucesso('A turma de destino está lotada!');
                  return;
                }
                const duplicado = alunos.some(a => a.id !== editingAluno.id && a.turmaId === editingAluno.turmaId && a.numero.trim().toLowerCase() === editingAluno.numero.trim().toLowerCase());
                if (duplicado) {
                  mostrarSucesso(`O Nº de Ordem "${editingAluno.numero}" já está ocupado na turma selecionada!`);
                  return;
                }
                setAlunos(alunos.map(a => a.id === editingAluno.id ? { ...editingAluno, idade: parseInt(editingAluno.idade, 10) || a.idade } : a));
                setEditingAluno(null);
                mostrarSucesso('Dados do aluno atualizados!');
              }} className="space-y-3">
                <div><label className="block text-xs font-bold mb-1">Nome Completo</label><input type="text" value={editingAluno.nome} onChange={e => setEditingAluno({ ...editingAluno, nome: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-sm" required /></div>
                <div className="grid grid-cols-3 gap-2">
                  <div><label className="block text-xs font-bold mb-1">Nº Ordem</label><input type="text" value={editingAluno.numero} onChange={e => setEditingAluno({ ...editingAluno, numero: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-sm font-bold" required /></div>
                  <div><label className="block text-xs font-bold mb-1">Idade</label><input type="number" value={editingAluno.idade} onChange={e => setEditingAluno({ ...editingAluno, idade: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-sm" required /></div>
                  <div><label className="block text-xs font-bold mb-1">Senha</label><input type="text" value={editingAluno.senha} onChange={e => setEditingAluno({ ...editingAluno, senha: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-sm" required /></div>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Turma</label>
                  <select value={editingAluno.turmaId} onChange={e => setEditingAluno({ ...editingAluno, turmaId: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-xs bg-white">
                    {turmas.map(t => <option key={t.id} value={t.id}>{t.nome} ({obterVagasRestantes(t.id)} vagas)</option>)}
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setEditingAluno(null)} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold">Cancelar</button>
                  <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 1. Pedidos Pendentes de Auto-Registo */}
        {pedidosAlunos.length > 0 && (
          <div className="bg-orange-50 border border-orange-300 p-6 rounded-3xl space-y-4">
            <h3 className="text-lg font-black text-orange-950 flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-600" /> Pedidos de Matrícula Pendentes ({pedidosAlunos.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pedidosAlunos.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-2xl border border-orange-200 flex justify-between items-center gap-3">
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{p.nome} <span className="text-xs text-indigo-600">(Nº {p.numero})</span></h4>
                    <p className="text-xs text-slate-500">Idade: {p.idade} anos • Turma: {turmas.find(t => t.id === p.turmaId)?.nome || '-'}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => handleAprovarPedidoAluno(p)} className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold">Aprovar</button>
                    <button onClick={() => setPedidosAlunos(pedidosAlunos.filter(x => x.id !== p.id))} className="bg-red-50 text-red-600 px-2.5 py-1.5 rounded-xl text-xs font-bold border border-red-200">Recusar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Reconfirmação de Alunos Aprovados (Novo Ano Letivo) */}
        {reconfirmacoesPendentes.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-3xl space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div>
                <h3 className="text-lg font-black text-indigo-950 flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-indigo-600" /> Reconfirmar Alunos Aprovados ({reconfirmacoesPendentes.length})
                </h3>
                <p className="text-xs text-indigo-700">Alunos aprovados no ano anterior aguardando ativação na classe seguinte com sugestão automática por idade.</p>
              </div>
              <button
                onClick={() => {
                  reconfirmacoesPendentes.forEach(rec => {
                    const sug = sugerirTurmaPorIdade(rec.novaIdade, rec.classeDestino);
                    const tDest = rec.turmaSugeridaId || sug?.turma?.id;
                    if (tDest && obterVagasRestantes(tDest) > 0) {
                      handleReconfirmarAluno(rec, tDest);
                    }
                  });
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow"
              >
                Reconfirmar Todos com Vaga
              </button>
            </div>
            <div className="space-y-2.5">
              {reconfirmacoesPendentes.map(rec => {
                const sug = sugerirTurmaPorIdade(rec.novaIdade, rec.classeDestino);
                const tEsc = rec.turmaSugeridaId || sug?.turma?.id || turmas[0]?.id || '';
                return (
                  <div key={rec.id} className="bg-white p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">{rec.nome}</h4>
                      <p className="text-xs text-slate-500">Nova Idade: <b>{rec.novaIdade} anos</b> • Promovido para: <b>{rec.classeDestino}ª Classe</b></p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={tEsc}
                        onChange={e => setReconfirmacoesPendentes(reconfirmacoesPendentes.map(r => r.id === rec.id ? { ...r, turmaSugeridaId: e.target.value } : r))}
                        className="px-3 py-1.5 border rounded-xl text-xs bg-slate-50 font-bold"
                      >
                        {turmas.map(t => (
                          <option key={t.id} value={t.id} disabled={obterVagasRestantes(t.id) <= 0}>
                            {t.nome} ({obterVagasRestantes(t.id)} vagas)
                          </option>
                        ))}
                      </select>
                      <button onClick={() => handleReconfirmarAluno(rec, tEsc)} className="bg-emerald-600 text-white px-4 py-1.5 rounded-xl text-xs font-black">Reconfirmar e Ativar</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Nova Matrícula Direta (com Sugestão Automática por Idade) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
          <h2 className="text-xl font-black flex items-center gap-2"><UserPlus className="text-indigo-600" /> Matrícula Direta de Aluno</h2>
          <form onSubmit={handleMatricularAluno} className="p-5 border rounded-2xl bg-slate-50 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
              <div>
                <label className="block text-xs font-bold mb-1">Idade do Aluno</label>
                <input
                  type="number"
                  min="5"
                  max="45"
                  placeholder="Ex: 12"
                  value={novoAluno.idade}
                  onChange={e => {
                    const idVal = e.target.value;
                    const sug = sugerirTurmaPorIdade(idVal);
                    setNovoAluno({ ...novoAluno, idade: idVal, turmaId: sug ? sug.turma.id : novoAluno.turmaId });
                  }}
                  className="w-full px-3 py-2 border rounded-xl text-sm bg-white font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Turma (Sugerida por Idade)</label>
                <select value={novoAluno.turmaId || sugestaoDiretor?.turma?.id || turmas[0]?.id || ''} onChange={e => setNovoAluno({ ...novoAluno, turmaId: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-xs bg-white font-bold">
                  {turmas.map(t => {
                    const livres = obterVagasRestantes(t.id);
                    return (
                      <option key={t.id} value={t.id} disabled={livres <= 0}>
                        {t.nome} ({livres > 0 ? `${livres} vagas` : 'LOTADA'})
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Nome Completo</label>
                <input type="text" value={novoAluno.nome} onChange={e => setNovoAluno({ ...novoAluno, nome: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-sm bg-white" required />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Nº Ordem (Vazio = Auto)</label>
                <input type="text" placeholder="Auto" value={novoAluno.numero} onChange={e => setNovoAluno({ ...novoAluno, numero: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-sm bg-white" />
              </div>
              <button type="submit" className="bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-black shadow">Matricular Aluno</button>
            </div>
            {sugestaoDiretor && (
              <p className="text-xs font-bold text-indigo-700">
                Sugestão Inteligente: Para <b>{novoAluno.idade} anos</b> ({sugestaoDiretor.classeEstimada}ª Classe), recomendamos <b>{sugestaoDiretor.turma.nome}</b> ({sugestaoDiretor.vagasRestantes} vagas disponíveis).
              </p>
            )}
          </form>
        </div>

        {/* 4. Lista de Alunos Matriculados */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <h3 className="text-lg font-black text-slate-900">Alunos Matriculados ({alunosFiltrados.length})</h3>
            <div className="flex flex-wrap gap-2">
              <input type="text" placeholder="Pesquisar nome ou nº..." value={filtroAlunoPesquisa} onChange={e => setFiltroAlunoPesquisa(e.target.value)} className="px-3 py-2 border rounded-xl text-xs" />
              <select value={filtroAlunoTurma} onChange={e => setFiltroAlunoTurma(e.target.value)} className="px-3 py-2 border rounded-xl text-xs bg-white font-bold">
                <option value="">Todas as Turmas</option>
                {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 uppercase font-bold text-slate-700">
                  <th className="p-3 border-b text-center">Nº</th>
                  <th className="p-3 border-b">Nome</th>
                  <th className="p-3 border-b text-center">Idade</th>
                  <th className="p-3 border-b">Turma</th>
                  <th className="p-3 border-b text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {alunosFiltrados.map(a => (
                  <tr key={a.id} className="border-b hover:bg-slate-50">
                    <td className="p-3 text-center font-black text-indigo-700">{a.numero}</td>
                    <td className="p-3 font-bold text-slate-900">{a.nome}</td>
                    <td className="p-3 text-center">{a.idade} anos</td>
                    <td className="p-3">{turmas.find(t => t.id === a.turmaId)?.nome || '-'}</td>
                    <td className="p-3 text-right space-x-1.5">
                      <button onClick={() => setEditingAluno({ ...a })} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl font-bold">Editar</button>
                      <button onClick={() => pedirConfirmacao(`Eliminar o aluno "${a.nome}"?`, () => { setAlunos(alunos.filter(x => x.id !== a.id)); mostrarSucesso('Aluno eliminado!'); })} className="px-3 py-1 bg-red-50 text-red-600 rounded-xl font-bold">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // --- PAUTAS & AVALIAÇÃO (CASCATA CICLO -> CLASSE -> TURMA -> DISCIPLINA -> TRIMESTRE) ---
  const renderMiniPautas = () => {
    const turmasPermitidas = usuarioLogado.tipo === 'professor'
      ? turmas.filter(t => (usuarioLogado.turmasAtribuidas || []).includes(t.id))
      : turmas;

    const ciclosDisp = usuarioLogado.tipo === 'professor'
      ? ciclos.filter(c => turmasPermitidas.some(t => t.cicloId === c.id))
      : ciclos;

    const cId = ciclosDisp.some(c => c.id === pautaCicloId) ? pautaCicloId : (ciclosDisp[0]?.id || '');
    const turmasDoCiclo = turmasPermitidas.filter(t => t.cicloId === cId);
    const classesDisp = Array.from(new Set(turmasDoCiclo.map(t => extrairNumeroClasse(t.nome)))).sort((a, b) => a - b);
    const classeAtiva = pautaClasseFiltro && classesDisp.includes(Number(pautaClasseFiltro)) ? Number(pautaClasseFiltro) : '';

    const turmasFiltradas = classeAtiva
      ? turmasDoCiclo.filter(t => extrairNumeroClasse(t.nome) === classeAtiva)
      : turmasDoCiclo;

    const tId = turmasFiltradas.some(t => t.id === pautaTurmaId) ? pautaTurmaId : (turmasFiltradas[0]?.id || '');
    const turmaObj = turmas.find(t => t.id === tId);
    const cicloObj = ciclos.find(c => c.id === turmaObj?.cicloId);

    const discDisp = usuarioLogado.tipo === 'professor'
      ? (usuarioLogado.atribuicoes || []).filter(a => a.turmaId === tId).map(a => a.disciplina)
      : (cicloObj?.disciplinas || []);

    const dId = discDisp.includes(pautaDisciplina) ? pautaDisciplina : (discDisp[0] || '');
    const bloqueada = Boolean(manutencaoTrimestral[`${tId}-${trimestreSelecionado}`]);
    const alunosTurma = alunos
      .filter(a => a.turmaId === tId)
      .sort((a, b) => (parseInt(a.numero, 10) || 0) - (parseInt(b.numero, 10) || 0));

    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <h2 className="text-xl font-black flex items-center gap-2"><ClipboardList className="text-indigo-600" /> Pautas & Avaliação Contínua</h2>
            <p className="text-xs text-slate-500">Selecione Ciclo → Classe → Turma → Disciplina → Trimestre para lançar MAC e NPT.</p>
          </div>
          {bloqueada && <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-black">Trimestre Bloqueado</span>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-2xl border">
          <div>
            <label className="block text-[11px] font-bold mb-1">1. Ciclo</label>
            <select value={cId} onChange={e => { setPautaCicloId(e.target.value); setPautaClasseFiltro(''); setPautaTurmaId(''); setPautaDisciplina(''); }} className="w-full border rounded-xl px-3 py-2 text-xs font-bold bg-white">
              {ciclosDisp.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold mb-1">2. Classe</label>
            <select value={classeAtiva} onChange={e => { setPautaClasseFiltro(e.target.value); setPautaTurmaId(''); }} className="w-full border rounded-xl px-3 py-2 text-xs font-bold bg-white">
              <option value="">Todas as Classes</option>
              {classesDisp.map(cl => <option key={cl} value={cl}>{cl}ª Classe</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold mb-1">3. Turma</label>
            <select value={tId} onChange={e => { setPautaTurmaId(e.target.value); setPautaDisciplina(''); }} className="w-full border rounded-xl px-3 py-2 text-xs font-bold bg-white">
              {turmasFiltradas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold mb-1">4. Disciplina</label>
            <select value={dId} onChange={e => setPautaDisciplina(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-xs font-bold bg-white">
              {discDisp.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold mb-1">5. Trimestre</label>
            <select value={trimestreSelecionado} onChange={e => setTrimestreSelecionado(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-xs font-bold bg-white">
              <option>1º Trimestre</option>
              <option>2º Trimestre</option>
              <option>3º Trimestre</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase font-bold text-slate-700">
                <th className="p-3.5 border-b text-center w-16">Nº</th>
                <th className="p-3.5 border-b">Nome do Aluno</th>
                <th className="p-3.5 border-b text-center">MAC</th>
                <th className="p-3.5 border-b text-center">NPT</th>
                <th className="p-3.5 border-b text-center">MT</th>
                <th className="p-3.5 border-b text-center">Comportamento</th>
              </tr>
            </thead>
            <tbody>
              {alunosTurma.length === 0 ? (
                <tr><td colSpan="6" className="p-6 text-center text-xs text-slate-400">Nenhum aluno encontrado nesta turma.</td></tr>
              ) : (
                alunosTurma.map(a => {
                  const k = `${a.id}-${dId}-${trimestreSelecionado}`;
                  const n = notas[k] || { av1: '', av2: '' };
                  const mt = calcularMedia(n.av1, n.av2);
                  return (
                    <tr key={a.id} className="border-b hover:bg-slate-50">
                      <td className="p-3.5 text-center font-black text-indigo-700">{a.numero}</td>
                      <td className="p-3.5 font-bold text-slate-900">{a.nome}</td>
                      <td className="p-3.5 text-center">
                        <input
                          type="number"
                          disabled={bloqueada}
                          value={n.av1}
                          onChange={e => handleNotaChange(a.id, dId, trimestreSelecionado, 'av1', e.target.value, cicloObj?.tipo)}
                          className="w-16 py-1 border rounded-xl text-center font-bold"
                        />
                      </td>
                      <td className="p-3.5 text-center">
                        <input
                          type="number"
                          disabled={bloqueada}
                          value={n.av2}
                          onChange={e => handleNotaChange(a.id, dId, trimestreSelecionado, 'av2', e.target.value, cicloObj?.tipo)}
                          className="w-16 py-1 border rounded-xl text-center font-bold"
                        />
                      </td>
                      <td className={`p-3.5 text-center font-black text-base ${checkNegativa(mt, cicloObj?.tipo) ? 'text-red-600' : 'text-emerald-700'}`}>{mt}</td>
                      <td className="p-3.5 text-center">
                        <select
                          disabled={bloqueada}
                          value={comportamentos[`${a.id}-${trimestreSelecionado}`] || 'Bom (B)'}
                          onChange={e => setComportamentos({ ...comportamentos, [`${a.id}-${trimestreSelecionado}`]: e.target.value })}
                          className="border rounded-xl px-2.5 py-1 text-xs bg-white font-semibold"
                        >
                          <option>Muito Bom (MB)</option>
                          <option>Bom (B)</option>
                          <option>Suficiente (S)</option>
                          <option>Mau (M)</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // --- BOLETINS DE NOTAS (COM MFD E IMPRESSÃO PARA DIRETOR/PROFESSOR) ---
  const renderBoletins = () => {
    const tId = boletimTurmaId || turmas[0]?.id || '';
    const tObj = turmas.find(t => t.id === tId);
    const cObj = ciclos.find(c => c.id === tObj?.cicloId);
    const discs = cObj?.disciplinas || [];
    const alunosT = alunos.filter(a => a.turmaId === tId).sort((a, b) => (parseInt(a.numero, 10) || 0) - (parseInt(b.numero, 10) || 0));
    const alunoSel = alunosT.find(a => a.id === boletimAlunoId) || alunosT[0];

    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <h2 className="text-xl font-black flex items-center gap-2"><FileText className="text-indigo-600" /> Boletins de Aproveitamento</h2>
          {alunoSel && (
            <button onClick={() => window.print()} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow">
              <Printer className="w-4 h-4" /> Imprimir Boletim
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border">
          <div>
            <label className="block text-xs font-bold mb-1">Turma</label>
            <select value={tId} onChange={e => { setBoletimTurmaId(e.target.value); setBoletimAlunoId(''); }} className="w-full border rounded-xl px-4 py-2 text-sm bg-white font-bold">
              {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Aluno</label>
            <select value={alunoSel?.id || ''} onChange={e => setBoletimAlunoId(e.target.value)} className="w-full border rounded-xl px-4 py-2 text-sm bg-white font-bold">
              {alunosT.map(a => <option key={a.id} value={a.id}>Nº {a.numero} - {a.nome}</option>)}
            </select>
          </div>
        </div>

        {alunoSel ? (
          <div className="overflow-x-auto rounded-2xl border">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 uppercase font-bold text-slate-700">
                  <th className="p-3.5 border-b">Disciplina</th>
                  <th className="p-3.5 border-b text-center">1º Trim</th>
                  <th className="p-3.5 border-b text-center">2º Trim</th>
                  <th className="p-3.5 border-b text-center">3º Trim</th>
                  <th className="p-3.5 border-b text-center">MFD</th>
                  <th className="p-3.5 border-b text-center">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {discs.map(d => {
                  const mt1 = calcularMedia(notas[`${alunoSel.id}-${d}-1º Trimestre`]?.av1 || '', notas[`${alunoSel.id}-${d}-1º Trimestre`]?.av2 || '');
                  const mt2 = calcularMedia(notas[`${alunoSel.id}-${d}-2º Trimestre`]?.av1 || '', notas[`${alunoSel.id}-${d}-2º Trimestre`]?.av2 || '');
                  const mt3 = calcularMedia(notas[`${alunoSel.id}-${d}-3º Trimestre`]?.av1 || '', notas[`${alunoSel.id}-${d}-3º Trimestre`]?.av2 || '');
                  const validas = [mt1, mt2, mt3].filter(v => v !== '-').map(Number);
                  const mfd = validas.length > 0 ? Math.round(validas.reduce((s, v) => s + v, 0) / validas.length).toString() : '-';
                  const neg = checkNegativa(mfd, cObj?.tipo);
                  return (
                    <tr key={d} className="border-b">
                      <td className="p-3.5 font-bold text-slate-900">{d}</td>
                      <td className="p-3.5 text-center font-bold">{mt1}</td>
                      <td className="p-3.5 text-center font-bold">{mt2}</td>
                      <td className="p-3.5 text-center font-bold">{mt3}</td>
                      <td className={`p-3.5 text-center font-black text-sm ${neg ? 'text-red-600' : 'text-emerald-700'}`}>{mfd}</td>
                      <td className="p-3.5 text-center">{mfd === '-' ? '-' : (neg ? 'Não Aprovado' : 'Aprovado')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-8">Nenhum aluno nesta turma.</p>
        )}
      </div>
    );
  };

  // --- ESTATÍSTICAS & RANKINGS (MELHOR ALUNO E PROFESSOR GERAL E POR SALA, APROVAÇÕES/REPROVAÇÕES) ---
  const renderEstatisticas = () => {
    const rankingsAlunos = alunos.map(al => {
      const des = calcularDesempenhoAnualAluno(al);
      const tObj = turmas.find(t => t.id === al.turmaId);
      return { ...al, turmaNome: tObj?.nome || '-', ...des };
    }).sort((a, b) => b.mediaGeral - a.mediaGeral);

    const melhorAlunoGeral = rankingsAlunos.find(a => a.totalComNota > 0) || rankingsAlunos[0];

    const rankingsProfessores = professores.map(pr => {
      const atribs = pr.atribuicoes || [];
      let somaNotas = 0;
      let qtdNotas = 0;
      let aprovadosDisc = 0;

      atribs.forEach(atr => {
        const tObj = turmas.find(t => t.id === atr.turmaId);
        const cObj = ciclos.find(c => c.id === tObj?.cicloId);
        const limiar = cObj?.tipo === 'primario' ? 5 : 10;
        const alunosSala = alunos.filter(a => a.turmaId === atr.turmaId);

        alunosSala.forEach(al => {
          const mt1 = calcularMedia(notas[`${al.id}-${atr.disciplina}-1º Trimestre`]?.av1 || '', notas[`${al.id}-${atr.disciplina}-1º Trimestre`]?.av2 || '');
          const mt2 = calcularMedia(notas[`${al.id}-${atr.disciplina}-2º Trimestre`]?.av1 || '', notas[`${al.id}-${atr.disciplina}-2º Trimestre`]?.av2 || '');
          const mt3 = calcularMedia(notas[`${al.id}-${atr.disciplina}-3º Trimestre`]?.av1 || '', notas[`${al.id}-${atr.disciplina}-3º Trimestre`]?.av2 || '');
          const validas = [mt1, mt2, mt3].filter(v => v !== '-').map(Number);
          if (validas.length > 0) {
            const mediaAl = validas.reduce((s, v) => s + v, 0) / validas.length;
            somaNotas += mediaAl;
            qtdNotas += 1;
            if (Math.round(mediaAl) >= limiar) aprovadosDisc += 1;
          }
        });
      });

      const mediaDesempenho = qtdNotas > 0 ? Number((somaNotas / qtdNotas).toFixed(2)) : 0;
      const taxaAprov = qtdNotas > 0 ? Math.round((aprovadosDisc / qtdNotas) * 100) : 0;
      return { ...pr, mediaDesempenho, taxaAprov, qtdAvaliacoes: qtdNotas };
    }).sort((a, b) => b.mediaDesempenho - a.mediaDesempenho);

    const melhorProfGeral = rankingsProfessores[0];

    const totalAprovadosGeral = rankingsAlunos.filter(a => a.aprovado).length;
    const totalReprovadosGeral = rankingsAlunos.length - totalAprovadosGeral;
    const taxaAprovacaoGeral = rankingsAlunos.length > 0 ? Math.round((totalAprovadosGeral / rankingsAlunos.length) * 100) : 0;

    const tFiltro = estatisticaTurmaId || turmas[0]?.id || '';
    const alunosSalaSel = rankingsAlunos.filter(a => a.turmaId === tFiltro);
    const melhorAlunoSala = alunosSalaSel[0];

    const profsSalaSel = professores.filter(pr => (pr.atribuicoes || []).some(a => a.turmaId === tFiltro)).map(pr => {
      const found = rankingsProfessores.find(rp => rp.id === pr.id);
      return found || { ...pr, mediaDesempenho: 0, taxaAprov: 0 };
    }).sort((a, b) => b.mediaDesempenho - a.mediaDesempenho);
    const melhorProfSala = profsSalaSel[0];

    const aprovSala = alunosSalaSel.filter(a => a.aprovado).length;
    const reprovSala = alunosSalaSel.length - aprovSala;

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-6">
          <div>
            <h2 className="text-xl font-black flex items-center gap-2"><BarChart3 className="text-indigo-600" /> Estatísticas Gerais & Quadro de Honra</h2>
            <p className="text-xs text-slate-500">Indicadores globais de aproveitamento, aprovações, reprovações e destaques académicos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
              <span className="text-[11px] font-black uppercase text-amber-700 flex items-center gap-1"><Award className="w-4 h-4" /> Melhor Aluno (Geral)</span>
              <p className="text-lg font-black text-slate-900 mt-1">{melhorAlunoGeral ? melhorAlunoGeral.nome : 'Sem dados'}</p>
              <p className="text-xs text-slate-600 mt-0.5">{melhorAlunoGeral ? `${melhorAlunoGeral.turmaNome} • Média: ${melhorAlunoGeral.mediaGeral}` : '-'}</p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200">
              <span className="text-[11px] font-black uppercase text-indigo-700 flex items-center gap-1"><Award className="w-4 h-4" /> Melhor Professor (Geral)</span>
              <p className="text-lg font-black text-slate-900 mt-1">{melhorProfGeral ? melhorProfGeral.nome : 'Sem dados'}</p>
              <p className="text-xs text-slate-600 mt-0.5">{melhorProfGeral ? `Média Turmas: ${melhorProfGeral.mediaDesempenho} • Aprov: ${melhorProfGeral.taxaAprov}%` : '-'}</p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-[11px] font-black uppercase text-emerald-700">Aprovações (Geral)</span>
              <p className="text-2xl font-black text-emerald-900 mt-1">{totalAprovadosGeral} <span className="text-xs font-bold">({taxaAprovacaoGeral}%)</span></p>
              <p className="text-xs text-emerald-700 mt-0.5">De {rankingsAlunos.length} aluno(s) ativo(s)</p>
            </div>

            <div className="p-5 rounded-2xl bg-red-50 border border-red-200">
              <span className="text-[11px] font-black uppercase text-red-700">Reprovações (Geral)</span>
              <p className="text-2xl font-black text-red-900 mt-1">{totalReprovadosGeral} <span className="text-xs font-bold">({rankingsAlunos.length > 0 ? 100 - taxaAprovacaoGeral : 0}%)</span></p>
              <p className="text-xs text-red-700 mt-0.5">Retidos por notas ou faltas</p>
            </div>
          </div>
        </div>

        {/* Estatísticas Específicas por Sala / Turma */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-lg font-black text-slate-900">Estatísticas Detalhadas por Sala / Turma</h3>
              <p className="text-xs text-slate-500">Selecione uma sala para consultar o melhor aluno, melhor professor e aproveitamento da turma.</p>
            </div>
            <select value={tFiltro} onChange={e => setEstatisticaTurmaId(e.target.value)} className="px-4 py-2 border rounded-xl text-xs font-black bg-slate-50">
              {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border">
              <p className="text-[11px] font-bold uppercase text-indigo-600">Melhor Aluno da Sala</p>
              <p className="text-base font-black text-slate-900 mt-1">{melhorAlunoSala ? melhorAlunoSala.nome : '-'}</p>
              <p className="text-xs text-slate-500">{melhorAlunoSala ? `Nº ${melhorAlunoSala.numero} • Média: ${melhorAlunoSala.mediaGeral}` : 'Sem alunos'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border">
              <p className="text-[11px] font-bold uppercase text-indigo-600">Melhor Professor da Sala</p>
              <p className="text-base font-black text-slate-900 mt-1">{melhorProfSala ? melhorProfSala.nome : '-'}</p>
              <p className="text-xs text-slate-500">{melhorProfSala ? `Média: ${melhorProfSala.mediaDesempenho}` : 'Sem docente atribuído'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <p className="text-[11px] font-bold uppercase text-emerald-700">Aprovados na Sala</p>
              <p className="text-xl font-black text-emerald-900 mt-1">{aprovSala}</p>
            </div>
            <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200">
              <p className="text-[11px] font-bold uppercase text-red-700">Reprovados na Sala</p>
              <p className="text-xl font-black text-red-900 mt-1">{reprovSala}</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 uppercase font-bold text-slate-700">
                  <th className="p-3 border-b">Turma</th>
                  <th className="p-3 border-b text-center">Alunos</th>
                  <th className="p-3 border-b text-center">Aprovados</th>
                  <th className="p-3 border-b text-center">Reprovados</th>
                  <th className="p-3 border-b">Melhor Aluno</th>
                  <th className="p-3 border-b">Melhor Professor</th>
                </tr>
              </thead>
              <tbody>
                {turmas.map(t => {
                  const als = rankingsAlunos.filter(a => a.turmaId === t.id);
                  const ap = als.filter(a => a.aprovado).length;
                  const rep = als.length - ap;
                  const topA = als[0];
                  const topP = professores
                    .filter(pr => (pr.atribuicoes || []).some(a => a.turmaId === t.id))
                    .map(pr => rankingsProfessores.find(rp => rp.id === pr.id))
                    .filter(Boolean)
                    .sort((a, b) => b.mediaDesempenho - a.mediaDesempenho)[0];
                  return (
                    <tr key={t.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-black text-slate-900">{t.nome}</td>
                      <td className="p-3 text-center font-bold">{als.length}</td>
                      <td className="p-3 text-center font-black text-emerald-700">{ap}</td>
                      <td className="p-3 text-center font-black text-red-600">{rep}</td>
                      <td className="p-3 font-semibold">{topA ? `${topA.nome} (${topA.mediaGeral})` : '-'}</td>
                      <td className="p-3 font-semibold">{topP ? `${topP.nome} (${topP.mediaDesempenho})` : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // --- MANUTENÇÃO TRIMESTRAL & ABERTURA DE NOVO ANO LETIVO ---
  const renderManutencao = () => {
    const tSel = turmaSelecionadaManut || turmas[0]?.id || '';

    const handleAbrirNovoAnoLetivo = () => {
      const novoAnoNum = (parseInt(anoLetivoAtual, 10) || 2026) + 1;
      const novoAnoStr = String(novoAnoNum);

      const novosFinalistas = [...arquivoFinalistas];
      const novasReconfirmacoes = [...reconfirmacoesPendentes];
      const turmasAtualizadas = [...turmas];
      const repetentesPorClasse = {};

      alunos.forEach(al => {
        const tAtual = turmasAtualizadas.find(t => t.id === al.turmaId);
        const cAtual = ciclos.find(c => c.id === tAtual?.cicloId);
        const classeAtual = extrairNumeroClasse(tAtual?.nome);
        const des = calcularDesempenhoAnualAluno(al);
        const novaIdade = (parseInt(al.idade, 10) || idadeIdealPorClasse(classeAtual)) + 1;

        const isFinalista = des.aprovado && (classeAtual === 12 || (cAtual?.tipo === 'primario' && classeAtual === 6 && !turmasAtualizadas.some(t => extrairNumeroClasse(t.nome) === 7)));

        if (isFinalista) {
          novosFinalistas.push({
            id: `fin_${Date.now()}_${al.id}`,
            anoConclusao: anoLetivoAtual,
            nome: al.nome,
            numero: al.numero,
            idade: al.idade,
            turmaConclusao: tAtual?.nome || '-',
            ciclo: cAtual?.nome || '-',
            mediaFinal: des.mediaGeral
          });
        } else if (des.aprovado) {
          const classeDestino = Math.min(12, classeAtual + 1);
          const sug = sugerirTurmaPorIdade(novaIdade, classeDestino);
          novasReconfirmacoes.push({
            id: `rec_${Date.now()}_${al.id}`,
            alunoId: al.id,
            nome: al.nome,
            senha: al.senha,
            novaIdade,
            classeAnterior: classeAtual,
            classeDestino,
            turmaSugeridaId: sug?.turma?.id || ''
          });
        } else {
          if (!repetentesPorClasse[classeAtual]) repetentesPorClasse[classeAtual] = [];
          repetentesPorClasse[classeAtual].push({ ...al, novaIdade });
        }
      });

      const alunosRepetentesAlocados = [];
      Object.entries(repetentesPorClasse).forEach(([clStr, listaRep]) => {
        const clNum = parseInt(clStr, 10);
        let turmaVelhos = turmasAtualizadas.find(t => extrairNumeroClasse(t.nome) === clNum && t.perfilIdade === 'mais_velhos');

        if (!turmaVelhos) {
          const cicloRef = clNum <= 6
            ? (ciclos.find(c => c.tipo === 'primario')?.id || ciclos[0]?.id || 'c1')
            : (ciclos.find(c => c.tipo === 'secundario')?.id || ciclos[0]?.id || 'c1');
          turmaVelhos = {
            id: `t_rep_${Date.now()}_${clNum}`,
            nome: `${clNum}ª Classe - Turma Especial (Idades Maiores)`,
            cicloId: cicloRef,
            vagas: Math.max(35, listaRep.length + 10),
            perfilIdade: 'mais_velhos'
          };
          turmasAtualizadas.push(turmaVelhos);
        }

        listaRep.forEach((rep, idx) => {
          alunosRepetentesAlocados.push({
            id: rep.id,
            nome: rep.nome,
            numero: String(idx + 1),
            idade: rep.novaIdade,
            turmaId: turmaVelhos.id,
            senha: rep.senha,
            status: 'aprovado'
          });
        });
      });

      setArquivoFinalistas(novosFinalistas);
      setReconfirmacoesPendentes(novasReconfirmacoes);
      setTurmas(turmasAtualizadas);
      setAlunos(alunosRepetentesAlocados);
      setNotas({});
      setFaltas({});
      setManutencaoTrimestral({});
      setAnoLetivoAtual(novoAnoStr);
      mostrarSucesso(`Ano Letivo ${novoAnoStr} aberto! Finalistas arquivados, aprovados em reconfirmação e repetentes reagrupados por idade.`);
    };

    return (
      <div className="space-y-6">
        {/* Abertura de Novo Ano Letivo */}
        {usuarioLogado.tipo === 'diretor' && (
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider bg-indigo-500/30 px-3 py-1 rounded-full text-indigo-200">Transição Inteligente de Ano Letivo</span>
              <h2 className="text-xl font-black mt-1">Abrir Novo Ano Letivo ({(parseInt(anoLetivoAtual, 10) || 2026) + 1})</h2>
              <p className="text-xs text-indigo-200 max-w-2xl">
                Arquiva os alunos finalistas para consultas futuras, envia os aprovados para a aba <b>Reconfirmar</b> na classe seguinte e agrupa os repetentes em turmas de idades maiores para libertar vagas aos mais novos.
              </p>
            </div>
            <button
              onClick={() => pedirConfirmacao(`Tem a certeza que deseja encerrar ${anoLetivoAtual} e abrir o Ano Letivo ${(parseInt(anoLetivoAtual, 10) || 2026) + 1}?`, handleAbrirNovoAnoLetivo)}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs shadow-lg shrink-0"
            >
              Abrir Novo Ano Letivo →
            </button>
          </div>
        )}

        {/* Bloqueio / Reabertura Trimestral */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <h3 className="text-lg font-black flex items-center gap-2"><Layers className="text-indigo-600" /> Bloqueio / Reabertura de Lançamento Trimestral</h3>
            <select value={tSel} onChange={e => setTurmaSelecionadaManut(e.target.value)} className="px-3 py-2 border rounded-xl text-xs font-bold bg-slate-50">
              {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['1º Trimestre', '2º Trimestre', '3º Trimestre'].map(trim => {
              const key = `${tSel}-${trim}`;
              const fechado = Boolean(manutencaoTrimestral[key]);
              return (
                <div key={trim} className="p-5 border rounded-2xl flex justify-between items-center bg-slate-50">
                  <div>
                    <h4 className="font-black text-slate-900">{trim}</h4>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${fechado ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'}`}>
                      {fechado ? 'Fechado / Bloqueado' : 'Aberto para Notas'}
                    </span>
                  </div>
                  {usuarioLogado.tipo === 'diretor' && (
                    <button
                      onClick={() => setManutencaoTrimestral({ ...manutencaoTrimestral, [key]: !fechado })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold ${fechado ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'}`}
                    >
                      {fechado ? 'Reabrir' : 'Fechar'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Arquivo Histórico de Finalistas */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><Archive className="w-5 h-5 text-indigo-600" /> Arquivo Histórico de Alunos Finalistas ({arquivoFinalistas.length})</h3>
          {arquivoFinalistas.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6 bg-slate-50 rounded-2xl">Nenhum aluno finalista arquivado ainda. Os finalistas são guardados aqui ao abrir um novo ano letivo.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 uppercase font-bold text-slate-700">
                    <th className="p-3 border-b">Ano Conclusão</th>
                    <th className="p-3 border-b">Nome Completo</th>
                    <th className="p-3 border-b">Turma</th>
                    <th className="p-3 border-b">Ciclo</th>
                    <th className="p-3 border-b text-center">Média Final</th>
                  </tr>
                </thead>
                <tbody>
                  {arquivoFinalistas.map(f => (
                    <tr key={f.id} className="border-b">
                      <td className="p-3 font-black text-indigo-700">{f.anoConclusao}</td>
                      <td className="p-3 font-bold text-slate-900">{f.nome}</td>
                      <td className="p-3">{f.turmaConclusao}</td>
                      <td className="p-3">{f.ciclo}</td>
                      <td className="p-3 text-center font-black text-emerald-700">{f.mediaFinal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (viewMode === 'registo_aluno') return renderRegistoAluno();
  if (viewMode === 'registo_professor') return renderRegistoProfessor();

  if (!usuarioLogado) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
        {renderDialog()}
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl max-w-md w-full space-y-6 border border-slate-100">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-600/30">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">SIGEP Angola</h1>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mt-1">Gestão Escolar • RAA 2026</p>
          </div>

          {loginErro && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 shrink-0" /> {loginErro}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail, Nº de Ordem ou Nome</label>
              <input type="text" value={loginEmailOuNumero} onChange={e => setLoginEmailOuNumero(e.target.value)} placeholder="admin, email ou nº de ordem" className="w-full px-4 py-3 border rounded-xl text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Palavra-passe</label>
              <input type="password" value={loginSenha} onChange={e => setLoginSenha(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 border rounded-xl text-sm" required />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all text-sm">Entrar no Sistema</button>
          </form>

          <div className="border-t pt-4 space-y-2 text-center">
            <button onClick={() => setViewMode('registo_aluno')} className="block w-full text-xs font-bold text-indigo-600 hover:underline">Sou Aluno: Fazer Registo →</button>
            <button onClick={() => setViewMode('registo_professor')} className="block w-full text-xs font-bold text-slate-600 hover:underline">Sou Professor: Fazer Registo →</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800 antialiased ${usuarioLogado.tipo === 'aluno' ? 'select-none print:hidden' : ''}`}
      onCopy={usuarioLogado.tipo === 'aluno' ? (e) => e.preventDefault() : undefined}
      onCut={usuarioLogado.tipo === 'aluno' ? (e) => e.preventDefault() : undefined}
      onContextMenu={usuarioLogado.tipo === 'aluno' ? (e) => e.preventDefault() : undefined}
      onDragStart={usuarioLogado.tipo === 'aluno' ? (e) => e.preventDefault() : undefined}
    >
      {renderDialog()}
      
      <aside className="w-full md:w-72 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white flex flex-col shrink-0 shadow-2xl z-20 border-r border-slate-800/80">
        <div className="p-6 border-b border-white/10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold shadow-lg shadow-indigo-500/30">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-black text-base tracking-tight">SIGEP RAA</h1>
              <span className="text-[9px] uppercase tracking-wider bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 px-1.5 py-0.5 rounded-md font-bold">PRO</span>
            </div>
            <p className="text-xs text-slate-400 font-medium truncate max-w-[160px] mt-0.5">{usuarioLogado.nome}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible">
          {usuarioLogado.tipo !== 'aluno' && (
            <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'dashboard' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <Sparkles className="w-4 h-4" /> Início / Boas-Vindas
            </button>
          )}

          {usuarioLogado.tipo === 'diretor' && (
            <>
              <button onClick={() => setActiveTab('escola')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'escola' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><GraduationCap className="w-4 h-4" /> Dados da Escola</button>
              <button onClick={() => setActiveTab('pedidos_prof')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all relative ${activeTab === 'pedidos_prof' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <UserCheck className="w-4 h-4" /> Aprovar Professores
                {pedidosProfessores.length > 0 && <span className="absolute right-3 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">{pedidosProfessores.length}</span>}
              </button>
              <button onClick={() => setActiveTab('seguranca')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'seguranca' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><Lock className="w-4 h-4" /> Segurança</button>
              <button onClick={() => setActiveTab('ciclos')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'ciclos' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><Layers className="w-4 h-4" /> Ciclos & Matriz</button>
              <button onClick={() => setActiveTab('turmas')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'turmas' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><LayoutDashboard className="w-4 h-4" /> Gestão de Turmas</button>
              <button onClick={() => setActiveTab('matricula')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all relative ${activeTab === 'matricula' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <UserPlus className="w-4 h-4" /> Matrículas & Reconfirmar
                {(pedidosAlunos.length + reconfirmacoesPendentes.length) > 0 && (
                  <span className="absolute right-3 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
                    {pedidosAlunos.length + reconfirmacoesPendentes.length}
                  </span>
                )}
              </button>
            </>
          )}

          {usuarioLogado.tipo === 'aluno' ? (
            <button onClick={() => setActiveTab('painel_aluno')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25`}><User className="w-4 h-4" /> Minhas Informações</button>
          ) : (
            <>
              <button onClick={() => setActiveTab('faltas')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'faltas' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><Users className="w-4 h-4" /> Faltas e Retenção</button>
              <button onClick={() => setActiveTab('pautas')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'pautas' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><ClipboardList className="w-4 h-4" /> Pautas & Avaliação</button>
              <button onClick={() => setActiveTab('boletins')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'boletins' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><FileText className="w-4 h-4" /> Boletins de Notas</button>
              <button onClick={() => setActiveTab('estatisticas')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'estatisticas' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><BarChart3 className="w-4 h-4" /> Estatísticas & Rankings</button>
              <button onClick={() => setActiveTab('manutencao')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'manutencao' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><Layers className="w-4 h-4" /> Manutenção & Novo Ano</button>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-slate-300 hover:text-white py-2.5 rounded-xl text-xs font-bold hover:bg-white/10 transition-colors"><LogOut className="w-4 h-4" /> Terminar Sessão</button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto relative w-full">
        {mensagemSucesso && (
          <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 z-50">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-xs font-bold">{mensagemSucesso}</span>
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          {usuarioLogado.tipo !== 'aluno' && usuarioLogado.tipo === 'diretor' && pedidosAlunos.length > 0 && activeTab !== 'matricula' && (
            <div
              onClick={() => setActiveTab('matricula')}
              className="mb-6 bg-orange-50 border border-orange-300 text-orange-950 px-5 py-3.5 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-orange-100/80 transition-all"
            >
              <div className="flex items-center gap-2.5 text-xs font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping"></span>
                <span>Alerta Pedagógico: Existem <b>{pedidosAlunos.length}</b> aluno(s) com registo <b>PENDENTE</b> aguardando aprovação para ficarem ativos.</span>
              </div>
              <span className="text-xs font-black text-orange-700 underline">Rever Pedidos →</span>
            </div>
          )}

          {usuarioLogado.tipo === 'aluno' ? (
            renderPainelAluno()
          ) : (
            <>
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'escola' && usuarioLogado.tipo === 'diretor' && renderEscola()}
              {activeTab === 'pedidos_prof' && usuarioLogado.tipo === 'diretor' && renderGestaoPedidosProfessores()}
              {activeTab === 'seguranca' && usuarioLogado.tipo === 'diretor' && renderSeguranca()}
              {activeTab === 'ciclos' && usuarioLogado.tipo === 'diretor' && renderCiclos()}
              {activeTab === 'turmas' && usuarioLogado.tipo === 'diretor' && renderTurmas()}
              {activeTab === 'matricula' && usuarioLogado.tipo === 'diretor' && renderMatricula()}
              
              {activeTab === 'faltas' && renderFaltas()}
              {activeTab === 'pautas' && renderMiniPautas()}
              {activeTab === 'boletins' && renderBoletins()}
              {activeTab === 'estatisticas' && renderEstatisticas()}
              {activeTab === 'manutencao' && renderManutencao()}
            </>
          )}
        </div>
      </main>
    </div>
  );
}