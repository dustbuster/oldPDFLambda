'use strict'
const chromium = require('chrome-aws-lambda')
const pug = require('pug')
const path = require('path')

module.exports.generate_pdf_post_html = async (event, context) => {
  
  console.log('generate_pdf_post_html');
  
  if (typeof event['body'] === 'string') {
    // console.log(event['body']);
    var decodedText = convertBase64RequestToString(event['body']);
    console.log('decodedText');
    console.log(decodedText);
  }
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
      // printBackground: true,
      // displayHeaderFooter: true,
      // margin: { top: '1.8cm', right: '1cm', bottom: '1cm', left: '1cm' },
    })
    console.log(pdf)
    // TODO: Response with PDF (or error if something went wrong )
    const response = {
      headers: {
        'Content-type': 'application/pdf',
        'content-disposition': 'attachment; filename=test.pdf',
      },
      statusCode: 200,
      body: pdf.toString('base64'),
      isBase64Encoded: true,
    }
    context.succeed(response)
  } catch (error) {
    return context.fail(error)
  } finally {
    if (browser !== null) {
      await browser.close()
    }
  }
}

// if (typeof event['body'] === 'string') {
  // let data = event['body'];
  // let buff = Buffer.from(data, 'base64');  
  // let text = buff.toString('utf-8');
//   const pdfContent = decodeURI(text).replace('text=','');
//   console.log(pdfContent);
//   console.log;opg
// }

function convertBase64RequestToString(base64Encoded) {
  let buff = Buffer.from(base64Encoded, 'base64');
  // console.log('buff');
  // console.log(buff);
  let text = buff.toString('utf-8');
  let pdfContent = decodeURI(text).replace('text=','');
  pdfContent = pdfContent.replace('text=','');
  console.log('pdfContent');
  console.log(pdfContent);
  return pdfContent;
}
