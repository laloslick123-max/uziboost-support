import {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField,
  EmbedBuilder
} from "discord.js";

import dotenv from "dotenv";
dotenv.config();

/* =========================
   CLIENTE
========================= */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

/* =========================
   🤖 IA SIMPLE (SEGURA)
========================= */
function aiResponse(text) {
  const msg = text.toLowerCase();

  if (msg.includes("precio")) return "💰 Nuestros precios están disponibles en UziBoost.";
  if (msg.includes("tiempo")) return "⏱️ Tiempo estimado: 5-30 minutos.";
  if (msg.includes("hola")) return "👋 Hola! Bienvenido a UziBoost Support.";
  if (msg.includes("ayuda")) return "🧠 Describe tu problema y te ayudamos.";

  return "🤖 Un miembro del staff te responderá pronto.";
}

/* =========================
   READY
========================= */
client.once("ready", () => {
  console.log(`✅ UziBoost SAAS ONLINE como ${client.user.tag}`);
});

/* =========================
   PANEL ELEGANTE PRO
========================= */
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!panel") {

    const embed = new EmbedBuilder()
      .setTitle("🎫 UziBoost Support Center")
      .setDescription(
`✨ Bienvenido al sistema oficial de soporte UziBoost

Selecciona una opción para recibir asistencia personalizada.

🔧 Soporte técnico profesional
💰 Información de precios
⚡ Optimización avanzada

📌 Atención rápida y profesional 24/7`
      )
      .setColor("#a855f7");

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("prices")
        .setLabel("💰 Precios")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("payments")
        .setLabel("💳 Pagos")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("requirements")
        .setLabel("⚙️ Requisitos")
        .setStyle(ButtonStyle.Secondary)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("open_ticket")
        .setLabel("🎫 Abrir Ticket")
        .setStyle(ButtonStyle.Success)
    );

    return message.channel.send({
      embeds: [embed],
      components: [row1, row2]
    });
  }

  /* =========================
     IA EN TICKETS
  ========================= */
  if (message.channel.name?.includes("ticket")) {
    const reply = aiResponse(message.content);
    return message.reply(reply);
  }
});

/* =========================
   INTERACCIONES
========================= */
client.on("interactionCreate", async (interaction) => {

  if (!interaction.isButton()) return;

  /* ===== INFO BUTTONS ===== */
  if (interaction.customId === "prices") {
    return interaction.reply({
      content: "💰 Precios desde $X - servicios premium UziBoost",
      ephemeral: true
    });
  }

  if (interaction.customId === "payments") {
    return interaction.reply({
      content: "💳 Métodos: PayPal / Stripe / Transferencia",
      ephemeral: true
    });
  }

  if (interaction.customId === "requirements") {
    return interaction.reply({
      content: "⚙️ CPU, GPU, RAM mínimo 8GB, Windows actualizado",
      ephemeral: true
    });
  }

  /* ===== CREAR TICKET ===== */
  if (interaction.customId === "open_ticket") {

    const channel = await interaction.guild.channels.create({
      name: `🎫・ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        }
      ]
    });

    const closeBtn = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("close_ticket")
        .setLabel("🔒 Cerrar Ticket")
        .setStyle(ButtonStyle.Danger)
    );

    const embed = new EmbedBuilder()
      .setTitle("🎫 Ticket Abierto")
      .setDescription(
`✨ Gracias por contactar UziBoost Support

Describe tu problema con detalle y un staff te atenderá pronto.

📌 Mientras más información, más rápido te ayudamos.`
      )
      .setColor("#22c55e");

    await channel.send({
      embeds: [embed],
      components: [closeBtn]
    });

    return interaction.reply({
      content: "✅ Ticket creado correctamente",
      ephemeral: true
    });
  }

  /* ===== CERRAR TICKET ===== */
  if (interaction.customId === "close_ticket") {
    await interaction.reply("🔒 Cerrando ticket...");
    setTimeout(() => interaction.channel.delete().catch(() => {}), 2000);
  }
});

/* =========================
   LOGIN
========================= */
client.login(process.env.TOKEN);
