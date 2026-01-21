'use client';

import {authenticate} from '@/actions/auth/authenticate';

import {Button} from '../ui/button';

const Header = () => {
  const handleAuthenticate = async () => {
    const {error} = await authenticate();
    if (error) {
      console.error('Authentication error:', error);
      return;
    }
  };

  return (
    <nav className='w-full fixed top-4 px-3 md:px-6 flex items-center justify-between'>
      <div className='flex items-center'>
        <h1 className='text-xl font-bold'>Dashboard Generator</h1>
      </div>
      <div className='flex items-center space-x-4'>
        <Button className='bg-primary text-primary-foreground hover:bg-primary/80 px-4 py-2 rounded-md' onClick={() => handleAuthenticate()}>
          Connect Zoho Analytics
        </Button>
      </div>
    </nav>
  );
};

export default Header;
