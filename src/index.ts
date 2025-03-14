import { AirtopClient } from "@airtop/sdk";
import dotenv from 'dotenv';
import { confirm, select } from "@inquirer/prompts";
dotenv.config();

const EXTENSION_IDS = [
  "dknlfmjaanfblgfdfebhijalfmhmjjjo", // NopeCHA
];

const PROFILE_NAME = "extension-demo-2";
const CAPTCHA_URL = "https://www.google.com/recaptcha/api2/demo";

/**
 * Configure the extension for the first time. This is a one-time setup that needs to be done only once.
 */
const configureExtesion = async (client: AirtopClient) => {
  const session = await client.sessions.create({
    configuration: {
      extensionIds: EXTENSION_IDS,
      profileName: PROFILE_NAME,
    }
  });

  const window = await client.windows.create(session.data.id);

  const { data: { liveViewUrl } } = await client.windows.getWindowInfo(session.data.id, window.data.windowId, {
    includeNavigationBar: true
  });
  console.log("Live view URL for configuration:", liveViewUrl);

  await confirm({
    message: "Ready to save configuration?"
  });

  await client.sessions.saveProfileOnTermination(session.data.id, PROFILE_NAME);
  await client.sessions.terminate(session.data.id);
}

/**
 * Solve a CAPTCHA using the extension. This function loads the ReCAPTCHA demo page and monitors for the CAPTCHA to be solved.
 * Once it's solved, it clicks the Submit button.
 */
const solveCaptcha = async (client: AirtopClient) => {
  const session = await client.sessions.create({
    configuration: {
      extensionIds: EXTENSION_IDS,
      profileName: PROFILE_NAME,
      proxy: true
    }
  });

  const window = await client.windows.create(session.data.id, {
    url: CAPTCHA_URL
  });

  const { data: { liveViewUrl } } = await client.windows.getWindowInfo(session.data.id, window.data.windowId, {
    includeNavigationBar: true
  });
  console.log("Live view URL for solving captcha. Open this URL in your browser to see the extension in action:\n", liveViewUrl);
  console.log("Monitoring for the Captcha to be solved...");

  const monitor = await client.windows.monitor(session.data.id, window.data.windowId, {
    configuration: {
      interval: {
        intervalSeconds: 5,
        timeoutSeconds: 60
      },
      includeVisualAnalysis: "enabled"
    },
    costThresholdCredits: 1000,
    condition: "The captcha on this page has been solved."
  });

  let conditionMet = false;
  if (monitor.data.modelResponse || !JSON.parse(monitor.data.modelResponse).conditionMet) {
    try {
      conditionMet = JSON.parse(monitor.data.modelResponse).conditionMet;
    } catch (error) {
      console.error("Error parsing monitor response:", error);
    }
  }

  if (!conditionMet) {
    throw new Error("Captcha was not solved");
  }

  console.log("Captcha solved Clicking the Submit button...");
  await client.windows.click(session.data.id, window.data.windowId, {
    elementDescription: "The Submit button"
  });

}

const main = async () => {
  const apiKey = process.env.AIRTOP_API_KEY;
  if (!apiKey) {
    throw new Error("AIRTOP_API_KEY is not set");
  }

  const client = new AirtopClient({ apiKey });

  const shouldConfigure = await confirm({
    message: "Would you like to configure the extension?"
  });

  if (shouldConfigure) {
    console.log("Configuring extension...");
    await configureExtesion(client);
  }

  while (true) {
    const action = await select({
      message: "What would you like to do?",
      choices: [
        { name: "Solve a Captcha", value: "solve_captcha" },
        { name: "Done", value: "done" }
      ]
    });

    if (action === "done") {
      break;
    }

    switch (action) {
      case "solve_captcha":
        console.log("Loading captcha example...");
        await solveCaptcha(client);
        break;
    }
  }

  console.log("Done");
}
main();
