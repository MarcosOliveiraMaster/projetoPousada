import {
  BedDouble, Sofa, Tv, Refrigerator, AirVent, Microwave, Fan, ShowerHead, Bath,
  Armchair, Table2, Blinds, Wifi, Lock, Speaker, Lamp, Wind, Baby, Umbrella,
  Monitor, Snowflake, Car, Package, LucideIcon
} from 'lucide-react'
import { createElement, ReactNode } from 'react'

export interface ItemBiblioteca {
  value: string
  label: string
  icon: LucideIcon
}

// Os 9 primeiros mantêm as mesmas `value` já usadas nos itens semeados,
// para que o mapeamento de ícone continue funcionando sem migração de dados.
export const BIBLIOTECA_ITENS: ItemBiblioteca[] = [
  { value: 'cama',                     label: 'Cama',                      icon: BedDouble },
  { value: 'guarda-roupa',             label: 'Guarda-roupa',              icon: Sofa },
  { value: 'televisao',                label: 'Televisão',                 icon: Tv },
  { value: 'frigobar',                 label: 'Frigobar',                  icon: Refrigerator },
  { value: 'ar-condicionado',          label: 'Ar-condicionado',           icon: AirVent },
  { value: 'microondas',               label: 'Micro-ondas',               icon: Microwave },
  { value: 'ventilador-teto',          label: 'Ventilador de teto',        icon: Fan },
  { value: 'banheiro-agua-quente',     label: 'Banheiro c/ água quente',   icon: ShowerHead },
  { value: 'banheiro-sem-agua-quente', label: 'Banheiro s/ água quente',   icon: Bath },
  { value: 'poltrona',                 label: 'Poltrona',                  icon: Armchair },
  { value: 'mesa',                     label: 'Mesa',                      icon: Table2 },
  { value: 'cortina',                  label: 'Cortina / Persiana',        icon: Blinds },
  { value: 'wifi',                     label: 'Wi-Fi',                     icon: Wifi },
  { value: 'cofre',                    label: 'Cofre',                     icon: Lock },
  { value: 'som',                      label: 'Caixa de som',              icon: Speaker },
  { value: 'luminaria',                label: 'Luminária',                 icon: Lamp },
  { value: 'ventilador-parede',        label: 'Ventilador de parede',      icon: Wind },
  { value: 'berco',                    label: 'Berço',                     icon: Baby },
  { value: 'varanda',                  label: 'Varanda c/ guarda-sol',     icon: Umbrella },
  { value: 'smart-tv',                 label: 'Monitor / Smart TV',        icon: Monitor },
  { value: 'climatizador',             label: 'Climatizador',              icon: Snowflake },
  { value: 'garagem',                  label: 'Vaga de garagem',           icon: Car },
]

// Atalhos exibidos direto no grid do formulário (os demais ficam na biblioteca completa)
export const TIPOS_ATALHO = BIBLIOTECA_ITENS.slice(0, 9)

export function getItemBiblioteca(value: string): ItemBiblioteca | undefined {
  return BIBLIOTECA_ITENS.find(i => i.value === value)
}

export function getIconeItem(value: string, className = 'w-8 h-8', strokeWidth = 1.5): ReactNode {
  const item = getItemBiblioteca(value)
  const Icon = item?.icon || Package
  return createElement(Icon, { className, strokeWidth })
}
