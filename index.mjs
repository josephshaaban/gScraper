import * as puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { getRandomInt } from "./utils.mjs";
import { connectToDatabase } from "./conn.mjs";

// Get an instance of our database
const db = await connectToDatabase();

export const handler = async (event, context) => {
  /* 
    By default, the callback waits until the runtime event loop is
    empty before freezing the process and returning the results to
    the caller. Setting this property to false requests that AWS Lambda
    freeze the process soon after the callback is invoked, even if there
    are events in the event loop. AWS Lambda will freeze the process, 
    any state data, and the events in the event loop. Any remaining events
    in the event loop are processed when the Lambda function is next
    invoked, if AWS Lambda chooses to use the frozen process.
  */
  context.callbackWaitsForEmptyEventLoop = false;

  var gData, pageTitle, isCaptcha;
  const loadImages = false;
  try {
    // Setup puppeteer browser
    const browser = await puppeteer.launch({
      args: [...chromium.args, "--no-sandbox"],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    // Serialize final google URL which initialized with search query
    const searchQuery = "Web3";
    const params = {
      rpcids: "HoAMBc",
      "source-path": "/search",
      "f.sid": -getRandomInt(0, 9e10),
      bl: "boq_visualfrontendserver_20220505.05_p0",
      hl: "en",
      authuser: 0,
      _reqid: -getRandomInt(0, 9e5),
    };
    params.q = searchQuery;
    const query = Object.entries(params)
      .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
      .join("&");
    const url = `https://www.google.com/search?${query}`;

    // Start new page
    const page = await browser.newPage();

    // Custom user agent
    // TODO: randomize selecting user agent
    const userAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/119.0.0.0 Safari/537.36";
    await page.setUserAgent(userAgent);

    // Custom viewport
    await page.setViewport({
      width: 1920 + Math.floor(Math.random() * 100),
      height: 3000 + Math.floor(Math.random() * 100),
      deviceScaleFactor: 1,
      hasTouch: false,
      isLandscape: false,
      isMobile: false,
    });

    // Enable JavaScript on the page
    await page.setJavaScriptEnabled(true);
    // Set navigation time to 0 milliseconds
    await page.setDefaultNavigationTimeout(0);

    // Avoid loading un-necessary
    if (!loadImages) {
      await page.setRequestInterception(true);
      page.on("request", (req) => {
        if (
          req.resourceType() == "stylesheet" ||
          req.resourceType() == "font" ||
          req.resourceType() == "image"
        ) {
          req.abort();
        } else {
          req.continue();
        }
      });
    }

    // Set cookies to be more real agent
    // await page.setCookie({
    //   AEC: "Ae3NU9NQYeRRnnil4weJYhCWDSQs2agvRC6Z8Oz3KFmsGb_3CKNNlySktw",
    //   "1P_JAR": "2024-01-19-00",
    //   NID: "=511=kwHtkWnf6R-exFh8U7KqvQwzQZuUbaOoqeK6VxE_UkCpRnSjW0jXNlRoM6W94eQ0J8ihGvjabx7oFFlwRNvdgXp7k74xjaLAT_DyVPSX_5HR_qdsIOgEez0PlVd0wORUCdZY2RKcmm6jQWoT8ettkUP5yzeOIHjBXPbKVruAk9D5-pUSPA40DZ3pXvw8A0yHMme5SQC1Rw",
    // });

    // Pass webdriver check
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => false,
      });
    });

    // Pass chrome check
    await page.evaluateOnNewDocument(() => {
      window.chrome = {
        runtime: {},
      };
    });

    // Pass plugins check
    await page.evaluateOnNewDocument(() => {
      const originalQuery = window.navigator.permissions.query;
      return (window.navigator.permissions.query = (parameters) =>
        parameters.name === "notifications"
          ? Promise.resolve({ state: Notification.permission })
          : originalQuery(parameters));
    });

    // Overwrite the `plugins` property to use a custom getter.
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "plugins", {
        // This just needs to have `length > 0` for the current test,
        // but we could mock the plugins too if necessary.
        get: () => [1, 2, 3, 4, 5],
      });
    });

    // Overwrite the `plugins` property to use a custom getter.
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "languages", {
        get: () => ["en-US", "en"],
      });
    });

    await page.goto(url, { waitUntil: "networkidle0" });

    // Check for captch checkbox
    // See https://stackoverflow.com/a/65721000
    const frame = await page.frames().find((f) => f.name().startsWith("a-"));
    const captchaCheckbox = await frame?.waitForSelector(
      "div.recaptcha-checkbox-border"
    );
    isCaptcha = captchaCheckbox ? true : false;

    pageTitle = await page.title();

    // Crowling the google page and scrape search data
    var gData = await page.evaluate(() => {
      var data = [];

      var titles = document.querySelectorAll("div.MjjYud");
      console.log(titles);

      titles.forEach((node) => {
        var link = node
          .querySelector('div>div[class="kb0PBd cvP2Ce jGGQ5e"]>div>div>span>a')
          ?.getAttribute("href");
        var sourceName = node.querySelector(
          'div>div[class="kb0PBd cvP2Ce jGGQ5e"]>div>div>span>a>div>div>span'
        )?.textContent;

        var title = node.querySelector(
          'div>div[class="kb0PBd cvP2Ce jGGQ5e"]>div>div>span>a>h3'
        )?.textContent;
        var description = node.querySelector(
          'div>div[class="kb0PBd cvP2Ce"]'
        )?.textContent;

        if (title && link && description && sourceName) {
          data.push({
            title,
            link,
            description,
            sourceName,
          });
        }
      });

      return data;
    });

    await page.close();

    await browser.close();
  } catch (error) {
    console.error(error);
  }

  const result = await db.collection("gscrapee").insertMany(gData);
  const dbInsertionSuccess = result ? true : false;

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        pageTitle,
        captchaExists: isCaptcha,
        dbInsertionSuccess,
        data: gData,
        // input: event,
      },
      null,
      2
    ),
  };
};
