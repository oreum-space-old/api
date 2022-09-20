import { getRPSChoices } from '../game'
import { capitalize, DiscordRequest } from '../utils'

export type AppCommand = {
  name: string
}

export async function InstallGuildCommand (appId: string, guildId: string, command: AppCommand) {
  const endpoint = `applications/${appId}/guilds/${guildId}/commands`

  try {
    await DiscordRequest(endpoint, { method: 'POST', body: JSON.stringify(command) })
  } catch (err) {
    console.error(err)
  }
}

async function HasGuildCommand (appId: string, guildId: string, command: AppCommand) {
  const endpoint = `applications/${appId}/guilds/${guildId}/commands`

  try {
    const
      res = await DiscordRequest(endpoint, { method: 'GET' }),
      data = await res.json() as AppCommand[]

    if (data) {
      const installedNames = data.map((c: AppCommand) => c.name)

      if (!installedNames.includes(command.name)) {
        console.log(`Installing "${command.name}"`)
        await InstallGuildCommand(appId, guildId, command)
      } else {
        console.log(`"${command.name}" command already installed`)
      }
    }
  } catch (err) {
    console.error(err)
  }
}

export async function HasGuildCommands (appId: string, guildId: string, commands: AppCommand[]) {
  if (guildId === '' || appId === '') return

  commands.forEach(c => HasGuildCommand(appId, guildId, c))
}

function createCommandChoices() {
  const choices = getRPSChoices();
  const commandChoices = [];

  for (let choice of choices) {
    commandChoices.push({
      name: capitalize(choice),
      value: choice.toLowerCase(),
    });
  }

  return commandChoices;
}

export const TEST_COMMAND = {
  name: 'test',
  description: 'Basic guild command',
  type: 1,
}

export const CHALLENGE_COMMAND = {
  name: 'challenge',
  description: 'Challenge to a match of rock paper scissors',
  options: [
    {
      type: 3,
      name: 'object',
      description: 'Pick your object',
      required: true,
      choices: createCommandChoices(),
    },
  ],
  type: 1,
}
