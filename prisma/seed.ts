import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { resolveDatasourceUrl } from "../src/lib/datasource-url";

const prisma = new PrismaClient({ datasourceUrl: resolveDatasourceUrl() });

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@example.com").toLowerCase().trim();
  const adminName = process.env.ADMIN_NAME ?? "Admin";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";

  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: adminName,
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      isActive: true,
    },
  });
  console.log(`Utente admin pronto: ${adminEmail}`);

  const demoClientEmail = "cliente.demo@example.com";
  const demoClientPasswordHash = await bcrypt.hash("Cliente123!", 10);
  await prisma.user.upsert({
    where: { email: demoClientEmail },
    update: {},
    create: {
      email: demoClientEmail,
      name: "Cliente Demo",
      passwordHash: demoClientPasswordHash,
      role: "CLIENT",
      isActive: true,
    },
  });
  console.log(`Cliente demo pronto: ${demoClientEmail} / Cliente123!`);

  const existingRecipes = await prisma.recipe.count();
  if (existingRecipes === 0) {
    await prisma.recipe.createMany({
      data: [
        {
          title: "Bowl di quinoa e verdure grigliate",
          description: "Piatto unico bilanciato, ideale per il pranzo.",
          ingredients:
            "80g di quinoa\n150g di verdure miste (zucchine, peperoni, melanzane)\n1 cucchiaio di olio EVO\nSucco di limone\nSale e pepe q.b.",
          instructions:
            "1. Cuoci la quinoa in acqua salata per 12-15 minuti e scola.\n2. Griglia le verdure tagliate a listarelle.\n3. Componi il bowl con quinoa e verdure, condisci con olio, limone, sale e pepe.",
          calories: 420,
          tags: "pranzo,vegetariano,senza glutine",
        },
        {
          title: "Petto di pollo alle erbe con patate al forno",
          description: "Secondo proteico semplice e gustoso.",
          ingredients:
            "150g di petto di pollo\n200g di patate\nRosmarino, timo\n1 cucchiaio di olio EVO\nSale e pepe q.b.",
          instructions:
            "1. Taglia le patate a spicchi e condisci con olio ed erbe, inforna a 200°C per 25 minuti.\n2. Cuoci il petto di pollo in padella con le erbe fino a cottura completa.\n3. Servi insieme.",
          calories: 480,
          tags: "cena,proteico",
        },
        {
          title: "Porridge di avena con frutta fresca",
          description: "Colazione energetica e ricca di fibre.",
          ingredients:
            "50g di fiocchi d'avena\n200ml di latte (o bevanda vegetale)\n1 frutto fresco a scelta\n1 cucchiaino di miele (facoltativo)",
          instructions:
            "1. Scalda il latte e aggiungi i fiocchi d'avena, cuoci a fuoco basso per 5 minuti mescolando.\n2. Versa in una ciotola e completa con frutta fresca a pezzi e miele.",
          calories: 320,
          tags: "colazione,vegetariano",
        },
      ],
    });
    console.log("Ricette di esempio create.");
  }

  const existingGroups = await prisma.substitutionGroup.count();
  if (existingGroups === 0) {
    await prisma.substitutionGroup.create({
      data: {
        name: "Fonti proteiche",
        description: "Alimenti equivalenti come apporto proteico, da usare in sostituzione tra loro.",
        items: {
          create: [
            { name: "Petto di pollo", quantity: "150g" },
            { name: "Petto di tacchino", quantity: "150g" },
            { name: "Filetto di merluzzo", quantity: "180g" },
            { name: "Uova", quantity: "2 unità" },
            { name: "Legumi cotti (ceci, lenticchie)", quantity: "200g" },
            { name: "Tofu", quantity: "150g" },
          ],
        },
      },
    });

    await prisma.substitutionGroup.create({
      data: {
        name: "Cereali e derivati",
        description: "Fonti di carboidrati complessi intercambiabili.",
        items: {
          create: [
            { name: "Pasta di semola", quantity: "80g" },
            { name: "Riso", quantity: "80g" },
            { name: "Quinoa", quantity: "80g" },
            { name: "Pane integrale", quantity: "90g" },
            { name: "Farro", quantity: "80g" },
          ],
        },
      },
    });

    console.log("Gruppi di sostituzione di esempio creati.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
