//show the product view, when someone clicks on the image.
var productView = function (imgData, mainObj) {
    var dbObj = myDB.get(mainObj.dbid);
    $.colorbox({
        html: "<div id='colorboxProjImg' class='colorboxDisplayImage'></div>",
        title: dbObj.modelNum + ', ' + dbObj.brand,
    });
    var imgView = $jConstruct('div').css({
        'width': '100%',
    });
    imgView.addChild($jConstruct('img', {
        src: imgData, //set the image.
    }).css({
        'max-width': '400px',
        'max-height': '400px',
        'border-radius': '10px',
        'display': 'block',
        'margin': 'auto',
    }));

    var details = undefined;
    if (dbObj.hasOwnProperty('details')) {
        details = $jConstruct('div', {
            text: dbObj.details,
        }).event('click', function () { //on click, means user wants to modify this.
            var thisObj = arrdb.get(this.id);
            if (thisObj.type == 'div') {
                thisObj.type = 'textarea'; //now define as a textarea.
                thisObj.css({ //set the css styling to this object.
                    'width': '90%',
                    'height': '100px',
                });
                thisObj.refresh(); //now refresh and become an editable textarea.
            }
        });
    } else {
        details = $jConstruct('textarea', {
            text: 'Enter details about object here.',
        }).css({
            'width': '90%',
            'height': '100px',
        });
    }

    var submitBtn = $jConstruct('button', {
        text: 'submit changes and close',
    }).event('click', function () {
        var data = $('#' + details.id).val(); //get the details that needs to be saved.
        console.log(data);
        myDB.get(mainObj.dbid).details = data; //set the details to the root db, to be saved later.
        arrdb.get(mainObj.id).details = data; //set the details to the jsonHTML object.
        console.log({
            'data': data,
            'by_dbid': myDB.get(mainObj.dbid),
            'by_id': arrdb.get(mainObj.id),
        });
        $.colorbox.close(); //close the colorbox.
    }).css({
        'display': 'block',
        'margin': 'auto',
    });

    imgView.appendTo('#colorboxProjImg');
    $jConstruct('div').addChild(details).appendTo('#colorboxProjImg');
    submitBtn.appendTo('#colorboxProjImg');
}