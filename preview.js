document
  .getElementById("fileInput")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function () {
      const typedArray = new Uint8Array(this.result);
      renderPDF(typedArray);
    };

    reader.readAsArrayBuffer(file);
  });

function renderPDF(pdfData) {
  pdfjsLib.getDocument({ data: pdfData }).promise.then(function (pdf) {
    const previewContainer = document.getElementById("pdfPreview");
    const canvasList = []; // Store canvas elements

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      pdf.getPage(pageNumber).then(function (page) {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        page.render(renderContext).promise.then(function () {
          previewContainer.appendChild(canvas);
          canvasList.push(canvas);
          enableDrawing(canvas); // Enable drawing on this canvas
        });
      });
    }
  });
}

function enableDrawing(canvas) {
  const context = canvas.getContext("2d");
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;
    context.beginPath();
    context.moveTo(lastX, lastY);
    context.lineTo(e.offsetX, e.offsetY);
    context.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY];
  });

  canvas.addEventListener("mouseup", () => {
    isDrawing = false;
  });

  canvas.addEventListener("mouseout", () => {
    isDrawing = false;
  });
}

function prepareAsset({ name, src }) {
  const pdf = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    scriptData.src = src;
    scriptData.onload = () => {
      resolve(window[name]);
    };
    scriptData.onerror = () => {
      reject(`The script ${name} didn't load correctly.`);
      alert(
        `Some scripts did not load correctly. Please reload and try again.`
      );
    };
    document.body.appendChild(scriptData);
  });
  return assets[name];
}
