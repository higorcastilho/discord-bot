const express = require('express')
const paypal = require('paypal-rest-sdk')
const Discord = require('discord.js')
const app = express()
const path = require('path')

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AV155ElLCzbo5k4OvGNm5vczYS0S3l_lP_ZHwpiG7UBWsvosUJYvfycQNUHu_ExoZ8CtnqoDvcjvb3s4',
    'client_secret': 'EFHlI5_--z4LX0RbE-ksAdyF6PN-F1K_zx6DORwuIXWFGMpN7-Vlzkt3-otLoph4JQ6yJWMO3hcC4zOf'
});

const bot = new Discord.Client()
const token = 'NzA5NDM0OTYxNjM5NTA2MDAw.XrmJNQ.GxvOqcXZN2hL6QKLZBjHgZJohiw'
bot.login(token)
bot.on('ready', () => {
    console.log('Estou pronto')
})

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html')

app.use('/', (req, res) => {
    res.render('./views/index')
})

app.get('/process', (req, res) => {
    res.render('process')
    const paymentId = req.query.paymentId
    const payerId = { payer_id: req.query.PayerID }

    paypal.payment.execute(paymentId, payerId, function(error, payment){
        if(error) {
            console.log('tente pagar novamente')
            console.log(error)
        } else {
            if (payment.state == 'approved') {
                console.log('Olha ... deu bom mesmo agora')
            } else {
                console.log('deu ruim ai, deu pra finalizar nao')
            }
        }
    })
})

bot.on('message', msg => {
    if (msg.content === "buy") {

        const payReq = {
            intent:'sale',
            payer:{
              payment_method:'paypal'
            },
            redirect_urls:{
              return_url:'http://localhost:3000/process',
              cancel_url:'http://localhost:3000/cancel'
            },
            transactions:[{
              amount:{
                total:'25',
                currency:'BRL'
              },
              description:' Box.'
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
                    console.log('deu ruim')
                }
            }
        })
    }
})

/* app.post('/pay', (req, res) => {
    const payReq = {
        intent:'sale',
        payer:{
          payment_method:'paypal'
        },
        redirect_urls:{
          return_url:'http://localhost:3000/process',
          cancel_url:'http://localhost:3000/cancel'
        },
        transactions:[{
          amount:{
            total:'25',
            currency:'BRL'
          },
          description:' Box.'
        }]
    }
    paypal.payment.create(payReq, function(error, payment){
        let links = {}

        if (error) {
            console.error(JSON.stringify(error))
        } else {
            payment.links.forEach(linkObj => {
                links[linkObj.rel] = {
                    href: linkObj.href,
                    method: linkObj.method
                }
            })
            if (links.hasOwnProperty('approval_url')) {
                res.redirect(links['approval_url'].href)

            } else {
                console.log('deu ruim')
            }
        }
    })
}) */

app.listen(3000, () => {
    console.log('Connected to server')
})