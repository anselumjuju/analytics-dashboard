import {getValidAccessToken} from '@/actions/libs/getValidAccessToken';
import {getWorkspaces} from '@/actions/metadata/workspaces';
import {Card, CardHeader, CardTitle, CardContent, CardFooter} from '@/components/ui/card';

interface Workspace {
  workspaceId: string;
  workspaceName: string;
  workspaceDesc: string;
  orgId: string;
  createdTime: string;
  createdBy: string;
  isDefault: boolean;
}

const Dashboard = async () => {
  const accessToken = await getValidAccessToken();

  if (!accessToken) return null;

  const response = await getWorkspaces(accessToken);

  if (!response) return null;

  const data = response.data as {ownedWorkspaces: Workspace[]; sharedWorkspaces: Workspace[]};

  return (
    <div className='w-full flex flex-col items-center justify-start gap-y-8'>
      {/* Owned Workspaces */}
      <div className='w-full h-full px-4 py-2 max-w-7xl mx-auto'>
        <h1 className='text-xl font-bold'>Owned WorkSpaces</h1>
        {data.ownedWorkspaces.length === 0 ?
          <p className='mt-4'>No owned workspaces available.</p>
        : <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8'>
            {data.ownedWorkspaces.map((workspace) => (
              <Card key={workspace.workspaceId} className='w-full'>
                <CardHeader className='border-b'>
                  <CardTitle>{workspace.workspaceName}</CardTitle>
                </CardHeader>
                <CardContent className='flex flex-col items-start justify-start gap-y-4'>
                  <p>Organization ID: {workspace.orgId}</p>
                  <p>Workspace ID: {workspace.workspaceId}</p>
                  <p>WorkSpace Description: {workspace.workspaceDesc || '-'}</p>
                </CardContent>
                <CardFooter className='border-t'>
                  <p>Created By: {workspace.createdBy}</p>
                </CardFooter>
              </Card>
            ))}
          </div>
        }
      </div>

      {/* Shared Workspaces */}
      <div className='w-full h-full px-4 py-2 max-w-7xl mx-auto'>
        <h1 className='text-xl font-bold'>Shared WorkSpaces</h1>
        {data.sharedWorkspaces.length === 0 ?
          <p className='mt-4'>No shared workspaces available.</p>
        : <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8'>
            {data.sharedWorkspaces.map((workspace) => (
              <Card key={workspace.workspaceId} className='w-full'>
                <CardHeader className='border-b'>
                  <CardTitle>{workspace.workspaceName}</CardTitle>
                </CardHeader>
                <CardContent className='flex flex-col items-start justify-start gap-y-4'>
                  <p>Organization ID: {workspace.orgId}</p>
                  <p>Workspace ID: {workspace.workspaceId}</p>
                  <p>WorkSpace Description: {workspace.workspaceDesc || '-'}</p>
                </CardContent>
                <CardFooter className='border-t'>
                  <p>Created By: {workspace.createdBy}</p>
                </CardFooter>
              </Card>
            ))}
          </div>
        }
      </div>
    </div>
  );
};

export default Dashboard;
