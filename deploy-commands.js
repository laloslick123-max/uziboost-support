import { REST, Routes, SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

/* =========================
   SLASH COMMANDS
========================= */
const commands = [
  new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Abrir panel de tickets UziBoost")
].map(command => command.toJSON());

/* =========================
   REST CLIENT
========================= */
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

/* =========================
   DEPLOY FUNCTION
========================= */
(async () => {
  try {
    console.log("🔄 Registrando slash commands...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log("✅ Slash commands registrados correctamente");
  } catch (error) {
    console.error("❌ Error al registrar comandos:", error);
  }
})();
