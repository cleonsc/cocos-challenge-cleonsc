import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export default async () => {
  console.log('Init testing environment...');

  try {
    await execPromise('docker-compose up -d');
  } catch (error) {
    console.error('Error init testing environment', error);
  }

  console.log('Testing environment configurated.');
};