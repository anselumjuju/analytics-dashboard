'use client';

import {authenticate} from '@/actions/auth/authenticate';
import {Button} from '../ui/button';
import {disconnectZoho} from '@/actions/auth/disconnect';

const ActionButton = ({connected}: {connected: boolean}) => {
  const handleConnect = async () => {
    await authenticate();
  };

  const handleDisconnect = async () => {
    await disconnectZoho();
    window.location.reload();
  };

  return (
    <div className='w-max'>
      {connected ?
        <div className='w-max flex gap-2'>
          <Button variant='destructive' onClick={handleDisconnect}>
            Disconnect Zoho Analytics
          </Button>
        </div>
      : <Button onClick={handleConnect}>Connect Zoho Analytics</Button>}
    </div>
  );
};

export default ActionButton;
