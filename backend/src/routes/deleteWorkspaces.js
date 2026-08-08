import {deleteWorkspaces} from '../services/workspaces.js';

export async function deleteWorkspacesRoute(_req, res) {
  try {
    const deletedCount = await deleteWorkspaces();
    res.status(200).json({
      success: true,
      message: `Deleted ${deletedCount} auto-generated workspaces`,
      data: {deletedCount},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete workspaces',
      data: error.message,
    });
  }
}
