'use strict'
const chromium = require('chrome-aws-lambda')

module.exports.generate_pdf_post_html = async (event, context) => {
  console.log('generate_pdf_post_html');
  console.log('event');
  console.log(event);

  console.log('context');
  console.log(context);
  
  if (typeof event['body'] === 'string') {
    var decodedText = convertBase64RequestToString(event['body']);
  } else {
    console.log('body does not exist, see event log');
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
      printBackground: true,
      // displayHeaderFooter: true,
      margin: { top: '1.8cm', right: '1cm', bottom: '1cm', left: '1cm' },
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

function convertBase64RequestToString(base64Encoded) {
  let buff = Buffer.from(base64Encoded, 'base64');
  // console.log('Buffer.from(base64Encoded, "base64")');
  // console.log(buff);
  let text = buff.toString('utf-8');
  let pdfContent = decodeURI(text).replace('text=','');
  pdfContent = pdfContent.replace('text=','');
  console.log('final decoding pdfContent');
  console.log(pdfContent);
  return pdfContent;
}
