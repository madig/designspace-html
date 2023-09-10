const designspacePicker = document.getElementById("designspace-picker");
const output = document.getElementById("output");

async function readyPython() {
  let pyodide = await loadPyodide();
  await pyodide.loadPackage("micropip");
  const micropip = pyodide.pyimport("micropip");
  await micropip.install("fonttools");

  designspacePicker.disabled = false;
  return pyodide;
}

const pythonPromise = readyPython();

designspacePicker.addEventListener("change", function () {
  try {
    if (designspacePicker.files.length === 0) {
      throw new Error("No file selected");
    }
    const reader = new FileReader();
    reader.onload = loadDesignspace;
    reader.readAsText(designspacePicker.files[0]);
  } catch (err) {
    console.error(err);
  }
});

async function loadDesignspace(event) {
  const pyodide = await pythonPromise;
  const contents = event.target.result;
  const dsLib = pyodide.pyimport("fontTools.designspaceLib");
  const designspace = dsLib.DesignSpaceDocument.fromstring(contents);
  const designspaceMap = designspace.asdict().toJs();
  layoutDesignspace(designspaceMap);
}

function layoutDesignspace(designspaceMap) {
  output.replaceChildren();

  const axisSection = document.createElement("section");
  axisSection.id = "axes";
  const axisHeader = document.createElement("h2");
  axisHeader.textContent = "Axes";
  axisSection.appendChild(axisHeader);

  const axisTable = document.createElement("table");
  const axisTableHeader = document.createElement("thead");
  const axisTableHeaderRow = document.createElement("tr");
  const axisNameHeader = document.createElement("th");
  axisNameHeader.textContent = "Name";
  const axisTagHeader = document.createElement("th");
  axisTagHeader.textContent = "Tag";
  const axisMinimumHeader = document.createElement("th");
  axisMinimumHeader.textContent = "Minimum";
  const axisDefaultHeader = document.createElement("th");
  axisDefaultHeader.textContent = "Default";
  const axisMaximumHeader = document.createElement("th");
  axisMaximumHeader.textContent = "Maximum";
  const axisHiddenHeader = document.createElement("th");
  axisHiddenHeader.textContent = "Hidden";

  axisTableHeaderRow.appendChild(axisNameHeader);
  axisTableHeaderRow.appendChild(axisTagHeader);
  axisTableHeaderRow.appendChild(axisMinimumHeader);
  axisTableHeaderRow.appendChild(axisDefaultHeader);
  axisTableHeaderRow.appendChild(axisMaximumHeader);
  axisTableHeaderRow.appendChild(axisHiddenHeader);
  axisTableHeader.appendChild(axisTableHeaderRow);
  axisTable.appendChild(axisTableHeader);

  const axes = designspaceMap.get("axes");
  console.log(axes);
  for (const axis of axes) {
    const axisName = document.createElement("input");
    axisName.value = axis.get("name");
    const axisTag = document.createElement("input");
    axisTag.value = axis.get("tag");
    const axisMinimum = document.createElement("input");
    axisMinimum.value = axis.get("minimum");
    const axisDefault = document.createElement("input");
    axisDefault.value = axis.get("default");
    const axisMaximum = document.createElement("input");
    axisMaximum.value = axis.get("maximum");
    const axisHidden = document.createElement("input");
    axisHidden.type = "checkbox";
    axisHidden.checked = axis.get("hidden");

    const axisRow = document.createElement("tr");
    const axisNameCell = document.createElement("td");
    axisNameCell.appendChild(axisName);
    axisRow.appendChild(axisNameCell);
    const axisTagCell = document.createElement("td");
    axisTagCell.appendChild(axisTag);
    axisRow.appendChild(axisTagCell);
    const axisMinimumCell = document.createElement("td");
    axisMinimumCell.appendChild(axisMinimum);
    axisRow.appendChild(axisMinimumCell);
    const axisDefaultCell = document.createElement("td");
    axisDefaultCell.appendChild(axisDefault);
    axisRow.appendChild(axisDefaultCell);
    const axisMaximumCell = document.createElement("td");
    axisMaximumCell.appendChild(axisMaximum);
    axisRow.appendChild(axisMaximumCell);
    const axisHiddenCell = document.createElement("td");
    axisHiddenCell.appendChild(axisHidden);
    axisRow.appendChild(axisHiddenCell);

    axisTable.appendChild(axisRow);
  }

  axisSection.appendChild(axisTable);
  output.appendChild(axisSection);
}
