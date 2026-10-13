/**
 * Zettbos Notion-Style Block Editor Engine
 * Mengelola blok modular (H1, H2, H3, Text, Callout, Code, Image, Video)
 */

class NotionBlockEditor {
  constructor(containerId, initialBlocks = [], onChange = null) {
    this.container = document.getElementById(containerId);
    this.blocks = Array.isArray(initialBlocks) && initialBlocks.length > 0 
      ? JSON.parse(JSON.stringify(initialBlocks)) 
      : [{ type: 'h1', content: 'Judul Materi Baru' }, { type: 'text', content: 'Ketik penjelasan materi di sini...' }];
    this.onChange = onChange;
    this.render();
  }

  setBlocks(blocks) {
    this.blocks = Array.isArray(blocks) && blocks.length > 0 
      ? JSON.parse(JSON.stringify(blocks)) 
      : [{ type: 'h1', content: 'Judul Materi Baru' }, { type: 'text', content: 'Ketik isi materi...' }];
    this.render();
  }

  getBlocks() {
    return this.blocks;
  }

  addBlock(type = 'text', index = null) {
    const newBlock = {
      type: type,
      content: type === 'callout' ? 'Catatan penting untuk modul ini...' : (type === 'code' ? '// Ketik kode di sini' : ''),
      language: type === 'code' ? 'javascript' : undefined,
      url: type === 'image' ? '' : undefined
    };

    if (index === null || index >= this.blocks.length) {
      this.blocks.push(newBlock);
    } else {
      this.blocks.splice(index + 1, 0, newBlock);
    }
    this.render();
    if (this.onChange) this.onChange(this.blocks);
  }

  removeBlock(index) {
    if (this.blocks.length <= 1) {
      alert('Minimal harus ada 1 blok materi.');
      return;
    }
    this.blocks.splice(index, 1);
    this.render();
    if (this.onChange) this.onChange(this.blocks);
  }

