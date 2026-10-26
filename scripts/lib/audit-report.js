/** @typedef {'pass' | 'warn' | 'fail'} AuditStatus */
/** @typedef {'good' | 'needs_improvement' | 'poor'} CwvRating */

/**
 * @typedef {Object} AuditFinding
 * @property {string} id
 * @property {string} category
 * @property {string} title
 * @property {AuditStatus} status
 * @property {CwvRating} [rating]
 * @property {string} detail
 * @property {string} [recommendation]
 * @property {string} [reference]
 */

const STATUS_ICON = {
  pass: '✓',
  warn: '⚠',
  fail: '✗',
};

const RATING_LABEL = {
  good: 'Good',
  needs_improvement: 'Needs improvement',
  poor: 'Poor',
};

/**
 * @param {AuditFinding[]} findings
 */
export function printAuditSection(title, findings) {
  console.log(`\n${title}`);
  console.log('-'.repeat(title.length));

  for (const finding of findings) {
    const icon = STATUS_ICON[finding.status];
    const rating = finding.rating ? ` [${RATING_LABEL[finding.rating]}]` : '';
    console.log(`${icon} ${finding.title}${rating}`);
    console.log(`  ${finding.detail}`);
    if (finding.recommendation) {
      console.log(`  → ${finding.recommendation}`);
    }
  }
}

/**
 * @param {AuditFinding[]} findings
 */
export function summarizeFindings(findings) {
  return {
    pass: findings.filter((f) => f.status === 'pass').length,
    warn: findings.filter((f) => f.status === 'warn').length,
    fail: findings.filter((f) => f.status === 'fail').length,
  };
}

/**
 * @param {AuditFinding[]} findings
 */
export function hasCriticalFailures(findings) {
  return findings.some((f) => f.status === 'fail');
}
