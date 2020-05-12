const Discord = require('discord.js')

const bot = new Discord.Client()

const token = 'NzA5NDM0OTYxNjM5NTA2MDAw.XrmJNQ.GxvOqcXZN2hL6QKLZBjHgZJohiw'

bot.login(token)
bot.on('ready', () => {
    console.log('Estou pronto')
})

bot.on('message', msg => {
    if (msg.content === "E ai, galera!!") {
        msg.reply('Olá!! Bem-vindo!!')
    }
})