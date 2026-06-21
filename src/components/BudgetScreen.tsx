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
  const [currency, setCurrency] = useState<'ILS' | 'USD' | 'EUR' | 'GBP' | 'CUSTOM'>('ILS');
  const [exchangeRate, setExchangeRate] = useState<number>(1);

  const handleCurrencyChange = (cur: 'ILS' | 'USD' | 'EUR' | 'GBP' | 'CUSTOM') => {
    setCurrency(cur);
    switch (cur) {
      case 'ILS':
        setExchangeRate(1);
        break;
      case 'USD':
        setExchangeRate(3.7);
        break;
      case 'EUR':
        setExchangeRate(4.0);
        break;
      case 'GBP':
        setExchangeRate(4.7);
        break;
      case 'CUSTOM':
        setExchangeRate(1);
        break;
    }
  };

  const getCurrencySymbol = (cur: string) => {
    switch (cur) {
      case 'ILS': return '₪';
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return '';
    }
  };

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

    const finalAmount = currency === 'ILS' ? parsedAmount : parsedAmount * exchangeRate;
    const suffix = currency !== 'ILS' ? ` (${parsedAmount}${getCurrencySymbol(currency)})` : '';
    const finalDescription = description.trim() ? `${description.trim()}${suffix}` : `${category}${suffix}`;

    onAddExpense({
      amount: Number(finalAmount.toFixed(2)),
      category,
      description: finalDescription,
      date: new Date(date).toLocaleDateString('he-IL'),
    });

    // Reset Form
    setAmount('');
    setDescription('');
    setCurrency('ILS');
    setExchangeRate(1);
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

            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', direction: 'rtl' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', textAlign: 'right' }}>מטבע</label>
                <select
                  className="form-input"
                  value={currency}
                  onChange={(e) => handleCurrencyChange(e.target.value as any)}
                  style={{ textAlign: 'right' }}
                >
                  <option value="ILS">₪ ILS (שקלים)</option>
                  <option value="USD">$ USD (דולר)</option>
                  <option value="EUR">€ EUR (אירו)</option>
                  <option value="GBP">£ GBP (ליש"ט)</option>
                  <option value="CUSTOM">מטבע אחר (ידני)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', textAlign: 'right' }}>סכום במטבע מקור</label>
                <input
                  type="number"
                  step="any"
                  required
                  className="form-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  autoFocus
                  style={{ textAlign: 'right' }}
                />
              </div>
            </div>

            {currency !== 'ILS' && (
              <div className="form-group animate-fade-in" style={{ direction: 'rtl' }}>
                <label style={{ display: 'block', marginBottom: '6px', textAlign: 'right' }}>שער חליפין (כמה שווה 1 במטבע זה בשקלים ₪)</label>
                <input
                  type="number"
                  step="any"
                  required
                  className="form-input"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
                  placeholder="לדוגמה: 3.7"
                  style={{ textAlign: 'right' }}
                />
              </div>
            )}

            {amount && currency !== 'ILS' && (
              <div className="form-group" style={{
                background: 'rgba(157, 78, 221, 0.1)',
                border: '1px solid rgba(157, 78, 221, 0.3)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center',
                marginTop: '8px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexDirection: 'row-reverse',
                direction: 'rtl'
              }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>סכום מוערך בשקלים:</span>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-purple)' }} dir="ltr">
                  ₪{(parseFloat(amount) * exchangeRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}

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
              <button type="button" className="btn-form-cancel" onClick={() => {
                setIsFormOpen(false);
                setCurrency('ILS');
                setExchangeRate(1);
                setAmount('');
                setDescription('');
              }}>
                ביטול
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
