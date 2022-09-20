import { Client, ClientChannel } from 'ssh2'
import WebSocket from 'ws'
import { WebSocketInstance, WebSocketRoute, WebSocketRouteRaw } from '../index'

type State = {
  client: Client
  channel?: ClientChannel
  endline?: '\n' | '\r\n'
}

function createClient (ws: WebSocketInstance<WebSocketRoute<State>>): State['client'] {
  const client = new Client()

  client
    .on('ready', () => {
      console.log('Client :: ready')
      const remoteVer = (client as unknown as { _remoteVer: string })._remoteVer as string

      if (ws.route) {
        if (remoteVer && remoteVer.toLowerCase().includes('windows') && ws.route) {
          ws.route.state.endline = '\r\n'
        } else {
          ws.route.state.endline = '\n'
        }
      }
      ws.action('ready')
      client.shell({
        term: 'xterm'
      },(error, channel) => {
        if (error) throw error

        if (ws.route) {
          ws.route.state.channel = channel
        }

        channel
          .on('close', () => {
            console.log('Channel :: close')
            ws.close(4200, 'channel was closed')
            client.end()
          })

        channel
          .on('data', (data: any) => {
            ws.action('pause')
            ws.action('write', data)
            ws.action('resume')
          })

        channel
          .stderr
          .on('data', (data) => {
            process.stderr.write(data);
            ws.action('write', data)
          })
      })
    })

  return client
}

const terminal = {
  state: wsr => ({ client: createClient(wsr) }),
  actions: {
    line (state: State, event: WebSocket.MessageEvent, webSocket: WebSocketInstance, data?: unknown) {
      if (state.channel && typeof data === 'string') {
        state.channel.write(data.trim() + state.endline)
      }
    },
    key (state: State, event: WebSocket.MessageEvent, webSocket: WebSocketInstance, data?: unknown) {
      if (state.channel) {
        state.channel.write(data)
      }
    },
    connect (state: State, event: WebSocket.MessageEvent, webSocket: WebSocketInstance, data?: { host: string, port: number, username: string, password: string }) {
      if (data) {
        console.log(data)
        state.client.connect(data)
      }
    },
    disconnect (state: State, event: WebSocket.MessageEvent, webSocket: WebSocketInstance) {
      state.client.end()
    }
  }
} as WebSocketRouteRaw<State>

export default terminal