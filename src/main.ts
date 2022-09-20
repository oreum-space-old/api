import cookieParser from 'cookie-parser'
import express from 'express'
import cors from 'cors'
import env from './env'
import start from './start'
import discordRouter from './discord/router'

process.timestamp = Date.now()

const
  app = express(),
  { applicationUrl } = env;

app
  .use(express.json())
  .use(cookieParser())
  .use(cors({ credentials: true, origin: applicationUrl }))
  .use('', discordRouter)
  // .use('/api', router)
  // .use(errorMiddleware)

start()