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
import OpenAI from "openai";

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
   IA OPENAI
========================= */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function ai(text) {
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Eres soporte profesional de UziBoost. Responde claro, corto y útil."
        },
        {
          role: "user",
          content: text
        }
      ]
    });

    return res.choices[0].message.content;
  } catch (err) {
    console.log("IA ERROR:", err);
    return "⚠️ IA no disponible en este momento.";
  }
}

/* =========================
   READY
========================= */
client.once("ready", () => {
  console.log(`🔥 UziBoost SAAS ONLINE: ${client.user.tag}`);
});

/* =========================
   SLASH PANEL
========================= */
client.on("interactionCreate", async (interaction) => {

  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "panel") {

    const embed = new EmbedBuilder()
      .setTitle("🎫 UziBoost Support Center")
      .setDescription(
`✨ Sistema oficial UziBoost

Selecciona una opción:

💰 Precios
💳 Pagos
⚙️ Requisitos

🎫 Abre ticket para soporte`
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

    return interaction.reply({
      embeds: [embed],
      components: [row1, row2]
    });
  }
});

/* =========================
   BOTONES + TICKETS + IA
========================= */
client.on("interactionCreate", async (interaction) => {

  if (!interaction.isButton()) return;

  /* =========================
     💰 PRECIOS (ACTUALIZADO)
  ========================= */
  if (interaction.customId === "prices") {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("💰 Planes UziBoost")
          .setDescription(
`🟢 Básica — $15 USD
• Soporte básico
• Optimización ligera

🟣 Legendaria — $25 USD
• Optimización avanzada
• Mejor rendimiento

🔴 Avanzada — $35 USD
• Optimización PRO completa
• Configuración total`
          )
          .setColor("#22c55e")
      ],
      ephemeral: true
    });
  }

  if (interaction.customId === "payments") {
    return interaction.reply({
      content: "💳 PayPal / Stripe / Transferencia",
      ephemeral: true
    });
  }

  if (interaction.customId === "requirements") {
    return interaction.reply({
      content: "⚙️ CPU, GPU, RAM mínimo 8GB",
      ephemeral: true
    });
  }

  /* =========================
     🎫 CREAR TICKET
  ========================= */
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
      .setDescription("Describe tu problema y te ayudamos.")
      .setColor("#22c55e");

    await channel.send({
      embeds: [embed],
      components: [closeBtn]
    });

    return interaction.reply({
      content: `✅ Ticket creado: ${channel}`,
      ephemeral: true
    });
  }

  /* =========================
     🔒 CERRAR TICKET
  ========================= */
  if (interaction.customId === "close_ticket") {
    await interaction.reply("🔒 Cerrando...");
    setTimeout(() => interaction.channel.delete().catch(() => {}), 1500);
  }
});

/* =========================
   🤖 IA EN TICKETS
========================= */
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.channel.name?.includes("ticket")) {
    const response = await ai(message.content);
    return message.reply(response);
  }
});

/* =========================
   LOGIN
========================= */
client.login(process.env.TOKEN);
