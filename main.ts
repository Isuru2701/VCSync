import { App, ButtonComponent, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { existsSync } from 'fs';
import { exec, ExecException } from 'child_process';


interface VCSyncSettings {
	remote: string;
	commit_message_template: string;
	period: number;
}

const DEFAULT_SETTINGS: Partial<VCSyncSettings> = {
	remote: '',
	commit_message_template: "SYNC YY/MM/DD HH:mm",
	period: 0
};

export default class VCSyncPlugin extends Plugin {

	settings: VCSyncSettings;
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}


	vault = this.app.vault.adapter;
	setup_commands = ["git init"];
	commands = ["git add .", "git commit -m ", "git push origin main"];

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new SettingTab(this.app, this));

		//check if .git is present
		this.vault.exists("/.git/").then(
			(value) => {
				if(!value){
					//no repo found. run setup
					exec("git init", (err:ExecException | null, stdout:string, stderr:string) => {
						if(err) {
							new Notice("failed to create local Repository. Is Git setup?");
						}
					})
				}
			});
		
		
		
	}

	async onunload() {
		//auto-sync 
	}
}


export class SettingTab extends PluginSettingTab{
	plugin: VCSyncPlugin;

	
	constructor(app: App, plugin: VCSyncPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	  }
	
	  display(): void {
		let { containerEl } = this;
	
		containerEl.empty();
	
		new Setting(containerEl)
		  .setName('Remote URL')
		  .setDesc('Remote URL for remote repository.')
		  .addText((text) =>
			text
			  .setPlaceholder('https://github.com/...')
			  .setValue(this.plugin.settings.remote)
			  .onChange(async (value) => {
				this.plugin.settings.remote = value;
				await this.plugin.saveSettings();
			  })
		  );

		new Setting(containerEl)
		.setName("Commit Message Template")
		.setDesc("Template for easy commit message")
		.addText((text) =>
		text.setPlaceholder("SYNC YY/MM/DD HH:mm").
		setValue(this.plugin.settings.commit_message_template)
		.onChange(async (value)=> {
			if(value){
			this.plugin.settings.commit_message_template = value;
			await this.plugin.saveSettings();
			}
		})
	)
		;

		new ButtonComponent(containerEl)
		.setButtonText("Sync Now")
		.onClick(() => new Notice("we are syncing we are syncing!"));


	  }

}