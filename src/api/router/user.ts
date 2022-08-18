import type { Router } from 'express'

function path(path: string) {
  return `/user/${path}`
}

export default function (router: Router) {
  router
    .post(path('/registration'))
    .post(path('/registration/username'))
    .post(path('/registration/email'))
    .post(path('/login'))
}