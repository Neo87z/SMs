const express = require('express');
const router = express.Router();
const _ = require('underscore');
const ClaimModel = require('../models/ClaimModel');
const ClaimedItems = require('../models/ClaimedModel');
const WeeklyWinners = require('../models/WeeklyWinners');
const nodemailer = require('nodemailer')
const newPrize = require('../models/Prize');

module.exports = function () {
  // POST route to add a new claim to the database
  router.post('/add-claim', (req, res) => {
    const newClaim = new ClaimModel(req.body);

    newClaim.save()
      .then((savedClaim) => {
        const response = {
          status: true,
          message: 'Claim saved successfully',
          data: savedClaim
        };

        const WnewClaim = new WeeklyWinners(req.body);
        WnewClaim.UniquieID = savedClaim._id;
        WnewClaim.save()
          .then((savedWeeklyClaim) => {
            newClaim.WeeklyClaimID = savedWeeklyClaim._id; // Update newClaim's WeeklyClaimID field with WnewClaim's _id
            newClaim.save() // Save the updated newClaim object
              .then(() => {
                SendEmail(WnewClaim.Email);
                res.status(201).send("Successful");
              })
              .catch((error) => {
                console.error(error);
                const response = {
                  status: false,
                  message: 'Failed to save claim',
                  error: error.message
                };
                res.status(500).send(response);
              });
          })
          .catch((error) => {
            console.error(error);
            const response = {
              status: false,
              message: 'Failed to save claim',
              error: error.message
            };
            res.status(500).send(response);
          });
      })
      .catch((error) => {
        console.error(error);
        const response = {
          status: false,
          message: 'Failed to save claim',
          error: error.message
        };
        res.status(500).send(response);
      });
  });


  router.get('/get-all-claims', (req, res) => {
    ClaimModel.find()
      .then(items => {
        console.log('Retrieved items:');
        console.log(items);

        const response = {
          status: true,
          message: 'Retrieved items successfully',
          data: items
        };
        res.status(200).send(response);
      })
      .catch(error => {
        console.error('Error retrieving items:', error);

        const response = {
          status: false,
          message: 'Failed to retrieve items',
          error: error.message
        };
        res.status(500).send(response);
      });
  });

  router.get('/get-weekly-winners', (req, res) => {
    WeeklyWinners.find()
      .then(items => {
        console.log('Retrieved items:');
        console.log(items);

        const response = {
          status: true,
          message: 'Retrieved items successfully',
          data: items
        };
        res.status(200).send(response);
      })
      .catch(error => {
        console.error('Error retrieving items:', error);

        const response = {
          status: false,
          message: 'Failed to retrieve items',
          error: error.message
        };
        res.status(500).send(response);
      });
  });

  router.get('/get-all-claims-MP', (req, res) => {
    ClaimModel.findByClaimLocation('Mount Pearl')
      .then(items => {
        console.log('Retrieved items:');
        console.log(items);

        const response = {
          status: true,
          message: 'Retrieved items successfully',
          data: items
        };
        res.status(200).send(response);
      })
      .catch(error => {
        console.error('Error retrieving items:', error);

        const response = {
          status: false,
          message: 'Failed to retrieve items',
          error: error.message
        };
        res.status(500).send(response);
      });
  });

  router.get('/get-all-claims-FR', (req, res) => {
    ClaimModel.findByClaimLocation('Freshwater')
      .then(items => {
        console.log('Retrieved items:');
        console.log(items);

        const response = {
          status: true,
          message: 'Retrieved items successfully',
          data: items
        };
        res.status(200).send(response);
      })
      .catch(error => {
        console.error('Error retrieving items:', error);

        const response = {
          status: false,
          message: 'Failed to retrieve items',
          error: error.message
        };
        res.status(500).send(response);
      });
  });

  router.get('/get-all-claims-HG', (req, res) => {
    ClaimModel.findByClaimLocation('Higgins Line')
      .then(items => {
        console.log('Retrieved items:');
        console.log(items);

        const response = {
          status: true,
          message: 'Retrieved items successfully',
          data: items
        };
        res.status(200).send(response);
      })
      .catch(error => {
        console.error('Error retrieving items:', error);

        const response = {
          status: false,
          message: 'Failed to retrieve items',
          error: error.message
        };
        res.status(500).send(response);
      });
  });


  router.post('/claim-item-weekly', (req, res) => {
    console.log('jere')
    console.log(req.body)
    const itemId = req.body.ItemID; // Retrieve the item ID from the request body

    WeeklyWinners.findById(itemId, (err, item) => {
      if (err) {
        console.error('Error retrieving item:', err);
        const response = {
          status: false,
          message: 'Failed to retrieve item',
          error: err.message
        };

        return;
      }

      if (!item) {
        const response = {
          status: false,
          message: 'Item not found',
          error: 'Item does not exist'
        };
        res.status(404).send(response);
        return;
      }

      // Create a new document for claimed items
      const claimedItem = new ClaimedItems({
        FirstName: item.FirstName,
        LastName: item.LastName,
        Email: item.Email,
        Phone: item.Phone,
        ClaimLocation: item.ClaimLocation,
        ClaimDate: item.ClaimDate,
        ClaimableItem: item.ClaimableItem,
        ClaimedDate: new Date().toISOString() // Add ClaimedDate with the current date
      });

      // Save the claimed item to the claimeditems collection
      claimedItem.save((err) => {
        if (err) {
          console.error('Error saving claimed item:', err);
          const response = {
            status: false,
            message: 'Failed to save claimed item',
            error: err.message
          };
          res.status(500).send(response);
          return;
        }

        // Remove the item from the Claims collection
        ClaimModel.findOneAndRemove({ WeeklyClaimID: itemId }, function (err, result) {
          if (err) {
            console.error(err);
            // Handle the error
          } else if (result) {
            console.log("Document removed:", result);
            // Document was found and removed
          } else {
            console.log("Document not found");
            // Document with the specified unique ID was not found
          }
        });
        WeeklyWinners.findByIdAndRemove(itemId, (err) => {
          if (err) {
            console.error('Error removing item:', err);
            const response = {
              status: false,
              message: 'Failed to remove item',
              error: err.message
            };
            res.status(500).send(response);
            return;
          }

          console.log('Item successfully claimed and removed.');

          const response = {
            status: true,
            message: 'Item successfully claimed and removed.'
          };
          res.status(200).send(response);
        });
      });
    });
  });


  router.post('/claim-item', (req, res) => {
    console.log('jere')
    console.log(req.body)
    const itemId = req.body.ItemID; // Retrieve the item ID from the request body

    ClaimModel.findById(itemId, (err, item) => {
      if (err) {
        console.error('Error retrieving item:', err);
        const response = {
          status: false,
          message: 'Failed to retrieve item',
          error: err.message
        };

        return;
      }

      if (!item) {
        const response = {
          status: false,
          message: 'Item not found',
          error: 'Item does not exist'
        };
        res.status(404).send(response);
        return;
      }

      // Create a new document for claimed items
      const claimedItem = new ClaimedItems({
        FirstName: item.FirstName,
        LastName: item.LastName,
        Email: item.Email,
        Phone: item.Phone,
        ClaimLocation: item.ClaimLocation,
        ClaimDate: item.ClaimDate,
        ClaimableItem: item.ClaimableItem,
        ClaimedDate: new Date().toISOString() // Add ClaimedDate with the current date
      });

      // Save the claimed item to the claimeditems collection
      claimedItem.save((err) => {
        if (err) {
          console.error('Error saving claimed item:', err);
          const response = {
            status: false,
            message: 'Failed to save claimed item',
            error: err.message
          };
          res.status(500).send(response);
          return;
        }

        // Remove the item from the Claims collection
        WeeklyWinners.findOneAndRemove({ UniquieID: itemId }, function (err, result) {
          if (err) {
            console.error(err);
            // Handle the error
          } else if (result) {
            console.log("Document removed:", result);
            // Document was found and removed
          } else {
            console.log("Document not found");
            // Document with the specified unique ID was not found
          }
        });
        ClaimModel.findByIdAndRemove(itemId, (err) => {
          if (err) {
            console.error('Error removing item:', err);
            const response = {
              status: false,
              message: 'Failed to remove item',
              error: err.message
            };
            res.status(500).send(response);
            return;
          }

          console.log('Item successfully claimed and removed.');

          const response = {
            status: true,
            message: 'Item successfully claimed and removed.'
          };
          res.status(200).send(response);
        });
      });
    });
  });


  router.post('/reset-weekly-winners', (req, res) => {

    console.log('here')
    WeeklyWinners.deleteMany({}, (error) => {
      if (error) {
        console.error('Error deleting entries:', error);
        res.status(500).send('error');
      } else {
        console.log('All entries deleted successfully.');
        res.status(201).send('ok');
      }
    });

  });

  router.get('/get-prize', (req, res) => {

    newPrize.find()
      .then(savedPrize => {
        console.log('Prize added:', savedPrize);
        // Prize saved successfully


        const response = {
          status: true,
          message: 'Retrieved items successfully',
          data: savedPrize
        };
        res.status(201).send(response);
      })
      .catch(error => {
        console.error('Failed to add prize:', error);
        // Handle the error
        res.status(500).send('error');
      });


  });


  router.post('/update-prize', async (req, res) => {
    //const Priuze = new newPrize(req.body)
    console.log(req.body.NewPrize)
    try {
      // Remove all existing records
      //newPrize.deleteMany();
      await  newPrize.deleteMany({}, (error) => {
        if (error) {
          console.error('Error deleting entries:', error);
          res.status(500).send('error');
        } else {
          console.log('All entries deleted successfully.');
          res.status(201).send('ok');
        }
      });

      // Create a new record
      const newRecord = await   new newPrize({ Prize: req.body.NewPrize });
      const savedRecord =await   newRecord.save();

      console.log('Data removed and new record added successfully:', savedRecord);
    } catch (error) {
      console.error('Error removing data and adding new record:', error);
    }

  });



  router.post('/check-login', (req, res) => {
    console.log(req.body)

    if (req.body.Username == 'Krock') {
      if (req.body.Password == '2023rock') {

        const response = {
          status: true,
          message: 'Krock Login',
          data: 'KrockLogin'
        };
        res.status(201).send(response);
      } else {

        const response = {
          status: false,
          message: 'Invalid',
          data: 'Invalid'
        };
        res.status(201).send(response);
      }
    } else {

      if (req.body.Username == 'Oldtown') {
        if (req.body.Password == '2023old') {

          const response = {
            status: true,
            message: 'Oldtonw Login',
            data: 'OldtonwLogin'
          };
          res.status(201).send(response);
        } else {

          const response = {
            status: false,
            message: 'Invalid',
            data: 'Invalid'
          };
          res.status(201).send(response);
        }
      } else {
        const response = {
          status: false,
          message: 'Invalid',
          data: 'Invalid'
        };
        res.status(201).send(response);

      }

    }


  });






  function SendEmail(Email) {
    return new Promise((resolve, reject) => {
      var trasnsporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        }
      })

      const mail_configs = {
        from: process.env.EMAIL,
        to: Email,
        subject: "Congratulations On Winning - Oldtown X Krock Collaboration",
        html: `<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head>
        <!--[if gte mso 9]>
        <xml>
          <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
        <![endif]-->
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="x-apple-disable-message-reformatting">
          <!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->
          <title></title>
          
            <style type="text/css">
              @media only screen and (min-width: 570px) {
          .u-row {
            width: 550px !important;
          }
          .u-row .u-col {
            vertical-align: top;
          }
        
          .u-row .u-col-100 {
            width: 550px !important;
          }
        
        }
        
        @media (max-width: 570px) {
          .u-row-container {
            max-width: 100% !important;
            padding-left: 0px !important;
            padding-right: 0px !important;
          }
          .u-row .u-col {
            min-width: 320px !important;
            max-width: 100% !important;
            display: block !important;
          }
          .u-row {
            width: 100% !important;
          }
          .u-col {
            width: 100% !important;
          }
          .u-col > div {
            margin: 0 auto;
          }
        }
        body {
          margin: 0;
          padding: 0;
        }
        
        table,
        tr,
        td {
          vertical-align: top;
          border-collapse: collapse;
        }
        
        p {
          margin: 0;
        }
        
        .ie-container table,
        .mso-container table {
          table-layout: fixed;
        }
        
        * {
          line-height: inherit;
        }
        
        a[x-apple-data-detectors='true'] {
          color: inherit !important;
          text-decoration: none !important;
        }
        
        @media (max-width: 480px) {
          .hide-mobile {
            max-height: 0px;
            overflow: hidden;
            display: none !important;
          }
        }
        
        table, td { color: #000000; } #u_body a { color: #ffffff; text-decoration: none; } @media (max-width: 480px) { #u_content_text_2 .v-text-align { text-align: center !important; } }
            </style>
          
          
        
        <!--[if !mso]><!--><link href="https://fonts.googleapis.com/css?family=Montserrat:400,700&display=swap" rel="stylesheet" type="text/css"><!--<![endif]-->
        
        </head>
        
        <body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
          <!--[if IE]><div class="ie-container"><![endif]-->
          <!--[if mso]><div class="mso-container"><![endif]-->
          <table id="u_body" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%" cellpadding="0" cellspacing="0">
          <tbody>
          <tr style="vertical-align: top">
            <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
            <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #ffffff;"><![endif]-->
            
        
        <div class="u-row-container" style="padding: 0px;background-color: transparent">
          <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 550px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #fc5656;">
            <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-image: url('https://i.ibb.co/vDs30yt/image-2.jpg');background-repeat: repeat;background-position: center top;background-color: transparent;">
              <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:550px;"><tr style="background-image: url('images/image-2.jpeg');background-repeat: repeat;background-position: center top;background-color: #fc5656;"><![endif]-->
              
        <!--[if (mso)|(IE)]><td align="center" width="534" style="width: 534px;padding: 0px;border-top: 8px solid #000000;border-left: 8px solid #000000;border-right: 8px solid #000000;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
        <div class="u-col u-col-100" style="max-width: 320px;min-width: 550px;display: table-cell;vertical-align: top;">
          <div style="height: 100%;width: 100% !important;">
          <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 8px solid #000000;border-left: 8px solid #000000;border-right: 8px solid #000000;border-bottom: 0px solid transparent;"><!--<![endif]-->
          
        <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td style="overflow-wrap:break-word;word-break:break-word;padding:25px 10px 10px;font-family:'Montserrat',sans-serif;" align="left">
                
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td class="v-text-align" style="padding-right: 0px;padding-left: 0px;" align="center">
              
              <img align="center" border="0" src="https://i.ibb.co/RTsTjPs/image-1.png" alt="Image" title="Image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 25%;max-width: 132.5px;" width="132.5"/>
              
            </td>
          </tr>
        </table>
        
              </td>
            </tr>
          </tbody>
        </table>
        
        <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td style="overflow-wrap:break-word;word-break:break-word;padding:42px;font-family:'Montserrat',sans-serif;" align="left">
                
          <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="1%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #fc5656;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
            <tbody>
              <tr style="vertical-align: top">
                <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                  <span>&#160;</span>
                </td>
              </tr>
            </tbody>
          </table>
        
              </td>
            </tr>
          </tbody>
        </table>
        
        <table class="hide-mobile" style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td style="overflow-wrap:break-word;word-break:break-word;padding:71px;font-family:'Montserrat',sans-serif;" align="left">
                
          <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="1%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #fc5656;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
            <tbody>
              <tr style="vertical-align: top">
                <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                  <span>&#160;</span>
                </td>
              </tr>
            </tbody>
          </table>
        
              </td>
            </tr>
          </tbody>
        </table>
        
        <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Montserrat',sans-serif;" align="left">
                
          <div class="v-text-align" style="font-size: 14px; color: #ffffff; line-height: 100%; text-align: left; word-wrap: break-word;">
            <p style="line-height: 100%; text-align: center;"><span style="background-color: #e03e2d; line-height: 14px;"><strong><span style="font-size: 44px; line-height: 44px; background-color: #e03e2d;">CONGRATZ!</span></strong></span></p>
          </div>
        
              </td>
            </tr>
          </tbody>
        </table>
        
        <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Montserrat',sans-serif;" align="left">
                
          <!--[if mso]><style>.v-button {background: transparent !important;}</style><![endif]-->
        <div class="v-text-align" align="center">
          <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://oldtownpizza.ca/" style="height:37px; v-text-anchor:middle; width:408px;" arcsize="11%"  stroke="f" fillcolor="#eec60e"><w:anchorlock/><center style="color:#FFFFFF;font-family:'Montserrat',sans-serif;"><![endif]-->  
            <a href="https://oldtownpizza.ca/" target="_blank" class="v-button" style="box-sizing: border-box;display: inline-block;font-family:'Montserrat',sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #eec60e; border-radius: 4px;-webkit-border-radius: 4px; -moz-border-radius: 4px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;font-size: 14px;">
              <span style="display:block;padding:10px 70px;line-height:120%;"><strong><span style="font-size: 14px; line-height: 16.8px;">Call The Store To Get Your Free Pizza</span></strong></span>
            </a>
          <!--[if mso]></center></v:roundrect><![endif]-->
        </div>
        
              </td>
            </tr>
          </tbody>
        </table>
        
        <table class="hide-mobile" style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td style="overflow-wrap:break-word;word-break:break-word;padding:56px;font-family:'Montserrat',sans-serif;" align="left">
                
          <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="1%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #fc5656;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
            <tbody>
              <tr style="vertical-align: top">
                <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                  <span>&#160;</span>
                </td>
              </tr>
            </tbody>
          </table>
        
              </td>
            </tr>
          </tbody>
        </table>
        
        <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td style="overflow-wrap:break-word;word-break:break-word;padding:20px;font-family:'Montserrat',sans-serif;" align="left">
                
          <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="1%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #fc5656;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
            <tbody>
              <tr style="vertical-align: top">
                <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                  <span>&#160;</span>
                </td>
              </tr>
            </tbody>
          </table>
        
              </td>
            </tr>
          </tbody>
        </table>
        
        <table id="u_content_text_2" style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 10px 17px 20px;font-family:'Montserrat',sans-serif;" align="left">
                
          <div class="v-text-align" style="font-size: 14px; color: #ffffff; line-height: 140%; text-align: center; word-wrap: break-word;">
            <p style="font-size: 14px; line-height: 140%; text-align: left;">*Valid Till End Of The Month</p>
          </div>
        
              </td>
            </tr>
          </tbody>
        </table>
        
          <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
          </div>
        </div>
        <!--[if (mso)|(IE)]></td><![endif]-->
              <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
            </div>
          </div>
        </div>
        
        
        
        <div class="u-row-container" style="padding: 0px;background-color: transparent">
          <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 550px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #000000;">
            <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
              <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:550px;"><tr style="background-color: #000000;"><![endif]-->
              
        <!--[if (mso)|(IE)]><td align="center" width="550" style="width: 550px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
        <div class="u-col u-col-100" style="max-width: 320px;min-width: 550px;display: table-cell;vertical-align: top;">
          <div style="height: 100%;width: 100% !important;">
          <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
          
        <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td style="overflow-wrap:break-word;word-break:break-word;padding:40px;font-family:'Montserrat',sans-serif;" align="left">
                
          <div class="v-text-align" style="font-size: 14px; color: #828388; line-height: 140%; text-align: left; word-wrap: break-word;">
            <p style="font-size: 14px; line-height: 140%; text-align: center;"><span style="font-size: 14px; line-height: 19.6px;">© Old Town Pizza.  All Rights Reserved </span></p>
          </div>
        
              </td>
            </tr>
          </tbody>
        </table>
        
          <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
          </div>
        </div>
        <!--[if (mso)|(IE)]></td><![endif]-->
              <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
            </div>
          </div>
        </div>
        
        
            <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
            </td>
          </tr>
          </tbody>
          </table>
          <!--[if mso]></div><![endif]-->
          <!--[if IE]></div><![endif]-->
        </body>
        
        </html>
        `,
      }
      trasnsporter.sendMail(mail_configs, function (error, info) {
        if (error) {
          return reject({ message: 'error' })
        } else {
          return resolve({ message: 'done' })
        }
      })
    })
  }

  return router;
};
