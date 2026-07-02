import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { criarSeed, MockDB } from '../data/mockSeed'
import {
  Quarto, ItemMobilia, ItemConsumo, MovimentoEstoque,
  Hospede, Usuario, Estadia, ConsumoRegistro
} from '../types'

const STORAGE_KEY = 'pousada-mock-db-v1'

function gerarId(prefixo: string) {
  return `${prefixo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function carregarInicial(): MockDB {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as MockDB
  } catch {
    // dados corrompidos: cai no seed
  }
  return criarSeed()
}

function periodosSobrepoem(inicioA: string, fimA: string, inicioB: string, fimB: string) {
  return inicioA < fimB && inicioB < fimA
}

interface DataContextType extends MockDB {
  addQuarto: (dados: Omit<Quarto, 'id' | 'createdAt'>) => Quarto
  updateQuarto: (id: string, dados: Partial<Quarto>) => void
  removeQuarto: (id: string) => void

  addItemMobilia: (dados: Omit<ItemMobilia, 'id' | 'createdAt'>) => ItemMobilia
  updateItemMobilia: (id: string, dados: Partial<ItemMobilia>) => void
  removeItemMobilia: (id: string) => void

  addItemConsumo: (dados: Omit<ItemConsumo, 'id' | 'createdAt'>) => ItemConsumo
  updateItemConsumo: (id: string, dados: Partial<ItemConsumo>) => void
  removeItemConsumo: (id: string) => void

  addHospede: (dados: Omit<Hospede, 'id' | 'createdAt'>) => Hospede
  updateHospede: (id: string, dados: Partial<Hospede>) => void
  removeHospede: (id: string) => void

  addUsuario: (dados: Omit<Usuario, 'id'>) => Usuario
  updateUsuario: (id: string, dados: Partial<Usuario>) => void
  removeUsuario: (id: string) => void
  getUsuarioPorEmail: (email: string) => Usuario | undefined

  addEstadia: (dados: Omit<Estadia, 'id' | 'createdAt'>) => Estadia
  updateEstadia: (id: string, dados: Partial<Estadia>) => void
  finalizarEstadia: (id: string) => void

  registrarConsumo: (estadiaId: string, quartoId: string, itemConsumoId: string, quantidade: number, precoUnitario: number) => void
  registrarEntradaEstoque: (itemConsumoId: string, quantidade: number, motivo?: string) => void

  setMetaMes: (mes: string, valorMeta: number) => void
  getMetaMes: (mes: string) => number

  getEstadiaAtivaPorQuarto: (quartoId: string) => Estadia | undefined
  getEstadiasPorHospede: (hospedeId: string) => Estadia[]
  getQuartosDisponiveisNoPeriodo: (dataInicio: string, dataFim: string, excluirEstadiaId?: string) => Quarto[]
  getConsumoDaEstadia: (estadiaId: string) => ConsumoRegistro[]
  getTotalConsumoEstadia: (estadiaId: string) => number
  getReceitaMes: (anoMes: string) => number
  getMovimentacoesRecentes: (limite?: number) => MovimentoEstoque[]

  resetDadosExemplo: () => void
}

const DataContext = createContext<DataContextType | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<MockDB>(carregarInicial)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  }, [db])

  // ─── Quartos ────────────────────────────────────────────────
  const addQuarto = useCallback((dados: Omit<Quarto, 'id' | 'createdAt'>) => {
    const novo: Quarto = { ...dados, id: gerarId('q'), createdAt: Date.now() }
    setDb(prev => ({ ...prev, quartos: [...prev.quartos, novo] }))
    return novo
  }, [])

  const updateQuarto = useCallback((id: string, dados: Partial<Quarto>) => {
    setDb(prev => ({ ...prev, quartos: prev.quartos.map(q => q.id === id ? { ...q, ...dados } : q) }))
  }, [])

  const removeQuarto = useCallback((id: string) => {
    setDb(prev => ({ ...prev, quartos: prev.quartos.filter(q => q.id !== id) }))
  }, [])

  // ─── Itens de mobília ───────────────────────────────────────
  const addItemMobilia = useCallback((dados: Omit<ItemMobilia, 'id' | 'createdAt'>) => {
    const novo: ItemMobilia = { ...dados, id: gerarId('im'), createdAt: Date.now() }
    setDb(prev => ({ ...prev, itensMobilia: [...prev.itensMobilia, novo] }))
    return novo
  }, [])

  const updateItemMobilia = useCallback((id: string, dados: Partial<ItemMobilia>) => {
    setDb(prev => ({ ...prev, itensMobilia: prev.itensMobilia.map(i => i.id === id ? { ...i, ...dados } : i) }))
  }, [])

  const removeItemMobilia = useCallback((id: string) => {
    setDb(prev => ({ ...prev, itensMobilia: prev.itensMobilia.filter(i => i.id !== id) }))
  }, [])

  // ─── Itens de consumo ───────────────────────────────────────
  const addItemConsumo = useCallback((dados: Omit<ItemConsumo, 'id' | 'createdAt'>) => {
    const novo: ItemConsumo = { ...dados, id: gerarId('ic'), createdAt: Date.now() }
    setDb(prev => ({ ...prev, itensConsumo: [...prev.itensConsumo, novo] }))
    return novo
  }, [])

  const updateItemConsumo = useCallback((id: string, dados: Partial<ItemConsumo>) => {
    setDb(prev => ({ ...prev, itensConsumo: prev.itensConsumo.map(i => i.id === id ? { ...i, ...dados } : i) }))
  }, [])

  const removeItemConsumo = useCallback((id: string) => {
    setDb(prev => ({ ...prev, itensConsumo: prev.itensConsumo.filter(i => i.id !== id) }))
  }, [])

  // ─── Hóspedes ───────────────────────────────────────────────
  const addHospede = useCallback((dados: Omit<Hospede, 'id' | 'createdAt'>) => {
    const novo: Hospede = { ...dados, id: gerarId('h'), createdAt: Date.now() }
    setDb(prev => ({ ...prev, hospedes: [...prev.hospedes, novo] }))
    return novo
  }, [])

  const updateHospede = useCallback((id: string, dados: Partial<Hospede>) => {
    setDb(prev => ({ ...prev, hospedes: prev.hospedes.map(h => h.id === id ? { ...h, ...dados } : h) }))
  }, [])

  const removeHospede = useCallback((id: string) => {
    setDb(prev => ({ ...prev, hospedes: prev.hospedes.filter(h => h.id !== id) }))
  }, [])

  // ─── Usuários / colaboradores ─────────────────────────────
  const addUsuario = useCallback((dados: Omit<Usuario, 'id'>) => {
    const novo: Usuario = { ...dados, id: gerarId('u') }
    setDb(prev => ({ ...prev, usuarios: [...prev.usuarios, novo] }))
    return novo
  }, [])

  const updateUsuario = useCallback((id: string, dados: Partial<Usuario>) => {
    setDb(prev => ({ ...prev, usuarios: prev.usuarios.map(u => u.id === id ? { ...u, ...dados } : u) }))
  }, [])

  const removeUsuario = useCallback((id: string) => {
    setDb(prev => ({ ...prev, usuarios: prev.usuarios.filter(u => u.id !== id) }))
  }, [])

  const getUsuarioPorEmail = useCallback((email: string) => {
    return db.usuarios.find(u => u.email.toLowerCase() === email.toLowerCase())
  }, [db.usuarios])

  // ─── Estadias (Entrada) ───────────────────────────────────
  const addEstadia = useCallback((dados: Omit<Estadia, 'id' | 'createdAt'>) => {
    const nova: Estadia = { ...dados, id: gerarId('e'), createdAt: Date.now() }
    setDb(prev => ({
      ...prev,
      estadias: [...prev.estadias, nova],
      quartos: nova.status === 'ativa'
        ? prev.quartos.map(q => q.id === nova.quartoId ? { ...q, status: 'ocupado' } : q)
        : prev.quartos
    }))
    return nova
  }, [])

  const updateEstadia = useCallback((id: string, dados: Partial<Estadia>) => {
    setDb(prev => ({ ...prev, estadias: prev.estadias.map(e => e.id === id ? { ...e, ...dados } : e) }))
  }, [])

  const finalizarEstadia = useCallback((id: string) => {
    setDb(prev => {
      const estadia = prev.estadias.find(e => e.id === id)
      if (!estadia) return prev
      return {
        ...prev,
        estadias: prev.estadias.map(e => e.id === id ? { ...e, status: 'finalizada' } : e),
        quartos: prev.quartos.map(q => q.id === estadia.quartoId ? { ...q, status: 'limpeza' } : q)
      }
    })
  }, [])

  // ─── Consumo transacional / estoque ───────────────────────
  const registrarConsumo = useCallback((estadiaId: string, quartoId: string, itemConsumoId: string, quantidade: number, precoUnitario: number) => {
    setDb(prev => {
      const item = prev.itensConsumo.find(i => i.id === itemConsumoId)
      if (!item || quantidade <= 0) return prev
      const registro: ConsumoRegistro = {
        id: gerarId('cr'), estadiaId, quartoId, itemConsumoId, quantidade, precoUnitario,
        precoTotal: quantidade * precoUnitario, data: Date.now(), createdAt: Date.now()
      }
      const movimento: MovimentoEstoque = {
        id: gerarId('me'), itemConsumoId, tipo: 'saida', quantidade,
        motivo: 'Consumo', data: Date.now(), createdAt: Date.now()
      }
      return {
        ...prev,
        consumoRegistros: [...prev.consumoRegistros, registro],
        movimentosEstoque: [...prev.movimentosEstoque, movimento],
        itensConsumo: prev.itensConsumo.map(i => i.id === itemConsumoId
          ? { ...i, qtdAtual: Math.max(0, i.qtdAtual - quantidade) }
          : i)
      }
    })
  }, [])

  const registrarEntradaEstoque = useCallback((itemConsumoId: string, quantidade: number, motivo = 'Reposição de estoque') => {
    setDb(prev => ({
      ...prev,
      itensConsumo: prev.itensConsumo.map(i => i.id === itemConsumoId ? { ...i, qtdAtual: i.qtdAtual + quantidade } : i),
      movimentosEstoque: [...prev.movimentosEstoque, {
        id: gerarId('me'), itemConsumoId, tipo: 'entrada', quantidade, motivo, data: Date.now(), createdAt: Date.now()
      }]
    }))
  }, [])

  // ─── Metas ─────────────────────────────────────────────────
  const setMetaMes = useCallback((mes: string, valorMeta: number) => {
    setDb(prev => {
      const existe = prev.metas.some(m => m.mes === mes)
      return {
        ...prev,
        metas: existe
          ? prev.metas.map(m => m.mes === mes ? { ...m, valorMeta } : m)
          : [...prev.metas, { mes, valorMeta }]
      }
    })
  }, [])

  const getMetaMes = useCallback((mes: string) => {
    return db.metas.find(m => m.mes === mes)?.valorMeta ?? 0
  }, [db.metas])

  // ─── Seletores derivados ───────────────────────────────────
  const getEstadiaAtivaPorQuarto = useCallback((quartoId: string) => {
    return db.estadias.find(e => e.quartoId === quartoId && e.status === 'ativa')
  }, [db.estadias])

  const getEstadiasPorHospede = useCallback((hospedeId: string) => {
    return db.estadias.filter(e => e.hospedeId === hospedeId).sort((a, b) => b.createdAt - a.createdAt)
  }, [db.estadias])

  const getQuartosDisponiveisNoPeriodo = useCallback((dataInicio: string, dataFim: string, excluirEstadiaId?: string) => {
    if (!dataInicio || !dataFim || dataInicio >= dataFim) return []
    return db.quartos.filter(q => {
      if (q.status === 'desativado') return false
      const temConflito = db.estadias.some(e =>
        e.quartoId === q.id &&
        e.status === 'ativa' &&
        e.id !== excluirEstadiaId &&
        periodosSobrepoem(dataInicio, dataFim, e.dataEntrada, e.dataSaida)
      )
      return !temConflito
    })
  }, [db.quartos, db.estadias])

  const getConsumoDaEstadia = useCallback((estadiaId: string) => {
    return db.consumoRegistros.filter(c => c.estadiaId === estadiaId).sort((a, b) => b.data - a.data)
  }, [db.consumoRegistros])

  const getTotalConsumoEstadia = useCallback((estadiaId: string) => {
    return db.consumoRegistros.filter(c => c.estadiaId === estadiaId).reduce((acc, c) => acc + c.precoTotal, 0)
  }, [db.consumoRegistros])

  const getReceitaMes = useCallback((anoMes: string) => {
    const receitaEstadias = db.estadias
      .filter(e => e.dataEntrada.startsWith(anoMes))
      .reduce((acc, e) => acc + (e.valorPago || 0), 0)
    const receitaConsumo = db.consumoRegistros
      .filter(c => {
        const d = new Date(c.data)
        const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        return chave === anoMes
      })
      .reduce((acc, c) => acc + c.precoTotal, 0)
    return receitaEstadias + receitaConsumo
  }, [db.estadias, db.consumoRegistros])

  const getMovimentacoesRecentes = useCallback((limite = 10) => {
    return [...db.movimentosEstoque].sort((a, b) => b.data - a.data).slice(0, limite)
  }, [db.movimentosEstoque])

  const resetDadosExemplo = useCallback(() => {
    setDb(criarSeed())
  }, [])

  return (
    <DataContext.Provider value={{
      ...db,
      addQuarto, updateQuarto, removeQuarto,
      addItemMobilia, updateItemMobilia, removeItemMobilia,
      addItemConsumo, updateItemConsumo, removeItemConsumo,
      addHospede, updateHospede, removeHospede,
      addUsuario, updateUsuario, removeUsuario, getUsuarioPorEmail,
      addEstadia, updateEstadia, finalizarEstadia,
      registrarConsumo, registrarEntradaEstoque,
      setMetaMes, getMetaMes,
      getEstadiaAtivaPorQuarto, getEstadiasPorHospede, getQuartosDisponiveisNoPeriodo,
      getConsumoDaEstadia, getTotalConsumoEstadia, getReceitaMes, getMovimentacoesRecentes,
      resetDadosExemplo
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData deve ser usado dentro de DataProvider')
  return ctx
}
