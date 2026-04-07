import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CATEGORIES = ['food', 'housing', 'utilities', 'transport', 'entertainment', 'salary', 'other'];

const COLORS = {
  food:          '#e8956d',
  housing:       '#7eb8e0',
  utilities:     '#f0c44a',
  transport:     '#85d4b0',
  entertainment: '#c992e0',
  salary:        '#5fb87a',
  other:         '#7a7870',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  return (
    <div style={{
      background: '#242220',
      border: '1px solid #2a2824',
      borderRadius: 3,
      padding: '8px 14px',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <p style={{ fontSize: 12, color: '#8a8478', textTransform: 'capitalize', marginBottom: 2 }}>{name}</p>
      <p style={{ fontSize: 14, color: '#f0ebe0', fontFamily: "'DM Mono', monospace" }}>
        ${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
};

function SpendingChart({ transactions }) {
  const data = CATEGORIES
    .map(category => ({
      name: category,
      value: transactions
        .filter(t => t.type === 'expense' && t.category === category)
        .reduce((sum, t) => sum + t.amount, 0),
    }))
    .filter(entry => entry.value > 0);

  if (data.length === 0) return null;

  return (
    <div className="spending-chart">
      <h2>Spending by Category</h2>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name] ?? COLORS.other} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              color: '#8a8478',
              textTransform: 'capitalize',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SpendingChart;
