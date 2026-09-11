document.getElementById("ano").textContent = new Date().getFullYear();

// PROCESSAR VÍDEO SELECIONADO DA GALERIA
function processarVideoGaleria(files) {
  if (!files || !files.length) return;

  const file = files[0];
  // Cria uma URL local direta no dispositivo
  const localVideoUrl = URL.createObjectURL(file);

  // Exibe na caixa de resultado
  document.getElementById('generatedVideoUrl').value = localVideoUrl;
  document.getElementById('vgResultBox').style.display = 'block';

  // Abre diretamente no player em tela cheia
  abrirPlayerComUrl(localVideoUrl);
}

// GERAR/ABRIR LINK DIRETO DIGITADO
function gerarUrlVideo() {
  const rawUrl = document.getElementById('videoUrlInput').value.trim();
  if (!rawUrl) {
    alert("Por favor, digite ou cole um link de vídeo válido.");
    return;
  }

  document.getElementById('generatedVideoUrl').value = rawUrl;
  document.getElementById('vgResultBox').style.display = 'block';

  // Abre em tela cheia
  abrirPlayerComUrl(rawUrl);
}

// ABRE O PLAYER EM TELA CHEIA
function abrirPlayerComUrl(videoUrl) {
  if (!videoUrl) return;

  const playerView = document.getElementById('fullscreen-player-view');
  const videoElement = document.getElementById('fullVideoElement');
  
  videoElement.src = videoUrl;
  videoElement.load();
  playerView.style.display = 'flex';

  // Solicita tela cheia nativa do dispositivo (se suportado)
  if (videoElement.requestFullscreen) {
    videoElement.requestFullscreen().catch(() => {});
  } else if (videoElement.webkitRequestFullscreen) {
    videoElement.webkitRequestFullscreen();
  }
}

// FECHA O PLAYER E RESTAURA A PÁGINA
function fecharVideoEVoltar() {
  const playerView = document.getElementById('fullscreen-player-view');
  const videoElement = document.getElementById('fullVideoElement');

  videoElement.pause();
  videoElement.src = '';
  playerView.style.display = 'none';

  if (document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
}

// NAVEGAÇÃO DE ABAS
function mostrarAba(aba) {
  const secaoApps = document.getElementById('secao-apps');
  const secaoDropZone = document.getElementById('secao-dropzone');
  const secaoVideo = document.getElementById('secao-video-generator');
  
  const btnApps = document.getElementById('btn-tab-apps');
  const btnHost = document.getElementById('btn-tab-host');
  const btnVideo = document.getElementById('btn-tab-video');

  secaoApps.style.display = 'none';
  secaoDropZone.classList.remove('active');
  secaoVideo.classList.remove('active');

  btnApps.classList.remove('active');
  btnHost.classList.remove('active');
  btnVideo.classList.remove('active');

  if (aba === 'dropzone') {
    secaoDropZone.classList.add('active');
    btnHost.classList.add('active');
  } else if (aba === 'video') {
    secaoVideo.classList.add('active');
    btnVideo.classList.add('active');
  } else {
    secaoApps.style.display = 'block';
    btnApps.classList.add('active');
  }
}

// MODAL DE INSTRUÇÕES
function abrirInstrucoes(nome, icone, link, nota) {
  document.getElementById("modalName").textContent = nome;
  document.getElementById("modalImg").src = icone;
  document.getElementById("modalIcon").classList.remove("broken");
  document.getElementById("modalLink").href = link;

  const modalNote = document.getElementById("modalNote");
  if (nota) {
    modalNote.innerHTML = "<strong>Observação:</strong> " + nota;
    modalNote.style.display = "block";
  } else {
    modalNote.innerHTML = "";
    modalNote.style.display = "none";
  }

  document.getElementById("modal").classList.add("open");
}

function fecharInstrucoes() {
  document.getElementById("modal").classList.remove("open");
}

document.getElementById("modal").addEventListener("click", function(e) {
  if (e.target === this) fecharInstrucoes();
});

// UPLOAD DE IMAGEM (IMGBB)
const IMGBB_API_KEY = "8980b893a10690c3abe72da7806bc5af";
const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressStatus = document.getElementById('progressStatus');
const galleryGrid = document.getElementById('galleryGrid');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, (e) => { e.preventDefault(); e.stopPropagation(); }, false);
});

['dragenter', 'dragover'].forEach(eventName => dropArea.classList.add('drag-over'));
['dragleave', 'drop'].forEach(eventName => dropArea.classList.remove('drag-over'));

dropArea.addEventListener('drop', (e) => handleFiles(e.dataTransfer.files));
fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

function handleFiles(files) {
  if (!files.length) return;
  Array.from(files).forEach(file => uploadImage(file));
}

function uploadImage(file) {
  progressContainer.style.display = 'block';
  progressFill.style.width = '40%';
  progressStatus.innerText = `Enviando "${file.name}"...`;

  const formData = new FormData();
  formData.append('image', file);

  fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      progressFill.style.width = '100%';
      progressStatus.innerText = 'Upload concluído!';

      const d = data.data;
      createImageCard(file.name, d.display_url || d.url, d.url, d.url_viewer);

      setTimeout(() => {
        progressContainer.style.display = 'none';
        progressFill.style.width = '0%';
      }, 1200);
    } else {
      alert('Ocorreu um erro no upload da imagem.');
      progressContainer.style.display = 'none';
    }
  })
  .catch(err => {
    console.error(err);
    alert('Erro ao conectar com o servidor.');
    progressContainer.style.display = 'none';
  });
}

function createImageCard(fileName, previewUrl, directUrl, viewerUrl) {
  const card = document.createElement('div');
  card.className = 'item-card';

  card.innerHTML = `
    <div class="preview-box">
      <img src="${previewUrl}" alt="${fileName}">
    </div>
    <div class="item-details">
      <div class="item-name" title="${fileName}">${fileName}</div>
      <div class="link-group">
        <span class="link-label">Link Direto:</span>
        <div class="input-copy-wrapper">
          <input type="text" value="${directUrl}" readonly onclick="this.select()">
          <button type="button" class="btn-copy" onclick="copyText(event, '${directUrl}')"><i class="fa-solid fa-copy"></i></button>
        </div>
      </div>
      <div class="link-group">
        <span class="link-label">Página da Imagem:</span>
        <div class="input-copy-wrapper">
          <input type="text" value="${viewerUrl}" readonly onclick="this.select()">
          <button type="button" class="btn-copy" onclick="copyText(event, '${viewerUrl}')"><i class="fa-solid fa-copy"></i></button>
        </div>
      </div>
    </div>
  `;
  
  galleryGrid.prepend(card);
}

function copyText(e, text) {
  if (e) e.preventDefault();
  const btn = e ? e.currentTarget : null;

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => showToast(btn));
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showToast(btn);
  }
}

function showToast(btn) {
  if (btn) {
    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = 'fa-solid fa-check';
      btn.style.color = '#10b981';
      setTimeout(() => {
        icon.className = 'fa-solid fa-copy';
        btn.style.color = '';
      }, 1500);
    }
  }
}
// BUSCA DE APLICATIVOS (filtra os cards existentes enquanto o usuário digita)
function filtrarApps(termo) {
  termo = (termo || '').toLowerCase().trim();
  document.querySelectorAll('#apps .app-card').forEach(function(card) {
    var nome = card.querySelector('.app-name');
    var desc = card.querySelector('.app-description');
    var txt = ((nome ? nome.textContent : '') + ' ' + (desc ? desc.textContent : '')).toLowerCase();
    card.style.display = txt.indexOf(termo) > -1 ? '' : 'none';
  });
}
