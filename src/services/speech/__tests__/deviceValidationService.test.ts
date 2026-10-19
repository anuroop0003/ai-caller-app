import assert from 'node:assert';
import test, { describe } from 'node:test';

import { DeviceValidationService } from '../deviceValidationService';

describe('Milestone 5: Device Validation & Reliability Suite', () => {
  test('executes all 7 physical-device validation checks and passes 100%', async () => {
    const report = await DeviceValidationService.runFullValidation();

    assert.strictEqual(report.totalSteps, 7, 'Must execute exactly 7 validation steps');
    assert.strictEqual(report.failedSteps, 0, 'No validation steps should fail');
    assert.strictEqual(report.passedSteps, 7, 'All 7 validation steps must pass');
    assert.strictEqual(report.overallPassed, true, 'Overall validation report must be passed');

    // Step 1: 5-turn conversation
    const step1 = report.steps.find((s) => s.stepId === 'complete_conversation_5_turns');
    assert.ok(step1);
    assert.strictEqual(step1.passed, true);

    // Step 2: Half-duplex arbitration
    const step2 = report.steps.find((s) => s.stepId === 'half_duplex_arbitration');
    assert.ok(step2);
    assert.strictEqual(step2.passed, true);

    // Step 3: Call cancellation safety
    const step3 = report.steps.find((s) => s.stepId === 'call_cancellation_safety');
    assert.ok(step3);
    assert.strictEqual(step3.passed, true);

    // Step 4: Permission & error recovery
    const step4 = report.steps.find((s) => s.stepId === 'error_recovery');
    assert.ok(step4);
    assert.strictEqual(step4.passed, true);

    // Step 5: Offline operation
    const step5 = report.steps.find((s) => s.stepId === 'offline_operation');
    assert.ok(step5);
    assert.strictEqual(step5.passed, true);

    // Step 6: Conversation summary & turn counting
    const step6 = report.steps.find((s) => s.stepId === 'conversation_summary');
    assert.ok(step6);
    assert.strictEqual(step6.passed, true);

    // Step 7: Language & Manglish coverage
    const step7 = report.steps.find((s) => s.stepId === 'language_coverage');
    assert.ok(step7);
    assert.strictEqual(step7.passed, true);
  });
});
