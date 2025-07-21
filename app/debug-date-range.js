// Debug da função getDateRange

function getDateRange(periodValue) {
  if (periodValue === 'all') {
    return {};
  }

  const [yearStr, monthStr] = periodValue.split('-');
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);

  console.log(`\n🔍 DEBUG: periodValue=${periodValue}`);
  console.log(`🔍 DEBUG: yearStr=${yearStr}, monthStr=${monthStr}`);
  console.log(`🔍 DEBUG: year=${year}, month=${month}`);

  // Primeiro dia do mês
  const startDate = new Date(year, month, 1);
  // Último dia do mês
  const endDate = new Date(year, month + 1, 0);

  console.log(`🔍 DEBUG: startDate=${startDate.toISOString()}`);
  console.log(`🔍 DEBUG: endDate=${endDate.toISOString()}`);

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  console.log(`🔍 DEBUG: startDateStr=${startDateStr}`);
  console.log(`🔍 DEBUG: endDateStr=${endDateStr}`);

  return {
    startDate: startDateStr,
    endDate: endDateStr
  };
}

// Testar com os casos problemáticos
console.log('=== DEBUG DA FUNÇÃO getDateRange ===\n');

// Teste 1: Maio 2025 (deveria ser 2025-04)
console.log('--- TESTE 1: Maio 2025 (2025-04) ---');
const maio = getDateRange('2025-04');
console.log(`Resultado: ${maio.startDate} até ${maio.endDate}`);

// Teste 2: Junho 2025 (deveria ser 2025-05)
console.log('\n--- TESTE 2: Junho 2025 (2025-05) ---');
const junho = getDateRange('2025-05');
console.log(`Resultado: ${junho.startDate} até ${junho.endDate}`);

// Teste 3: Julho 2025 (deveria ser 2025-06)
console.log('\n--- TESTE 3: Julho 2025 (2025-06) ---');
const julho = getDateRange('2025-06');
console.log(`Resultado: ${julho.startDate} até ${julho.endDate}`);

// Teste 4: Agosto 2025 (deveria ser 2025-07)
console.log('\n--- TESTE 4: Agosto 2025 (2025-07) ---');
const agosto = getDateRange('2025-07');
console.log(`Resultado: ${agosto.startDate} até ${agosto.endDate}`);

console.log('\n=== FIM DO DEBUG ==='); 