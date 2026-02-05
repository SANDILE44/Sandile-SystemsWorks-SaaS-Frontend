import { runFormula } from './formulaRunner.js';
import agriculture from '../../data/primary/agriculture.json';

export function runCalculator({ calculatorId, userPlan, input }) {
  const calculator = agriculture.industry.calculators.find(
    (c) => c.id === calculatorId
  );

  if (!calculator) throw new Error('Calculator not found');

  // Tier enforcement
  if (!calculator.planAccess.calculate.includes(userPlan)) {
    throw new Error('Plan not allowed');
  }

  // Run formula
  const rawResult = runFormula(calculator.formula.code, input);

  // Filter outputs for Tier 1
  return filterForPlan(rawResult, userPlan);
}

function filterForPlan(result, plan) {
  if (plan !== 'tier1') return result;

  const hidden = ['roiPct', 'annualNetProfit', 'monthlyNetProfit'];

  return Object.fromEntries(
    Object.entries(result).filter(([key]) => !hidden.includes(key))
  );
}
