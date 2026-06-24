console.log("🔥 VERSION NUEVA CARGADA");
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
   IA (SIMPLE PERO FUNCIONAL)
========================= */
function ai(text) {
  const msg = text.toLowerCase();

  if (msg.includes("precio")) return "💰 Precios disponibles en UziBoost.";
  if (msg.includes("tiempo")) return "⏱️ Tiempo estimado: 5-30 min.";
  if (msg.includes("hola")) return "👋 Hola! Bienvenido a UziBoost Support.";
  if (msg.includes("ayuda")) return "🧠 Describe tu problema y te ayudo.";

  return "🤖 Un staff te atenderá pronto.";
}

/* =========================
   READY
========================= */
client.once("ready", () => {
  console.log(`✅ UziBoost ONLINE como ${client.user.tag}`);
});

/* =========================
   PANEL (ESTILO LIMPIO COMO EL TUYO)
========================= */
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!panel") {

    const embed = new EmbedBuilder()
      .setTitle("🎫 UziBoost Support System")
      .setDescription(
`✨ Bienvenido al sistema de soporte UziBoost

Selecciona una opción:

💰 Información de precios
💳 Métodos de pago
⚙️ Requisitos técnicos

🎫 Abre un ticket para soporte personalizado`
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
    return message.reply(ai(message.content));
  }
});

/* =========================
   BOTONES + TICKETS
========================= */
client.on("interactionCreate", async (interaction) => {

  if (!interaction.isButton()) return;

  /* ===== INFO BUTTONS ===== */
  if (interaction.customId === "prices") {
    return interaction.reply({
      content: "💰 Precios desde $X según servicio",
      ephemeral: true
    });
  }

  if (interaction.customId === "payments") {
    return interaction.reply({
      content: "💳 PayPal / Transferencia / Stripe",
      ephemeral: true
    });
  }

  if (interaction.customId === "requirements") {
    return interaction.reply({
      content: "⚙️ CPU, GPU, RAM mínimo 8GB, Windows actualizado",
      ephemeral: true
    });
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
      .setDescription(
`✨ Gracias por contactar UziBoost

Describe tu problema con detalle para ayudarte más rápido.

🚀 Nuestro equipo responderá pronto.`
      )
      .setColor("#22c55e");

    await channel.send({
      embeds: [embed],
      components: [btn]
    });

    return interaction.reply({
      content: "✅ Ticket creado correctamente",
      ephemeral: true
    });
  }

  /* ===== CERRAR ===== */
  if (interaction.customId === "close_ticket") {
    await interaction.reply("🔒 Cerrando ticket...");
    setTimeout(() => interaction.channel.delete().catch(() => {}), 2000);
  }
});

/* =========================
   LOGIN
========================= */
client.login(process.env.TOKEN);
