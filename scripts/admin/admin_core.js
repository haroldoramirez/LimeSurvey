/*
 * JavaScript functions for LimeSurvey administrator
 *
 * This file is part of LimeSurvey
 * Copyright (C) 2007-2013 The LimeSurvey Project Team / Carsten Schmitz
 * All rights reserved.
 * License: GNU/GPL License v2 or later, see LICENSE.php
 * LimeSurvey is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 * See COPYRIGHT.php for copyright notices and details.
 */

// @license magnet:?xt=urn:btih:cf05388f2679ee054f2beb29a391d25f4e673ac3&dn=gpl-2.0.txt  GNU/GPL License v2 or later

/* Set a variable to test if browser have HTML5 form ability
 * Need to be replaced by some polyfills see #8009
 */
hasFormValidation= typeof document.createElement( 'input' ).checkValidity == 'function';

$(document).ready(function(){

    initializeAjaxProgress();
    tableCellAdapters();
    linksInDialog();
    doToolTip();

    $('button,input[type=submit],input[type=button],input[type=reset],.button').button();
    $('button,input[type=submit],input[type=button],input[type=reset],.button').addClass("limebutton");

    $(".progressbar").each(function(){
        var pValue = parseInt($(this).attr('name'));

        $(this).progressbar({
            value: pValue
        });

        if (pValue > 85){
            $("div",$(this)).css({ 'background': 'Red' });
        }

        $("div",this).html(pValue + "%");
    });



    if($('#survey-grid').length>0)
    {
        $(document).on('click', '.has-link', function () {
            $linkUrl = $(this).find('a').attr('href');
            window.location.href=$linkUrl;
            console.log($linkUrl);
        });
    }

    /* Switch format group */
    if ($('#switchchangeformat').length>0){
        $('#switchchangeformat button').on('click', function(event, state) {
            $('#switchchangeformat button.active').removeClass('active');
            $(this).addClass('active');
            $value = $(this).data('value');
            $url = $('#switch-url').attr('data-url')+'/format/'+$value;

            console.log('required format: '+$value);
            console.log('format url: '+$url);

            $.ajax({
                url : $url,
                type : 'GET',
                dataType : 'html',

                // html contains the buttons
                success : function(html, statut){
                },
                error :  function(html, statut){
                    alert('error');
                }
            });

        });
    };


    $('#survey-action-chevron').click(function(){
        $url = $(this).data('url');
        $.ajax({
            url : $url,
            type : 'GET',
            dataType : 'html',

            // html contains the buttons
            success : function(html, statut){
                $('#survey-action-container').animate({
            "height": "toggle", "opacity": "toggle"
        });
                $('#survey-action-chevron').toggleClass('glyphicon-chevron-right').toggleClass('glyphicon-chevron-down');
            },
            error :  function(html, statut){
                alert('error');
            }
        });
    });


    $('#showadvancedattributes').click(function(){
        $('#showadvancedattributes').hide();
        $('#hideadvancedattributes').show();
        $('#advancedquestionsettingswrapper').animate({
            "height": "toggle", "opacity": "toggle"
        });

    });

    $('#hideadvancedattributes').click(function(){
        $('#showadvancedattributes').show();
        $('#hideadvancedattributes').hide();
        $('#advancedquestionsettingswrapper').animate({
            "height": "toggle", "opacity": "toggle"
        });

    });
    $('#question_type').change(updatequestionattributes);

    $('#question_type_button  li a').click(function(){
        $(".btn:first-child .buttontext").text($(this).text());
        $('#question_type').val($(this).data('value'));

        updatequestionattributes();
       });

    $('#MinimizeGroupWindow').click(function(){
        $('#groupdetails').hide();
    });
    $('#MaximizeGroupWindow').click(function(){
        $('#groupdetails').show();
    });
    $('#tabs').tabs({
        activate: function(event, ui) {
            if(history.pushState) {
                history.pushState(null, null, '#'+ui.newPanel.attr('id'));
            }
            else {
                location.hash = ui.newPanel.attr('id');
            }
        }
    });
    $('.tab-nav').tabs();
    $(".flashmessage").each(function() {
        $(this).notify().notify('create','themeroller',{},{custom:true,
        speed: 500,
        expires: 5000
        });
    });
    if ($("#question_type_button").not('.none').length > 0 && $("#question_type_button").attr('type')!='hidden'){

       qTypeDropdownInit();
        $("#question_type_button").change(function(event){
            OtherSelection(this.value);
        });
        $("#question_type_button").change();
    }
    else
    {
        $("#question_type.none").change(function(event){
            OtherSelection(this.value);
        });
        $("#question_type.none").change();
    }

    /**
     * Confirmation modal
     *
     * Either provide a data-href to redirect after OK button is clicked,
     * or data-onclick to be run when OK is clicked.
     */
    $('#confirmation-modal').on('show.bs.modal', function(e) {

        var onclick = null;
        var href = null;
        if($(this).data('href'))
        {
            var href = $(this).data('href');    // When calling modal from javascript
        }
        else
        {
            var href = $(e.relatedTarget).data('href');
        }

        if($(this).data('onclick'))
        {
            var onclick = $(this).data('onclick');
        }
        else
        {
            var onclick = $(e.relatedTarget).data('onclick');
        }

        $keepopen = $(this).data('keepopen');
        if (href != '' && href !== undefined)
        {
            $(this).find('.btn-ok').attr('href', href);
        }
        else if (onclick != '' && onclick !== undefined) {

            var onclick_fn = eval(onclick);

            if (typeof onclick_fn == 'function') {
                $(this).find('.btn-ok').off('click');
                $(this).find('.btn-ok').on('click', function(ev) {
                    if(! $keepopen )
                    {
                        $('#confirmation-modal').modal('hide');
                    }
                    onclick_fn();
                });
            }
            else {
                throw "Confirmation modal: onclick is not a function.";
            }

        }
        else if($(e.relatedTarget).data('ajax-url'))
        {
            var postDatas   = $(e.relatedTarget).data('post');
            var gridid      = $(e.relatedTarget).data('gridid');

            $(this).find('.btn-ok').on('click', function(ev)
            {
                $.ajax({
                    type: "POST",
                    url: $(e.relatedTarget).data('ajax-url'),
                    data: postDatas,

                    success : function(html, statut)
                    {
                        $.fn.yiiGridView.update(gridid);                   // Update the surveys list
                        $('#confirmation-modal').modal('hide');
                    },
                    error :  function(html, statut){
                        $('#confirmation-modal .modal-body-text').append(html.responseText);
                    }

                });
            });
        }
        else
        {
            throw "Confirmation modal: Found neither data-href or data-onclick.";
        }

        $(this).find('.modal-body-text').html($(e.relatedTarget).data('message'));
    });

    // Error modal
    $('#error-modal').on('show.bs.modal', function(e) {
        $(this).find('.modal-body-text').html($(e.relatedTarget).data('message'));
    });

});

