import React, { useState } from 'react';
import './App.css';
// Chart.js will be dynamically imported in the chart component

function calculateMonthlyPayment(P, annualRate, n) {
  const r = annualRate / 12 / 100;
  if (r === 0) return P / n;
  return P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function calculateCompoundInterest(P, r, t) {
  return P * Math.pow(1 + r, t);
}

const SAVINGS_RATE = 0.06;
const SAVINGS_YEARS = [1, 5, 10, 30];

function App() {
  const [price, setPrice] = useState('');
  const [financing, setFinancing] = useState(false);
  const [term, setTerm] = useState('');
  const [apr, setApr] = useState('');

  const validPrice = parseFloat(price) > 0;
  const validTerm = financing ? parseInt(term) > 0 : true;
  const validApr = financing ? parseFloat(apr) >= 0 : true;

  let monthlyPayment = null, totalLoanCost = null;
  if (financing && validPrice && validTerm && validApr) {
    monthlyPayment = calculateMonthlyPayment(parseFloat(price), parseFloat(apr), parseInt(term));
    totalLoanCost = monthlyPayment * parseInt(term);
  }

  let savingsProjections = null;
  if (validPrice) {
    // If financing, use total loan cost as the opportunity cost
    const baseAmount = financing && validTerm && validApr && monthlyPayment && totalLoanCost ? totalLoanCost : parseFloat(price);
    savingsProjections = SAVINGS_YEARS.map(years => ({
      years,
      amount: calculateCompoundInterest(baseAmount, SAVINGS_RATE, years)
    }));
  }

  return (
    <div className="container">
      <div className="brand-header">
        <span className="nestwise-logo" title="Nestwise">🥚</span>
        <h1>Nestwise</h1>
      </div>
      <form className="input-form" onSubmit={e => e.preventDefault()}>
        <label>
          Product Price ($):
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={e => setPrice(e.target.value)}
            required
          />
        </label>
        <label className="financing-toggle">
          <input
            type="checkbox"
            checked={financing}
            onChange={e => setFinancing(e.target.checked)}
          />
          Financing?
        </label>
        {financing && (
          <div className="financing-fields">
            <label>
              Loan Term (months):
              <input
                type="number"
                min="1"
                step="1"
                value={term}
                onChange={e => setTerm(e.target.value)}
                required={financing}
              />
            </label>
            <label>
              Interest Rate (% APR):
              <input
                type="number"
                min="0"
                step="0.01"
                value={apr}
                onChange={e => setApr(e.target.value)}
                required={financing}
              />
            </label>
          </div>
        )}
      </form>
      <div className="results">
        {financing && validPrice && validTerm && validApr && (
          <div className="loan-results">
            <h2>Financing Results</h2>
            <p>Monthly Payment: <strong>${monthlyPayment.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></p>
            <p>Total Loan Cost: <strong>${totalLoanCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></p>
            <p>Total Interest Paid: <strong>${(totalLoanCost - parseFloat(price)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></p>
          </div>
        )}
        {validPrice && (
          <div className="savings-results">
            <h2>Savings Projection (6% APY)</h2>
            <ul>
              {savingsProjections.map(({ years, amount }) => (
                <li key={years}>
                  After {years} year{years > 1 ? 's' : ''}: <strong>${amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
                </li>
              ))}
            </ul>
            <div className="chart-area">
              {/* Chart will be rendered here */}
              <SavingsChart projections={savingsProjections} />
            </div>
          </div>
        )}
      </div>
      <footer>
        <small>For informational purposes only. Assumes fixed 6% APY, compounded annually.</small>
      </footer>
    </div>
  );
}

// Chart component (bonus)
function SavingsChart({ projections }) {
  const chartRef = React.useRef();
  React.useEffect(() => {
    if (!chartRef.current || !projections) return;
    let chartInstance;
    import('chart.js/auto').then(Chart => {
      if (chartInstance) chartInstance.destroy();
      const ctx = chartRef.current.getContext('2d');
      if (window.savingsChart) window.savingsChart.destroy();
      window.savingsChart = new Chart.default(ctx, {
        type: 'line',
        data: {
          labels: projections.map(p => `${p.years} yr`),
          datasets: [{
            label: 'Projected Savings',
            data: projections.map(p => Number(p.amount.toFixed(2))),
            fill: false,
            borderColor: '#4caf50',
            tension: 0.2
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { callback: v => `$${Number(v).toLocaleString()}` } }
          },
          responsive: true,
          maintainAspectRatio: false
        }
      });
    });
    return () => {
      if (window.savingsChart) window.savingsChart.destroy();
    };
  }, [projections]);

  return <canvas ref={chartRef} height={200} />;
}

export default App;
