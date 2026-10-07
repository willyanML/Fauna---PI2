import { MongoClient, Db } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

/**
 * Verifica se a variável MONGODB_URI está configurada
 */
export function isMongoConfigured(): boolean {
  return Boolean(
    process.env.MONGODB_URI &&
    process.env.MONGODB_URI.trim().length > 0 &&
    process.env.MONGODB_URI.startsWith("mongodb")
  );
}

/**
 * Retorna uma promessa com a conexão do cliente MongoDB
 * Utiliza cache global para evitar estouro de pool no hot-reload e em funções serverless
 */
export async function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI não foi definida no ambiente.");
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }

  const client = new MongoClient(uri);
  return client.connect();
}

/**
 * Retorna a instância da base de dados (default: 'fauna_db')
 */
export async function getMongoDb(dbName: string = "fauna_db"): Promise<Db> {
  const client = await getMongoClient();
  return client.db(dbName);
}
