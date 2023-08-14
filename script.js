// 取得したいデータのエンドポイントとパラメータを設定したURLのリスト
const apiList = {
  cpu: "https://api.recursionist.io/builder/computers?type=cpu",
  gpu: "https://api.recursionist.io/builder/computers?type=gpu",
  ram: "https://api.recursionist.io/builder/computers?type=ram",
  hdd: "https://api.recursionist.io/builder/computers?type=hdd",
  ssd: "https://api.recursionist.io/builder/computers?type=ssd",
};

function getElements(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.error(`要素${id}が存在しません`);
    return null;
  }
  return element;
}

const elementsList = {
  cpuBrands: getElements("cpuBrandsMenu"),
  cpuModels: getElements("cpuModelsMenu"),
  gpuBrands: getElements("gpuBrandsMenu"),
  gpuModels: getElements("gpuModelsMenu"),
  numbersOfMemory: getElements("numbersOfMemory"),
  memoryBrands: getElements("memoryBrandsMenu"),
  memoryModels: getElements("memoryModelsMenu"),
  storagesType: getElements("storagesType"),
  storageCapacity: getElements("storageCapacity"),
  storageBrands: getElements("storageBrandsMenu"),
  storageModels: getElements("storageModelsMenu"),
};

// APIのデータ取得と解析に成功した場合にcallbackを呼び出す関数
function fetchData(apiURL, callback) {
  fetch(apiURL)
    .then((response) => response.json())
    .then(callback);
}

// ドロップダウンメニューを作成・表示する関数
function populateDropdown(dropdownElement, optionsData) {
  // エラーハンドリング
  if (!dropdownElement || !Array.isArray(optionsData)) {
    console.error("引数が無効です");
    return;
  }

  // ドロップダウンメニューを初期化
  dropdownElement.textContent = "";
  // データに応じて
  optionsData.forEach((optionText) => {
    let option = document.createElement("option");
    option.text = optionText;
    option.value = optionText;
    dropdownElement.appendChild(option);
  });
}

// ブランド・モデル名を取得・更新する関数
function populateBrands(data, brandElement, modelElement) {
  let brands = new Set();
  data.forEach((item) => brands.add(item.Brand));

  // brandsを渡す前に配列に変換する事で、エラーハンドリングの確認を通過している
  populateDropdown(brandElement, Array.from(brands));

  // ブランドの選択に応じてモデルの表示を変更するイベントリスナー
  brandElement.addEventListener("change", (event) => {
    // ドロップダウン内のブランド名を取得する
    let selectedBrand = event.target.value;
    // ブランド名に応じてモデル名が更新される
    populateModels(data, selectedBrand, modelElement);
  });

  // 取得したデータから、ブランド・モデル名を表示する為に関数を呼び出す
  populateModels(data, Array.from(brands)[0], modelElement);
}

// ブランド名に応じたモデル名を取得・更新する関数
function populateModels(data, brand, modelElement) {
  // 取得したデータから、ブランド名と一致するアイテム(model)を全て格納した配列を新規で作成
  let models = data
    .filter((item) => item.Brand === brand)
    .map((item) => item.Model);

  // 選択したブランド名に応じて、モデル名をドロップダウンメニューに入力
  populateDropdown(modelElement, models);
}

window.addEventListener("DOMContentLoaded", () => {
  fetchData(apiList.cpu, (data) => {
    populateBrands(data, elementsList.cpuBrands, elementsList.cpuModels);
  });
});
