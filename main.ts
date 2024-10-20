import {
	App,
	ButtonComponent,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import { existsSync } from "fs";
import { exec, ExecException } from "child_process";
var moment = require("moment");

interface VCSyncSettings {
	remote: string;
	period: number;
}

const DEFAULT_SETTINGS: Partial<VCSyncSettings> = {
	remote: "",
	period: 0,
};

export default class VCSyncPlugin extends Plugin {
	settings: VCSyncSettings;
	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	vault = this.app.vault.adapter;
	setup_commands = ["git init"];

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new SettingTab(this.app, this));

		this.addRibbonIcon("folder-sync", "Sync", ()=> {
			this.doSync()
		});

		//check if .git is present
		this.vault.exists("/.git/").then((value) => {
			if (!value) {
				//no repo found. run setup
				exec(
					"git init",
					(
						err: ExecException | null,
						stdout: string,
						stderr: string
					) => {
						if (err) {
							new Notice(
								"failed to create local Repository. Is Git configured?"
							);
						}
					}
				);
			}
		});
	}


	doSync() {
		//get current date and time		
		let message = moment().format("yyyy-MM-DD:HH:mm:ss"); // TODO: change to an customizable message
		let proceed = true;
		let commands = ["git add .", "git commit -m \" SYNC " + message + "\"", "git push origin main"];

		new Notice("SYNC " + message + " in progress");


		for (const command of commands) {
			if (proceed) {
				console.log(command);
				exec(
					command,
					(
						err: ExecException | null,
						stdout: string,
						stderr: string
					) => {
						if (err) {
							new Notice(
								"Sync failed. Could be a bad configuration, could be bad internet, could be a bug."
							);
							console.log(stderr);
						} else {
							console.log(stdout);
						}
					}
				);
			}
		}
	}

	async updateRemote() {
		if (this.settings.remote) {
			exec(
				"git remote add origin " + this.settings.remote,
				(err: ExecException | null, stdout: string, stderr: string) => {
					if (err) {
						if(stderr === "remote origin already exists") {
							exec(
								"git remote set-url origin " + this.settings.remote, 
								(err: ExecException | null, stdout: string, stderr: string) => {
									if (err) {
										new Notice("Remote seems invalid");
										return;
									}
								})
						}
						new Notice(
							"failed to connect to remote repository. Is the URL correct?"
						);
					}
				}
			);
		}
	}

}

export class SettingTab extends PluginSettingTab {
	plugin: VCSyncPlugin;

	constructor(app: App, plugin: VCSyncPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Remote URL")
			.setDesc("Remote URL for remote repository.")
			.addText((text) =>
				text
					.setPlaceholder("https://github.com/...")
					.setValue(this.plugin.settings.remote)
					.onChange(async (value) => {
						this.plugin.settings.remote = value;
						await this.plugin.saveSettings();
					})
			);

		new ButtonComponent(containerEl)
		.setButtonText("Register remote")
		.onClick(() => {
			this.plugin.updateRemote();

		})

		new ButtonComponent(containerEl)
			.setButtonText("Sync Now")
			.onClick(() => new Notice("we are syncing we are syncing!"));
	}
}
