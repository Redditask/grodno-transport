import { createApp } from './create-app';

async function bootstrap() {
  const app = await createApp();

  await app.listen(3000, '0.0.0.0');
}

void bootstrap();