function qTypeDropdownInit()
{
    $(document).ready(function () {
        $("#question_type_button .questionType").each(function(index,element){
            $(element).qtip({
                style: {
                    classes: 'qtip-bootstrap'
                },
                content: getToolTip($(element).text()),
                position: {
                    my : 'center right',
                    at: 'center left',
                    target: $('label[for=question_type]'),
                    viewport: $(window),
                    adjust: {
                        x: 0
                    }

                }
            });

        });
    });
    $(document).ready(function() {

        $('.questionType').on('mouseenter', function(e){
            //alert($(this).attr('class'));
            $('.questionType').qtip('hide');
            $(this).qtip('option', 'position.target', $(this).qtip('show'));
        });

        $('.questionType').on('mouseleave', function(e){
            $(this).qtip('hide');
        });
    });
}


var aToolTipData = {

};

var qDescToCode;
var qCodeToInfo;

function getToolTip(type){
    var code = qDescToCode[''+type];
    var multiple = 0;
    if (code=='S') multiple = 2;

    if (code == ":") code = "COLON";
    else if(code == "|") code = "PIPE";
    else if(code == "*") code = "EQUATION";

    if (multiple > 0){
        returnval = '';
        for(i=1;i<=multiple;i++){
            returnval = returnval + "<img src='" + imgurl + "/screenshots/"+code+i+".png' /><br /><br />";
        }
        return returnval;
    }

    return "<img src='" + imgurl + "/screenshots/"+code+".png' />";
}

