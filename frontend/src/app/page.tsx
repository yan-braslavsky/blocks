export default function HomePage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100'>
      <div className='text-center space-y-6 p-8'>
        <h1 className='text-4xl font-bold text-slate-900'>Blocks MVP</h1>
        <p className='text-lg text-slate-600 max-w-md'>
          Cloud cost optimization platform with AI-powered insights
        </p>
        <div className='text-sm text-slate-500'>
          This page will redirect to the dashboard once routing is implemented.
        </div>
      </div>
    </div>
  );
}
