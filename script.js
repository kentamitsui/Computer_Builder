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
  const matchRegularExpression = modelName.match(/(\d+TB|\d+GB)/g);
  return matchRegularExpression ? matchRegularExpression[0] : null;
}

// データからストレージの種類を取得する関数
function populateStorageTypes(data, storageTypeElement) {
  let types = new Set();
  // Typeと一致したデータを選択項目に追加
  data.forEach((item) => types.add(item.Type));
  populateDropdown(storageTypeElement, Array.from(types));
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
  // 上記のデータを基にドロップダウンメニューを作成
  populateDropdown(capacityElement, Array.from(capacities));
}

// HDDとSSDのAPIレスポンスを取得・統合する関数
// function fetchBothStorageData() {
//   // 両データ配列をPromiss.allで取得し、concatで統合する
//   return Promise.all([fetchData(apiList.hdd), fetchData(apiList.ssd)]).then(
//     ([hddData, ssdData]) => {
//       if (!hddData || !ssdData) {
//         throw new Error("One of the datasets is missing");
//       }
//       return hddData.concat(ssdData);
//     }
//   );
// }

window.addEventListener("DOMContentLoaded", () => {
  fetchData(apiList.cpu, (data) => {
    populateBrands(data, elementsList.cpuBrands, elementsList.cpuModels);
  });

  fetchData(apiList.gpu, (data) => {
    populateBrands(data, elementsList.gpuBrands, elementsList.gpuModels);
  });

  fetchData(apiList.hdd, (data) => {
    // Assuming HDD and SSD data are combined in the same API response
    // If they are separate, you'll need to merge the data arrays

    // Populate storage types
    populateStorageTypes(data, elementsList.storagesType);

    // Initial population of brands, models, and capacities
    const initialType = elementsList.storagesType.value;
    populateBrands(
      data,
      elementsList.storageBrands,
      elementsList.storageModels
    );
    populateStorageCapacities(data, initialType, elementsList.storageCapacity);

    // Update brands, models, and capacities based on selected storage type
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

  // fetchBothStorageData().then((data) => {
  //   populateStorageTypes(data, elementsList.storagesType);

  //   // ストレージのブランド・モデル・容量の初期化設定
  //   const initialTypeValue = elementsList.storagesType.value;
  //   populateBrands(
  //     data,
  //     elementsList.storageBrands,
  //     elementsList.storageModels
  //   );
  //   populateStorageCapacities(
  //     data,
  //     initialTypeValue,
  //     elementsList.storageCapacity
  //   );

  //   elementsList.storagesType.addEventListener("change", (event) => {
  //     const selectType = event.target.value;
  //     populateBrands(
  //       data,
  //       elementsList.storageBrands,
  //       elementsList.storageModels
  //     );
  //     populateStorageCapacities(data, selectType, elementsList.storageCapacity);
  //   });
  // });
});
