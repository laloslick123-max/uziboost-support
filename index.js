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
   CLIENTE DISCORD
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

async function aiResponse(text) {
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Eres UziBoost Support AI. Ayudas con soporte técnico, PCs, optimización y ventas. Responde claro, corto y profesional."
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.7
    });

    return res.choices[0].message.content;
  } catch (err) {
    console.log(err);
    return "⚠️ IA no disponible en este momento.";
  }
}

/* =========================
   READY
========================= */
client.once("ready", () => {
  console.log(`✅ UziBoost SAAS ONLINE: ${client.user.tag}`);
});

/* =========================
   PANEL PRO
========================= */
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!panel") {
    const embed = new EmbedBuilder()
      .setTitle("🎫 UziBoost Support System")
      .setDescription(
        `Bienvenido al sistema de soporte.

🔧 Soporte técnico
💰 Compras y precios
⚡ Optimización PC

Selecciona una opción para abrir ticket.`
      )
      .setColor("#a855f7");

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("prices")
        .setLabel("Precios")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("payments")
        .setLabel("Pagos")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("requirements")
        .setLabel("Requisitos")
        .setStyle(ButtonStyle.Secondary)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("open_ticket")
        .setLabel("🎫 Abrir Ticket")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("close_ticket")
        .setLabel("❌ Cerrar Ticket")
        .setStyle(ButtonStyle.Danger)
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
    const reply = await aiResponse(message.content);
    return message.reply(reply);
  }
});

/* =========================
   INTERACCIONES
========================= */
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  /* ===== BOTONES INFO ===== */
  if (interaction.customId === "prices") {
    return interaction.reply({
      content: "💰 Precios desde $X optimización PC",
      ephemeral: true
    });
  }

  if (interaction.customId === "payments") {
    return interaction.reply({
      content: "💳 Pagos: PayPal / Stripe / Transferencia",
      ephemeral: true
    });
  }

  if (interaction.customId === "requirements") {
    return interaction.reply({
      content: "📋 Necesitas CPU, GPU, RAM y Windows actualizado",
      ephemeral: true
    });
  }

  /* ===== CREAR TICKET ===== */
  if (interaction.customId === "open_ticket") {
    const category = interaction.guild.channels.cache.find(
      c => c.name === "🎫・SOPORTE Y PEDIDOS"
    );

    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: category?.id || null,
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
        .setLabel("❌ Cerrar Ticket")
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
      content: `🎫 Ticket de <@${interaction.user.id}>`,
      components: [btn]
    });

    return interaction.reply({
      content: `✅ Ticket creado: ${channel}`,
      ephemeral: true
    });
  }

  /* ===== CERRAR ===== */
  if (interaction.customId === "close_ticket") {
    await interaction.reply("🔒 Cerrando ticket...");
    setTimeout(() => interaction.channel.delete().catch(() => {}), 1500);
  }
});

/* =========================
   LOGIN
========================= */
client.login(process.env.TOKEN);
