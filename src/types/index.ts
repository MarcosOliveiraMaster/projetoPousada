// ─── User / Auth ────────────────────────────────────────────────
export type UserNivel = 'master' | 'adm' | 'simples'

export interface Usuario {
  id: string
  nome: string
  cpf: string
  contato: string
  email: string
  nivel: UserNivel
  loginUsername: string
}

// ─── Quartos ────────────────────────────────────────────────────
export type StatusQuarto = 'disponivel' | 'ocupado' | 'limpeza' | 'desativado'

export interface PosicaoItem {
  itemId: string
  x: number
  y: number
}

export interface Quarto {
  id: string
  nome: string
  status: StatusQuarto
  itensMobilia: string[]       // IDs dos itens de mobília
  itensConsumo: string[]       // IDs dos itens de consumo
  posicoes: Record<string, PosicaoItem>
  hospedeId?: string
  createdAt: number
}

// ─── Itens de Mobília ────────────────────────────────────────────
export type TipoItem = 'cama' | 'guarda-roupa' | 'televisao' | 'frigobar' | 'ar-condicionado'

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
  icone: string
  quartoId?: string
  createdAt: number
}

// ─── Hóspedes ───────────────────────────────────────────────────
export type StatusHospede = 'ativo' | 'inativo'

export interface Hospede {
  id: string
  nome: string
  cpf: string
  email: string
  uid: string
  contato: string
  detalhes: string
  checkin: string
  checkout: string
  status: StatusHospede
  alocacao?: string            // quartoId
  createdAt: number
}

// ─── Pagamentos ─────────────────────────────────────────────────
export interface Pagamento {
  id: string
  hospedeId: string
  hospedeNome: string
  valor: number
  data: string
  descricao: string
  createdAt: number
}

// ─── Dashboard ──────────────────────────────────────────────────
export interface DashboardStats {
  totalHospedes: number
  totalPagamentos: number
  proximosPagamentos: number
  totalItens: number
}
