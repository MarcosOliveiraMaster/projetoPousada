import {
  Quarto, ItemMobilia, ItemConsumo, MovimentoEstoque,
  Hospede, Usuario, Estadia, ConsumoRegistro, MetaFinanceira, AreaKey
} from '../types'

const TODAS_AREAS: AreaKey[] = ['dashboard', 'quartos', 'hospedes', 'itens', 'consumo', 'entrada', 'colaboradores']

function dataOffset(dias: number): string {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  return d.toISOString().split('T')[0]
}

function mesAtual(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export interface MockDB {
  quartos: Quarto[]
  itensMobilia: ItemMobilia[]
  itensConsumo: ItemConsumo[]
  movimentosEstoque: MovimentoEstoque[]
  hospedes: Hospede[]
  usuarios: Usuario[]
  estadias: Estadia[]
  consumoRegistros: ConsumoRegistro[]
  metas: MetaFinanceira[]
}

export function criarSeed(): MockDB {
  const agora = Date.now()

  const itensMobilia: ItemMobilia[] = [
    { id: 'im-1', nome: 'Cama de casal',        tipo: 'cama',                    icone: 'cama',                    quartoId: 'q-1', createdAt: agora },
    { id: 'im-2', nome: 'Guarda-roupa',          tipo: 'guarda-roupa',            icone: 'guarda-roupa',            quartoId: 'q-1', createdAt: agora },
    { id: 'im-3', nome: 'TV 42"',                tipo: 'televisao',               icone: 'televisao',               quartoId: 'q-1', createdAt: agora },
    { id: 'im-4', nome: 'Frigobar',              tipo: 'frigobar',                icone: 'frigobar',                quartoId: 'q-1', createdAt: agora },
    { id: 'im-5', nome: 'Ar-condicionado',       tipo: 'ar-condicionado',         icone: 'ar-condicionado',         quartoId: 'q-1', createdAt: agora },
    { id: 'im-6', nome: 'Micro-ondas',           tipo: 'microondas',              icone: 'microondas',              quartoId: 'q-1', createdAt: agora },
    { id: 'im-7', nome: 'Banheiro c/ água quente', tipo: 'banheiro-agua-quente',  icone: 'banheiro-agua-quente',    quartoId: 'q-1', createdAt: agora },

    { id: 'im-8',  nome: 'Cama de casal',        tipo: 'cama',                   icone: 'cama',                    quartoId: 'q-2', createdAt: agora },
    { id: 'im-9',  nome: 'Guarda-roupa',         tipo: 'guarda-roupa',           icone: 'guarda-roupa',            quartoId: 'q-2', createdAt: agora },
    { id: 'im-10', nome: 'TV 32"',               tipo: 'televisao',              icone: 'televisao',               quartoId: 'q-2', createdAt: agora },
    { id: 'im-11', nome: 'Frigobar',             tipo: 'frigobar',                icone: 'frigobar',                quartoId: 'q-2', createdAt: agora },
    { id: 'im-12', nome: 'Ventilador de teto',   tipo: 'ventilador-teto',         icone: 'ventilador-teto',         quartoId: 'q-2', createdAt: agora },
    { id: 'im-13', nome: 'Banheiro c/ água quente', tipo: 'banheiro-agua-quente', icone: 'banheiro-agua-quente',    quartoId: 'q-2', createdAt: agora },

    { id: 'im-14', nome: 'Cama de solteiro (2x)', tipo: 'cama',                  icone: 'cama',                    quartoId: 'q-3', createdAt: agora },
    { id: 'im-15', nome: 'Guarda-roupa',          tipo: 'guarda-roupa',          icone: 'guarda-roupa',            quartoId: 'q-3', createdAt: agora },
    { id: 'im-16', nome: 'Ventilador de teto',    tipo: 'ventilador-teto',       icone: 'ventilador-teto',         quartoId: 'q-3', createdAt: agora },
    { id: 'im-17', nome: 'Banheiro s/ água quente', tipo: 'banheiro-sem-agua-quente', icone: 'banheiro-sem-agua-quente', quartoId: 'q-3', createdAt: agora },

    { id: 'im-18', nome: 'Cama de casal',        tipo: 'cama',                   icone: 'cama',                    quartoId: 'q-4', createdAt: agora },
    { id: 'im-19', nome: 'Guarda-roupa',         tipo: 'guarda-roupa',           icone: 'guarda-roupa',            quartoId: 'q-4', createdAt: agora },
    { id: 'im-20', nome: 'Ar-condicionado',      tipo: 'ar-condicionado',        icone: 'ar-condicionado',         quartoId: 'q-4', createdAt: agora },
    { id: 'im-21', nome: 'Banheiro c/ água quente', tipo: 'banheiro-agua-quente', icone: 'banheiro-agua-quente',   quartoId: 'q-4', createdAt: agora },
  ]

  const posicoesQuarto = (ids: string[]): Quarto['posicoes'] => {
    const posicoes: Quarto['posicoes'] = {}
    ids.forEach((id, i) => {
      posicoes[id] = { itemId: id, x: 20 + (i % 3) * 90, y: 20 + Math.floor(i / 3) * 90, rotacao: 0 }
    })
    return posicoes
  }

  const q1Itens = ['im-1', 'im-2', 'im-3', 'im-4', 'im-5', 'im-6', 'im-7']
  const q2Itens = ['im-8', 'im-9', 'im-10', 'im-11', 'im-12', 'im-13']
  const q3Itens = ['im-14', 'im-15', 'im-16', 'im-17']
  const q4Itens = ['im-18', 'im-19', 'im-20', 'im-21']

  const quartos: Quarto[] = [
    { id: 'q-1', nome: 'Suíte Coqueiro',        status: 'ocupado',    itensMobilia: q1Itens, itensConsumo: ['ic-1', 'ic-2'], posicoes: posicoesQuarto(q1Itens), createdAt: agora },
    { id: 'q-2', nome: 'Suíte Jasmim',          status: 'disponivel', itensMobilia: q2Itens, itensConsumo: ['ic-1', 'ic-3'], posicoes: posicoesQuarto(q2Itens), createdAt: agora },
    { id: 'q-3', nome: 'Standard Vista Mar',    status: 'limpeza',    itensMobilia: q3Itens, itensConsumo: [],               posicoes: posicoesQuarto(q3Itens), createdAt: agora },
    { id: 'q-4', nome: 'Standard Jardim',       status: 'disponivel', itensMobilia: q4Itens, itensConsumo: [],               posicoes: posicoesQuarto(q4Itens), createdAt: agora },
    { id: 'q-5', nome: 'Chalé Lua de Mel',      status: 'desativado', itensMobilia: [],       itensConsumo: [],               posicoes: {},                       createdAt: agora },
  ]

  const itensConsumo: ItemConsumo[] = [
    { id: 'ic-1', nome: 'Água mineral',      qtdAtual: 38, preco: 5,  icone: 'water',    quartoId: undefined, createdAt: agora },
    { id: 'ic-2', nome: 'Cerveja artesanal', qtdAtual: 21, preco: 12, icone: 'wine',     quartoId: undefined, createdAt: agora },
    { id: 'ic-3', nome: 'Refrigerante lata', qtdAtual: 30, preco: 6,  icone: 'basket',   quartoId: undefined, createdAt: agora },
    { id: 'ic-4', nome: 'Salgadinho',        qtdAtual: 20, preco: 8,  icone: 'sandwich', quartoId: undefined, createdAt: agora },
    { id: 'ic-5', nome: 'Chocolate',         qtdAtual: 15, preco: 9,  icone: 'cookie',   quartoId: undefined, createdAt: agora },
  ]

  const movimentosEstoque: MovimentoEstoque[] = [
    { id: 'me-1', itemConsumoId: 'ic-1', tipo: 'entrada', quantidade: 40, motivo: 'Reposição inicial', data: agora - 6 * 86400000, createdAt: agora },
    { id: 'me-2', itemConsumoId: 'ic-2', tipo: 'entrada', quantidade: 24, motivo: 'Reposição inicial', data: agora - 6 * 86400000, createdAt: agora },
    { id: 'me-3', itemConsumoId: 'ic-3', tipo: 'entrada', quantidade: 30, motivo: 'Reposição inicial', data: agora - 6 * 86400000, createdAt: agora },
    { id: 'me-4', itemConsumoId: 'ic-4', tipo: 'entrada', quantidade: 20, motivo: 'Reposição inicial', data: agora - 6 * 86400000, createdAt: agora },
    { id: 'me-5', itemConsumoId: 'ic-5', tipo: 'entrada', quantidade: 15, motivo: 'Reposição inicial', data: agora - 6 * 86400000, createdAt: agora },
    { id: 'me-6', itemConsumoId: 'ic-1', tipo: 'saida',   quantidade: 2,  motivo: 'Consumo',           data: agora - 1 * 86400000, createdAt: agora },
    { id: 'me-7', itemConsumoId: 'ic-2', tipo: 'saida',   quantidade: 3,  motivo: 'Consumo',           data: agora - 1 * 86400000, createdAt: agora },
  ]

  const hospedes: Hospede[] = [
    {
      id: 'h-1', nome: 'Ana Beatriz Ferreira', cpf: '123.456.789-00', email: 'ana.ferreira@email.com',
      contato: '(82) 99911-2233', nacionalidade: 'Brasileira', cidade: 'São Paulo', estado: 'SP', pais: 'Brasil',
      preferencias: ['Vista para o mar', 'Não fumante'], observacoes: 'Prefere check-in após 15h.', createdAt: agora
    },
    {
      id: 'h-2', nome: 'John Miller', cpf: '', email: 'john.miller@email.com',
      contato: '+1 305 555-0199', nacionalidade: 'Americana', cidade: 'Miami', estado: 'FL', pais: 'Estados Unidos',
      preferencias: ['Cama extra', 'Pet friendly'], observacoes: 'Viaja com um cachorro de pequeno porte.', createdAt: agora
    },
    {
      id: 'h-3', nome: 'Marta Oliveira', cpf: '987.654.321-00', email: 'marta.oliveira@email.com',
      contato: '(82) 98877-6655', nacionalidade: 'Brasileira', cidade: 'Maceió', estado: 'AL', pais: 'Brasil',
      preferencias: ['Andar térreo', 'Silencioso'], observacoes: '', createdAt: agora
    },
    {
      id: 'h-4', nome: 'Lucas Prado', cpf: '456.789.123-00', email: 'lucas.prado@email.com',
      contato: '(81) 97766-5544', nacionalidade: 'Brasileira', cidade: 'Recife', estado: 'PE', pais: 'Brasil',
      preferencias: ['Vegetariano'], observacoes: '', createdAt: agora
    },
  ]

  const usuarios: Usuario[] = [
    {
      id: 'u-admin', nome: 'Administrador', cpf: '', contato: '',
      email: 'adm@pousadasertanejo.com', admin: true, areas: TODAS_AREAS, loginUsername: 'adm@pousadasertanejo.com'
    },
    {
      id: 'u-2', nome: 'Fernanda Souza', cpf: '111.222.333-44', contato: '(82) 99123-4567',
      email: 'fernanda@pousadasertanejo.com', admin: false, areas: ['dashboard', 'quartos', 'hospedes', 'entrada'],
      loginUsername: 'fernanda@pousadasertanejo.com'
    },
    {
      id: 'u-3', nome: 'Carlos Lima', cpf: '222.333.444-55', contato: '(82) 99876-5432',
      email: 'carlos@pousadasertanejo.com', admin: false, areas: ['itens', 'consumo'],
      loginUsername: 'carlos@pousadasertanejo.com'
    },
  ]

  const estadias: Estadia[] = [
    {
      id: 'e-1', hospedeId: 'h-1', quartoId: 'q-1',
      dataEntrada: dataOffset(0), dataSaida: dataOffset(5),
      valorDiaria: 250, valorTotal: 1250, valorPago: 600, formaPagamento: 'pix',
      statusPagamento: 'parcial', status: 'ativa', comprovantes: [],
      observacoes: 'Aniversário de casamento.', createdAt: agora
    },
    {
      id: 'e-2', hospedeId: 'h-2', quartoId: 'q-2',
      dataEntrada: dataOffset(-20), dataSaida: dataOffset(-17),
      valorDiaria: 300, valorTotal: 900, valorPago: 900, formaPagamento: 'cartao',
      statusPagamento: 'pago', status: 'finalizada', comprovantes: [],
      observacoes: '', createdAt: agora
    },
    {
      id: 'e-3', hospedeId: 'h-3', quartoId: 'q-3',
      dataEntrada: dataOffset(-10), dataSaida: dataOffset(-8),
      valorDiaria: 200, valorTotal: 400, valorPago: 400, formaPagamento: 'dinheiro',
      statusPagamento: 'pago', status: 'finalizada', comprovantes: [],
      observacoes: '', createdAt: agora
    },
  ]

  const consumoRegistros: ConsumoRegistro[] = [
    { id: 'cr-1', estadiaId: 'e-1', quartoId: 'q-1', itemConsumoId: 'ic-1', quantidade: 2, precoUnitario: 5, precoTotal: 10, data: agora - 1 * 86400000, createdAt: agora },
    { id: 'cr-2', estadiaId: 'e-1', quartoId: 'q-1', itemConsumoId: 'ic-2', quantidade: 3, precoUnitario: 12, precoTotal: 36, data: agora - 1 * 86400000, createdAt: agora },
  ]

  const metas: MetaFinanceira[] = [
    { mes: mesAtual(), valorMeta: 15000 }
  ]

  return { quartos, itensMobilia, itensConsumo, movimentosEstoque, hospedes, usuarios, estadias, consumoRegistros, metas }
}
