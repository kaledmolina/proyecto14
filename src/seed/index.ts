import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { Role, ArticleStatus } from "@prisma/client";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await db.systemLog.deleteMany();
  await db.articleTag.deleteMany();
  await db.article.deleteMany();
  await db.siteSettings.deleteMany();
  await db.tag.deleteMany();
  await db.category.deleteMany();
  await db.user.deleteMany();

  // Create Admin user
  const adminPassword = await bcrypt.hash("Admin123!", 12);
  const admin = await db.user.create({
    data: {
      email: "admin@newsportal.com",
      name: "Carlos Admin",
      passwordHash: adminPassword,
      role: Role.ADMIN,
      bio: "Administrador principal del portal de noticias.",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Carlos",
    },
  });
  console.log("✅ Admin created:", admin.email);

  // Create Writer users
  const writerPassword = await bcrypt.hash("Writer123!", 12);
  const writer1 = await db.user.create({
    data: {
      email: "maria@newsportal.com",
      name: "María García",
      passwordHash: writerPassword,
      role: Role.WRITER,
      bio: "Periodista especializada en tecnología y ciencia.",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Maria",
    },
  });

  const writer2 = await db.user.create({
    data: {
      email: "jose@newsportal.com",
      name: "José Rodríguez",
      passwordHash: writerPassword,
      role: Role.WRITER,
      bio: "Corresponsal de deportes y cultura.",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Jose",
    },
  });

  const writer3 = await db.user.create({
    data: {
      email: "ana@newsportal.com",
      name: "Ana Martínez",
      passwordHash: writerPassword,
      role: Role.WRITER,
      bio: "Redactora de política y economía.",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Ana",
    },
  });
  console.log("✅ Writers created");

  // Create Categories
  const categories = await Promise.all([
    db.category.create({
      data: {
        name: "Tecnología",
        slug: "tecnologia",
        description: "Las últimas novedades del mundo tech",
        color: "#10b981",
        order: 1,
      },
    }),
    db.category.create({
      data: {
        name: "Deportes",
        slug: "deportes",
        description: "Resultados y noticias deportivas",
        color: "#f59e0b",
        order: 2,
      },
    }),
    db.category.create({
      data: {
        name: "Política",
        slug: "politica",
        description: "Análisis político y gubernamental",
        color: "#ef4444",
        order: 3,
      },
    }),
    db.category.create({
      data: {
        name: "Ciencia",
        slug: "ciencia",
        description: "Descubrimientos y avances científicos",
        color: "#8b5cf6",
        order: 4,
      },
    }),
    db.category.create({
      data: {
        name: "Cultura",
        slug: "cultura",
        description: "Arte, música, cine y literatura",
        color: "#ec4899",
        order: 5,
      },
    }),
    db.category.create({
      data: {
        name: "Economía",
        slug: "economia",
        description: "Mercados, finanzas y negocios",
        color: "#06b6d4",
        order: 6,
      },
    }),
  ]);
  console.log("✅ Categories created");

  // Create Tags
  const tags = await Promise.all([
    db.tag.create({ data: { name: "Inteligencia Artificial", slug: "inteligencia-artificial" } }),
    db.tag.create({ data: { name: "Fútbol", slug: "futbol" } }),
    db.tag.create({ data: { name: "Elecciones", slug: "elecciones" } }),
    db.tag.create({ data: { name: "Espacio", slug: "espacio" } }),
    db.tag.create({ data: { name: "Cine", slug: "cine" } }),
    db.tag.create({ data: { name: "Criptomonedas", slug: "criptomonedas" } }),
    db.tag.create({ data: { name: "Cambio Climático", slug: "cambio-climatico" } }),
    db.tag.create({ data: { name: "Startups", slug: "startups" } }),
    db.tag.create({ data: { name: "Salud", slug: "salud" } }),
    db.tag.create({ data: { name: "Innovación", slug: "innovacion" } }),
  ]);
  console.log("✅ Tags created");

  // Create Articles
  const articles = [
    {
      title: "IA Generativa Revoluciona la Industria Creativa: Nuevas Herramientas de Adobe y OpenAI",
      slug: "ia-generativa-revoluciona-industria-creativa",
      content: `La inteligencia artificial generativa continúa transformando la forma en que los profesionales creativos trabajan. Adobe ha anunciado una nueva serie de herramientas impulsadas por IA que permiten a los diseñadores crear imágenes, videos y animaciones con una precisión sin precedentes.

Por su parte, OpenAI ha presentado su última generación de modelos multimodales que no solo generan texto, sino que pueden crear composiciones visuales complejas, editar fotografías con instrucciones en lenguaje natural y generar música instrumental.

## Impacto en la Industria

Los expertos del sector coinciden en que estas herramientas no reemplazarán a los creativos, sino que amplificarán sus capacidades. "La IA es un copiloto creativo, no un reemplazo", aseguró el director de innovación de Adobe durante la presentación.

Las startups del sector han recaudado más de $2.500 millones en financiación durante el último trimestre, lo que demuestra el enorme interés de los inversores en esta tecnología.

## ¿Qué Significa para los Profesionales?

Los diseñadores gráficos, ilustradores y creadores de contenido están adoptando estas herramientas rápidamente. Las plataformas de freelance ya muestran un aumento del 40% en proyectos que requieren habilidades de "prompt engineering" y edición asistida por IA.

Sin embargo, también surgen preocupaciones sobre los derechos de autor y la ética en el uso de contenido generado por IA. Varios países están trabajando en legislación específica para regular este espacio.`,
      excerpt: "Adobe y OpenAI presentan nuevas herramientas de IA generativa que transforman el trabajo creativo profesional, generando debate sobre el futuro de la industria.",
      coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=630&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isFeatured: true,
      views: 15420,
      authorId: writer1.id,
      categoryId: categories[0].id,
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      tags: [tags[0], tags[7], tags[9]],
    },
    {
      title: "Champions League: Sorpresas y Clasificados en Cuartos de Final",
      slug: "champions-league-sorpresas-cuartos-final",
      content: `La UEFA Champions League ha entregado resultados que pocos esperaban en esta temporada. Equipos considerados favoritos han caído ante rivales que demostraron un fútbol brillante y táctico.

## Resultados Destacados

El partido más sorprendente de la jornada fue la eliminación de uno de los favoritos del torneo, que cayó ante un equipo que no llegaba como candidato tras un encuentro lleno de emoción en los últimos minutos del partido de vuelta.

Los cuartos de final prometen ser electrizantes, con enfrentamientos que mezclan experiencia juvenil con veteranía.

## Análisis Táctico

Los analistas destacan que la tendencia hacia pressing intenso y transiciones rápidas ha marcado la diferencia. Los equipos que han invertido en data analytics para optimizar sus alineaciones han mostrado un rendimiento superior.

La final se disputará en Munich el próximo mes, y las entradas ya se agotaron en tiempo récord.`,
      excerpt: "La Champions League entrega resultados inesperados en octavos. Análisis completo de los clasificados a cuartos de final y las claves tácticas del torneo.",
      coverImage: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=630&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isFeatured: false,
      views: 23100,
      authorId: writer2.id,
      categoryId: categories[1].id,
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      tags: [tags[1]],
    },
    {
      title: "Reforma Tributaria 2025: Lo que Necesita Saber sobre los Nuevos Cambios",
      slug: "reforma-tributaria-2025-nuevos-cambios",
      content: `El Congreso ha aprobado la más ambiciosa reforma tributaria de la última década. Los cambios entrarán en vigor a partir del próximo trimestre fiscal y afectarán a personas naturales y jurídicas.

## Puntos Clave de la Reforma

La nueva ley establece una reestructuración completa del sistema de impuestos, con énfasis en la progresividad y la simplificación del proceso de declaración.

Entre las medidas más destacadas se encuentran:
- Reducción del impuesto a las empresas medianas
- Nuevas deducciones para inversión en tecnología
- Impuesto temporal a las grandes fortunas
- Incentivos fiscales para empresas verdes

## Impacto Económico

Los economistas proyectan un impacto positivo en el crecimiento del PIB, estimando un aumento de entre 0.5 y 1.2 puntos porcentuales durante el primer año de implementación.

Sin embargo, algunos sectores empresariales han expresado preocupación por ciertas disposiciones que podrían afectar la competitividad internacional.`,
      excerpt: "Análisis completo de la reforma tributaria 2025: cambios clave, impactos económicos y lo que significa para ciudadanos y empresas.",
      coverImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=630&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isFeatured: false,
      views: 8750,
      authorId: writer3.id,
      categoryId: categories[5].id,
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      tags: [tags[5]],
    },
    {
      title: "Descubrimiento Histórico: Telescopio James Webb Detecta Agua en Exoplaneta Habitable",
      slug: "telescopio-james-webb-agua-exoplaneta",
      content: `El telescopio espacial James Webb ha realizado uno de los descubrimientos más emocionantes en la historia de la astronomía: la detección inequívoca de vapor de agua en la atmósfera de un exoplaneta ubicado en la zona habitable de su estrella.

## Los Datos Científicos

El exoplaneta, denominado JWST-2025b, orbita una estrella tipo G a aproximadamente 40 años luz de la Tierra. Los datos espectroscópicos revelan no solo agua, sino también indicios de dióxido de carbono y metano, una combinación que en la Tierra está asociada con la actividad biológica.

## Implicaciones para la Búsqueda de Vida

Este descubrimiento marca un punto de inflexión en la astrobiología. Aunque la presencia de agua no confirma la existencia de vida, sí establece que las condiciones para ella podrían existir.

La comunidad científica internacional ya está planificando nuevas observaciones con instrumentos aún más sensibles para intentar detectar biosignaturas adicionales.`,
      excerpt: "El telescopio James Webb detecta vapor de agua en un exoplaneta habitable, marcando un hito histórico en la búsqueda de vida extraterrestre.",
      coverImage: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&h=630&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isFeatured: true,
      views: 34200,
      authorId: writer1.id,
      categoryId: categories[3].id,
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      tags: [tags[3], tags[8]],
    },
    {
      title: "Festival de Cine Independiente 2025: Las Películas que No Puedes Perderte",
      slug: "festival-cine-independiente-2025",
      content: `El Festival Internacional de Cine Independiente celebró su edición 2025 con una programación que deslumbró a críticos y público por igual. Más de 50 películas de 30 países compitieron en diversas categorías.

## Películas Destacadas

La gran ganadora de la noche fue una producción latinoamericana que cuenta la historia de una comunidad indígena y su lucha por preservar sus tradiciones. La película recibió cinco premios, incluyendo Mejor Película y Mejor Dirección.

## Tendencias del Cine Independiente

Este año se notó una fuerte tendencia hacia historias que exploran la identidad cultural y el impacto de la tecnología en las relaciones humanas. Los documentales también tuvieron una presencia destacada, con varios films que abordan la crisis climática y la justicia social.

El festival cerró con una proyección al aire libre que reunió a más de 10.000 espectadores en la plaza principal de la ciudad.`,
      excerpt: "Resumen del Festival de Cine Independiente 2025: películas ganadoras, tendencias y las producciones que marcarán la temporada.",
      coverImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&h=630&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isFeatured: false,
      views: 5430,
      authorId: writer2.id,
      categoryId: categories[4].id,
      publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
      tags: [tags[4]],
    },
    {
      title: "Negociaciones Climáticas: Acuerdo Histórico entre Potencias Mundiales",
      slug: "negociaciones-climaticas-acuerdo-historico",
      content: `En una cumbre que se prolongó durante tres días más de lo previsto, las principales potencias económicas del mundo han alcanzado un acuerdo que podría definir el futuro de la lucha contra el cambio climático.

## Los Compromisos

El acuerdo establece metas vinculantes de reducción de emisiones que van más allá de los compromisos anteriores del Acuerdo de París. Las naciones firmantes se comprometen a alcanzar la neutralidad de carbono antes de 2045.

Las inversiones anunciadas superan los $500.000 millones destinados a energía renovable, tecnologías de captura de carbono y adaptación climática en los países más vulnerables.

## Reacciones

Los ambientalistas han calificado el acuerdo como "un paso necesario pero insuficiente", mientras que los líderes empresariales han recibido positivamente la claridad regulatoria que proporciona el pacto.`,
      excerpt: "Las principales potencias alcanzan un acuerdo climático histórico con metas vinculantes de reducción de emisiones e inversiones de $500 mil millones.",
      coverImage: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=1200&h=630&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isFeatured: false,
      views: 12100,
      authorId: writer3.id,
      categoryId: categories[2].id,
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      tags: [tags[6], tags[3]],
    },
    // Pending articles
    {
      title: "Startup Colombiana Alcanza Valoración de $1.000 Millones en Ronda de Financiación",
      slug: "startup-colombiana-valoracion-mil-millones",
      content: "Una startup colombiana dedicada a soluciones de fintech ha alcanzado el estatus de unicornio...",
      excerpt: "La empresa de tecnología financiera se convierte en el primer unicornio colombiano del año.",
      coverImage: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=630&fit=crop",
      status: ArticleStatus.PENDING_REVIEW,
      isFeatured: false,
      views: 0,
      authorId: writer1.id,
      categoryId: categories[0].id,
      tags: [tags[7], tags[5]],
    },
    // Draft article
    {
      title: "Nuevos Avances en Tratamientos contra el Alzheimer",
      slug: "avances-tratamientos-alzheimer",
      content: "Investigadores han identificado un nuevo biomarcador que podría revolutionar...",
      excerpt: "Un hallazgo científico promete cambiar el panorama del tratamiento del Alzheimer.",
      coverImage: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1200&h=630&fit=crop",
      status: ArticleStatus.DRAFT,
      isFeatured: false,
      views: 0,
      authorId: writer1.id,
      categoryId: categories[3].id,
      tags: [tags[8]],
    },
  ];

  for (const article of articles) {
    const { tags: articleTags, ...data } = article;
    const created = await db.article.create({
      data: {
        ...data,
        tags: {
          create: articleTags.map((tag) => ({ tagId: tag.id })),
        },
      },
    });
    console.log(`  📰 Article: ${created.title.substring(0, 50)}...`);
  }

  // Create site settings
  const settings = [
    { key: "site_name", value: "Tolima Informa" },
    { key: "site_description", value: "Tu portal de noticias digital de confianza" },
    { key: "site_logo", value: "https://api.dicebear.com/9.x/initials/svg?seed=TI&backgroundColor=c0392b" },
    { key: "seo_title", value: "Tolima Informa - Últimas Noticias de Actualidad" },
    { key: "seo_description", value: "Portal de noticias digital con las últimas noticias de Tolima, tecnología, deportes, política, ciencia, cultura y economía." },
    { key: "banner_enabled", value: "true" },
    { key: "banner_text", value: "¡Suscríbete a nuestro boletín semanal!" },
    { key: "articles_per_page", value: "12" },
  ];

  for (const setting of settings) {
    await db.siteSettings.create({ data: setting });
  }
  console.log("✅ Settings created");

  // Create initial system logs
  await db.systemLog.createMany({
    data: [
      { action: "LOGIN" as any, userId: admin.id, details: "Admin inició sesión", ipAddress: "192.168.1.1" },
      { action: "ARTICLE_CREATE" as any, userId: writer1.id, details: "Creó: IA Generativa Revoluciona la Industria Creativa" },
      { action: "ARTICLE_PUBLISH" as any, userId: admin.id, details: "Publicó: IA Generativa Revoluciona la Industria Creativa" },
      { action: "USER_CREATE" as any, userId: admin.id, details: "Creó usuario: María García (Writer)" },
      { action: "USER_CREATE" as any, userId: admin.id, details: "Creó usuario: José Rodríguez (Writer)" },
      { action: "USER_CREATE" as any, userId: admin.id, details: "Creó usuario: Ana Martínez (Writer)" },
      { action: "CATEGORY_CREATE" as any, userId: admin.id, details: "Creó categoría: Tecnología" },
      { action: "SETTINGS_UPDATE" as any, userId: admin.id, details: "Actualizó configuración del sitio" },
    ],
  });
  console.log("✅ System logs created");

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📋 Credenciales de prueba:");
  console.log("  Admin:  admin@newsportal.com / Admin123!");
  console.log("  Writer: maria@newsportal.com / Writer123!");
  console.log("  Writer: jose@newsportal.com / Writer123!");
  console.log("  Writer: ana@newsportal.com / Writer123!");
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
