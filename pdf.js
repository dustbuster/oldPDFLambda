'use strict'
const chromium = require('chrome-aws-lambda')
const url = require('url');
const pug = require('pug');

module.exports.generate_pdf_post_html = async (event, context) => {
  // debug_app(event, context);
  // console.log("EVENT: \n" + JSON.stringify(event, null, 2))
  // console.log(event['body']);
  const body = event['body'];
  
  if (event['isBase64Encoded'] === true) {
    let decodedTextBody = convertBase64RequestToString(body);
    var urlObjectPathname = url.parse(decodedTextBody, true).pathname;
    const postBody = urlObjectPathname.split('&text=');

    var roughFileName = decodeURIComponent(postBody[0]);
    var filename = roughFileName.split('filename=').pop();
    var decodedHTML = decodeURIComponent(postBody[1]);
     
    // console.log('decodedHTML');
    // console.log(decodedHTML);
    var rawHTML = decodedHTML.replace(/\+/g, " ");
  }
  // console.log('rawHTML');
  // console.log(rawHTML);

  if (typeof rawHTML !== 'string') {
    return context.logStreamName;
  }

  let browser = null
  const filter = {
    html: rawHTML
  }
  const template = pug.compileFile('./src/template.pug')
  const htmldoc = template({ filter })

  try {
      browser = await chromium.puppeteer.launch({
      args: [
        ...chromium.args,
        "--hide-scrollbars", 
        "--no-sandbox",
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();

    page.setContent(htmldoc);
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      margin: { top: '1.8cm', right: '1cm', bottom: '1cm', left: '1cm' },
    });
    const response = {
      headers: {
        'Content-type': 'application/pdf',
        'content-disposition': 'attachment; filename=' + filename,
      },
      statusCode: 200,
      body: pdf.toString('base64'),
      isBase64Encoded: true,
    }
    context.succeed(response);
  } catch (error) {
    
    return context.fail(error)
  } finally {
    if (browser !== null) {
      await browser.close()
    }
  }
}

function debug_app(event, context) { 
  console.log('event - request');
  console.log(event);
  console.log('context - request');
  console.log(context);
}



function convertBase64RequestToString(base64Encoded) {
  let buff = Buffer.from(base64Encoded, 'base64');
  let text = buff.toString('utf-8');
  return text;
}

function base64Decode(base64Encoded) {
  let buff = Buffer.from(base64Encoded, 'base64');
  return buff.toString('utf-8');
}

function containsEncodedComponents(x) {
  // ie ?,=,&,/ etc
  return (decodeURI(x) !== decodeURIComponent(x));
}

// DOES NOT WORK
function decodeEntities(encodedString) {
  var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
  var translate = {
      "nbsp":" ",
      "amp" : "&",
      "quot": "\"",
      "lt"  : "<",
      "gt"  : ">"
  };
  return encodedString.replace(translate_re, function(match, entity) {
      return translate[entity];
  }).replace(/&#(\d+);/gi, function(match, numStr) {
      var num = parseInt(numStr, 10);
      return String.fromCharCode(num);
  });
}
