function convertGoogleDriveUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  const fileIdMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`;
  }
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${idParamMatch[1]}`;
  }
  return trimmed;
}
if (typeof window !== 'undefined') window.convertGoogleDriveUrl = convertGoogleDriveUrl;

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

  createFormatToolbar(targetInput) {
    const bar = document.createElement('div');
    bar.className = 'flex flex-wrap items-center gap-1 mb-2 pb-1.5 border-b border-slate-800/80 text-[11px]';
    
    const label = document.createElement('span');
    label.className = 'text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-1';
    label.textContent = 'Format:';
    bar.appendChild(label);

    const makeBtn = (text, title, prefix, suffix, defaultTxt, btnClass) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `px-2 py-0.5 rounded text-xs transition-colors flex items-center gap-1 ${btnClass}`;
      btn.title = title;
      btn.innerHTML = text;
      btn.onclick = (e) => {
        e.preventDefault();
        applyFormatToInput(targetInput, prefix, suffix, defaultTxt);
      };
      return btn;
    };

    bar.appendChild(makeBtn('<b>B</b>', 'Tebal (Bold: **teks**)', '**', '**', 'teks tebal', 'bg-slate-800 hover:bg-slate-700 text-white font-bold border border-slate-700'));
    bar.appendChild(makeBtn('<i>I</i>', 'Miring (Italic: *teks*)', '*', '*', 'teks miring', 'bg-slate-800 hover:bg-slate-700 text-slate-200 italic border border-slate-700'));
    bar.appendChild(makeBtn('🖍️ Kuning', 'Stabilo Neon Kuning (==teks==)', '==', '==', 'stabilo kuning', 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold border border-amber-500/40'));
    bar.appendChild(makeBtn('🟢 Hijau', 'Stabilo Hijau (==green:teks==)', '==green:', '==', 'stabilo hijau', 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold border border-emerald-500/40'));
    bar.appendChild(makeBtn('🔵 Cyan', 'Stabilo Cyan (==cyan:teks==)', '==cyan:', '==', 'stabilo cyan', 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold border border-cyan-500/40'));
    bar.appendChild(makeBtn('🌸 Pink', 'Stabilo Pink (==pink:teks==)', '==pink:', '==', 'stabilo pink', 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold border border-rose-500/40'));

    return bar;
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
        { value: 'video', label: 'Video (YouTube / Google Drive)' }
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
        textarea.placeholder = 'Tulis penjelasan normal di sini... (gunakan toolbar format di atas untuk tebal, miring & stabilo)';
        textarea.className = 'w-full bg-transparent text-sm text-slate-300 border-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50 rounded px-1 py-1 resize-y leading-relaxed';
        textarea.oninput = (e) => this.updateBlockContent(index, e.target.value);
        blockEl.appendChild(this.createFormatToolbar(textarea));
        blockEl.appendChild(textarea);
      } else if (block.type === 'callout') {
        const calloutWrapper = document.createElement('div');
        calloutWrapper.className = 'flex flex-col gap-2 p-3 rounded-lg bg-emerald-950/25 border border-emerald-500/30 text-emerald-200';
        
        const topRow = document.createElement('div');
        topRow.className = 'flex gap-2 items-start';
        topRow.innerHTML = `
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
        topRow.appendChild(textarea);
        
        calloutWrapper.appendChild(this.createFormatToolbar(textarea));
        calloutWrapper.appendChild(topRow);
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
        imgInput.placeholder = 'Masukkan URL Gambar (Google Drive link / Direct URL https://...)';
        imgInput.className = 'w-full bg-slate-950 text-xs text-slate-300 border border-slate-800 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none mb-2 font-mono';

        const imgPreview = document.createElement('div');
        imgPreview.className = 'w-full min-h-[140px] max-h-80 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center relative p-2';

        const updatePreview = (rawUrl) => {
          const directUrl = convertGoogleDriveUrl(rawUrl);
          if (directUrl) {
            imgPreview.innerHTML = `
              <img 
                src="${escapeHtml(directUrl)}" 
                alt="Preview" 
                class="w-full h-full max-h-72 object-contain rounded-lg" 
                onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'flex flex-col items-center justify-center p-3 text-center text-xs text-rose-400 gap-1\\'><span>⚠️ Gagal memuat gambar.</span><span class=\\'text-[11px] text-slate-400\\'>Pastikan izin share Google Drive disetel ke <b>\\'Anyone with the link\\' (Siapa saja yang memiliki link)</b>.</span></div>';"
              />
            `;
          } else {
            imgPreview.innerHTML = `<span class="text-xs text-slate-600">Preview Gambar (Paste link Google Drive atau URL gambar)</span>`;
          }
        };

        imgInput.oninput = (e) => {
          const raw = e.target.value;
          const converted = convertGoogleDriveUrl(raw);
          this.updateBlockMeta(index, 'url', converted);
          updatePreview(converted);
        };

        updatePreview(block.url);

        blockEl.appendChild(imgInput);
        blockEl.appendChild(imgPreview);
      } else if (block.type === 'video') {
        const vidInput = document.createElement('input');
        vidInput.type = 'text';
        vidInput.value = block.url || '';
        vidInput.placeholder = 'Masukkan Link Video (YouTube atau Google Drive: https://drive.google.com/file/d/.../view)';
        vidInput.className = 'w-full bg-slate-950 text-xs text-emerald-400 font-mono border border-slate-800 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none mb-2';
        vidInput.oninput = (e) => this.updateBlockMeta(index, 'url', e.target.value);

        const vidNote = document.createElement('p');
        vidNote.className = 'text-[11px] text-slate-500 italic mb-1';
        vidNote.textContent = 'Tips: Mendukung YouTube maupun Google Drive (pastikan video GDrive di-set "Anyone with the link can view").';

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
      <button type="button" data-type="video" class="btn-add-quick px-2.5 py-1 text-xs rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-700">+ Video (YT / GDrive)</button>
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

  let html = '<div class="space-y-6 text-slate-100 prose-reading w-full">';

  blocks.forEach(block => {
    if (block.type === 'h1') {
      html += `<h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-6 mb-3 border-b border-slate-800/80 pb-3">${formatRichText(block.content)}</h1>`;
    } else if (block.type === 'h2') {
      html += `<h2 class="text-xl sm:text-2xl font-bold text-white tracking-tight mt-6 mb-2">${formatRichText(block.content)}</h2>`;
    } else if (block.type === 'h3') {
      html += `<h3 class="text-lg font-bold text-slate-100 mt-4 mb-2">${formatRichText(block.content)}</h3>`;
    } else if (block.type === 'text') {
      html += `<p class="leading-relaxed text-slate-100 text-sm sm:text-base">${formatRichText(block.content)}</p>`;
    } else if (block.type === 'callout') {
      html += `
        <div class="my-4 p-4 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex gap-3.5 items-start shadow-sm">
          <div class="text-emerald-400 mt-0.5">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div class="text-sm leading-relaxed text-emerald-100 font-medium">
            ${formatRichText(block.content)}
          </div>
        </div>
      `;
    } else if (block.type === 'code') {
      const codeId = 'code-' + Math.random().toString(36).substring(2, 9);
      html += `
        <div class="notion-code-block my-4 rounded-xl overflow-hidden border border-slate-800 bg-slate-950/90 shadow-lg">
          <div class="notion-code-header flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400">
            <div class="notion-code-dots flex items-center gap-1.5 py-0.5">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500/70 inline-block"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500/70 inline-block"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500/70 inline-block"></span>
              <span class="notion-code-lang text-[11px] font-mono text-slate-400 font-semibold uppercase tracking-wider ml-1.5 hidden sm:inline-block">${escapeHtml(block.language || 'code')}</span>
            </div>
            <div class="notion-code-actions flex items-center gap-1.5">
              <button onclick="saveSnippetToFavorites('${codeId}', '${escapeHtml(block.language || 'javascript')}')" class="notion-code-btn flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-amber-950/40 text-slate-300 hover:text-amber-300 border border-slate-700/80 hover:border-amber-600/40 transition-colors text-xs" title="Simpan snippet ini ke menu Favorit">
                <svg class="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                <span>Simpan</span>
              </button>
              <button onclick="copyCodeSnippet('${codeId}')" class="notion-code-btn flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs">
                <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                <span>Salin</span>
              </button>
            </div>
          </div>
          <pre id="${codeId}" class="notion-code-pre p-3.5 sm:p-4 text-xs sm:text-sm font-mono text-emerald-300 overflow-x-auto leading-relaxed"><code class="notion-code-inner">${escapeHtml(block.content)}</code></pre>
        </div>
      `;
    } else if (block.type === 'image') {
      const directUrl = typeof convertGoogleDriveUrl === 'function' ? convertGoogleDriveUrl(block.url || '') : (block.url || '');
      html += `
        <div class="my-5 rounded-xl overflow-hidden border border-slate-800 bg-slate-950/80 shadow-lg flex items-center justify-center p-1 sm:p-2">
          <img src="${escapeHtml(directUrl)}" alt="Gambar Materi" class="w-full max-h-[560px] object-contain rounded-lg" onerror="this.style.display='none'">
        </div>
      `;
    } else if (block.type === 'video') {
      const embedInfo = resolveVideoEmbedSource(block.url);
      html += `
        <div class="my-5">
          <div class="video-responsive-container">
            <iframe 
              src="${escapeHtml(embedInfo.src)}" 
              title="Video Pembelajaran" 
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

/**
 * Smart Video Embed URL Resolver (Revisi 91):
 * Mendukung YouTube (youtu.be / youtube.com) dan Google Drive (drive.google.com/file/d/.../view).
 */
function resolveVideoEmbedSource(url) {
  if (!url || typeof url !== 'string') {
    return { type: 'youtube', src: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1' };
  }
  const cleanUrl = url.trim();

  // 1. Google Drive Video Parser
  // Pola: drive.google.com/file/d/FILE_ID/... atau drive.google.com/open?id=FILE_ID
  const driveMatch = cleanUrl.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/i);
  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return {
      type: 'gdrive',
      src: `https://drive.google.com/file/d/${fileId}/preview`
    };
  }

  // 2. YouTube Video Parser
  const ytMatch = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      src: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`
    };
  }

  // 3. Native Embed URL Fallback
  if (cleanUrl.includes('/embed/') || cleanUrl.includes('/preview')) {
    return { type: 'embed', src: cleanUrl };
  }

  return { type: 'youtube', src: `https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1` };
}
window.resolveVideoEmbedSource = resolveVideoEmbedSource;

function formatRichText(text) {
  if (!text) return '';
  let str = escapeHtml(text);

  // 1. Stabilo / Highlighter (Multi-color background)
  // Green / Hijau: ==green:text== atau ==hijau:text==
  str = str.replace(/==(?:green|hijau):([\s\S]+?)==/gi, '<mark class="mark-highlight mark-green bg-emerald-500/25 text-emerald-200 px-1.5 py-0.5 rounded border border-emerald-500/40 font-medium">$1</mark>');
  // Cyan / Biru: ==cyan:text== atau ==biru:text==
  str = str.replace(/==(?:cyan|biru):([\s\S]+?)==/gi, '<mark class="mark-highlight mark-cyan bg-cyan-500/25 text-cyan-200 px-1.5 py-0.5 rounded border border-cyan-500/40 font-medium">$1</mark>');
  // Pink / Rose: ==pink:text== atau ==rose:text==
  str = str.replace(/==(?:pink|rose):([\s\S]+?)==/gi, '<mark class="mark-highlight mark-pink bg-rose-500/25 text-rose-200 px-1.5 py-0.5 rounded border border-rose-500/40 font-medium">$1</mark>');
  // Purple / Ungu: ==purple:text== atau ==ungu:text==
  str = str.replace(/==(?:purple|ungu):([\s\S]+?)==/gi, '<mark class="mark-highlight mark-purple bg-purple-500/25 text-purple-200 px-1.5 py-0.5 rounded border border-purple-500/40 font-medium">$1</mark>');
  // Standard Neon Yellow Stabilo: ==text==
  str = str.replace(/==([\s\S]+?)==/g, '<mark class="mark-highlight mark-amber bg-amber-400/30 text-amber-200 px-1.5 py-0.5 rounded border border-amber-400/40 font-medium shadow-sm">$1</mark>');

  // 2. Bold: **text**
  str = str.replace(/\*\*([\s\S]+?)\*\*/g, '<strong class="rich-bold font-bold text-white">$1</strong>');

  // 3. Italic: *text* (excluding already formatted)
  str = str.replace(/(^|[^*])\*(?!\*)([^*]+?)\*(?!\*)/g, '$1<em class="rich-italic italic text-slate-100">$2</em>');

  // 4. Line break support
  str = str.replace(/\n/g, '<br/>');

  return str;
}
window.formatRichText = formatRichText;

function applyFormatToInput(inputOrTextarea, prefix, suffix, defaultText) {
  if (!inputOrTextarea) return;
  const start = inputOrTextarea.selectionStart;
  const end = inputOrTextarea.selectionEnd;
  const text = inputOrTextarea.value;
  const selected = text.substring(start, end);
  const insertContent = selected || defaultText;
  const replacement = prefix + insertContent + suffix;
  inputOrTextarea.value = text.substring(0, start) + replacement + text.substring(end);
  inputOrTextarea.focus();
  const selectStart = start + prefix.length;
  const selectEnd = selectStart + insertContent.length;
  inputOrTextarea.setSelectionRange(selectStart, selectEnd);
  inputOrTextarea.dispatchEvent(new Event('input', { bubbles: true }));
}
window.applyFormatToInput = applyFormatToInput;

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