//We have form validation and other stuff..

function updatequestionattributes()
{
    var type = $('#question_type').val();
    OtherSelection(type);

    $('.loader').show();
    $('#advancedquestionsettings').html('');
    var selected_value = qDescToCode[''+$("#question_type_child .selected").text()];
    if (selected_value==undefined) selected_value = $("#question_type").val();
    $('#advancedquestionsettings').load(attr_url,{qid:$('#qid').val(),
        question_type:selected_value,
        sid:$('#sid').val()
    }, function(){
        // Loads the tooltips for the toolbars

        // Loads the tooltips for the toolbars
        $('.loader').hide();
        $('label[title]').qtip({
            style: {name: 'cream',
                tip: true,
                color:'#111111',
                border: {
                    width: 1,
                    radius: 5,
                    color: '#EADF95'}
            },
            position: {adjust: {
                    screen: true, scroll:true},
                corner: {
                    target: 'bottomRight'}
            },
            show: {effect: {length:50}}
        });}
    );
}

function validatefilename (form, strmessage )
{
    if (form.the_file.value == "") {
        $('#pleaseselectfile-popup').modal();
        form.the_file.focus();
        return false ;
    }
    return true ;
}

function doToolTip()
{
    $('.btntooltip').tooltip();

    // Since you can only have one option per data-toggle,
    // we need this to enable both modal and toggle on one
    // button. E.g., <button data-toggle='modal' data-tooltip='true' title="foo">...</button>
    $('[data-tooltip="true"]').tooltip();

    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })

    // ToolTip on menu
    $(".sf-menu li").each(function() {
        tipcontent=$(this).children("a").children("img").attr('alt');
        if(tipcontent && tipcontent!=""){
            $(this).qtip({
                content: {
                    text: tipcontent
                },
                style: {
                    classes: "qtip-light qtip-rounded"
                },
                position: {
                    my: 'bottom left',
                    at: "top right"
                }
            });
            $(this).children("a").children("img").removeAttr('title');
        }
    });



}

// If the length of the element's string is 0 then display helper message
function isEmpty(elem, helperMsg)
{
    if($.trim(elem.value).length == 0){
        alert(helperMsg);
        elem.focus(); // set the focus to this input
        return false;
    }
    return true;
}


function arrHasDupes( A ) {                          // finds any duplicate array elements using the fewest possible comparison
    var i, j, n;
    n=A.length;
    // to ensure the fewest possible comparisons
    for (i=0; i<n; i++) {                        // outer loop uses each item i at 0 through n
        for (j=i+1; j<n; j++) {              // inner loop only compares items j at i+1 to n
            if (A[i]==A[j]) return true;
    }}
    return false;
}

/**
 * Like arrHasDupes, but returns the duplicated item
 *
 * @param {array} A
 * @return {mixed|boolean} Array item] or false if no duplicate is found
 */
function arrHasDupesWhich(A) {
    var i, j, n;
    n=A.length;
    // to ensure the fewest possible comparisons
    for (i=0; i<n; i++) {                        // outer loop uses each item i at 0 through n
        for (j=i+1; j<n; j++) {              // inner loop only compares items j at i+1 to n
            if (A[i]==A[j]) return A[i];
    }}
    return false;
}


