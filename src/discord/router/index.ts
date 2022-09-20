import {
  ButtonStyleTypes,
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  MessageComponentTypes
} from 'discord-interactions'
import express, { Router } from 'express'
import env from '../../env'
import { getResult, getShuffledOptions } from '../game'
import type { Variant } from '../game'
import { verifyDiscordRequest } from '../middleware'
import { DiscordRequest, getRandomEmoji } from '../utils'

export type Game = {
  id: unknown,
  objectName: Variant
}

const activeGames: Record<string, Game> = {}

const router = Router()
  .use(express.json({ verify: verifyDiscordRequest (env.discord.publicKey) }))
  .post('/interactions', async function (req, res) {
    const {
      type,
      id,
      data
    } = req.body

    if (type === InteractionType.PING) {
      return res.send({ type: InteractionResponseType.PONG })
    }

    if (type === InteractionType.APPLICATION_COMMAND) {
      const { name } = data

      if (name === 'test') {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'hello world ' + getRandomEmoji()
          }
        })
      }

      if (name === 'challenge' && id) {
        const userId = req.body.member.user.id
        const objectName = req.body.data.options[0].value

        activeGames[id] = {
          id: userId,
          objectName
        }

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          content: `Rock papers scissors challenge from <@${userId}>`,
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.BUTTON,
                  // Append the game ID to use later on
                  custom_id: `accept_button_${req.body.id}`,
                  label: 'Accept',
                  style: ButtonStyleTypes.PRIMARY,
                },
              ],
            },
          ],
        })
      }
    }

    if (type === InteractionType.MESSAGE_COMPONENT) {
      const componentId: string = data.custom_id

      if (componentId.startsWith('accept_button_')) {
        const
          gameId = componentId.replace('accept_button_', ''),
          endpoint = `webhooks/${env.discord.appId}/${req.body.token}/messages/${req.body.message.id}`

        try {
          await res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: 'What is your object of choice?',
              flags: InteractionResponseFlags.EPHEMERAL,
              components: [
                {
                  type: MessageComponentTypes.ACTION_ROW,
                  components: [
                    {
                      type: MessageComponentTypes.STRING_SELECT,
                      custom_id: `select_choice_${gameId}`,
                      options: getShuffledOptions(),
                    }
                  ]
                }
              ]
            }
          })

          await DiscordRequest(endpoint, { method: 'DELETE' })
        } catch (err) {
          console.error('Error sending message:', err)
        }
      } else if (componentId.startsWith('select_choice_')) {
        const gameId = componentId.replace('select_choice_', '')
        const game = activeGames[gameId]

        if (game) {
          const userId = req.body.member.user.id
          const objectName = data.values[0]

          const resultStr = getResult(game, {
            id: userId,
            objectName
          })

          delete activeGames[gameId]

          const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`

          try {
            await res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: { content: resultStr }
            })

            await DiscordRequest(endpoint, {
              method: 'PATCH',
              body: JSON.stringify({
                content: `Nice choice ${getRandomEmoji()}`,
                components: []
              })
            });
          } catch (err) {
            console.error('Error sending message:', err)
          }
        }
      }
    }
  })

export default router
