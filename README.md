# AWS lambda PDF generator example

This is a PDF generator. 
This uses node 18. As a WHOLE lot of node packages have just been abandoned. 
AWS lambda with [chrome-aws-lambda](https://www.npmjs.com/package/chrome-aws-lambda), [serverless](https://serverless.com/), [pug](https://pugjs.org/) and [knex](https://knexjs.org/). This is the msot succesful verison yet, using chromium to generate the page. 

# Setup

1. Initialize serverless either inside project or globally (after installing package globally) with

```
serverless
```

2. This pug template should be empty, so we can push whatever we need into it. 
3. Deploy with:

```
sls deploy
```
