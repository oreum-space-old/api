import list from './list'

export default async function commandHandler (command: string | undefined, args: Array<string>): Promise<void> {
  if (!command) return

  if (list[command]) {
    await list[command].handler(command, args)
  } else {
    await list.default.handler(command, args)
  }
}