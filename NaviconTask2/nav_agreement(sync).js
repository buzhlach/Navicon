var Navicon = Navicon || {};

Navicon.nav_agreement = (function () {

    /**
     * Если изменилось значение полей Контакт или Автомобиль показать Кредитныую программу.
     * @param {*} context 
     */
    let onContactOrAutoChanged = function (context) {
        let formContext = context.getFormContext();

        let contactValue = formContext.getAttribute("nav_contact").getValue();
        let autoIdValue = formContext.getAttribute("nav_autoid").getValue();

        let creditIdControl = formContext.getControl("nav_creditid");

        if (!creditIdControl) {
            alert("try to get nav_creditid control, but get null");
            return;
        }

        if (contactValue && autoIdValue) {
            creditIdControl.setVisible(true);
        }
        else creditIdControl.setVisible(false);
    };

    /**
     * Если изменилось поле Кредитная программа показать поля связанные с кредитом.
     * @param {*} context 
     */
    let onCreditIdChanged = function (context) {
        let formContext = context.getFormContext();

        let creditIdValue = formContext.getAttribute("nav_creditid").getValue();

        let summaControl = formContext.getControl("nav_summa");
        let factControl = formContext.getControl("nav_fact");
        let creditTab = formContext.ui.tabs.get("tab_2");

        if (!summaControl && !factControl && !creditTab) {
            alert("try to get nav_summa and nav_fact controls, tab_2 but get null");
            return;
        }

        if (creditIdValue) {
            changeControlVisible(context, ["nav_summa", "nav_fact"], true);
            creditTab.setVisible(true);
        }
        else {
            changeControlVisible(context, ["nav_summa", "nav_fact"], false);
            creditTab.setVisible(false);
        }
    };

    /**
     * Фильтрует поле Кредтная программа по связи с полем Автомобиль
     * @param {*} context 
     */
    var filterAuto = function (context) {

        let formContext = context.getFormContext();
        let autoValue = formContext.getAttribute("nav_autoid").getValue();
        let autoFilter = "";

        var addCustomFilterForCredit = function () {
            formContext.getControl("nav_creditid").addCustomFilter(autoFilter);
            formContext.getControl("nav_creditid").removePreSearch(addCustomFilterForCredit);
        }

        if (!autoValue) {
            return;
        }
        autoId = autoValue[0].id;
        autoId = autoId.toLowerCase().substring(1, autoId.length - 1);
        console.log(autoId);

        var req = new XMLHttpRequest();
        req.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() +
            "/api/data/v9.0/nav_nav_credit_nav_autoset?$select=nav_creditid&$filter=nav_autoid eq " + autoId, false);

        req.send();
        if (req.status != 200) {
            console.error(req.status + ': ' + req.statusText);
            return;
        }

        let reqObj = JSON.parse(req.response);

        autoFilter += "<filter type='or'><condition attribute='nav_creditid' operator='eq' value='00000000-0000-0000-0000-000000000000'/>";
        for (let i = 0; i < reqObj.value.length; i++) {
            autoFilter += "<condition attribute='nav_creditid' operator='eq' value='" + reqObj.value[i].nav_creditid + "'/>";
        }
        autoFilter += "</filter>";

        console.log(autoFilter);

        formContext.getControl("nav_creditid").addPreSearch(addCustomFilterForCredit);
    }

    /**
    * Если поле Автомобиль изменено показать в поле Кредитные программы только связанные объекты.
    * @param {*} context
    */
    let onAutoChanged = function (context) {
        let formContext = context.getFormContext();
        // formContext.getAttribute("nav_creditid").setValue(null);
        filterAuto(context);
    }

    /**
     * Если поле Номер договора изменено оставить только цифры и -.
     * @param {*} context 
     */
    let onNameChanged = function (context) {
        let formContext = context.getFormContext();
        let nameAttr = formContext.getAttribute("nav_name");

        let nameValue = nameAttr.getValue();
        nameValue = nameValue.replace(/[^\d\-]/g, '');

        nameAttr.setValue(nameValue);
    }

    /**
     * Меняет видимость у control именам controlNames.
     * @param {*} context 
     * @param {Array} controlNames Имена всех control.
     * @param {boolean} visible Параметр видимости.
     */
    let changeControlVisible = function (context, controlNames, visible) {
        controlNames.forEach(element => {
            let formContext = context.getFormContext();
            let disableControl = formContext.getControl(element);

            if (disableControl) {
                disableControl.setVisible(visible);
            }
            else {
                console.log("try to get" + element + "control ,but get null");
            }
        });
    }


    /**
     * Скрывает при загрузке все поля кроме номер, дата договора, контакт и модель. 
     * @param {*} context 
     */
    let hideFildsOnLoad = function (context) {
        changeControlVisible(context, ["nav_summa", "nav_fact", "nav_creditid"], false);

        let formContext = context.getFormContext();

        let disableControl = formContext.ui.tabs.get("tab_2");
        if (disableControl) {
            disableControl.setVisible(false);
        }
        else {
            alert("try to get tab_2 control, but get null");
        }
    }

    /**
     * Показать поле Кредитная программа, если поля Контакт и Автомобиль не пустые.
     * @param {*} context 
     */
    let showCreditIfAutoAndContactNotNull = function (context) {
        let formContext = context.getFormContext();

        let contactAttr = formContext.getAttribute("nav_contact");
        let autoIdAttr = formContext.getAttribute("nav_autoid");

        if (!contactAttr || !autoIdAttr) {
            alert("try to get nav_contact and nav_autoid attr, but get null");
            return;
        }
        onContactOrAutoChanged(context);
        contactAttr.addOnChange(onContactOrAutoChanged);
        autoIdAttr.addOnChange(onContactOrAutoChanged);
    }


    return {

        /**
         * Выполняется при загрузке формы.
         * @param {*} context 
         */
        onLoad: function (context) {
            let formContext = context.getFormContext();

            if (!formContext) {
                alert("try to get formContext control, but get null");
                return;
            }

            hideFildsOnLoad(context);


            showCreditIfAutoAndContactNotNull(context);

            //#region Открыть поля связанные с кредитом, если поле Кредитная программа не пустое.

            let creditIdAttr = formContext.getAttribute("nav_creditid");

            if (creditIdAttr) {
                onCreditIdChanged(context);
                creditIdAttr.addOnChange(onCreditIdChanged);
            }
            else {
                alert("try to get nav_creditid attr, but get null");
            }
            //#endregion

            //#region Показывать в поиске Кредитные программы только связанные с Автомобилем.

            let autoIdAttr = formContext.getAttribute("nav_autoid");

            if (autoIdAttr) {
                autoIdAttr.addOnChange(onAutoChanged);
            }
            else {
                alert("try to get nav_contact and nav_autoid attr, but get null");
            }
            //#endregion

            //#region После редактирования оставить в поле Номер договора только цифры и -.
            let nameControl = formContext.getAttribute("nav_name");
            nameControl.addOnChange(onNameChanged);
            //#endregion
        }
    }
})();
