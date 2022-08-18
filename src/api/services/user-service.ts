import UserDto from '../dtos/user-dto'

type Tokens = {
  accessToken: string,
  refreshToken: string
}

class UserService {
  static async generateAndSaveNewTokens (userDto: UserDto, userAgent: string): Promise<Tokens> {
    const tokens = tokenService.generateTokens({ ...userDto })
    await tokenService.saveToken(userDto.id, tokens.refreshToken, userAgent)
    return tokens
  }

  async registration (username: string, email: string, password: string)
    : Promise<{ username: string, email: string, password: string }> {
    const usernameCandidate = await UserModel.findOne({ username })

    if (usernameCandidate) {
      throw ApiError.BadRequest('user')
    }


    return { username, email, activationCodeLink }
  }
}

export default new UserService()