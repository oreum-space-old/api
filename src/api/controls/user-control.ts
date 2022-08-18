import { NextFunction, Request, Response } from 'express'
import userService from '../services/user-service'

const MONTH = 30 * 24 * 60 * 60 * 1000

class UserControl {
  static setCookieToken (response: Response, refreshToken: string): Response {
    return response.cookie('refreshToken', refreshToken, {
      maxAge: MONTH,
      secure: true,
      httpOnly: true
    })
  }

  static getUserAgent (request: Request): string {
    return request.headers['user-agent'] || 'Unknown'
  }

  async registration (request: Request, response: Response, next: NextFunction): string {
    try {
      const { username, email, password } = request.body
      const registrationData = await userService.registration(username, email, password)
      return response.json(registrationData)
    } catch (error) {
      next(error)
    }
  }
}

export default new UserControl()