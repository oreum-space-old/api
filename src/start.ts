import fs, { read } from 'fs'
import * as https from 'https'
import mongoose, { ConnectOptions } from 'mongoose'
import discordStart from './discord'
import escape from './library/escape'
import write from './library/write'
import prompt from './prompt'
import env from './env'
import startWebSockets from './socket/start'

const
  options = {
    key: fs.readFileSync('.cert/key.pem'),
    cert: fs.readFileSync('.cert/cert.pem')
  } as const,
  {
    databaseUrl,
    port,
    network: {
      local,
      networks
    }
  } = env,
  mongooseConnectOptions = {
    connectTimeoutMS: 5000,
    useNewUrlParser: true,
    useUnifiedTopology: true
  } as Readonly<ConnectOptions>,
  {
    npm_package_name: name,
    npm_package_version: version
  } = process.env as Record<'npm_package_name' | 'npm_package_version', string>

function serverMounted () {
  let buffer = ''
  const
    space = networks.length > 1 ? ' ' : '',
    many = networks.length > 1 ? 's' : ''
  const [network, ..._networks] = networks
  const greenArrow = escape.color(escape.Color.green, '  ➜  ')

  buffer +=
    `\n  ${escape.color(32, name.toUpperCase() as string, 1)} ${escape.color(32, `v${version}`)}`
    + ` ready in ${escape.color(97, Date.now() - process.timestamp)} ms\n`
  buffer += `\n${greenArrow}${escape.color(escape.Color.brightWhite, 'Local')}:   ${space}${local}/`

  buffer += network
    ? `\n${greenArrow}${escape.color(escape.Color.brightWhite, `Network${many}`)}: ${network}/\n`
    : `\n${greenArrow}${escape.color(escape.Color.brightWhite, 'Network')}: ${escape.color(escape.Color.brightBlack, 'none')}\n`

  for (const network of _networks) {
    `\n  ➜          : ${network}/\n`
  }
  buffer += '\n'
  prompt(buffer)
}

export default function start () {
  console.clear()
  write(`Connecting to ${escape.color(escape.Color.brightBlack, databaseUrl)} database...`)
  mongoose.connect(databaseUrl, mongooseConnectOptions)
    .then(() => {
      console.clear()
      const server = https.createServer(options)
      startWebSockets(server)
      server.listen(port, serverMounted)
      discordStart()
    })
    .catch(() => {
      console.clear()
      write(escape.color(escape.Color.red, `Failed to connect to database\n  ➜  Address: ${databaseUrl}\n`))
      write('Press enter to retry...')
      read(0, {
        length: 1
      }, (): void => {
        start()
      })
    })
}