import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'
import tailwindConfig from '../tailwind.config'

const twMerge = extendTailwindMerge(tailwindConfig)

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
