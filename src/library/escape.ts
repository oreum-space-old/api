const esc = '\x1B'
const csi = `${esc}[`

enum Color {
  black = 30,
  red,
  green,
  yellow,
  blue,
  magenta,
  cyan,
  white,
  brightBlack = 90,
  brightRed,
  brightGreen,
  brightYellow,
  brightBlue,
  brightMagenta,
  brightCyan,
  brightWhite
}

enum Modification {
  bold = 1,
  italic = 3,
  underline
}

function sgr (n: number | string | Array<number | string>, target: string | number): string {
  return `${csi}${typeof n === 'object' ? n.join(';') : n}m${target}${csi}${0}m`
}

export default {
  esc,
  csi,
  sgr,
  color (color: Color, target: string | number, modification?: Modification) {
    return sgr(!modification ? color : [modification, color], target)
  },
  background (color: Color, target: string | number, modification?: Modification) {
    return sgr(!modification ? color + 10 : [modification, color + 10], target)
  },
  bold (target: string | number) {
    return sgr(1, target)
  },
  italic (target: string | number) {
    return sgr(3, target)
  },
  underline (target: string | number) {
    return sgr(4, target)
  },
  Color,
  Modification,
  cuu (n: string | number = '') {
    return `${csi}${n}A`
  },
  cud (n: string | number = '') {
    return `${csi}${n}B`
  },
  cuf (n: string | number = '') {
    return `${csi}${n}C`
  },
  cub (n: string | number = '') {
    return `${csi}${n}D`
  },
  backspace: '\b'
}