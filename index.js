const express = require('express')
const paypal = require('paypal-rest-sdk')
const Discord = require('discord.js')
const ejs = require('ejs')
const app = express()
const serveStatic = require('serve-static')
const path = require('path')

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': //your client id goes here,
    'client_secret': //your client secret goes here
});

const bot = new Discord.Client()
const token = //here goes your token from discord bot account
bot.login(token)
bot.on('ready', () => {
    console.log('Im ready to send messages for you')
})

app.set('view engine', 'ejs')

app.use('/', serveStatic(path.join(__dirname, '/views')))

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/process', (req, res) => {
    const paymentId = req.query.paymentId
    const payerId = { payer_id: req.query.PayerID }

    paypal.payment.execute(paymentId, payerId, function(error, payment){
        if(error) {
            console.log('Try to pay again')
            console.log(error)
        } else {
            if (payment.state == 'approved') {
                console.log('Payment aproved')
                res.render('process')
            } else {
                console.log('Something went wrong. Payment not approved')
            }
        }
    })
})

bot.on('message', msg => {
    if (msg.content === "!buy") {

        const payReq = {
            intent:'sale',
            payer:{
              payment_method:'paypal'
            },
            redirect_urls:{
            //if you're testing, change return and cancel_url by http://localhost:3000/process ou /cancel
              return_url:'your_heroku_url_goes_here/process',
              cancel_url:'your_heroku_url_goes_here/cancel'
            },
            transactions:[{
              amount:{
                total:'the value you want to put goes here. e.g: 20',
                currency:'USD'
              },
              description:' Your Product name goes here'
            }]
        }
        paypal.payment.create(payReq, function(error, payment){
            let links = {}
    
            if (error) {
                console.error(JSON.stringify(error))
                msg.reply('Something went wrong when trying to sent paypal link checkout')
            } else {
                payment.links.forEach(linkObj => {
                    links[linkObj.rel] = {
                        href: linkObj.href,
                        method: linkObj.method
                    }
                })
                if (links.hasOwnProperty('approval_url')) {
                    msg.reply(links['approval_url'].href)
                } else {
                    console.log('Something went wrong after paypal.create payment')
                }
            }
        })
    }
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log('Connected to server')
})