import commandHandler from './commands'
import escape from './library/escape'
import write from './library/write'

const stdin = process.openStdin()

function writePrompt () {
  const date = new Date().toLocaleString('ru-RU').slice(12)
  write(escape.color(escape.Color.brightYellow, `${date} ➜ `))
}

function writeTimestamp (length: number) {
  const date = new Date().toLocaleString('ru-RU').slice(12)
  write(escape.color(escape.Color.brightBlack, `${escape.cuu()}${escape.cuf(length + 10)}// ${date}\n`))
}

function dataHandler (data: Buffer): void {
  const string = data.toString('utf-8')

  const [command, ...args] = string
    .slice(0, -2)
    .split(' ')
    .filter(_ => !!_)

  writeTimestamp(string.length)
  commandHandler(command, args)
    .finally(() => {
      writePrompt()
    })
}

export default function prompt (buffer: string): void {
  write(buffer)
  writePrompt()
  stdin.addListener('data', dataHandler)
}