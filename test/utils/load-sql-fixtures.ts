import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';

export async function loadSqlFixture(dataSource: DataSource, filename: string) {
  const filePath = path.resolve(__dirname, '../fixtures', filename);
  const sql = fs.readFileSync(filePath, 'utf8');
  await dataSource.query(sql);
}
