import { App, ButtonComponent, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { existsSync } from 'fs';


interface VCSyncSettings {
	remote: string;
	period: number;
}

const DEFAULT_SETTINGS: Partial<VCSyncSettings> = {
	remote: '',
	period: 0
};

export default class VCSyncPlugin extends Plugin {

//is remote in data.json?
//  yes - load into remote variable
//  no - produce error, ask for origin
	settings: VCSyncSettings;
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}




	vault = this.app.vault.adapter
	remote = ""
	setup_commands = ["git init"];
	commands = ["git add .", "git commit -m ", "git push origin main"];

	async onload() {
		this.addSettingTab(new SettingTab(this.app, this));
		//check if .git is present
		this.vault.exists("/.git/").then(
			(value) => {
				if(!value){
					//no repo found. run setup
				}
			});

		await this.loadSettings();
		
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
		new ButtonComponent(containerEl)
		.setButtonText("Sync Now")
		.onClick(() => new Notice("we are syncing we are syncing!"));


	  }

}