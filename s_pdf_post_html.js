
var serverlessSDK = require('./serverless_sdk/index.js');
serverlessSDK = new serverlessSDK({
  orgId: 'dustbuster',
  applicationName: 'puppet-pdf',
  appUid: '57HVxF6PRBjzrxt9N3',
  orgUid: '520d3f44-dd08-416d-bc8d-ea886e4ddf92',
  deploymentUid: '46682e71-e46c-4ec7-8e0e-2979e5d67928',
  serviceName: 'puppet-pdf',
  shouldLogMeta: true,
  shouldCompressLogs: true,
  disableAwsSpans: false,
  disableHttpSpans: false,
  stageName: 'development',
  serverlessPlatformStage: 'prod',
  devModeEnabled: false,
  accessKey: null,
  pluginVersion: '5.5.4',
  disableFrameworksInstrumentation: false
});

const handlerWrapperArgs = { functionName: 'puppet-pdf-development-pdf-post-html', timeout: 6 };

try {
  const userHandler = require('./pdf.js');
  module.exports.handler = serverlessSDK.handler(userHandler.generate_pdf_post_html, handlerWrapperArgs);
} catch (error) {
  module.exports.handler = serverlessSDK.handler(() => { throw error }, handlerWrapperArgs);
}