// (c) 2006 Simon Wunderlin, License: GPL, hacks want to be free ;)
// This fix forces Firefox to fire the onchange event if someone changes select box with cursor keys
function ev_gecko_select_keyup_ev(Ev) {
    // prevent tab, alt, ctrl keys from fireing the event
    if (Ev.keyCode && (Ev.keyCode == 1 || Ev.keyCode == 9 ||
    Ev.keyCode == 16 || Ev.altKey || Ev.ctrlKey))
        return true;
    Ev.target.onchange();
    return true;
}



function getkey(e)
{
    if (window.event) return window.event.keyCode;
    else
        if (e) return e.which;
    else return null;
}

function goodchars(e, goods)
{
    var key, keychar;
    key = getkey(e);
    if (key == null) return true;

    // get character
    keychar = String.fromCharCode(key);
    keychar = keychar.toLowerCase();
    goods = goods.toLowerCase();

    // check goodkeys
    if (goods.indexOf(keychar) != -1)
        return true;

    // control keys
    if ( key==null || key==0 || key==8 || key==9  || key==27 )
        return true;

    // else return false
    return false;
}


function DoAdd()
{
    if (document.getElementById("available_languages").selectedIndex>-1)
        {
        var strText = document.getElementById("available_languages").options[document.getElementById("available_languages").selectedIndex].text;
        var strId = document.getElementById("available_languages").options[document.getElementById("available_languages").selectedIndex].value;
        AddItem(document.getElementById("additional_languages"), strText, strId);
        RemoveItem(document.getElementById("available_languages"), document.getElementById("available_languages").selectedIndex);
        sortSelect(document.getElementById("additional_languages"));
        UpdateLanguageIDs();
    }
}

function DoRemove(minItems,strmsg)
{
    var strText = document.getElementById("additional_languages").options[document.getElementById("additional_languages").selectedIndex].text;
    var strId = document.getElementById("additional_languages").options[document.getElementById("additional_languages").selectedIndex].value;
    if (document.getElementById("additional_languages").options.length>minItems)
        {
        AddItem(document.getElementById("available_languages"), strText, strId);
        RemoveItem(document.getElementById("additional_languages"), document.getElementById("additional_languages").selectedIndex);
        sortSelect(document.getElementById("available_languages"));
        UpdateLanguageIDs();
    }
    else
        if (strmsg!=''){alert(strmsg);}
}

function UpdateLanguageIDs(mylangs,confirmtxt)
{
    document.getElementById("languageids").value = '';

    var lbBox = document.getElementById("additional_languages");
    for (var i = 0; i < lbBox.options.length; i++)
        {
        document.getElementById("languageids").value = document.getElementById("languageids").value + lbBox.options[i].value+ ' ';
    }
    if (mylangs)
        {
        if (checklangs(mylangs))
            {
            return true;
        } else
            {
            return confirm(confirmtxt);
        }
    }
}



function trim(stringToTrim) {
    return stringToTrim.replace(/^\s+|\s+$/g,"");
}

function AddItem(objListBox, strText, strId)
{
    var newOpt;
    newOpt = document.createElement("OPTION");
    newOpt = new Option(strText,strId);
    newOpt.id = strId;
    objListBox.options[objListBox.length]=newOpt;
}

function RemoveItem(objListBox, strId)
{
    if (strId > -1)
        objListBox.options[strId]=null;
}

function GetItemIndex(objListBox, strId)
{
    for (var i = 0; i < objListBox.children.length; i++)
        {
        var strCurrentValueId = objListBox.children[i].id;
        if (strId == strCurrentValueId)
            {
            return i;
        }
    }
    return -1;
}

function compareText (option1, option2) {
    return option1.text < option2.text ? -1 :
    option1.text > option2.text ? 1 : 0;
}

function compareValue (option1, option2) {
    return option1.value < option2.value ? -1 :
    option1.value > option2.value ? 1 : 0;
}

