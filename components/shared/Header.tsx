import {isZohoConnected} from '@/lib/zohoConnection';
import ActionButton from './ActionButton';

const Header = async () => {
  const connected = await isZohoConnected();

  return (
    <nav className='w-full fixed top-4 px-3 md:px-6 flex items-center justify-between'>
      <h1 className='text-xl font-bold'>Dashboard Generator</h1>
      {connected && <ActionButton connected={connected} />}
    </nav>
  );
};

export default Header;
