# Home
## So what is StressSimple?
It's a stress testing solution for your web applications. It's a simple and easy to use tool that allows you to test your web application's performance under heavy load. 

StressSimple written in [TypeScript](http://typescriptlang.org/) and [Svelte](https://svelte.dev/) and runs on Node.js. 

It's open source and free to use.![GitHub license](https://img.shields.io/github/license/StressSimple/StressSimple)
## How it looks?

![Test Overview](images/ScreenshotOverview.png){: style="height:250px" }![Test Results](images/ScreenshotAudit.png){: style="height:250px" }

## How does it work?
1. **You write a simple script** that defines the test scenario either in TypeScript or Python.
2. **You run the script** against your web application using the StressSimple application.
3. **You get the results** in real-time and can analyze the performance of your web application.
## Getting started
To get started with StressSimple, you can run the application id Docker or install it locally. Check out the [installation guide](installation.md) for more details.

**TL;DR Run** `git clone https://github.com/hananmil/StressSimple.git` and run `npm run compose:up:app` to start the application.

Once you have the application up and running, you can start creating tests and running them against your web application. Check out the [user guide](user-guide.md) for more details on how to use StressSimple.

**TL;DR Use** Go to 'http://localhost:5000' and run one of the sample tests.

Core component of StressSimple is the stress script. It's a simple application, written in either TypeScript or Python, that defines the test scenario and runs the test against your web application. Check out the [user guide](user-guide.md) for more details on how to create your own stress scripts.

*Have a look at the [stress script examples](https://github.com/hananmil/StressSimple/tree/master/backend/templates/bootstrap) to see some sample scripts in action.*


