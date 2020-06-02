
/*****
*
*	Рисование квадрата в новом слое на позиции
*
*****/

/*
* Options
*/
var OPTS = {
    LayerWantName: "road block",
    RectSize: 32,
    OffsetXY: 25,
    PosX: 0,
    PosY: 0,
    InvertY: true,	// инверсия по оси Y (если инверсия, то считаем снизу)
    InCenter: true, // центрировать квадрат в координаты
    ColorR: 1.000000,
    ColorG: 1.000000,
    ColorB: 1.000000
}


//
// создаем слой
var createLayer = function() {
    var doc = app.activeDocument;
    var activeLayer = doc.activeLayer;
    // набор (группа), куда вставлять новый слой будем
    var layerSets = doc.artLayers;
    if (activeLayer != null && activeLayer.parent != null && activeLayer.parent.typename == "LayerSets") layerSets = activeLayer.parent;
    // создаем
    var newLayerRef = layerSets.add();
    // называем и ставим в позицию
    newLayerRef.name = OPTS.LayerWantName;
    if (activeLayer != null) newLayerRef.move(activeLayer, ElementPlacement.PLACEBEFORE);
    // выбираем текущим
    doc.activeLayer = newLayerRef;
    return newLayerRef;
}

//
// рисуем фигуру (clockwise)
// https://gist.github.com/vladocar/1307987
var drawShape = function() {
    var doc = app.activeDocument;
    var y = arguments.length;
    var i = 0;
    // lines
    var lineArray = [];
    for (i = 0; i < y; i++) {
        lineArray[i] = new PathPointInfo;
        lineArray[i].kind = PointKind.CORNERPOINT;
        lineArray[i].anchor = arguments[i];
        lineArray[i].leftDirection = lineArray[i].anchor;
        lineArray[i].rightDirection = lineArray[i].anchor;
    }
    var lineSubPathArray = new SubPathInfo();
    lineSubPathArray.closed = true;
    lineSubPathArray.operation = ShapeOperation.SHAPEADD;
    lineSubPathArray.entireSubPath = lineArray;
    var myPathItem = doc.pathItems.add("myPath", [lineSubPathArray]);
    // красим
    var desc88 = new ActionDescriptor();
    var ref60 = new ActionReference();
    ref60.putClass(stringIDToTypeID("contentLayer"));
    desc88.putReference(charIDToTypeID("null"), ref60);
    var desc89 = new ActionDescriptor();
    var desc90 = new ActionDescriptor();
    var desc91 = new ActionDescriptor();
    desc91.putDouble(charIDToTypeID("Rd  "), OPTS.ColorR); // TODO: colors not work
    desc91.putDouble(charIDToTypeID("Grn "), OPTS.ColorG);
    desc91.putDouble(charIDToTypeID("Bl  "), OPTS.ColorB);
    var id481 = charIDToTypeID("RGBC");
    desc90.putObject(charIDToTypeID("Clr "), id481, desc91);
    desc89.putObject(charIDToTypeID("Type"), stringIDToTypeID("solidColorLayer"), desc90);
    desc88.putObject(charIDToTypeID("Usng"), stringIDToTypeID("contentLayer"), desc89);
    executeAction(charIDToTypeID("Mk  "), desc88, DialogModes.NO);
    myPathItem.remove();
}


/*
* Logic: 
*/
var layerSearchDo = function(dlg) {
    var doc = app.activeDocument;
    // создаем слой
    var layer = createLayer();
    if (layer == null) { return; }
    // рассчитываем координаты
    var offsetXY = OPTS.InCenter ? OPTS.OffsetXY - OPTS.RectSize/2 : OPTS.OffsetXY;
    var tl_x = offsetXY + OPTS.PosX;
    var tl_y = OPTS.InvertY ? (doc.height.value - offsetXY - OPTS.RectSize - OPTS.PosY) : (offsetXY + OPTS.PosY);
    var tr_x = tl_x + OPTS.RectSize;
    var tr_y = tl_y;
    var br_x = tr_x;
    var br_y = tr_y + OPTS.RectSize;
    var bl_x = tl_x;
    var bl_y = br_y;
    // рисуем
    // top_left -> bottom_left -> bottom_ right -> top_right
    drawShape([tl_x, tl_y], [bl_x, bl_y], [br_x, br_y], [tr_x, tr_y]);
    dlg.close();
}

