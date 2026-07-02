import {
  Coffee, Wine, Apple, Sandwich, Droplets, Cookie, Beef, Fish, Salad,
  Beer, GlassWater, CupSoda, Pizza, Cake, Croissant, Egg, Soup, Utensils,
  Milk, Candy, Popcorn, Banana, Cherry, Grape, Citrus, Martini, Nut, Carrot,
  Drumstick, EggFried, Donut, IceCream, Wheat, ShoppingBasket, LucideIcon
} from 'lucide-react'
import { createElement, ReactNode } from 'react'

export interface ItemBibliotecaConsumo {
  value: string
  label: string
  icon: LucideIcon
}

// Os 9 primeiros mantêm as mesmas `value` já usadas nos itens semeados,
// para que o mapeamento de ícone continue funcionando sem migração de dados.
export const BIBLIOTECA_CONSUMO: ItemBibliotecaConsumo[] = [
  { value: 'coffee',      label: 'Café',              icon: Coffee },
  { value: 'wine',        label: 'Vinho',              icon: Wine },
  { value: 'apple',       label: 'Fruta',              icon: Apple },
  { value: 'sandwich',    label: 'Lanche',             icon: Sandwich },
  { value: 'water',       label: 'Água',               icon: Droplets },
  { value: 'cookie',      label: 'Biscoito',           icon: Cookie },
  { value: 'beef',        label: 'Carne',              icon: Beef },
  { value: 'fish',        label: 'Peixe',              icon: Fish },
  { value: 'salad',       label: 'Salada',             icon: Salad },
  { value: 'beer',        label: 'Cerveja',            icon: Beer },
  { value: 'glass-water', label: 'Suco',               icon: GlassWater },
  { value: 'soda',        label: 'Refrigerante',       icon: CupSoda },
  { value: 'pizza',       label: 'Pizza',              icon: Pizza },
  { value: 'cake',        label: 'Bolo',               icon: Cake },
  { value: 'croissant',   label: 'Padaria',            icon: Croissant },
  { value: 'egg',         label: 'Ovo',                icon: Egg },
  { value: 'soup',        label: 'Sopa',               icon: Soup },
  { value: 'utensils',    label: 'Refeição',           icon: Utensils },
  { value: 'milk',        label: 'Leite',              icon: Milk },
  { value: 'candy',       label: 'Doce',               icon: Candy },
  { value: 'popcorn',     label: 'Pipoca',             icon: Popcorn },
  { value: 'banana',      label: 'Banana',             icon: Banana },
  { value: 'cherry',      label: 'Cereja',             icon: Cherry },
  { value: 'grape',       label: 'Uva',                icon: Grape },
  { value: 'citrus',      label: 'Cítrico',            icon: Citrus },
  { value: 'martini',     label: 'Coquetel',           icon: Martini },
  { value: 'nut',         label: 'Castanha',           icon: Nut },
  { value: 'carrot',      label: 'Legume',             icon: Carrot },
  { value: 'drumstick',   label: 'Frango',             icon: Drumstick },
  { value: 'egg-fried',   label: 'Ovo frito',          icon: EggFried },
  { value: 'donut',       label: 'Rosquinha',          icon: Donut },
  { value: 'ice-cream',   label: 'Sorvete',            icon: IceCream },
  { value: 'wheat',       label: 'Grãos',              icon: Wheat },
]

// Ícones fixados por padrão no formulário de "Novo item de consumo"
export const ICONES_BASE_CONSUMO = BIBLIOTECA_CONSUMO.slice(0, 9).map(i => i.value)

export function getItemBibliotecaConsumo(value: string): ItemBibliotecaConsumo | undefined {
  return BIBLIOTECA_CONSUMO.find(i => i.value === value)
}

export function getIconeConsumo(value: string, className = 'w-8 h-8', strokeWidth = 1.5): ReactNode {
  const item = getItemBibliotecaConsumo(value)
  const Icon = item?.icon || ShoppingBasket
  return createElement(Icon, { className, strokeWidth })
}
