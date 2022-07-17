// Assuming a 'markdown-it' global
const md = window.markdownit({
  html: true,
  xhtmlOut: true,
  breaks: false,
  linkify: true,
  typographer: true,
  highlight: true
})

class MarkdownElement extends HTMLElement {
  connectedCallback() {
    // Make sure markdown element has a position so sub-elements are positioned relative to it
    this.style.display = "block";
    this.style.position = "relative";

    // Make input
    this.editor = document.createElement("textarea");
    this.editor.className = "md-editor";
    this.appendChild(this.editor);
    // Make viewer
    this.viewer = document.createElement("div");
    this.viewer.className = "md-viewer";
    this.viewer.style = document.style;
    this.appendChild(this.viewer);
    // Make toggle button
    this.toggle = document.createElement("a");
    this.toggle.className = "md-toggle"
    this.toggle.parent = this;
    this.toggle.onclick = toggleMarkdownMode;
    this.appendChild(this.toggle);
    // Hide toggle in readonly mode
    if ("readonly" in this.dataset) {
        this.toggle.style.display = "none";
    }

    // Make both editor and viewer the same size as markdown element
    for (let subemt of [this.editor, this.viewer]) {
      if (!("readonly" in this.dataset)) {
        subemt.style.position = "absolute";
        subemt.style.height = "100%";
      }
      subemt.style.width = "100%";
      subemt.style.top = subemt.style.left = subemt.style.bottom = subemt.style.right = 0;
    }
    // Style editor
    this.editor.style.resize = "none";
    this.editor.style.overflowY = "auto";
    // Style viewer
    this.viewer.style.overflowY = "auto";
    // Position button
    this.toggle.style.position = "absolute";
    this.toggle.style.left = "calc(100% + 10px)";

    // Set initial mode to view if requested
    let mode = this.getAttribute("mode")
    if (mode === "view" || "readonly" in this.dataset) {
      this.editor.hidden = true;
      this.toggle.mode = this.mode = "view";
      this.toggle.textContent = "✏";
    } else {
      // Otherwise set to edit
      this.viewer.hidden = true;
      this.toggle.mode = this.mode = "edit";
      this.toggle.textContent = "👁";
    }
    // Link to settable post-render function
    let func = window[this.dataset.postrender];
    if (func) {
      this.postrender = func;
    } else {
      this.postrender = function(raw) {return raw}
      if (this.dataset.postrender) {
        console.log(`Function ${this.dataset.postrender} not found, will use default postrender.`)
      }
    }
    // Wait for DOM to load
    setTimeout(() => {
        // Clear initial contents
        let content = ""
        // If given
        if (this.dataset.src) {
          // Create reader
          let xmlhttp
          if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();
          }
          else {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
          }
          xmlhttp.parent = this;
          xmlhttp.onreadystatechange = function() {
            this.parent.editor.value = xmlhttp.responseText;
            // Render
            this.parent.render();
          }
          xmlhttp.open("GET", this.dataset.src, true);

          // Load
          xmlhttp.send();
        } else {
          // Store initial contents
          for (let node of this.childNodes) {
            if (node instanceof Text) {
                content = node.nodeValue;
                node.nodeValue = "";
            }
          }
          // Assign contents to editor
          this.editor.value = content;
          // Render
          this.render();
        }
    });
  }

  render() {
     let firstpass = md.render(this.editor.value);
     this.viewer.innerHTML = this.postrender(firstpass);
  }

  // Alias MarkdownElement value with the value of its editor
  get value() {
    return this.editor.value
  }
  set value(val) {
    this.editor.value = val
    this.render();
  }
}
customElements.define("mark-down", MarkdownElement);

function toggleMarkdownMode(evt) {
  let button = evt.currentTarget
  // Toggle button mode
  if (button.mode === "edit") {
    button.mode = "view";
  } else if (button.mode === "view") {
    button.mode = "edit";
  }
  button.parent.mode = button.mode
  // Make changes according to new button mode
  if (button.mode === "edit") {
    // If mode is edit, hide viewer and show editor
    button.parent.viewer.hidden = true;
    button.parent.editor.hidden = false;
    // Set icon on button to be eye
    button.textContent = "👁";
  }
  if (button.mode === "view") {
    // Render markdown
    button.parent.render()
    // If mode is view, hide editor and show viewer
    button.parent.viewer.hidden = false;
    button.parent.editor.hidden = true;
    // Set icon on button to be eye
    button.textContent = "✏";
  }
}