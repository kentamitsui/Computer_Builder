// 取得したいデータのエンドポイントとパラメータを設定したURLのリスト
const apiList = {
  cpu: "https://api.recursionist.io/builder/computers?type=cpu",
  gpu: "https://api.recursionist.io/builder/computers?type=gpu",
  memory: "https://api.recursionist.io/builder/computers?type=ram",
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
// function fetchData(apiURL) {
//   return fetch(apiURL).then((response) => {
//     if (!response.ok) {
//       throw new Error(`Failed to fetch data from ${apiURL}`);
//     }
//     return response.json();
//   });
// }

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
  // 各データの選択肢のテキスト・値を設定し追加する
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

  // brandsを渡す前に配列に変換する事で、エラーハンドリングチェックを通過している
  populateDropdown(brandElement, Array.from(brands));

  // ブランドの選択に応じてモデルの表示を変更するイベントリスナー
  brandElement.addEventListener("change", (event) => {
    // ドロップダウン内のブランド名を取得する
    let selectedBrand = event.target.value;
    // ブランド名に応じてモデル名が更新される
    populateModels(data, selectedBrand, modelElement);
  });

  // 取得したデータから、ブランド・モデル名を表示する為に関数を呼び出す
  //
  populateModels(data, Array.from(brands)[0], modelElement);
}

// ブランド名に応じたモデル名を取得・更新する関数
function populateModels(data, brand, modelElement) {
  // 取得したデータから、ブランド名と一致するアイテム(model)を全て格納した配列を新規で作成
  let models = data
    .filter((item) => item.Brand === brand)
    .map((item) => item.Model);

  populateDropdown(modelElement, models);
}

// "Model"のデータ内から、容量の数値部分を抽出する関数
function getStorageCapacity(modelName) {
  // "d+"は一桁以上の数値文字列と合致する部分を抽出する
  const matchRegularExpression = modelName.match(/(\d+TB|\d+GB)/);
  // console.log(matchRegularExpression[0]);
  return matchRegularExpression ? matchRegularExpression[0] : null;
}

// データからストレージの種類を取得する関数
function populateStorageTypes(data, storageTypeElement) {
  let types = new Set();
  // Typeと一致したデータを選択項目に追加
  data.forEach((item) => types.add(item.Type));
  populateDropdown(storageTypeElement, Array.from(types));
}

// 文字列のストレージ容量をGBの数値単位（1-1000）で参照できるよう変換する関数
function convertToGB(str) {
  if (str.endsWith("TB")) {
    return parseInt(str) * 1000;
  } else if (str.endsWith("GB")) {
    return parseInt(str);
  }
  return 0;
}

// 上記の関数によって変換された数値を、元の単位に戻す関数
function convertToOriginalUnit(value) {
  if (value >= 1000) {
    return `${value / 1000}TB`;
  }
  return `${value}GB`;
}

// ストレージの種類と、容量の文字列データを基に
// ドロップダウンメニューを作成・表示する関数
function populateStorageCapacities(data, type, capacityElement) {
  let capacities = new Set();

  data
    // まずデータをType別に抽出
    .filter((item) => item.Type === type)
    // 次にストレージ容量の文字列を取得
    .forEach((item) => {
      const capacityString = getStorageCapacity(item.Model);
      // 文字列をSet()に格納
      if (capacityString) capacities.add(capacityString);
    });

  // 1.map関数で配列を生成 2. 降順でソート 3. ソート後の文字列をmap関数で単位毎に配列を生成
  const sortCapacityStrings = Array.from(capacities)
    .map((capacity) => convertToGB(capacity))
    .sort((a, b) => a - b)
    .map((value) => convertToOriginalUnit(value));

  // 上記のデータを基にドロップダウンメニューを作成
  populateDropdown(capacityElement, sortCapacityStrings);
}

window.addEventListener("DOMContentLoaded", () => {
  fetchData(apiList.cpu, (data) => {
    populateBrands(data, elementsList.cpuBrands, elementsList.cpuModels);
  });

  fetchData(apiList.gpu, (data) => {
    populateBrands(data, elementsList.gpuBrands, elementsList.gpuModels);
  });

  fetchData(apiList.hdd, (data) => {
    populateStorageTypes(data, elementsList.storagesType);

    const initialType = elementsList.storagesType.value;
    populateBrands(
      data,
      elementsList.storageBrands,
      elementsList.storageModels
    );
    populateStorageCapacities(data, initialType, elementsList.storageCapacity);

    elementsList.storagesType.addEventListener("change", (event) => {
      const selectedType = event.target.value;
      populateBrands(
        data,
        elementsList.storageBrands,
        elementsList.storageModels
      );
      populateStorageCapacities(
        data,
        selectedType,
        elementsList.storageCapacity
      );
    });
  });
});
