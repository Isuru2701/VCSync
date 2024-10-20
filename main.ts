import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { existsSync } from 'fs';

export default class HelloWorldPlugin extends Plugin {

//is remote in data.json?
//  yes - load into remote variable
//  no - produce error, ask for origin



remote = ""
setup_commands = ["git init"];
commands = ["git add .", "git commit -m ", "git push origin main"];

	async onload() {

		//check if .git is present
		//if not, run setup_commands
		if(!existsSync(".git")){
			new Notice("GIT NOT INIT");
			new Notice(process.cwd());
		}
		else {
			new Notice("GIT FOUND!");
		}
		
	}

	async onunload() {
		//auto-sync 
	}
}