function compareTextAsFloat (option1, option2) {
    var value1 = parseFloat(option1.text);
    var value2 = parseFloat(option2.text);
    return value1 < value2 ? -1 :
    value1 > value2 ? 1 : 0;
}

function compareValueAsFloat (option1, option2) {
    var value1 = parseFloat(option1.value);
    var value2 = parseFloat(option2.value);
    return value1 < value2 ? -1 :
    value1 > value2 ? 1 : 0;
}

function sortSelect (select, compareFunction) {
    if (!compareFunction)
        compareFunction = compareText;
    var options = new Array (select.options.length);
    for (var i = 0; i < options.length; i++)
        options[i] =
    new Option (
    select.options[i].text,
    select.options[i].value,
    select.options[i].defaultSelected,
    select.options[i].selected
    );
    options.sort(compareFunction);
    select.options.length = 0;
    for (var i = 0; i < options.length; i++)
        select.options[i] = options[i];
}

function checklangs(mylangs)
{
    selObject=document.getElementById("additional_languages");
    var found;

    for (x = 0; x < mylangs.length; x++)
        {
        found = 0;
        for (i=0;i<selObject.options.length;i++)
            {
            if(selObject.options[i].value == mylangs[x])
                {
                found = 1;
                break;
            }
        }
        if (found == 0) {return false;}
    }
    return true;
}

function isset( variable )
{
    return( typeof( variable ) != 'undefined' );
}

