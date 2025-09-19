export default function DashboardPage() {
  return (
    <div className='min-h-screen bg-background p-6'>
      <div className='container-mobile mx-auto'>
        {/* Header */}
        <header className='mb-8'>
          <h1 className='text-3xl font-bold text-foreground mb-2'>
            Dashboard
          </h1>
          <p className='text-muted'>
            Cloud cost visibility and optimization insights
          </p>
        </header>

        {/* KPI Cards Placeholder */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <div className='card-base'>
            <h3 className='font-semibold text-sm text-muted mb-2'>
              Current Month Spend
            </h3>
            <p className='text-2xl font-bold text-foreground'>
              $12,345
            </p>
            <p className='text-sm text-secondary mt-1'>
              ↓ 18% from last month
            </p>
          </div>
          
          <div className='card-base'>
            <h3 className='font-semibold text-sm text-muted mb-2'>
              Projected Savings
            </h3>
            <p className='text-2xl font-bold text-foreground'>
              $2,468
            </p>
            <p className='text-sm text-secondary mt-1'>
              20% optimization potential
            </p>
          </div>
          
          <div className='card-base'>
            <h3 className='font-semibold text-sm text-muted mb-2'>
              Active Recommendations
            </h3>
            <p className='text-2xl font-bold text-foreground'>
              7
            </p>
            <p className='text-sm text-muted mt-1'>
              3 high impact
            </p>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className='card-base mb-8'>
          <h3 className='font-semibold text-lg text-foreground mb-4'>
            Spend Trend
          </h3>
          <div className='h-64 bg-surface border-2 border-dashed border-border rounded-md flex items-center justify-center'>
            <p className='text-muted'>
              Chart component will be implemented in future tasks
            </p>
          </div>
        </div>

        {/* Status */}
        <div className='bg-primary-50 border border-primary-200 rounded-lg p-4'>
          <p className='text-sm text-primary-800'>
            <strong>Status:</strong> This is a placeholder dashboard created during foundation setup (T001-T010). 
            Full functionality will be implemented in upcoming tasks T011+ with contract tests, mock data, and real components.
          </p>
        </div>
      </div>
    </div>
  );
}