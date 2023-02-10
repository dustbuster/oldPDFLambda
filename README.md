# AWS lambda PDF generator example. 

This uses POST instead of GET, and it's pretty specific to an exact request body. 
I never got this to work right, but this is based off of [ARautio/aws-lambda-pdf-generator-puppeteer](https://github.com/ARautio/aws-lambda-pdf-generator-puppeteer) The issue i think is that the request was returning before the PDF gen was complete. asyc junk. 

This is a PDF generator. 
This TRIED node 18. I settled for nodejs16.x A whole lot issues with missing files. 

AWS lambda with [chrome-aws-lambda](https://www.npmjs.com/package/chrome-aws-lambda), [URL](https://nodejs.org/api/url.html), [serverless](https://serverless.com/), and [pug](https://pugjs.org/). This is the msot succesful verison yet, using chromium to generate the page. 

# Setup

1. Initialize serverless either inside project or globally (after installing package globally) with

```
serverless
```
2. Deploy with:

```
sls deploy
```
3. Request must be: 
```
{
  "filename": /test.pdf,
  "text": <HTML_base64Encoded>
}
```
