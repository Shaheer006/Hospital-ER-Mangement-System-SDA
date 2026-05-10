import React, { useState } from "react";
import { InventoryItem, Alert } from "../../types";

interface InventoryPageProps {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  addAlert: (a: Omit<Alert, 'ts'>) => void;
}

export function InventoryPage({ inventory, setInventory, addAlert }: InventoryPageProps) {
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editVal, setEditVal] = useState<string | number>("");

  const setStock = (key: string, val: string | number) => {
    const n = Math.max(0, parseInt(val as string) || 0);
    setInventory(prev => prev.map(i => i.key === key ? { ...i, stock: n } : i));
    addAlert({ type: "info", text: `${key} stock updated to ${n}` });
    setEditKey(null);
  };
  const adjust = (key: string, delta: number) => {
    setInventory(prev => prev.map(i => i.key === key ? { ...i, stock: Math.max(0, i.stock + delta) } : i));
  };

  const totalValue = inventory.reduce((s, i) => s + i.stock * i.dailyCost, 0);

  return (
    <div>
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <div className="card" style={{ flex: 1 }}>
          <div className="card-title">Equipment Types</div>
          <div className="card-value accent">{inventory.length}</div>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <div className="card-title">Total Units</div>
          <div className="card-value">{inventory.reduce((s,i)=>s+i.stock,0)}</div>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <div className="card-title">Items Out of Stock</div>
          <div className="card-value red">{inventory.filter(i=>i.stock===0).length}</div>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <div className="card-title">Daily Billing Potential</div>
          <div className="card-value amber">${totalValue.toLocaleString()}</div>
        </div>
      </div>

      <div className="section-header">
        <div>
          <div className="section-title">Inventory Control</div>
          <div className="section-sub">Stock levels here directly gate the Decorator pattern on the ER Floor</div>
        </div>
      </div>

      <div className="grid-3" style={{ gap: 16 }}>
        {inventory.map(item => {
          const pct = Math.min(100, (item.stock / 10) * 100);
          const stockClass = item.stock === 0 ? "zero" : item.stock <= 2 ? "low" : "ok";
          return (
            <div className="inv-card" key={item.key}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ fontSize: 28 }}>{item.icon}</div>
                <div>
                  <div className="inv-name">{item.label}</div>
                  <div className="inv-price">${item.dailyCost}/day per unit</div>
                </div>
              </div>
              <div className={`inv-stock ${stockClass}`}>{item.stock} <span style={{ fontSize: 14, fontWeight: 400 }}>units</span></div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${pct}%`, background: item.stock === 0 ? "var(--red)" : item.stock <= 2 ? "var(--amber)" : "var(--green)" }} />
              </div>
              <div className="inv-controls">
                <button className="btn btn-sm danger" onClick={() => adjust(item.key, -1)} disabled={item.stock === 0}>−</button>
                {editKey === item.key ? (
                  <>
                    <input className="form-input" type="number" value={editVal} onChange={e=>setEditVal(e.target.value)} style={{ flex: 1, padding: "4px 8px", fontSize: 12 }} autoFocus onKeyDown={e => e.key==="Enter" && setStock(item.key, editVal)} />
                    <button className="btn btn-sm success" onClick={() => setStock(item.key, editVal)}>✓</button>
                  </>
                ) : (
                  <button className="btn btn-sm" style={{ flex: 1 }} onClick={() => { setEditKey(item.key); setEditVal(item.stock); }}>Set Stock</button>
                )}
                <button className="btn btn-sm success" onClick={() => adjust(item.key, 1)}>+</button>
              </div>
              {item.stock === 0 && (
                <div style={{ marginTop: 8, fontSize: 11, color: "var(--red)", fontFamily: "var(--font-mono)", background: "var(--red-dim)", padding: "4px 8px", borderRadius: 4 }}>
                  ⚠ Decorator button DISABLED on ER Floor
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
