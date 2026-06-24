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
   IA
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
          content: "Eres soporte profesional de UziBoost. Responde claro y corto."
        },
        { role: "user", content: text }
      ]
    });

    return res.choices[0].message.content;
  } catch {
    return "⚠️ IA no disponible";
  }
}

/* =========================
   READY
========================= */
client.once("ready", () => {
  console.log(`🔥 SAAS BOT ONLINE: ${client.user.tag}`);
});

/* =========================
   SLASH COMMAND (/panel)
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
   BOTONES + TICKETS
========================= */
client.on("interactionCreate", async (interaction) => {

  if (!interaction.isButton()) return;

  if (interaction.customId === "prices") {
    return interaction.reply({ content: "💰 Desde $X servicios", ephemeral: true });
  }

  if (interaction.customId === "payments") {
    return interaction.reply({ content: "💳 PayPal / Stripe / Transferencia", ephemeral: true });
  }

  if (interaction.customId === "requirements") {
    return interaction.reply({ content: "⚙️ CPU, GPU, RAM mínimo 8GB", ephemeral: true });
  }

  /* ===== TICKET ===== */
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

    const btn = new ActionRowBuilder().addComponents(
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
      components: [btn]
    });

    return interaction.reply({
      content: `✅ Ticket creado: ${channel}`,
      ephemeral: true
    });
  }

  /* ===== CLOSE ===== */
  if (interaction.customId === "close_ticket") {
    await interaction.reply("🔒 Cerrando...");
    setTimeout(() => interaction.channel.delete().catch(() => {}), 1500);
  }
});

/* =========================
   LOGIN
========================= */
client.login(process.env.TOKEN);
