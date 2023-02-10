module.exports.generate_pdf_post_html = async (event, context) => {
  const body = event['body'];
  if (event['isBase64Encoded'] === true) {
      let decodedTextBody = convertBase64RequestToString(body);
      var urlObjectPathname = url.parse(decodedTextBody, true).pathname;
      const postBody = urlObjectPathname.split('&text=');
      var filename = decodeURIComponent(postBody[0]).split('filename=').pop();
      var decodedHTML = decodeURIComponent(postBody[1]);
      var rawHTML = decodedHTML.replace(/\+/g, " ");
  }

  if (typeof rawHTML !== 'string') {
      console.log('EARLY BAIL OUT!');
      return context.logStreamName;
  }

  let browser = null;
  let pdf = null;

  try {
      browser = await puppeteer.launch({});
      const page = await browser.newPage();

      await page.setContent(rawHTML, {
        waitUntil: "load",
      });

      pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      margin: {
          top: 40,
          right: 0,
          bottom: 40,
          left: 0,
      }
      });
  } finally {
      if (browser !== null) {
      await browser.close();
      }
  }
  return {
      headers: {
      'Content-type': 'application/pdf',
      'content-disposition': 'attachment; filename=' + filename
      },
      statusCode: 200,
      body: pdf.toString('base64'),
      isBase64Encoded: true
  }
}
