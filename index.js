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
//After that, your bot will basically act on two lines of this entire code
//At line started with 'bot.on('message', msg => {})' and line 'msg.reply'
//All the other lines are the paypal API configurations.
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

//Here, you're using your bot to answer to an especific message (!buy, in this case) sent by a member of your group. 
//if message === '!buy', your bot starts the paypal configuration to your product, as you can see below:
bot.on('message', msg => {
    if (msg.content === "!buy") {

        const payReq = {
            intent:'sale',
            payer:{
              payment_method:'paypal'
            },
            redirect_urls:{
            //if you're testing, change return and cancel_url to http://localhost:3000/process or /cancel
            //The /process url is created because when the checkout step is confirmed by the user(member of your group)
            //it's redirected to this page. On our example, you can see this page on /views/process.ejs which says
            //"Thanks for your purchase"
            //In addition, this route(/process), is used by paypal API to check the confirmation sent by the user,
            //as you can see above on app.get(/process) 
              return_url:'your_website_url_goes_here/process',
              cancel_url:'your_website_url_goes_here/cancel'
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
                    //if a link is successfuly created, your bot is triggered by the command 'msg.reply' to send this link
                    //to your member. Now, your member can click on the link to go to a checkout page. 
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