  moveBlock(index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= this.blocks.length) return;
    const temp = this.blocks[index];
    this.blocks[index] = this.blocks[targetIndex];
    this.blocks[targetIndex] = temp;
    this.render();
    if (this.onChange) this.onChange(this.blocks);
  }

  updateBlockType(index, newType) {
    this.blocks[index].type = newType;
    if (newType === 'code' && !this.blocks[index].language) {
      this.blocks[index].language = 'javascript';
    }
    this.render();
    if (this.onChange) this.onChange(this.blocks);
  }

  updateBlockContent(index, newContent) {
    this.blocks[index].content = newContent;
    if (this.onChange) this.onChange(this.blocks);
  }

  updateBlockMeta(index, key, value) {
    this.blocks[index][key] = value;
    if (this.onChange) this.onChange(this.blocks);
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = '';

    const listContainer = document.createElement('div');
    listContainer.className = 'space-y-4';

    this.blocks.forEach((block, index) => {
      const blockEl = document.createElement('div');
      blockEl.className = 'group relative p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all';
      blockEl.dataset.index = index;

      // Header Toolbar of Block
      const toolbar = document.createElement('div');
      toolbar.className = 'flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-xs text-slate-400';

      const leftControls = document.createElement('div');
      leftControls.className = 'flex items-center gap-2';

      // Type Selector Dropdown
      const typeSelect = document.createElement('select');
      typeSelect.className = 'bg-slate-950 text-slate-200 border border-slate-700/80 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-emerald-500 outline-none';
      const options = [
        { value: 'h1', label: 'Heading 1 (H1)' },
        { value: 'h2', label: 'Heading 2 (H2)' },
        { value: 'h3', label: 'Heading 3 (H3)' },
        { value: 'text', label: 'Teks Normal (Paragraph)' },
        { value: 'callout', label: 'Kotak Tips (Callout Box)' },
        { value: 'code', label: 'Blok Kode (Code Block)' },
        { value: 'image', label: 'Gambar (Image URL)' },
        { value: 'video', label: 'Video YouTube Tambahan' }
      ];
      options.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt.value;
        o.textContent = opt.label;
        if (opt.value === block.type) o.selected = true;
        typeSelect.appendChild(o);
      });
      typeSelect.onchange = (e) => this.updateBlockType(index, e.target.value);
      leftControls.appendChild(typeSelect);

      // If code block, add language selector
      if (block.type === 'code') {
        const langSelect = document.createElement('select');
        langSelect.className = 'bg-slate-950 text-slate-300 border border-slate-700/80 rounded-md px-2 py-1 text-xs';
        ['javascript', 'html', 'css', 'json', 'python', 'sql'].forEach(l => {
          const lo = document.createElement('option');
          lo.value = l;
          lo.textContent = l.toUpperCase();
          if (l === block.language) lo.selected = true;
          langSelect.appendChild(lo);
        });
        langSelect.onchange = (e) => this.updateBlockMeta(index, 'language', e.target.value);
        leftControls.appendChild(langSelect);
      }

      // Right Action Buttons (Move up, Move down, Delete)
      const rightControls = document.createElement('div');
      rightControls.className = 'flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity';

      const btnUp = document.createElement('button');
      btnUp.type = 'button';
      btnUp.title = 'Geser ke atas';
      btnUp.className = 'p-1 hover:text-white rounded hover:bg-slate-800 disabled:opacity-20';
      btnUp.disabled = index === 0;
      btnUp.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>`;
      btnUp.onclick = () => this.moveBlock(index, -1);

      const btnDown = document.createElement('button');
      btnDown.type = 'button';
      btnDown.title = 'Geser ke bawah';
      btnDown.className = 'p-1 hover:text-white rounded hover:bg-slate-800 disabled:opacity-20';
      btnDown.disabled = index === this.blocks.length - 1;
      btnDown.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>`;
      btnDown.onclick = () => this.moveBlock(index, 1);

      const btnDelete = document.createElement('button');
      btnDelete.type = 'button';
      btnDelete.title = 'Hapus blok';
      btnDelete.className = 'p-1 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-950/40 ml-1';
      btnDelete.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`;
      btnDelete.onclick = () => this.removeBlock(index);

      rightControls.appendChild(btnUp);
      rightControls.appendChild(btnDown);
      rightControls.appendChild(btnDelete);

      toolbar.appendChild(leftControls);
      toolbar.appendChild(rightControls);
      blockEl.appendChild(toolbar);

      // Block Content Input based on type
      if (block.type === 'h1') {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = block.content || '';
        input.placeholder = 'Ketik Judul Besar (Heading 1)...';
        input.className = 'w-full bg-transparent text-xl font-bold text-white border-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50 rounded px-1 py-1';
        input.oninput = (e) => this.updateBlockContent(index, e.target.value);
        blockEl.appendChild(input);
      } else if (block.type === 'h2') {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = block.content || '';
        input.placeholder = 'Ketik Sub-judul (Heading 2)...';
        input.className = 'w-full bg-transparent text-lg font-semibold text-slate-100 border-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50 rounded px-1 py-1';
        input.oninput = (e) => this.updateBlockContent(index, e.target.value);
        blockEl.appendChild(input);
      } else if (block.type === 'h3') {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = block.content || '';
        input.placeholder = 'Ketik Judul Bagian (Heading 3)...';
        input.className = 'w-full bg-transparent text-base font-medium text-slate-200 border-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50 rounded px-1 py-1';
        input.oninput = (e) => this.updateBlockContent(index, e.target.value);
        blockEl.appendChild(input);
      } else if (block.type === 'text') {
        const textarea = document.createElement('textarea');
        textarea.rows = 3;
        textarea.value = block.content || '';
        textarea.placeholder = 'Tulis penjelasan normal di sini... (mendukung enter untuk paragraf baru)';
        textarea.className = 'w-full bg-transparent text-sm text-slate-300 border-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50 rounded px-1 py-1 resize-y leading-relaxed';
        textarea.oninput = (e) => this.updateBlockContent(index, e.target.value);
        blockEl.appendChild(textarea);
      } else if (block.type === 'callout') {
        const calloutWrapper = document.createElement('div');
        calloutWrapper.className = 'flex gap-3 p-3 rounded-lg bg-emerald-950/25 border border-emerald-500/30 text-emerald-200';
        calloutWrapper.innerHTML = `
          <div class="mt-0.5 text-emerald-400">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
        `;
        const textarea = document.createElement('textarea');
        textarea.rows = 2;
        textarea.value = block.content || '';
        textarea.placeholder = 'Ketik isi tips / catatan penting di sini...';
        textarea.className = 'w-full bg-transparent text-sm text-emerald-200 placeholder-emerald-500/60 border-none focus:outline-none focus:ring-1 focus:ring-emerald-400/40 rounded px-1 py-0.5 resize-y';
        textarea.oninput = (e) => this.updateBlockContent(index, e.target.value);
        calloutWrapper.appendChild(textarea);
        blockEl.appendChild(calloutWrapper);
      } else if (block.type === 'code') {
        const codeWrapper = document.createElement('div');
        codeWrapper.className = 'bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono';
        const textarea = document.createElement('textarea');
        textarea.rows = 4;
        textarea.value = block.content || '';
        textarea.placeholder = '// Tulis snippet kode di sini...';
        textarea.className = 'w-full bg-transparent text-xs text-emerald-300 font-mono border-none focus:outline-none focus:ring-0 resize-y';
        textarea.oninput = (e) => this.updateBlockContent(index, e.target.value);
        codeWrapper.appendChild(textarea);
        blockEl.appendChild(codeWrapper);
      } else if (block.type === 'image') {
        const imgInput = document.createElement('input');
        imgInput.type = 'text';
        imgInput.value = block.url || '';
        imgInput.placeholder = 'Masukkan URL Gambar (https://...)';
        imgInput.className = 'w-full bg-slate-950 text-xs text-slate-300 border border-slate-800 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none mb-2';
        imgInput.oninput = (e) => this.updateBlockMeta(index, 'url', e.target.value);

        const imgPreview = document.createElement('div');
        imgPreview.className = 'w-full h-32 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center';
        if (block.url) {
          imgPreview.innerHTML = `<img src="${block.url}" alt="Preview" class="w-full h-full object-cover">`;
        } else {
          imgPreview.innerHTML = `<span class="text-xs text-slate-600">Preview Gambar</span>`;
        }

        blockEl.appendChild(imgInput);
        blockEl.appendChild(imgPreview);
      } else if (block.type === 'video') {
        const vidInput = document.createElement('input');
        vidInput.type = 'text';
        vidInput.value = block.url || '';
        vidInput.placeholder = 'Masukkan Link Video YouTube (https://www.youtube.com/watch?v=...)';
        vidInput.className = 'w-full bg-slate-950 text-xs text-emerald-400 font-mono border border-slate-800 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none mb-2';
        vidInput.oninput = (e) => this.updateBlockMeta(index, 'url', e.target.value);

        const vidNote = document.createElement('p');
        vidNote.className = 'text-[11px] text-slate-500 italic mb-1';
        vidNote.textContent = 'Tips: Anda bisa menyisipkan video tambahan ini di antara teks atau setelah pembahasan kode.';

        blockEl.appendChild(vidInput);
        blockEl.appendChild(vidNote);
      }

      // Add Block In-between Button
      const addBetweenBtn = document.createElement('div');
      addBetweenBtn.className = 'flex justify-center -mb-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity';
      addBetweenBtn.innerHTML = `
        <button type="button" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 hover:bg-emerald-600 text-[11px] text-slate-300 hover:text-white transition-colors border border-slate-700">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Sisipkan Blok Baru
        </button>
      `;
      addBetweenBtn.querySelector('button').onclick = () => this.addBlock('text', index);
      blockEl.appendChild(addBetweenBtn);

      listContainer.appendChild(blockEl);
    });

    // Add Block At Bottom Bar
    const bottomBar = document.createElement('div');
    bottomBar.className = 'pt-2 flex flex-wrap gap-2 items-center';
    bottomBar.innerHTML = `
      <span class="text-xs text-slate-500 font-medium">Tambah Blok Cepat:</span>
      <button type="button" data-type="h2" class="btn-add-quick px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">+ Heading 2</button>
      <button type="button" data-type="text" class="btn-add-quick px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">+ Teks</button>
      <button type="button" data-type="callout" class="btn-add-quick px-2.5 py-1 text-xs rounded-lg bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-800/60">+ Callout Box</button>
      <button type="button" data-type="code" class="btn-add-quick px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-mono">+ Code</button>
      <button type="button" data-type="image" class="btn-add-quick px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">+ Gambar</button>
      <button type="button" data-type="video" class="btn-add-quick px-2.5 py-1 text-xs rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-700">+ Video YouTube</button>
    `;

    bottomBar.querySelectorAll('.btn-add-quick').forEach(btn => {
      btn.onclick = () => this.addBlock(btn.dataset.type);
    });

    this.container.appendChild(listContainer);
    this.container.appendChild(bottomBar);
  }
}

/**
 * Render block list to HTML for the Member Learning Room
 */
function renderBlocksToHtml(blocks) {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return '<p class="text-slate-400 italic">Belum ada catatan materi.</p>';
  }

  let html = '<div class="space-y-5 text-slate-300 prose-reading">';

  blocks.forEach(block => {
    if (block.type === 'h1') {
      html += `<h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-6 mb-3 border-b border-slate-800/80 pb-3">${escapeHtml(block.content)}</h1>`;
    } else if (block.type === 'h2') {
      html += `<h2 class="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight mt-6 mb-2">${escapeHtml(block.content)}</h2>`;
    } else if (block.type === 'h3') {
      html += `<h3 class="text-lg font-semibold text-slate-200 mt-4 mb-2">${escapeHtml(block.content)}</h3>`;
    } else if (block.type === 'text') {
      const formatted = escapeHtml(block.content).replace(/\n/g, '<br/>');
      html += `<p class="leading-relaxed text-slate-300 text-sm sm:text-base">${formatted}</p>`;
    } else if (block.type === 'callout') {
      html += `
        <div class="my-4 p-4 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex gap-3.5 items-start shadow-sm">
          <div class="text-emerald-400 mt-0.5">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div class="text-sm leading-relaxed text-emerald-200 font-medium">
            ${escapeHtml(block.content).replace(/\n/g, '<br/>')}
          </div>
        </div>
      `;
    } else if (block.type === 'code') {
      const codeId = 'code-' + Math.random().toString(36).substring(2, 9);
      html += `
        <div class="my-4 rounded-xl overflow-hidden border border-slate-800 bg-slate-950/90 shadow-lg">
          <div class="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400">
            <span class="font-mono uppercase tracking-wider text-[11px] text-cyan-400 font-bold">${block.language || 'CODE'}</span>
            <div class="flex items-center gap-1.5">
              <button onclick="saveSnippetToFavorites('${codeId}', '${escapeHtml(block.language || 'javascript')}')" class="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-amber-950/40 text-slate-300 hover:text-amber-300 border border-slate-700/80 hover:border-amber-600/40 transition-colors text-xs" title="Simpan snippet ini ke menu Favorit">
                <svg class="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                <span>Simpan</span>
              </button>
              <button onclick="copyCodeSnippet('${codeId}')" class="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs">
                <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                <span>Salin</span>
              </button>
            </div>
          </div>
          <pre id="${codeId}" class="p-3.5 sm:p-4 text-xs sm:text-sm font-mono text-emerald-300 overflow-x-auto leading-relaxed"><code>${escapeHtml(block.content)}</code></pre>
        </div>
      `;
    } else if (block.type === 'image') {
      html += `
        <div class="my-5 rounded-lg overflow-hidden border border-slate-800 bg-slate-900/50 shadow-md">
          <img src="${escapeHtml(block.url || '')}" alt="Gambar Materi" class="w-full max-h-96 object-cover" onerror="this.style.display='none'">
        </div>
      `;
    } else if (block.type === 'video') {
      let embedId = 'dQw4w9WgXcQ';
      if (block.url) {
        const match = block.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        if (match) embedId = match[1];
      }
      html += `
        <div class="my-5">
          <div class="video-responsive-container">
            <iframe 
              src="https://www.youtube-nocookie.com/embed/${embedId}?rel=0&modestbranding=1" 
              title="Video Pembelajaran Tambahan" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen>
            </iframe>
          </div>
        </div>
      `;
    }
  });

  html += '</div>';
  return html;
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.NotionBlockEditor = NotionBlockEditor;
window.renderBlocksToHtml = renderBlocksToHtml;
window.copyCodeSnippet = function(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const text = el.innerText;
  navigator.clipboard.writeText(text).then(() => {
    showToast('Kode berhasil disalin ke clipboard', 'success');
  }).catch(() => {
    showToast('Gagal menyalin kode', 'error');
  });
};
