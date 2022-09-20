import escape from '../library/escape'
import write from '../library/write'
import type { Command } from './list'
import SSH from '../library/node-ssh'

export default {
  name: 'ssh',
  description: 'Creating ssh connection',
  examples: [
    `ssh computer/username@hostname ${escape.color(escape.Color.brightBlack, 
      'To connect to the computer/username@hostname')}`
  ],
  async handler (command, args) {
    write(command)
    for (const arg of args) {
      write(`args[${args.indexOf(arg)}]: ${arg}\n`)
    }

    if (args[0]) {
      const [ username, host ] = args[0].split('@')

      if (username && host) {
        try {
          const ssh = new SSH()
          console.log({ username, host, password: args[1] })
          const result = await ssh.connect({ username, host, password: args[1] })
          console.log('result:', result)
        } catch (error) {
          console.log(username, host)
          console.error('error:', error)
        }
      }
    }
  }
} as Command