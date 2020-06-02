
/*****
*
*	Сохранение файла в двух вариантах: с включенным слоем "NOT NORMALS" и с выключенным.

	Задача 
	выполнить все действия одним скриптом:
	1. сохранить в файл с названием {filename}.png с включенным слоем "NOT NORMALS"
	2. сохранить в файл с названием {filename}_normal.png с выключенным слоем "NOT NORMALS"
	3. дать возможность ввода (input) название слоя (по-умолчанию "NOT NORMALS")
	4. дать возможность ввода (input) префикса для к названию второго файла (по-умолчанию "_normal")
	5. дать возможность ввода (input) название файла (по-умолчанию текущее название файла от .psd)
	6. дать возможность ввода (input) пути для сохранения файлов (по-умолчанию текущая папка от открытого файла)

*
*****/

/*
* Options
*/
var OPTS = {
    LayerName: "NOT NORMALS", // слой, который не должен быть при сохранении во второй файл
    FilePath: "c:/pngout", // "/c/pngout"
    FileName: "unnamed",
    FileSuffix: "_normal",
	AutoSaveAfterEnd: true,
	FileExtension: "png",
	FileSaveOptions: new PNGSaveOptions()
}

/*
* Save file
*/
var saveFile = function(fileName) {
        var outputFile = File(OPTS.FilePath + "/" + fileName + "." + OPTS.FileExtension);
        // TODO: проверить путь на наличие всех папок
        var docRef = app.activeDocument;
        try{
            docRef.saveAs(outputFile, OPTS.FileSaveOptions, true);
        }
        catch(ex) {
            alert("Ошибка: " + ex);
            return false;
        }
        return true;
}

/*
* Logic: выполнение логики над нашим слоем
*/
var layerWorkDo = function(layerSet) {
        if (layerSet == null || typeof(layerSet) === 'undefined') return;
        var saveVisible = layerSet.visible;
        var isSuccess = true;
        // 1. save first (for normals)
        layerSet.visible = false;
        var fileName = OPTS.FileName + OPTS.FileSuffix;
        isSuccess = saveFile(fileName);
        // 2. save first (for all)
        if (isSuccess) {
            layerSet.visible = true;
            fileName = OPTS.FileName;
            isSuccess = saveFile(fileName);
        }
        // restore
        layerSet.visible = saveVisible;
        return isSuccess;
}

/*
* Logic: посик необходимых слоев
*/
var layerSearchDo = function(dlg) {
    var docRef = app.activeDocument;
    for (var x = 0; x < docRef.layerSets.length; x++){ 
        var layerSet = docRef.layerSets[x];
        if (layerSet == null || typeof(layerSet) === 'undefined') continue;
        if (layerSet.name == null || typeof(layerSet.name) === 'undefined' || layerSet.name === "") continue;
        if (layerSet.name.toLowerCase() == OPTS.LayerName.toLowerCase()) {
            // logic
            var isSuccess = layerWorkDo(layerSet);
            // info
            if (isSuccess) {
				if (OPTS.AutoSaveAfterEnd === true) { try{docRef.save();} catch(ex){} }
				alert("Выполнено успешно 😊");
			}
            dlg.close();
            return;
        }
    }
    alert("Не найдено ни одного слоя с названием: '" + OPTS.LayerName + "'!");
    dlg.close();
}

/*
* Dialog: диалоговое окно с настройками и запуском
*/
var dialogDo = function() {
    var dlg = new Window('dialog', 'Save NotNormals',[100,100,520,380]); // абсолютные координаты: left_x, left_y, right_x, right_y
    // inputs
    dlg.optsPnl = dlg.add('panel', [10,10,410,200], 'Настройки');
    dlg.optsPnl.txtTitle1 = dlg.optsPnl.add('statictext', [15,15,140,35], "Путь", {name:'stpath'});
    dlg.optsPnl.inputPath = dlg.optsPnl.add('edittext', [140,15,335,35], OPTS.FilePath, {name:'path'});
    dlg.optsPnl.inputPath.onChange = function(){
        OPTS.FilePath = dlg.optsPnl.inputPath.text;
    };
    dlg.optsPnl.txtTitle2 = dlg.optsPnl.add('statictext', [15,45,140,65], "Имя файла", {name:'stfilename'});
    dlg.optsPnl.inputFileName = dlg.optsPnl.add('edittext', [140,45,335,65], OPTS.FileName, {name:'filename'});
    dlg.optsPnl.inputFileName.onChange = function(){
        OPTS.FileName = dlg.optsPnl.inputFileName.text;
    };
    dlg.optsPnl.txtTitle3 = dlg.optsPnl.add('statictext', [15,75,140,95], "Слой для поиска", {name:'stlayersearch'});
    dlg.optsPnl.inputLayerSearch = dlg.optsPnl.add('edittext', [140,75,335,95], OPTS.LayerName, {name:'layersearch'});
    dlg.optsPnl.inputLayerSearch.onChange = function(){
        OPTS.LayerName = dlg.optsPnl.inputLayerSearch.text;
    };
    dlg.optsPnl.txtTitle4 = dlg.optsPnl.add('statictext', [15,105,140,125], "Префикс к файлу", {name:'stfileprefix'});
    dlg.optsPnl.inputFileprefix = dlg.optsPnl.add('edittext', [140,105,335,125], OPTS.FileSuffix, {name:'fileprefix'});
    dlg.optsPnl.inputFileprefix.onChange = function(){
        OPTS.FileSuffix = dlg.optsPnl.inputFileprefix.text;
    };
    dlg.optsPnl.checkboxAutosave = dlg.optsPnl.add('checkbox', [15,135,335,155], "Автосохранение (текущего документа)", {name:'selfsave'});
    dlg.optsPnl.checkboxAutosave.value = OPTS.AutoSaveAfterEnd;
    dlg.optsPnl.checkboxAutosave.onClick = function(){
        OPTS.AutoSaveAfterEnd = dlg.optsPnl.checkboxAutosave.value;
    };
    // buttons
    dlg.btnPnl = dlg.add('panel', [10,210,410,270], 'Действия');
    dlg.btnPnl.testBtn = dlg.btnPnl.add('button', [10,15,100,40], 'Выполнить', {name:'ok'});
    dlg.btnPnl.testBtn.onClick = function(){layerSearchDo(dlg);};
    dlg.btnPnl.closeBtn = dlg.btnPnl.add('button', [110,15,200,40], 'Закрыть', {name:'close'});
    dlg.btnPnl.closeBtn.onClick = function(){dlg.close();};
    dlg.show();
}

/*
* Inits: инициализация и запуск
*/
var initDo = function() {
    var docRef = app.activeDocument;
    if (docRef == null || typeof(docRef) === "undefined") {
        alert("Нет активного документа");
        return;
    }
    // opts
    //OPTS.FilePath = docRef.saved ? docRef.path : OPTS.FilePath;
    try {OPTS.FilePath = docRef.path;} catch(ex) {}
    if (docRef.name != null && typeof(docRef.name) !== "undefined" && docRef.name !== "")
        try {OPTS.FileName = docRef.name.replace(/\.[^\.]+$/, '');} catch(ex) {}
    // run
    dialogDo();
}

// autorun
initDo();






