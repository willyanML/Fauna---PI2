import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";

async function main() {
  console.log("==================================================");
  console.log("🌿 Fauna da Serra • Sincronização MongoDB Atlas");
  console.log("==================================================");

  const envPath = path.join(process.cwd(), ".env");
  let uri = process.env.MONGODB_URI;

  if (!uri && fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    const match = envContent.match(/MONGODB_URI="([^"]+)"/) || envContent.match(/MONGODB_URI=([^\r\n]+)/);
    if (match) {
      uri = match[1].trim();
    }
  }

  if (!uri || !uri.startsWith("mongodb")) {
    console.error("❌ ERRO: A variável MONGODB_URI não está definida no arquivo .env");
    console.log("👉 Obtenha gratuitamente em https://www.mongodb.com/cloud/atlas");
    console.log("👉 Exemplo: MONGODB_URI=\"mongodb+srv://usuario:senha@cluster0.abcde.mongodb.net/fauna_db?retryWrites=true&w=majority\"");
    process.exit(1);
  }

  console.log("📡 Conectando ao MongoDB Atlas...");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Conexão com MongoDB Atlas estabelecida com sucesso!");

    const db = client.db("fauna_db");

    const jsonPath = path.join(process.cwd(), "src", "data", "conteudo_fauna.json");
    if (!fs.existsSync(jsonPath)) {
      console.error("❌ Arquivo src/data/conteudo_fauna.json não encontrado.");
      process.exit(1);
    }

    const raw = fs.readFileSync(jsonPath, "utf-8");
    const conteudo = JSON.parse(raw);

    console.log(`📦 Preparando envio de ${conteudo.especies?.length || 0} espécies e ${conteudo.ocorrencias?.length || 0} ocorrências...`);

    // 1. Carrossel
    if (conteudo.carrossel) {
      await db.collection("carrossel").updateOne(
        { _id: "config" as any },
        {
          $set: {
            limiteMaximo: conteudo.carrossel.limiteMaximo || 10,
            itens: conteudo.carrossel.itens || [],
            atualizadoEm: new Date().toISOString(),
          },
        },
        { upsert: true }
      );
      console.log("✅ Coleção 'carrossel' atualizada.");
    }

    // 2. Espécies
    if (Array.isArray(conteudo.especies) && conteudo.especies.length > 0) {
      await db.collection("especies").deleteMany({});
      const docsEspecies = conteudo.especies.map((e: any) => ({ ...e, _id: e.id }));
      await db.collection("especies").insertMany(docsEspecies);
      console.log(`✅ Coleção 'especies' populada com ${docsEspecies.length} registros.`);
    }

    // 3. Ocorrências
    if (Array.isArray(conteudo.ocorrencias) && conteudo.ocorrencias.length > 0) {
      await db.collection("ocorrencias").deleteMany({});
      const docsOcorr = conteudo.ocorrencias.map((o: any) => ({ ...o, _id: o.id }));
      await db.collection("ocorrencias").insertMany(docsOcorr);
      console.log(`✅ Coleção 'ocorrencias' populada com ${docsOcorr.length} registros.`);
    }

    console.log("--------------------------------------------------");
    console.log("🎉 Sincronização concluída com sucesso no MongoDB Atlas!");
    console.log("O seu banco na nuvem agora está 100% pronto para a produção.");
    console.log("==================================================");
  } catch (error) {
    console.error("❌ Erro durante a sincronização com o MongoDB Atlas:", error);
  } finally {
    await client.close();
  }
}

main();
