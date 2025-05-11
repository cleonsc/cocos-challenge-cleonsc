import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getTypeOrmConfig = (config: ConfigService): TypeOrmModuleOptions => {
  const isSslEnabled = config.get<string>('DB_SSL') === 'true';
  return {
    type: 'postgres',
    host: config.get<string>('DB_HOST'),
    port: config.get<number>('DB_PORT'),
    username: config.get<string>('DB_USERNAME'),
    password: config.get<string>('DB_PASSWORD'),
    database: config.get<string>('DB_NAME'),
    autoLoadEntities: true,
    synchronize: false,
    ssl: isSslEnabled
      ? { rejectUnauthorized: false } // Configuración para producción/desarrollo
      : false, // Configuración para pruebas

  };
};
