import { User } from '../models/user-model'

export default class UserDto {
  id: string
  username: string
  email: string

  constructor (model: User) {
    this.id = model.id
    this.username = model.username
    this.email = model.email
  }
}