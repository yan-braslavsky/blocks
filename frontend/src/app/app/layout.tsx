export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen bg-background'>
      {/* Simple navigation placeholder */}
      <nav className='border-b border-border bg-surface'>
        <div className='container-mobile mx-auto py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <h2 className='text-xl font-bold text-primary'>Blocks</h2>
              <span className='text-sm text-muted'>MVP</span>
            </div>
            <div className='text-sm text-muted'>
              Welcome back
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main content */}
      <main>
        {children}
      </main>
    </div>
  );
}