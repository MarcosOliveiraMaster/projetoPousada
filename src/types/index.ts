// ─── Áreas / Permissões ─────────────────────────────────────────
export type AreaKey =
  | 'dashboard'
  | 'quartos'
  | 'hospedes'
  | 'itens'
  | 'consumo'
  | 'entrada'
  | 'colaboradores'
  | 'mapaHospedes'

// ─── User / Auth ────────────────────────────────────────────────
export interface Usuario {
  id: string
  nome: string
  cpf: string
  contato: string
  email: string
  admin: boolean            // administradores têm acesso total e gerenciam colaboradores
  areas: AreaKey[]          // áreas às quais o colaborador tem acesso (ignorado se admin=true)
  loginUsername: string
}

// ─── Quartos ────────────────────────────────────────────────────
export type StatusQuarto = 'disponivel' | 'ocupado' | 'limpeza' | 'desativado'

export interface PosicaoItem {
  itemId: string
  x: number
  y: number
  rotacao?: number   // 0, 90, 180, 270
}

export interface Quarto {
  id: string
  nome: string
  status: StatusQuarto
  descricao?: string
  fotos?: string[]              // data URLs (base64)
  itensMobilia: string[]       // IDs dos itens de mobília
  itensConsumo: string[]       // IDs dos itens de consumo
  posicoes: Record<string, PosicaoItem>
  createdAt: number
}

// ─── Itens de Mobília ────────────────────────────────────────────
// Livre (não é mais uma union fechada) para permitir criar tipos novos
// pela biblioteca de ícones em Itens; `icone` guarda a chave do ícone.
export type TipoItem = string

export interface ItemMobilia {
  id: string
  nome: string
  tipo: TipoItem
  icone: string
  quartoId?: string
  createdAt: number
}

// ─── Itens de Consumo ────────────────────────────────────────────
export interface ItemConsumo {
  id: string
  nome: string
  qtdAtual: number
  preco: number
  icone: string
  quartoId?: string
  createdAt: number
}

export interface MovimentoEstoque {
  id: string
  itemConsumoId: string
  tipo: 'entrada' | 'saida'
  quantidade: number
  motivo?: string
  consumoRegistroId?: string   // liga ao ConsumoRegistro que originou a saída
  data: number
  createdAt: number
}

// ─── Hóspedes ───────────────────────────────────────────────────
export interface Hospede {
  id: string
  nome: string
  cpf: string
  email: string
  contato: string
  nacionalidade: string
  cidade: string
  estado: string
  pais: string
  preferencias: string[]    // tags: ex. "Vista para o mar", "Pet friendly"...
  observacoes: string       // alergias, observações gerais
  createdAt: number
}

// ─── Estadias (área "Entrada") ───────────────────────────────────
export type StatusPagamento = 'pendente' | 'parcial' | 'pago'
export type StatusEstadia = 'ativa' | 'finalizada'
export type FormaPagamento = 'dinheiro' | 'pix' | 'cartao' | 'transferencia'

export interface Estadia {
  id: string
  hospedeId: string
  quartoId: string
  dataEntrada: string       // yyyy-mm-dd
  dataSaida: string         // yyyy-mm-dd
  valorDiaria: number
  valorTotal: number
  valorPago: number
  formaPagamento: FormaPagamento
  statusPagamento: StatusPagamento
  status: StatusEstadia
  comprovantes: string[]    // data URLs (base64), máx. 5
  observacoes: string
  createdAt: number
}

export interface ConsumoRegistro {
  id: string
  estadiaId: string
  quartoId: string
  itemConsumoId: string
  quantidade: number
  precoUnitario: number
  precoTotal: number
  pago?: boolean
  data: number
  createdAt: number
}

// ─── Metas financeiras ────────────────────────────────────────────
export interface MetaFinanceira {
  mes: string          // '2026-07'
  valorMeta: number
}

// ─── Dashboard ──────────────────────────────────────────────────
export interface DashboardStats {
  totalHospedes: number
  totalPagamentos: number
  proximosPagamentos: number
  totalItens: number
}
