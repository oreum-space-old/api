import { ClientRequestArgs } from 'http'
import { URL } from 'url'
import WebSocket, { Server, ServerOptions } from 'ws'

type Action<S = unknown> = (state: S, event: WebSocket.MessageEvent, webSocket: WebSocketInstance, data?: unknown) => void

type initialState<S = any> = (wsr: WebSocketInstance) => S

export type WebSocketRouteRaw<S> = {
  state: initialState<S>,
  actions: Record<string, Action<S>>
}

export class WebSocketRoute<S = any> {
  state: S
  actions: Record<string, Action<S>>

  constructor (initialState: initialState<S>, actions: Record<string, Action<S>>, instance: WebSocketInstance) {
    this.state = initialState(instance)
    this.actions = actions
  }
}

const
  defaultActions = {
  ping (state: undefined, event: WebSocket.MessageEvent, webSocket: WebSocketInstance, data: unknown) {
    webSocket.action('pong', data)
  }
} as Record<string, Action<undefined>>,
  defaultActionsKeys = Object.keys(defaultActions)

export class WebSocketInstance<R extends WebSocketRoute = WebSocketRoute> extends WebSocket {
  route?: R

  constructor(address: null);
  constructor(address: string | URL, options?: WebSocket.ClientOptions | ClientRequestArgs);
  constructor(address: string | URL, protocols?: string | string[], options?: WebSocket.ClientOptions | ClientRequestArgs);
  constructor (
    address: null | string | URL,
    protocols?: string | string[] | WebSocket.ClientOptions | ClientRequestArgs,
    options?: WebSocket.ClientOptions | ClientRequestArgs
  ) {
    if (!address) {
      super(null)
    } else if (typeof protocols !== 'string' && !Array.isArray(protocols)) {
      super(address, protocols)
    } else {
      super(address, protocols, options)
    }
    this.route = undefined
    this.onmessage = this._onmessage
  }

  private _onmessage (event: WebSocket.MessageEvent) {
    if (typeof event.data === 'string') {
      const { action: actionName, data } = JSON.parse(event.data) as {
        action?: string,
        data?: unknown
      }

      if (this.route && actionName) {
        if (defaultActionsKeys.includes(actionName)) {
          defaultActions[actionName](this.route.state, event, this, data)
        } else {
          const action = this.route.actions[actionName]

          if (action) {
            action(this.route.state, event, this, data)
          }
        }
      }
    }
  }

  public action (action: string, data?: any) {
    try {
      this.send(JSON.stringify({
        action,
        data
      }))
    } catch {
      this.send(JSON.stringify({
        action: 'error',
        data: {
          reason: 'JSON recursion error'
        }
      }))
    }
  }

  public setRoute<T extends unknown> (route: WebSocketRoute<T>): WebSocketInstance<WebSocketRoute<T>> {
    this.route = route as R
    return this as unknown as WebSocketInstance<WebSocketRoute<T>>
  }
}

export default class WebSocketServer extends Server<WebSocketInstance> {
  private readonly routes = new Map<string, WebSocketRouteRaw<any>>()

  constructor (serverOptions: ServerOptions) {
    super({ ...serverOptions, WebSocket: WebSocketInstance })
    this.on('connection', (wsRaw, data) => {
      const route = this.routes.get(data.url || 'default')

      if (!route) {
        wsRaw.close(4404, 'route not found!')
      } else {
        wsRaw.setRoute(new WebSocketRoute(route.state, route.actions, wsRaw))
      }

      console.log(`connected ${data.url}`)
    })
  }

  public addRoute (path: string, actions: WebSocketRouteRaw<any>) {
    this.routes.set(path, actions)
    return this
  }
}
