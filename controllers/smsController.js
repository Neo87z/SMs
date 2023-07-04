const express = require('express');
const router = express.Router();
const _ = require('underscore');
const ClaimModel = require('../models/ClaimModel');
const ClaimedItems = require('../models/ClaimedModel');
const WeeklyWinners = require('../models/WeeklyWinners');
const nodemailer = require('nodemailer')
const newPrize = require('../models/Prize');

const accountSID = 'AC5f7a45a9ed4f2b17a662df8339fcc3c7'
const authtoken = '91eafda90ac940959fb329d13f081e70'

const httpDat= require('http');
const MessagingResponse= require('twilio').twiml.MessagingResponse;

module.exports = function () {
    // POST route to add a new claim to the database


    router.get('/sendsms', (req, res) => {
        const client = require('twilio')(
            accountSID,
            authtoken
        );
        client.messages.create({
            from: '+17097020449',
            to: '+17093510576',
            body: "Oldtown"
        })
       



    });

    router.post('/sms', (req, res) => {
     const twiml= new MessagingResponse()

     twiml.messages('Welcome tO Oldtown SMS Order Service')
     res.writeHead(200,{'Content-Type':'text/xml'});
     res.end(twiml.toString());
    
    });




    return router;
};