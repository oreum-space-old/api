import env from '../env'
import { CHALLENGE_COMMAND, HasGuildCommands, TEST_COMMAND } from './commands'

export default function discordStart () {
  HasGuildCommands(env.discord.appId, env.discord.guildId, [
    TEST_COMMAND,
    CHALLENGE_COMMAND,
  ]);
}