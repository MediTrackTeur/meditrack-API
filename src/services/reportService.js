'use strict';

// Genere un export CSV du stock courant.
function toStockCsv(medications) {
  const header = 'nom,DCI,forme,stock,seuil,peremption,fournisseur';
  const lines = medications.map((med) =>
    [
      med.name,
      med.dci,
      med.form,
      med.stock,
      med.threshold,
      med.expiresAt,
      med.supplierId || '',
    ].join(',')
  );
  return [header, ...lines].join('\n');
}

module.exports = { toStockCsv };