/*
* Dialog: диалоговое окно с настройками и запуском
*/
var dialogDo = function() {
    var dlg = new Window('dialog', 'Draw Rect',[100,100,520,440]);
    // inputs
    dlg.optsPnl = dlg.add('panel', [10,10,410,260], 'Настройки');
    dlg.optsPnl.txtTitle1 = dlg.optsPnl.add('statictext', [15,15,150,35], "Название нового слоя", {name:'stpath'});
    dlg.optsPnl.inputPath = dlg.optsPnl.add('edittext', [160,15,365,35], OPTS.LayerWantName, {name:'path'});
    dlg.optsPnl.inputPath.onChange = function(){
        OPTS.LayerWantName = dlg.optsPnl.inputPath.text;
    };
    dlg.optsPnl.txtTitle2 = dlg.optsPnl.add('statictext', [15,45,240,65], "Размер квадрата (ширина и высота)", {name:'srectsize'});
    dlg.optsPnl.inputRectSize = dlg.optsPnl.add('edittext', [240,45,365,65], OPTS.RectSize, {name:'rectsize'});
    dlg.optsPnl.inputRectSize.onChange = function(){
        OPTS.RectSize = parseInt(dlg.optsPnl.inputRectSize.text, 10);
        dlg.optsPnl.inputRectSize.text = OPTS.RectSize;
    };
    dlg.optsPnl.txtTitle3 = dlg.optsPnl.add('statictext', [15,75,240,95], "Отступ по XY", {name:'soffset'});
    dlg.optsPnl.inputOffsetXY = dlg.optsPnl.add('edittext', [240,75,365,95], OPTS.OffsetXY, {name:'offset'});
    dlg.optsPnl.inputOffsetXY.onChange = function(){
        OPTS.OffsetXY = parseInt(dlg.optsPnl.inputOffsetXY.text, 10);
        dlg.optsPnl.inputOffsetXY.text = OPTS.OffsetXY;
    };
    dlg.optsPnl.txtTitle4 = dlg.optsPnl.add('statictext', [15,105,240,125], "Координаты X", {name:'sposx'});
    dlg.optsPnl.inputPosX = dlg.optsPnl.add('edittext', [240,105,365,125], OPTS.PosX, {name:'posx'});
    dlg.optsPnl.inputPosX.onChange = function(){
        OPTS.PosX = parseInt(dlg.optsPnl.inputPosX.text, 10);
        dlg.optsPnl.inputPosX.text = OPTS.PosX;
    };
    dlg.optsPnl.txtTitle5 = dlg.optsPnl.add('statictext', [15,135,240,155], "Координаты Y", {name:'sposy'});
    dlg.optsPnl.inputPosY = dlg.optsPnl.add('edittext', [240,135,365,155], OPTS.PosY, {name:'posy'});
    dlg.optsPnl.inputPosY.onChange = function(){
        OPTS.PosY = parseInt(dlg.optsPnl.inputPosY.text);
        dlg.optsPnl.inputPosY.text = OPTS.PosY;
    };
	dlg.optsPnl.checkboxInvertY = dlg.optsPnl.add('checkbox', [15,165,335,185], "Инверсия по оси Y (считать снизу)", {name:'inverty'});
    dlg.optsPnl.checkboxInvertY.value = OPTS.InvertY;
    dlg.optsPnl.checkboxInvertY.onClick = function(){
        OPTS.InvertY = dlg.optsPnl.checkboxInvertY.value;
    };
	dlg.optsPnl.checkboxInCenter = dlg.optsPnl.add('checkbox', [15,195,335,215], "Центрировать квадрат в координатах", {name:'incenter'});
    dlg.optsPnl.checkboxInCenter.value = OPTS.InCenter;
    dlg.optsPnl.checkboxInCenter.onClick = function(){
        OPTS.InCenter = dlg.optsPnl.checkboxInCenter.value;
    };
    // buttons
    dlg.btnPnl = dlg.add('panel', [10,270,410,330], 'Действия');
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
    var doc = app.activeDocument;
    if (doc == null || typeof(doc) === "undefined") {
        alert("Нет активного документа");
        return;
    }
    // opts
    if (doc.activeLayer != null) OPTS.LayerWantName =  doc.activeLayer.name + " (" + OPTS.LayerWantName + ")";
    // run
    dialogDo();
}

// autorun
initDo();






