import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { existsSync } from 'fs';

export default class HelloWorldPlugin extends Plugin {

//is remote in data.json?
//  yes - load into remote variable
//  no - produce error, ask for origin


vault = this.app.vault.adapter
remote = ""
setup_commands = ["git init"];
commands = ["git add .", "git commit -m ", "git push origin main"];

	async onload() {

		//check if .git is present
		this.vault.exists("/.git/").then(
			(value) => {
				if(!value){
					//no repo found. run setup
				}
			});
		
	}

	async onunload() {
		//auto-sync 
	}
}
