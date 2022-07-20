import { expect as expectCDK, matchTemplate, MatchStyle } from 'aws-cdk-lib/assert';
import * as cdk from 'aws-cdk-lib/core';
import * as Backend from '../lib/backend-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Backend.BackendStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
