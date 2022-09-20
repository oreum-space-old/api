import env from '../env'
import fetch, { RequestInit } from 'node-fetch'

export async function DiscordRequest (endpoint: string, options: RequestInit) {
  const
    url = 'https://discord.com/api/v10/' + endpoint,
    res = await fetch(url, {
      headers: {
        Authorization: `Bot ${ env.discord.token }`,
        'Content-Type': 'application/json; charset=UTF-8',
        'User-Agent': 'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)'
      },
      ...options
    })
  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  // return original response
  return res;
}

export function getRandomEmoji () {
  const emojiList = ['😭','😄','😌','🤓','😎','😤','🤖','😶‍🌫️','🌏','📸','💿','👋','🌊','✨'];
  return emojiList[Math.floor(Math.random() * emojiList.length)];
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}