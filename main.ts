import {
  App,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  Editor,
  MarkdownView
} from "obsidian";

interface ObsidianRichLinksPluginSettings {
  mySetting: string;
}

const DEFAULT_SETTINGS: ObsidianRichLinksPluginSettings = {
  mySetting: "default",
};

export default class ObsidianRichLinksPlugin extends Plugin {
  settings: ObsidianRichLinksPlugin;

  async onload() {
    console.log("loading plugin");

    await this.loadSettings();

    this.addRibbonIcon("link", "Rich Links", () => {
      let activeLeaf = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (activeLeaf) {
        let editor = activeLeaf.editor;
        this.urlToIframe(editor);
      }
    });

    this.addCommand({
      id: "create-rich-links",
      name: "Create Rich Links",
      editorCheckCallback: (checking: boolean, editor: Editor) => {
        if (!checking) {
          this.urlToIframe(editor);
        }
        return true;
      },
    });
  }

  onunload() {
    console.log("unloading plugin");
  }

  isUrl(text: string): boolean {
    const urlRegex = new RegExp(
      "^(http:\\/\\/www\\.|https:\\/\\/www\\.|http:\\/\\/|https:\\/\\/)?[a-z0-9]+([\\-.]{1}[a-z0-9]+)*\\.[a-z]{2,5}(:[0-9]{1,5})?(\\/.*)?$"
    );
    return urlRegex.test(text);
  }

  urlToIframe(editor: Editor): void {
    let selectedText = editor.somethingSelected()
      ? editor.getSelection()
      : false;

    if (selectedText && this.isUrl(selectedText)) {
      const url = selectedText;
      ajaxPromise({
        url: `http://iframely.server.crestify.com/iframely?url=${url}`,
      }).then((res) => {
		  const data = JSON.parse(res);
		  const imageLink = data.links[0].href || '';

        editor.replaceSelection(`
<div class="rich-link-card-container"><a class="rich-link-card" href="${url}" target="_blank">
	<div class="rich-link-image-container">
		<div class="rich-link-image" style="background-image: url('${imageLink}')">
	</div>
	</div>
	<div class="rich-link-card-text">
		<h1 class="rich-link-card-title">${data.meta.title || ""}</h1>
		<p class="rich-link-card-description">
		${data.meta.description || ""}
		</p>
		<p class="rich-link-href">
		${url}
		</p>
	</div>
</a></div>

`);
      });
    } else {
      new Notice("Select a URL to convert to rich link.");
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class SampleModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen() {
    let { contentEl } = this;
    contentEl.setText("Woah!");
  }

  onClose() {
    let { contentEl } = this;
    contentEl.empty();
  }
}
