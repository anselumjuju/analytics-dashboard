import Dashboard from '@/components/layout/Dashboard';
import ActionButton from '@/components/shared/ActionButton';
import Header from '@/components/shared/Header';
import {isZohoConnected} from '@/lib/zohoConnection';

export default async function Home() {
  const isConnected = await isZohoConnected();

  return (
    <div className='w-full min-h-screen flex items-center justify-center'>
      <Header />
      {isConnected ?
        <Dashboard />
      : <div className='text-center p-8 bg-white rounded shadow flex flex-col items-center'>
          <h2 className='text-2xl font-bold mb-4'>Zoho CRM Not Connected</h2>
          <p className='mb-6'>Please connect your Zoho CRM account to access the dashboard.</p>
          <ActionButton connected={isConnected} />
        </div>
      }
    </div>
  );
}
