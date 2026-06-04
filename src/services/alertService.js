'use strict';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Calcule le nombre de jours entiers entre referenceDate et une date cible.
function daysUntil(targetIso, referenceDate) {
  const ref = referenceDate instanceof Date ? referenceDate : new Date(referenceDate);
  const target = new Date(targetIso);
  return Math.ceil((target.getTime() - ref.getTime()) / MS_PER_DAY);
}

// Genere les alertes pour une liste de medicaments a partir d'une date de reference.
// referenceDate : objet Date ou chaine ISO (jamais l'horloge systeme implicite).
function generateAlerts(medications, referenceDate) {
  const ref = referenceDate instanceof Date ? referenceDate : new Date(referenceDate);
  const alerts = [];

  for (const med of medications) {
    // Alerte de reassort.
    if (med.stock <= med.threshold) {
      alerts.push({
        id: 'alert-' + med.id + '-restock',
        type: 'restock',
        level: 'warning',
        medicationId: med.id,
        medicationName: med.name,
        message: `Stock bas pour ${med.name} (${med.stock} <= seuil ${med.threshold})`,
        createdAt: ref.toISOString(),
        acknowledged: false,
      });
    }

    // Alerte de peremption.
    if (med.expiresAt) {
      const days = daysUntil(med.expiresAt, ref);
      let level = null;
      if (days <= 7) {
        level = 'critical';
      } else if (days <= 30) {
        level = 'warning';
      }
      if (level) {
        alerts.push({
          id: 'alert-' + med.id + '-expiry',
          type: 'expiry',
          level,
          medicationId: med.id,
          medicationName: med.name,
          message: `Peremption proche pour ${med.name} (${days} jour(s))`,
          createdAt: ref.toISOString(),
          acknowledged: false,
        });
      }
    }
  }

  return alerts;
}

module.exports = { generateAlerts, daysUntil };
