import cookieParser from 'cookie-parser'
import express from 'express'
import cors from 'cors'
import env from './env'
import start from './start'

process.timestamp = Date.now()

const
  app = express(),
  { origin } = env;

app
  .use(express.json())
  .use(cookieParser())
  .use(cors({ credentials: true, origin }))
  // .use('/api', router)
  // .use(errorMiddleware)

start()