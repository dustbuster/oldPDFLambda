'use strict'
const chromium = require('chrome-aws-lambda')
const url = require('url');
const pug = require('pug');
const puppeteer = require('puppeteer');

module.exports.generate_pdf_post_html = async (event, context) => {
  (async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    await browser.close();
  })();
  const body = event['body'];
  if (event['isBase64Encoded'] === true) {
    let decodedTextBody = convertBase64RequestToString(body);
    var urlObjectPathname = url.parse(decodedTextBody, true).pathname;
    const postBody = urlObjectPathname.split('&text=');

    var roughFileName = decodeURIComponent(postBody[0]);
    var filename = roughFileName.split('filename=').pop();
    var decodedHTML = decodeURIComponent(postBody[1]);
    var rawHTML = decodedHTML.replace(/\+/g, " ");
  }

  if (typeof rawHTML !== 'string') {
    console.log('EARLY BAIL OUT!');
    return context.logStreamName;
  }

  let browser = null
  const filter = {
    html: rawHTML
  }

  const template = pug.compileFile('./src/template.pug');
  let htmldoc = template({ filter });

  try {
      browser = await chromium.puppeteer.launch({
      args: [
        ...chromium.args,
        "--hide-scrollbars", 
        "--no-sandbox",
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: 'node_modules/chrome-aws-lambda/bin/chromium.br',
      headless: false,
      ignoreDefaultArgs: ["--disable-extensions"],
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
    console.log('success response');
    context.succeed(response);
  } catch (error) {
    console.error(error)
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

