export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0)
}

export function formatarData(data: string | number): string {
  const d = typeof data === 'number' ? new Date(data) : new Date(`${data}T00:00:00`)
  return d.toLocaleDateString('pt-BR')
}

export function mesAtualChave(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function calcularStatusPagamento(valorPago: number, valorTotal: number): 'pendente' | 'parcial' | 'pago' {
  if (valorPago <= 0) return 'pendente'
  if (valorPago >= valorTotal) return 'pago'
  return 'parcial'
}

export function calcularNoites(dataEntrada: string, dataSaida: string): number {
  if (!dataEntrada || !dataSaida) return 0
  const ms = new Date(`${dataSaida}T00:00:00`).getTime() - new Date(`${dataEntrada}T00:00:00`).getTime()
  return Math.max(0, Math.round(ms / 86400000))
}