String.prototype.splitCSV = function(sep) {
    for (var foo = this.split(sep = sep || ","), x = foo.length - 1, tl; x >= 0; x--) {
        if (foo[x].replace(/"\s+$/, '"').charAt(foo[x].length - 1) == '"') {
            if ((tl = foo[x].replace(/^\s+"/, '"')).length > 1 && tl.charAt(0) == '"') {
                foo[x] = foo[x].replace(/^\s*"|"\s*$/g, '').replace(/""/g, '"');
            } else if (x) {
                foo.splice(x - 1, 2, [foo[x - 1], foo[x]].join(sep));
            } else foo = foo.shift().split(sep).concat(foo);
        } else foo[x].replace(/""/g, '"');
    }return foo;
};

// This is a helper function to extract the question ID from a DOM ID element
function removechars(strtoconvert){
    return strtoconvert.replace(/[-a-zA-Z_]/g,"");
}


function htmlspecialchars (string, quote_style, charset, double_encode) {
    // Convert special characters to HTML entities
    //
    // version: 1109.2015
    // discuss at: http://phpjs.org/functions/htmlspecialchars    // +   original by: Mirek Slugen
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Nathan
    // +   bugfixed by: Arno
    // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)    // +    bugfixed by: Brett Zamir (http://brett-zamir.me)
    // +      input by: Ratheous
    // +      input by: Mailfaker (http://www.weedem.fr/)
    // +      reimplemented by: Brett Zamir (http://brett-zamir.me)
    // +      input by: felix    // +    bugfixed by: Brett Zamir (http://brett-zamir.me)
    // %        note 1: charset argument not supported
    // *     example 1: htmlspecialchars("<a href='test'>Test</a>", 'ENT_QUOTES');
    // *     returns 1: '&lt;a href=&#039;test&#039;&gt;Test&lt;/a&gt;'
    // *     example 2: htmlspecialchars("ab\"c'd", ['ENT_NOQUOTES', 'ENT_QUOTES']);    // *     returns 2: 'ab"c&#039;d'
    // *     example 3: htmlspecialchars("my "&entity;" is still here", null, null, false);
    // *     returns 3: 'my &quot;&entity;&quot; is still here'
    var optTemp = 0,
    i = 0,        noquotes = false;
    if (typeof quote_style === 'undefined' || quote_style === null) {
        quote_style = 2;
    }
    // Not form phpjs: added because in some condition : subquestion can send null for string
    // subquestion js use inline javascript function
    if (typeof string === 'undefined' || string === null) {
        string="";
    }
    string = string.toString();    if (double_encode !== false) { // Put this first to avoid double-encoding
        string = string.replace(/&/g, '&amp;');
    }
    string = string.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    var OPTS = {
        'ENT_NOQUOTES': 0,
        'ENT_HTML_QUOTE_SINGLE': 1,
        'ENT_HTML_QUOTE_DOUBLE': 2,
        'ENT_COMPAT': 2,        'ENT_QUOTES': 3,
        'ENT_IGNORE': 4
    };
    if (quote_style === 0) {
        noquotes = true;    }
    if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
        quote_style = [].concat(quote_style);
        for (i = 0; i < quote_style.length; i++) {
            // Resolve string input to bitwise e.g. 'ENT_IGNORE' becomes 4
            if (OPTS[quote_style[i]] === 0) {
                noquotes = true;
            }
            else if (OPTS[quote_style[i]]) {
                optTemp = optTemp | OPTS[quote_style[i]];            }
        }
        quote_style = optTemp;
    }
    if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {        string = string.replace(/'/g, '&#039;');
    }
    if (!noquotes) {
        string = string.replace(/"/g, '&quot;');
    }
    return string;
}

jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", ( $(window).height() - this.height() ) / 2+$(window).scrollTop() + "px");
    this.css("left", ( $(window).width() - this.width() ) / 2+$(window).scrollLeft() + "px");
    return this;
};

// Fix broken substr function with negative start value (in older IE)
// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/substr
if ('ab'.substr(-1) != 'b') {
    String.prototype.substr = function(substr) {
        return function(start, length) {
            if (start < 0) start = this.length + start;
            return substr.call(this, start, length);
        };
    }(String.prototype.substr);
}

function linksInDialog()
{
    $(function () {
        var iframe = $('<iframe id="dialog" allowfullscreen></iframe>');
        var dialog = $("<div></div>").append(iframe).appendTo("body").dialog({
            autoOpen: false,
            modal: false,
            resizable: true,
            width: "60%",
            height: $(window).height()*0.6,
            close: function () {
                iframe.attr("src", "");
            }
        });
        $(document).on('click','a[target=dialog]',function(event){
            event.preventDefault();
            var src = $(this).attr("href");
            var title = $(this).attr("title");
            if(!title && $(this).children("img[alt]"))
                title = $(this).children("img[alt]").attr("alt");
            iframe.attr({
                src: src,
            });
            dialog.dialog("option", "title", title);
            dialog.dialog("open");
        });
    });
}
function initializeAjaxProgress()
{
    $('#ajaxprogress').dialog({
            'modal' : true,
            'closeOnEscape' : false,
            'title' : $('#ajaxprogress').attr('title'),
            'autoOpen' : false,
            'minHeight': 0,
            'resizable': false
        });
    $('#ajaxprogress').bind('ajaxStart', function()
    {
        $(this).dialog('open');
    });
    $('#ajaxprogress').bind('ajaxStop', function()
    {

        $(this).dialog('close');
    });
}

/**
 * Adapt cell to have a click on cell do a click on input:radio or input:checkbox (if unique)
 * Using delegate the can be outside document.ready
 */
function tableCellAdapters()
{
    $('table.activecell').delegate('tbody td input:checkbox,tbody td input:radio,tbody td label,tbody th input:checkbox,tbody th input:radio,tbody th label',"click", function(e) {
        e.stopPropagation();
    });
    $('table.activecell').delegate('tbody td,tbody th',"click", function() {
        if($(this).find("input:radio,input:checkbox").length==1)
        {
          $(this).find("input:radio").click();
          $(this).find("input:radio").triggerHandler("click");
          $(this).find("input:checkbox").click();
          $(this).find("input:checkbox").triggerHandler("click");
        }
    });
}

/**
 * sendPost : create a form, fill with param and submit
 *
 * @param {string} action
 * @param {} checkcode : deprecated
 * @param {array} arrayparam
 * @param {array} arrayval
 *
 */
function sendPost(myaction,checkcode,arrayparam,arrayval)
{
    var $form = $("<form method='POST'>").attr("action", myaction);
    for (var i = 0; i < arrayparam.length; i++)
        $("<input type='hidden'>").attr("name", arrayparam[i]).attr("value", arrayval[i]).appendTo($form);
    $("<input type='hidden'>").attr("name", 'YII_CSRF_TOKEN').attr("value", LS.data.csrfToken).appendTo($form);
    $form.appendTo("body");
    $form.submit();
}
function addHiddenElement(theform,thename,thevalue)
{
    var myel = document.createElement('input');
    myel.type = 'hidden';
    myel.name = thename;
    theform.appendChild(myel);
    myel.value = thevalue;
    return myel;
}
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

/**
 * jQuery Plugin to manage the date in token modal edition.
 * Some fields, like "Completed", can have string value (eg: 'N') or a date value.
 * They are displayed via a switch hidding or showing a date picker.
 */
$.fn.YesNoDate = function(options)
{
    var that            = $(this);                                              // calling element
    $(document).ready(function(){
        var $elSwitch        = that.find('.YesNoDateSwitch').first();           // switch element (generated with YiiWheels widgets)
        var $elDateContainer = that.find('.date-container').first();            // date time picker container (to show/hide)
        var $elDate          = that.find('.YesNoDatePicker').first();           // date time picker element (generated with YiiWheels widgets)
        var $elHiddenInput   = that.find('.YesNoDateHidden').first();           // input form, containing the value to submit to the database

        // The view is called without processing output (no javascript)
        // So we must apply js to widget elements
        $elSwitch.bootstrapSwitch();                                            // Generate the switch
        $elDate.datetimepicker({locale: that.data('locale')})                   // Generate the date time picker

        // When user switch
        $(document).on( 'switchChange.bootstrapSwitch', '#'+$elSwitch.attr('id'), function(event, state)
        {
            if (state==true)
            {
                // Show date
                $elDateContainer.show();
            }
            else
            {
                // Hide date, set hidden input to "N"
                $elDateContainer.hide();
                $elHiddenInput.attr('value', 'N');
            }
        });

        // When user change date
        $(document).on('dp.change', '#'+$elDate.attr('id')+'_datetimepicker', function(e){
            $elHiddenInput.attr('value', e.date.format('YYYY-MM-DD HH:MM'));
        })
    });
}


// Calculate width of text from DOM element or string. By Phil Freo <http://philfreo.com>
$.fn.textWidth = function(text, font) {
    if (!$.fn.textWidth.fakeEl) $.fn.textWidth.fakeEl = $('<span>').hide().appendTo(document.body);
    $.fn.textWidth.fakeEl.text(text || this.val() || this.text()).css('font', font || this.css('font'));
    return $.fn.textWidth.fakeEl.width();
};


/**
 * Provide to this function a element containing form-groups,
 * it will stick the text labels on its border
 */
$.fn.stickLabelOnLeft  = function(options)
{
    var that = $(this);
    var formgroups = that.find('.form-group');
    $maxWidth  = 0;
    $elWidestLeftLabel = '';
    formgroups.each( function() {
        var elLeftLabel = $(this).find('label').first();
        $LeftLabelWidth = elLeftLabel.textWidth();

        if ($LeftLabelWidth > $maxWidth )
        {
            $maxWidth =$LeftLabelWidth;
            $elWidestLeftLabel = elLeftLabel;
        }
    });

    $distanceFromBorder = ( $maxWidth - $elWidestLeftLabel.width());
    if ( $distanceFromBorder < 0)
    {
        that.css({
            position: "relative",
            left: $distanceFromBorder,
        });
    }

}

$(document).ready(function(){

    /**
     * Scroll the pager and the footer when scrolling horizontally
     */
    $('.scrolling-wrapper').scroll(function(){
        $('#tokenListPager').css({
            'left': $(this).scrollLeft() ,
        });
    });

    if($('#sent-yes-no-date-container').length > 0)
    {
        $('#general').stickLabelOnLeft();
        $('#sent-yes-no-date-container').YesNoDate();
        $('#remind-yes-no-date-container').YesNoDate();
        $('#completed-yes-no-date-container').YesNoDate();

        $('#validfrom').datetimepicker({locale: $('#validfrom').data('locale')});
        $('#validuntil').datetimepicker({locale: $('#validuntil').data('locale')});

        $('.date .input-group-addon').on('click', function(){
            $prev = $(this).siblings();
            console.log($prev.attr('class'));
            $prev.data("DateTimePicker").show();
        });
    }

    /**
     * Token edition
     */
    $(document).on( 'click', '.edit-token', function(){
        $that       = $(this);
        $sid        = $that.data('sid');
        $tid        = $that.data('tid');
        $actionUrl  = $that.data('url');
        $modal      = $('#editTokenModal');
        $modalBody  = $modal.find('.modal-body');
        $ajaxLoader = $('#ajaxContainerLoading2');
        $oldModalBody   = $modalBody.html();


        $ajaxLoader.show();
        $modal.modal('show');
        // Ajax request
        $.ajax({
            url : $actionUrl,
            type : 'GET',

            // html contains the buttons
            success : function(html, statut){

                $('#modal-content').empty().append(html);                       // Inject the returned HTML in the modal body

                // Apply the yes/no/date jquery plugin to the elements loaded via ajax
                $('#sent-yes-no-date-container').YesNoDate();
                $('#remind-yes-no-date-container').YesNoDate();
                $('#completed-yes-no-date-container').YesNoDate();

                $('#validfrom').datetimepicker({locale: $('#validfrom').data('locale')});
                $('#validuntil').datetimepicker({locale: $('#validuntil').data('locale')});

                $('.date .input-group-addon').on('click', function(){
                    $prev = $(this).siblings();
                    console.log($prev.attr('class'));
                    $prev.data("DateTimePicker").show();
                });

                var elGeneral  = $('#general');

                // Fake hide of modal content, so we can still get width of inner elements like labels
                var previousCss  = $("#modal-content").attr("style");
                $("#modal-content")
                    .css({
                        position:   'absolute', // Optional if #myDiv is already absolute
                        visibility: 'hidden',
                        display:    'block'
                    });

                // Stick the labels on the left side
                // Sometime, the content is loaded after modal is shown, sometimes not. So, we wait 200ms just in case (For label width)
                setTimeout(function(){
                    elGeneral.stickLabelOnLeft();
                    $ajaxLoader.hide();
                    // Remove fake hide
                    $("#modal-content").attr("style", previousCss ? previousCss : "");
                }, 200);

            },
            error :  function(html, statut){
                $ajaxLoader.hide();
                $('#modal-content').empty().append(html);
                console.log(html);
            }
        });
    });

    /**
     * Save token
     */
    $("#save-edittoken").click(function(){
        $form       = $('#edittoken');
        $datas      = $form.serialize();
        $actionUrl  = $form.attr('action');
        $gridid     = $('.listActions').data('grid-id');
        $modal      = $('#editTokenModal');

        $ajaxLoader = $('#ajaxContainerLoading2');
        $('#modal-content').empty();
        $ajaxLoader.show();                                         // Show the ajax loader

        // Ajax request
        $.ajax({
            url  : $actionUrl,
            type : 'POST',
            data : $datas,

            // html contains the buttons
            success : function(html, statut){
                $ajaxLoader.hide();
                $.fn.yiiGridView.update('token-grid');                   // Update the surveys list
                $modal.modal('hide');
            },
            error :  function(html, statut){
                $ajaxLoader.hide();
                $('#modal-content').empty().append(html);
                console.log(html);
            }
        });

    });



});
