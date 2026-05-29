import * as vscode from 'vscode';

const TRIAL_START_KEY = 'driftguard.trialStart';
const TRIAL_DAYS = 7;

function getTrialStart(context: vscode.ExtensionContext): Date | undefined {
  const stored = context.globalState.get<string>(TRIAL_START_KEY);
  if (stored) {
    return new Date(stored);
  }
  return undefined;
}

function setTrialStart(context: vscode.ExtensionContext, date: Date): void {
  context.globalState.update(TRIAL_START_KEY, date.toISOString());
}

function getLicenseKey(): string {
  const config = vscode.workspace.getConfiguration('driftguard');
  return config.get<string>('licenseKey', '').trim();
}

function hasValidLicense(): boolean {
  const key = getLicenseKey();
  return key.length > 0;
}

function getDaysRemaining(startDate: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return TRIAL_DAYS - diffDays;
}

export function isTrialActive(context: vscode.ExtensionContext): boolean {
  if (hasValidLicense()) {
    return true;
  }

  let startDate = getTrialStart(context);
  if (!startDate) {
    startDate = new Date();
    setTrialStart(context, startDate);
  }

  const daysRemaining = getDaysRemaining(startDate);
  return daysRemaining > 0;
}

export function checkTrialAndNotify(context: vscode.ExtensionContext): void {
  if (hasValidLicense()) {
    return;
  }

  let startDate = getTrialStart(context);
  if (!startDate) {
    startDate = new Date();
    setTrialStart(context, startDate);
    vscode.window.showInformationMessage(
      `DriftGuard trial started. You have ${TRIAL_DAYS} days to evaluate the extension.`,
      'OK'
    );
    return;
  }

  const daysRemaining = getDaysRemaining(startDate);

  if (daysRemaining <= 0) {
    vscode.window.showWarningMessage(
      'Your DriftGuard trial has expired. Please purchase a license to continue using the extension.',
      'Purchase',
      'Later'
    ).then(selection => {
      if (selection === 'Purchase') {
        vscode.env.openExternal(vscode.Uri.parse('https://marketplace.visualstudio.com/items?itemName=CodeMedic.driftguard'));
      }
    });
  } else if (daysRemaining <= 2) {
    vscode.window.showInformationMessage(
      `DriftGuard trial ends in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}. Purchase a license to keep using it.`,
      'Purchase',
      'Later'
    ).then(selection => {
      if (selection === 'Purchase') {
        vscode.env.openExternal(vscode.Uri.parse('https://marketplace.visualstudio.com/items?itemName=CodeMedic.driftguard'));
      }
    });
  }
}

export function assertTrialOrLicense(context: vscode.ExtensionContext): boolean {
  if (hasValidLicense()) {
    return true;
  }

  const startDate = getTrialStart(context);
  if (!startDate) {
    setTrialStart(context, new Date());
    return true;
  }

  const daysRemaining = getDaysRemaining(startDate);
  if (daysRemaining > 0) {
    return true;
  }

  vscode.window.showErrorMessage(
    'DriftGuard trial has expired. Please purchase a license to use this feature.',
    'Purchase'
  ).then(selection => {
    if (selection === 'Purchase') {
      vscode.env.openExternal(vscode.Uri.parse('https://marketplace.visualstudio.com/items?itemName=CodeMedic.driftguard'));
    }
  });

  return false;
}
