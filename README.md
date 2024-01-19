# Lemn gScraper

A simple scraping program for `google.com` that use given fingerprint, cookies, avoiding captcha technique.

## Setup

Download or clone this repository.

    $ git clone https://github.com/josephshaaban/gscrapee.git
    $ cd gscrapee
    $ curl https://github.com/Sparticuz/chromium/releases/download/v119.0.2/chromium-v119.0.2-layer.zip

Create new file named `.env` and then provid required environment variables like `.env.example`

**Note: The required credentials are in the file `.env.example`, but this step is demonstrating some security that we can address through development.**

## Usage

### Deployment

```
$ serverless deploy
```

After deploying, you should see output similar to:

```bash
Running "serverless" from node_modules

Deploying lemn-gscrapee to stage dev (us-east-1, "default" provider)
✔ Your AWS account is now integrated into Serverless Framework Observability
✔ Serverless Framework Observability is enabled

✔ Service deployed to stack lemn-gscrapee-dev (115s)

dashboard: https://app.serverless.com/******/apps/***********/lemn-gscrapee/dev/us-east-1
endpoint: GET - https://8ypvkaqdy5.execute-api.us-east-1.amazonaws.com/
functions:
  gscrapee: lemn-gscrapee-dev-gscrapee (70 MB)
layers:
  chromiumtest: arn:aws:lambda:us-east-1:299143158254:layer:chromiumtest:3
```

_Note_: You can use my deployed API, by using `Postman HTTP GET request` or calling the following `cmd` command:
```bash
curl https://xxxxxxx.execute-api.us-east-1.amazonaws.com/
```

### Invocation

After successful deployment, you can call the created application via HTTP:

```bash
curl https://xxxxxxx.execute-api.us-east-1.amazonaws.com/
```

Which should result in response similar to the following:

```json
{
  "pageTitle": "Web3 - Google Search",
  "captchaExists": false,
  "dbInsertionSuccess": true,
  "data": [
    {
      "title": "Web3",
      "link": "https://en.wikipedia.org/wiki/Web3",
      "description": "Web3 is an idea for a new iteration of the World Wide Web which incorporates concepts such as decentralization, blockchain technologies, and token-based ...",
      "sourceName": "Wikipedia",
      "_id": "65a9e94abcb68848fffbd3c8"
    },
    ...,
    {
      "title": "What Is Web3?",
      "link": "https://hbr.org/2022/05/what-is-web3",
      "description": "May 10, 2022 — Put very simply, Web3 is an extension of cryptocurrency, using blockchain in new ways to new ends. A blockchain can store the number of tokens ...",
      "sourceName": "Harvard Business Review",
      "_id": "65a9e94abcb68848fffbd3c9"
    }
  ]
}
```

## Checking stored data
Simply, you can use my temperory Atlas cluster through the required credentials in the file `.env.example`