import write from '../library/write'
import escape from '../library/escape'

type Command = {
  name: string,
  description?: string,
  examples?: Array<string>,
  handler: (command: string, args: Array<string>) => Promise<void>
}

const white = (_: string) => escape.color(escape.Color.brightWhite, _)

const list = {
  clear: {
    name: 'clear',
    description: 'Clears screen',
    examples: [
      `clear ${escape.color(escape.Color.brightBlack, 'To clear screen')}`
    ],
    async handler () {
      write(escape.csi + '2J' + escape.csi + '0;0H')
    }
  },
  help: {
    name: 'help',
    description: 'Helps to find commands and theirs description, examples',
    examples: [
      `help ${escape.color(escape.Color.brightBlack, 'To show list commands')}`,
      `help <command> ${escape.color(escape.Color.brightBlack, 'To show list commands')}`
    ],
    async handler (_, args) {
      if (!args[0]) {
        write(Object.keys(list).toString().split(',',).join('\n') + '\n')
      } else if (list[args[0]]) {
        const { name, description, examples } = list[args[0]]
        write(`${white('name')}:\n\t${name}\n\n${
          description ? `${white('description')}:\n\t${description}\n\n` : ''
        }${
          examples ? `${white('examples')}:\n\t${examples.join('\n\t')}\n\n` : ''
        }`)
      } else {
        await list.default.handler(_, [])
      }
    }
  },
  default: {
    name: 'default',
    async handler (command) {
      write(escape.color(escape.Color.red, `Command ${
        escape.color(escape.Color.white, command)
      }${
        escape.color(escape.Color.red, ' is not found!\n')
      }`))
    }
  }
} as Record<string, Command>

export default list