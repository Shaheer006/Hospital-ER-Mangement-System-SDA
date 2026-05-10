import { Bed, InventoryItem } from "../../types";
import { EQUIPMENT_CATALOG } from "../../constants";

export function decorateBed(bed: Bed, equipmentKey: string, inventoryItems: InventoryItem[]): Bed | null {
  const eq = EQUIPMENT_CATALOG.find(e => e.key === equipmentKey);
  if (!eq) return bed;
  const invItem = inventoryItems.find(i => i.key === equipmentKey);
  if (!invItem || invItem.stock <= 0) return null; // stock depleted
  // Return new decorated bed (immutable pattern)
  return {
    ...bed,
    decorators: [...bed.decorators, equipmentKey],
    billingTotal: (bed.billingTotal || bed.billingBase) + eq.dailyCost,
  };
}

export function removeDecorator(bed: Bed, equipmentKey: string, inventoryItems: InventoryItem[]): Bed {
  const eq = EQUIPMENT_CATALOG.find(e => e.key === equipmentKey);
  if (!eq) return bed;
  return {
    ...bed,
    decorators: bed.decorators.filter(d => d !== equipmentKey),
    billingTotal: (bed.billingTotal || bed.billingBase) - eq.dailyCost,
  };
}

export function getBedBilling(bed: Bed): number {
  const base = bed.billingBase || 500;
  const extra = (bed.decorators || []).reduce((sum, key) => {
    const eq = EQUIPMENT_CATALOG.find(e => e.key === key);
    return sum + (eq ? eq.dailyCost : 0);
  }, 0);
  return base + extra;
}
