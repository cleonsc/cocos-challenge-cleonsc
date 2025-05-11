import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export default async () => {
  console.log('Cleaning testing environment...');

  try {
    await execPromise('docker-compose down');
  } catch (error) {
    console.error('Error Cleaning testing environment', error);
  }

  console.log('Testing environment cleaned.');
};