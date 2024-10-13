import { Client, GatewayIntentBits, TextChannel, EmbedBuilder, Message } from 'discord.js'
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

const TOKEN = process.env.DISCORD_BOT_TOKEN
const PREFIX = '!code'

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`)
})

client.on('messageCreate', async (message: Message) => {
  if (message.author.bot) return
  if (!message.content.startsWith(PREFIX)) return

  const args = message.content.slice(PREFIX.length).trim().split(/ +/)
  const command = args.shift()?.toLowerCase()

  if (command === 'gist') {
    const gistUrl = args[0]
    if (!gistUrl) {
      await message.reply('Please provide a GitHub Gist URL.')
      return
    }

    try {
      const gistId = gistUrl.split('/').pop()
      const response = await axios.get(`https://api.github.com/gists/${gistId}`)
      const gistData = response.data

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(gistData.description || 'GitHub Gist')
        .setURL(gistUrl)
        .setAuthor({
          name: gistData.owner.login,
          iconURL: gistData.owner.avatar_url,
          url: gistData.owner.html_url,
        })
        .setTimestamp()

      for (const [filename, fileData] of Object.entries(gistData.files)) {
        embed.addFields({
          name: filename,
          value: '```' + (fileData as any).language + '\n' + (fileData as any).content.substring(0, 1000) + '```',
        })
      }

      await message.channel.send({ embeds: [embed] })
    } catch (error) {
      console.error('Error fetching Gist:', error)
      await message.reply('An error occurred while fetching the Gist. Please check the URL and try again.')
    }
  } else if (command === 'snippet') {
    const codeSnippet = args.join(' ')
    if (!codeSnippet) {
      await message.reply('Please provide a code snippet.')
      return
    }

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Code Snippet')
      .setDescription('```\n' + codeSnippet + '\n```')
      .setTimestamp()

    await message.channel.send({ embeds: [embed] })
  }
})

client.login(TOKEN).catch(console.error)