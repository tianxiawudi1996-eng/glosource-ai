import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildProductionRemediationApprovalPacket,
  readProductionRemediationPacketInput,
  type ProductionRemediationPreferences,
} from './build-production-remediation-approval-packet';

type PreflightStatus =
  | 'awaiting_preferences'
  | 'handoff_ready'
  | 'stale'
  | 'invalid'
  | 'not_required';

type ProposedActionCode =
  | 'SET_AUTH_TRUST_HOST_TRUE'
  | 'HUMAN_ENTER_DATAGO_SECRET'
  | 'CONFIGURE_INDEPENDENT_REVIEWER_PROTECTION'
  | 'CONFIGURE_CUSTOM_FEATURE_REF_POLICY'
  | 'CONFIGURE_DEDICATED_RELEASE_BRANCH_POLICY';

type ApprovalPacket = ReturnType<typeof buildProductionRemediationApprovalPacket>;
type ApprovalPacketStatus = ApprovalPacket['packetStatus'];
type PreflightInput = Parameters<typeof buildProductionRemediationApprovalPacket>[0];

function mapPreflightStatus(packetStatus: ApprovalPacketStatus): PreflightStatus {
  switch (packetStatus) {
    case 'awaiting_decisions':
      return 'awaiting_preferences';
    case 'preferences_recorded':
      return 'handoff_ready';
    case 'stale':
      return 'stale';
    case 'not_required':
      return 'not_required';
    case 'invalid':
      return 'invalid';
  }
}

function mapActionCodes(
  preferences: ProductionRemediationPreferences['preferences'],
): ProposedActionCode[] {
  const actions: ProposedActionCode[] = [];
  if (preferences.authTrustHost === 'set_true_preference') {
    actions.push('SET_AUTH_TRUST_HOST_TRUE');
  }
  if (preferences.datagoSecret === 'secret_available_for_human_entry') {
    actions.push('HUMAN_ENTER_DATAGO_SECRET');
  }
  if (preferences.requiredReviewer === 'require_independent_reviewer') {
    actions.push('CONFIGURE_INDEPENDENT_REVIEWER_PROTECTION');
  }
  if (preferences.branchPolicy === 'custom_feature_ref_policy') {
    actions.push('CONFIGURE_CUSTOM_FEATURE_REF_POLICY');
  } else if (preferences.branchPolicy === 'dedicated_release_branch') {
    actions.push('CONFIGURE_DEDICATED_RELEASE_BRANCH_POLICY');
  }
  return actions;
}

export function buildProductionRemediationExecutionPreflight(
  input: PreflightInput,
) {
  const packet = buildProductionRemediationApprovalPacket(input);
  const preflightStatus = mapPreflightStatus(packet.packetStatus);
  const proposedActionCodes = preflightStatus === 'handoff_ready'
    && packet.preferences
    ? mapActionCodes(packet.preferences)
    : [];

  return {
    preflightStatus,
    readinessStatus: packet.readinessStatus,
    contextDigest: packet.contextDigest,
    decisionBlockers: packet.decisionBlockers,
    proposedActionCodes,
    safety: {
      mutationStatus: packet.safety.mutationStatus,
      executionApprovalPresent: false as const,
      providerMutationAuthorized: packet.safety.providerMutationAuthorized,
      commandsIncluded: packet.safety.executionCommandsIncluded,
      providerPayloadsIncluded: false as const,
      secretValuesIncluded: packet.safety.secretValuesIncluded,
      reviewerIdentitiesIncluded: packet.safety.reviewerIdentitiesIncluded,
      exactBranchPatternsIncluded: false as const,
      postChangeAuditRequired: packet.safety.postChangeAuditRequired,
    },
  };
}

async function runCli() {
  const preferencesPath = process.argv[2];
  const auditPath = process.argv[3];
  if (!preferencesPath || !auditPath) {
    throw new Error('Preference and sanitized audit file paths are required.');
  }
  const preflight = buildProductionRemediationExecutionPreflight(
    await readProductionRemediationPacketInput(preferencesPath, auditPath),
  );
  console.log(JSON.stringify(preflight, null, 2));
  if (preflight.preflightStatus !== 'not_required') {
    process.exitCode = 1;
  }
}

const currentFile = resolve(fileURLToPath(import.meta.url));
const entryFile = process.argv[1] ? resolve(process.argv[1]) : '';
if (currentFile === entryFile) {
  runCli().catch(() => {
    console.error('Production remediation execution preflight could not be built.');
    process.exitCode = 1;
  });
}
