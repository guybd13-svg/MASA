import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, CreditCard } from 'lucide-react';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface BudgetScreenProps {
  expenses: Expense[];
  budgetLimit: number;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
  onUpdateBudgetLimit: (limit: number) => void;
}

const CATEGORIES = [
  { name: 'אוכל', color: 'var(--accent-blue)', eng: 'Food' },
  { name: 'תחבורה', color: 'var(--accent-pink)', eng: 'Transport' },
  { name: 'לינה', color: 'var(--accent-purple)', eng: 'Lodging' },
  { name: 'אטרקציות', color: 'var(--accent-green)', eng: 'Activities' },
  { name: 'שונות', color: 'var(--text-muted)', eng: 'Other' },
];

export const BudgetScreen: React.FC<BudgetScreenProps> = ({
  expenses,
  budgetLimit,
  onAddExpense,
  onDeleteExpense,
  onUpdateBudgetLimit,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudgetVal, setNewBudgetVal] = useState(budgetLimit.toString());

  // Form State
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('אוכל');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const balance = budgetLimit - totalSpent;
  const isOverspent = balance < 0;
  const spentPercentage = Math.min((totalSpent / budgetLimit) * 100, 100);

  // Group expenses by category for chart
  const categoryTotals = CATEGORIES.reduce((acc, cat) => {
    const total = expenses
      .filter((e) => e.category === cat.name)
      .reduce((sum, e) => sum + e.amount, 0);
    acc[cat.name] = total;
    return acc;
  }, {} as Record<string, number>);

  const handleSaveBudgetLimit = () => {
    const val = parseFloat(newBudgetVal);
    if (!isNaN(val) && val > 0) {
      onUpdateBudgetLimit(val);
      setIsEditingBudget(false);
    }
  };

  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    onAddExpense({
      amount: parsedAmount,
      category,
      description: description || category,
      date: new Date(date).toLocaleDateString('he-IL'),
    });

    // Reset Form
    setAmount('');
    setDescription('');
    setIsFormOpen(false);
  };

  // Donut chart calculations
  const renderDonutChart = () => {
    if (totalSpent === 0) {
      return (
        <svg width="120" height="120" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
        </svg>
      );
    }

    let accumulatedPercentage = 0;
    return (
      <svg width="120" height="120" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3.5" />
        {CATEGORIES.map((cat) => {
          const catTotal = categoryTotals[cat.name] || 0;
          if (catTotal === 0) return null;

          const percentage = (catTotal / totalSpent) * 100;
          const strokeDash = `${percentage} ${100 - percentage}`;
          const strokeOffset = 100 - accumulatedPercentage;
          accumulatedPercentage += percentage;

          return (
            <circle
              key={cat.name}
              cx="18"
              cy="18"
              r="15.915"
              fill="none"
              stroke={cat.color}
              strokeWidth="4"
              strokeDasharray={strokeDash}
              strokeDashoffset={strokeOffset}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div className="screen-content">
      {/* Title */}
      <div className="app-header">
        <h2 className="app-title">תקציב והוצאות</h2>
        <button className="btn-add-floating" onClick={() => setIsFormOpen(true)}>
          <Plus size={16} style={{ marginLeft: '4px' }} />
          <span>הוסף הוצאה</span>
        </button>
      </div>

      {/* Grid Container */}
      <div className="budget-grid">
        
        {/* Right Column: Transactions History */}
        <div className="budget-right-column">
          <div className="section-title-row">
            <h3 className="section-title">היסטוריית הוצאות</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{expenses.length} עסקאות</span>
          </div>

          <div className="transactions-list">
            {expenses.map((expense) => {
              const catInfo = CATEGORIES.find((c) => c.name === expense.category);
              return (
                <div className="transaction-item" key={expense.id}>
                  <div className="trans-right">
                    <button className="btn-delete-trans" onClick={() => onDeleteExpense(expense.id)}>
                      <Trash2 size={14} />
                    </button>
                    <div style={{ textAlign: 'right' }}>
                      <div className="trans-title">{expense.description}</div>
                      <div className="trans-date">{expense.date}</div>
                    </div>
                  </div>

                  <div className="trans-left">
                    <div className="trans-amount" dir="ltr" style={{ color: catInfo?.color }}>
                      -₪{expense.amount.toLocaleString()}
                    </div>
                    <div
                      className="trans-icon-bg"
                      style={{
                        backgroundColor: `rgba(255, 255, 255, 0.04)`,
                        border: `1px solid ${catInfo?.color || 'var(--border-color)'}`,
                      }}
                    >
                      <CreditCard size={14} style={{ color: catInfo?.color }} />
                    </div>
                  </div>
                </div>
              );
            })}

            {expenses.length === 0 && (
              <div
                style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  border: '1px dashed var(--border-color)',
                  borderRadius: '16px',
                  fontSize: '14px',
                }}
              >
                لا נרשמו הוצאות בטיול זה ✈️
              </div>
            )}
          </div>
        </div>

        {/* Left Column: Summaries & Charts */}
        <div className="budget-left-column">
          
          {/* Budget Limit Card */}
          <div className="budget-card">
            <div className="budget-limit-edit">
              <span>יתרה פנויה</span>
              {isEditingBudget ? (
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <input
                    type="number"
                    value={newBudgetVal}
                    onChange={(e) => setNewBudgetVal(e.target.value)}
                    style={{
                      width: '80px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--accent-blue)',
                      borderRadius: '4px',
                      color: '#fff',
                      padding: '4px 8px',
                      fontFamily: 'inherit',
                      fontSize: '12px',
                    }}
                  />
                  <button onClick={handleSaveBudgetLimit} style={{ color: 'var(--accent-green)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Check size={14} />
                  </button>
                  <button onClick={() => setIsEditingBudget(false)} style={{ color: 'var(--accent-pink)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsEditingBudget(true)}>
                  <Edit2 size={12} style={{ marginLeft: '4px' }} />
                  ערוך תקציב
                </button>
              )}
            </div>

            <div className={`budget-val ${isOverspent ? 'overspent' : ''}`} dir="ltr">
              ₪{balance.toLocaleString()}
            </div>

            {/* Progress Bar */}
            <div className="progress-bar-container">
              <div
                className={`progress-bar-fill ${spentPercentage > 85 ? 'warning' : ''}`}
                style={{ width: `${spentPercentage}%` }}
              />
            </div>

            <div className="budget-stats">
              <span>נוצל: ₪{totalSpent.toLocaleString()}</span>
              <span>מתוך: ₪{budgetLimit.toLocaleString()}</span>
            </div>
          </div>

          {/* Donut Chart Container */}
          <div className="chart-container">
            <div className="svg-chart-wrapper">{renderDonutChart()}</div>
            <div className="chart-legend">
              {CATEGORIES.map((cat) => {
                const amount = categoryTotals[cat.name] || 0;
                if (amount === 0) return null;
                return (
                  <div className="legend-item" key={cat.name}>
                    <span className="legend-color-label">
                      <span className="legend-dot" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </span>
                    <span className="legend-val" dir="ltr">
                      ₪{amount.toLocaleString()}
                    </span>
                  </div>
                );
              })}
              {totalSpent === 0 && (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', width: '100%' }}>
                  אין הוצאות להצגה
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Expense Form Modal */}
      {isFormOpen && (
        <div className="modal-overlay">
          <form className="modal-card" onSubmit={handleSubmitExpense}>
            <div className="modal-title">הוספת הוצאה חדשה</div>

            <div className="form-group">
              <label>סכום (₪)</label>
              <input
                type="number"
                required
                className="form-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>קטגוריה</label>
              <select
                className="form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>תיאור</label>
              <input
                type="text"
                className="form-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="לדוגמה: מונית, ארוחת בוקר, מלון..."
              />
            </div>

            <div className="form-group">
              <label>תאריך</label>
              <input
                type="date"
                required
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-form-save">
                שמור הוצאה
              </button>
              <button type="button" className="btn-form-cancel" onClick={() => setIsFormOpen(false)}>
                ביטול
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
