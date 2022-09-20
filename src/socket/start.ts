import { Server } from 'https'
import WebSocketServer from './index'
import terminal from './routes/terminal'

export default function startWebSockets (server: Server) {
  const webSocketServer = new WebSocketServer({ server })


  webSocketServer
    .addRoute('/terminal', terminal)

  console.log('wss:server')
}
