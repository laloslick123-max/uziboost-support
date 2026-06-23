import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder
} from "discord.js";

import dotenv from "dotenv";
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

/* =========================
   🧠 CONFIG EN MEMORIA (por server)
========================= */
const config = new Map();

/* =========================
   🔥 SLASH COMMANDS
========================= */
const commands = [
  new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Sistema de tickets UziBoost")
    .addSubcommand(s =>
      s.setName("setup")
        .setDescription("Configurar sistema de tickets")
        .addChannelOption(o =>
          o.setName("canal")
            .setDescription("Canal donde irá el panel")
            .setRequired(true)
        )
        .addChannelOption(o =>
          o.setName("categoria")
            .setDescription("Categoría donde se crearán tickets")
            .setRequired(true)
        )
        .addChannelOption(o =>
          o.setName("logs")
            .setDescription("Canal de logs")
            .setRequired(false)
        )
    )
    .addSubcommand(s =>
      s.setName("send")
        .setDescription("Enviar panel de tickets")
        .addChannelOption(o =>
          o.setName("canal")
            .setDescription("Canal donde enviar")
            .setRequired(true)
        )
    )
].map(c => c.toJSON());

/* =========================
   🚀 REGISTER COMMANDS
========================= */
client.once("ready", async () => {
  console.log(`✅ Online como ${client.user.tag}`);

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  await rest.put(
    Routes.applicationCommands(client.user.id),
    { body: commands }
  );
});

/* =========================
   ⚙️ SLASH LOGIC
========================= */
client.on("interactionCreate", async (interaction) => {

  /* ===== PANEL ===== */
  if (interaction.isChatInputCommand()) {

    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === "setup") {
      const canal = interaction.options.getChannel("canal");
      const categoria = interaction.options.getChannel("categoria");
      const logs = interaction.options.getChannel("logs");

      config.set(guildId, {
        panel: canal.id,
        category: categoria.id,
        logs: logs?.id || null
      });

      return interaction.reply({
        content: "✅ Sistema configurado correctamente",
        ephemeral: true
      });
    }

    if (sub === "send") {
      const canal = interaction.options.getChannel("canal");

      const embed = new EmbedBuilder()
        .setTitle("🎫 UziBoost Support")
        .setDescription("Selecciona una categoría para abrir ticket")
        .setColor("#a855f7");

      const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("ticket_select")
          .setPlaceholder("Selecciona una opción")
          .addOptions(
            { label: "Soporte", value: "soporte", emoji: "🔧" },
            { label: "Compras", value: "compras", emoji: "💰" },
            { label: "Optimización", value: "opt", emoji: "⚡" }
          )
      );

      await canal.send({
        embeds: [embed],
        components: [menu]
      });

      return interaction.reply({
        content: "📩 Panel enviado",
        ephemeral: true
      });
    }
  }

  /* ===== TICKETS ===== */
  if (interaction.isStringSelectMenu()) {

    if (interaction.customId === "ticket_select") {

      const guildConfig = config.get(interaction.guild.id);
      if (!guildConfig) {
        return interaction.reply({
          content: "❌ Sistema no configurado",
          ephemeral: true
        });
      }

      const categoryId = guildConfig.category;
      const value = interaction.values[0];

      const channel = await interaction.guild.channels.create({
        name: `ticket-${value}-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: categoryId,
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
  }

  /* ===== CLOSE ===== */
  if (interaction.isButton()) {
    if (interaction.customId === "close_ticket") {
      await interaction.reply("🔒 Cerrando...");
      setTimeout(() => interaction.channel.delete(), 2000);
    }
  }
});

client.login(process.env.TOKEN);
