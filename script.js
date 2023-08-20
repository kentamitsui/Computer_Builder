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

function fetchData(apiURL) {
  return fetch(apiURL).then((response) => {
    if (!response.ok) {
      throw new Error(`${apiURL}からのデータフェッチに失敗しました`);
    }
    return response.json();
  });
}

// HDD・SSD両方のAPIレスポンスデータを統合する関数
function mergeStorageData() {
  return Promise.all([fetchData(apiList.hdd), fetchData(apiList.ssd)]).then(
    ([hddData, ssdData]) => {
      if (!hddData || !ssdData) {
        throw new Error("データセットが見つかりません");
      }

      // concatで両データを統合する
      return hddData.concat(ssdData);
    }
  );
}

// ドロップダウンメニューを作成・表示する関数
function createDropdown(dropdownElement, optionsData) {
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
function createBrands(data, brandElement, modelElement) {
  let brands = new Set();
  data.forEach((item) => brands.add(item.Brand));

  // brandsを渡す前に配列に変換する事で、エラーチェックを通過している
  const sortBrands = Array.from(brands).sort();
  createDropdown(brandElement, sortBrands);

  // ブランドの選択に応じてモデルの表示を変更するイベントリスナー
  brandElement.addEventListener("change", (event) => {
    // ドロップダウン内のブランド名を取得する
    let selectBrand = event.target.value;
    // ブランド名に応じてモデル名が更新される
    createModels(data, selectBrand, modelElement);
  });

  // 取得したデータから、ブランド・モデル名を表示する為に関数を呼び出す
  createModels(data, sortBrands[0], modelElement);
}

function createMemoryBrands(data, brandElement, modelElement) {
  let brands = new Set();
  data.forEach((item) => brands.add(item.Brand));

  // brandsを渡す前に配列に変換する事で、エラーチェックを通過している
  const sortBrands = Array.from(brands).sort();
  createDropdown(brandElement, sortBrands);

  const memorySheets = elementsList.numbersOfMemory;
  // メモリーの枚数を変更する度に取得するイベントリスナー
  brandElement.addEventListener("change", (event) => {
    let selectBrand = event.target.value;
    let selectSheets = elementsList.numbersOfMemory.value;
    createMemoryModels(data, selectBrand, selectSheets, modelElement);
  });

  const initialSheets = memorySheets.options[memorySheets.selectedIndex].text;
  // console.log(initialSheets);
  createMemoryModels(data, sortBrands[0], initialSheets, modelElement);
}

// ストレージのブランド名を動的に表示する関数
function createStorageBrands(data, type, brandElement, modelElement) {
  let brands = new Set();
  data
    .filter((item) => item.Type === type)
    .forEach((item) => brands.add(item.Brand));

  // brandsを渡す前に配列に変換する事で、エラーチェックを通過している
  const sortBrands = Array.from(brands).sort();
  createDropdown(brandElement, sortBrands);

  // ブランドの選択に応じてモデルの表示を変更するイベントリスナー
  brandElement.addEventListener("change", (event) => {
    // ドロップダウン内のブランド名を取得する
    let selectBrand = event.target.value;
    let selectCapacity = elementsList.storageCapacity.value;
    // ブランド名に応じてモデル名が更新される
    createStorageModels(data, selectBrand, selectCapacity, modelElement);
  });

  const initialCapacity = elementsList.storageCapacity.value;
  // 取得したデータから、ブランド・モデル名を表示する為に関数を呼び出す
  createStorageModels(data, sortBrands[0], initialCapacity, modelElement);
}

// ブランド名に応じたモデル名を取得・更新する関数
function createModels(data, brand, modelElement) {
  // 取得したデータから、ブランド名と一致するアイテム(model)を全て格納した配列を新規で作成
  let models = data
    .filter((item) => item.Brand === brand)
    .map((item) => item.Model)
    .sort();

  createDropdown(modelElement, models);
}

// "Model"のデータ内から、メモリーの数値部分を抽出する関数
function getMemorySlots(modelName) {
  const matchRegularExpression = modelName.match(/(\d+x)/);
  // console.log(matchRegularExpression[0]);
  return matchRegularExpression ? matchRegularExpression[0] : null;
}

// メモリーのモデル名をスロット数に合わせて動的に表示する関数
function createMemoryModels(data, brand, sheets, modelElement) {
  let models = data
    .filter(
      (item) =>
        // getMemorySlots関数によって抽出される文字列が"2x"となっているので、
        // sheetsに"x"を足すことで適切にフィルタリングを行う
        item.Brand === brand && getMemorySlots(item.Model) === sheets + "x"
    )
    .map((item) => item.Model)
    .sort();

  // console.log(models);
  createDropdown(modelElement, models);
}

// ストレージのモデル名を記憶容量に合わせて動的に表示する関数
function createStorageModels(data, brand, capacity, modelElement) {
  let models = data
    .filter(
      (item) =>
        item.Brand === brand && getStorageCapacity(item.Model) === capacity
    )
    .map((item) => item.Model)
    .sort();

  createDropdown(modelElement, models);
}

// データからストレージの種類を取得する関数
function createStorageTypes(data, storageTypeElement) {
  let types = new Set();
  // Typeと一致したデータを選択項目に追加
  data.forEach((item) => types.add(item.Type));

  createDropdown(storageTypeElement, Array.from(types));
}

// "Model"のデータ内から、容量の数値部分を抽出する関数
function getStorageCapacity(modelName) {
  // "d+"は一桁以上の数値文字列と合致する部分を抽出する
  const matchRegularExpression = modelName.match(/(\d+TB|\d+GB)/);
  // console.log(matchRegularExpression[0]);
  return matchRegularExpression ? matchRegularExpression[0] : null;
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
function createStorageCapacities(data, type, capacityElement) {
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
  createDropdown(capacityElement, sortCapacityStrings);
}

window.addEventListener("DOMContentLoaded", () => {
  fetchData(apiList.cpu).then((data) => {
    createBrands(data, elementsList.cpuBrands, elementsList.cpuModels);
  });

  fetchData(apiList.gpu).then((data) => {
    createBrands(data, elementsList.gpuBrands, elementsList.gpuModels);
  });

  fetchData(apiList.memory).then((data) => {
    // console.log(data);
    createMemoryBrands(
      data,
      elementsList.memoryBrands,
      elementsList.memoryModels
    );

    elementsList.numbersOfMemory.addEventListener("change", (event) => {
      let selectBrand = elementsList.memoryBrands.value;
      let selectSheetsText =
        event.target.options[event.target.selectedIndex].text;
      createMemoryModels(
        data,
        selectBrand,
        selectSheetsText,
        elementsList.memoryModels
      );
      // console.log(selectSheetsText);
    });
  });

  mergeStorageData().then((data) => {
    createStorageTypes(data, elementsList.storagesType);

    const initialType = elementsList.storagesType.value;
    const initialCapacity = elementsList.storageCapacity.value;
    createStorageBrands(
      data,
      initialType,
      elementsList.storageBrands,
      elementsList.storageModels
    );
    createStorageCapacities(data, initialType, elementsList.storageCapacity);

    createStorageModels(
      data,
      elementsList.storageBrands.value,
      initialCapacity,
      elementsList.storageModels
    );

    elementsList.storagesType.addEventListener("change", (event) => {
      const selectedType = event.target.value;
      createStorageBrands(
        data,
        selectedType,
        elementsList.storageBrands,
        elementsList.storageModels
      );
      createStorageCapacities(data, selectedType, elementsList.storageCapacity);
    });

    elementsList.storageCapacity.addEventListener("change", (event) => {
      let selectedCapacity = event.target.value;
      let selectedBrand = elementsList.storageBrands.value;
      createStorageModels(
        data,
        selectedBrand,
        selectedCapacity,
        elementsList.storageModels
      );
    });
  });
});
