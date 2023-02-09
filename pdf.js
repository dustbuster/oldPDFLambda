'use strict'
const chromium = require('chrome-aws-lambda')
const querystring = require('querystring');

module.exports.generate_pdf_post_html = async (event, context) => {
  console.log('generate_pdf_post_html');
  console.log('event');
  console.log(event);
  let qs = querystring.parse(event['body'], null, null, { decodeURIComponent: convertBase64RequestToString });

  console.log('let qs querystring.parse');
  console.log(qs);
  let bodyDecoded = querystring.decode(qs);
  console.log('querystring.decode(qs)');
  console.log(bodyDecoded);

  if (typeof event['body'] === 'string') {
    if (event['isBase64Encoded'] === true) {
      console.log('bodyDecoded[text]');
      console.log(event['body']);
      var base64decodedText = convertBase64RequestToString(event['body']);
      let bodyDecoded = querystring.decode(decodeURIComponent(event['body']));
      bodyDecoded = querystring.parse(event['body'], null, null,{ decodeURIComponent: gbkDecodeURIComponent });
      console.log('ALL bodyDecoded');
      console.log(bodyDecoded);
      console.log('base 64 decode');
      console.log(base64decodedText);
      console.log('decodeEntities(base64decodedText)');
      console.log(decodeEntities(base64decodedText));
    } else {
      console.log('No base 64 decode needed');
      decodedText = event['body'].replace(removeAttribute + 'text=','');
    }

    console.log('should be good markup:');
    console.log(decodedText);
  } else {
    console.log('body does not exist, see event log');
  }
  const fileName = (typeof bodyDecoded['filename'] === 'string') ? base64Decode(bodyDecoded['filename']) : 'test.pdf'
  console.log('fileName');
  console.log(fileName);

  const html = decodedText;

  let browser = null

  try {
      browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    })
    const page = await browser.newPage()
    page.setContent(html)
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      margin: { top: '1.8cm', right: '1cm', bottom: '1cm', left: '1cm' },
    });
    const response = {
      headers: {
        'Content-type': 'application/pdf',
        'content-disposition': 'attachment; filename=' + fileName,
      },
      statusCode: 200,
      body: pdf.toString('base64'),
      isBase64Encoded: true,
    }
    context.succeed(response)
  } catch (error) {
    console.log('ERROR');
    console.log(error);
    return context.fail(error)
  } finally {
    if (browser !== null) {
      await browser.close()
    }
  }
}

function convertBase64RequestToString(base64Encoded) {
  console.log('convertBase64RequestToString base64Encoded');
  console.log(base64Encoded);
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
