var Navicon = Navicon || {};

Navicon.nav_agreement = (function () {

    /**
     * Если изменилось значение полей Контакт или Автомобиль показать Кредитныую программу.
     */
    let onContactOrAutoChanged = function () {

        let contactValue = Xrm.Page.getAttribute("nav_contact").getValue();
        let autoIdValue = Xrm.Page.getAttribute("nav_autoid").getValue();

        let creditIdControl = Xrm.Page.getControl("nav_creditid");

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
     */
    let onCreditIdChanged = function () {

        let creditIdValue = Xrm.Page.getAttribute("nav_creditid").getValue();

        let summaControl = Xrm.Page.getControl("nav_summa");
        let factControl = Xrm.Page.getControl("nav_fact");
        let creditTab = Xrm.Page.ui.tabs.get("tab_2");

        if (!summaControl && !factControl && !creditTab) {
            alert("try to get nav_summa and nav_fact controls, tab_2 but get null");
            return;
        }

        if (creditIdValue) {
            changeControlVisible(["nav_summa", "nav_fact"], true);
            creditTab.setVisible(true);
        }
        else {
            changeControlVisible(["nav_summa", "nav_fact"], false);
            creditTab.setVisible(false);
        }
    };

    /**
     * Фильтрует поле Кредтная программа по связи с полем Автомобиль 
     */
    var filterAuto = function () {

        let autoValue = Xrm.Page.getAttribute("nav_autoid").getValue();
        let autoFilter = "";

        var addCustomFilterForCredit = function () {
            Xrm.Page.getControl("nav_creditid").addCustomFilter(autoFilter);
            Xrm.Page.getControl("nav_creditid").removePreSearch(addCustomFilterForCredit);
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

        Xrm.Page.getControl("nav_creditid").addPreSearch(addCustomFilterForCredit);
    }

    /**
    * Если поле Автомобиль изменено показать в поле Кредитные программы только связанные объекты.
    */
    let onAutoChanged = function () {
        // Xrm.Page.getAttribute("nav_creditid").setValue(null);
        filterAuto();
    }

    /**
     * Если поле Номер договора изменено оставить только цифры и -. 
     */
    let onNameChanged = function () {
        let nameAttr = Xrm.Page.getAttribute("nav_name");

        let nameValue = nameAttr.getValue();
        nameValue = nameValue.replace(/[^\d\-]/g, '');

        nameAttr.setValue(nameValue);
    }

    /**
     * Меняет видимость у control именам controlNames.
     * @param {Array} controlNames Имена всех control.
     * @param {boolean} visible Параметр видимости.
     */
    let changeControlVisible = function ( controlNames, visible) {
        controlNames.forEach(element => {
            let disableControl = Xrm.Page.getControl(element);

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
     */
    let hideFildsOnLoad = function () {
        changeControlVisible( ["nav_summa", "nav_fact", "nav_creditid"], false);


        let disableControl = Xrm.Page.ui.tabs.get("tab_2");
        if (disableControl) {
            disableControl.setVisible(false);
        }
        else {
            alert("try to get tab_2 control, but get null");
        }
    }

    /**
     * Показать поле Кредитная программа, если поля Контакт и Автомобиль не пустые.
     */
    let showCreditIfAutoAndContactNotNull = function () {

        let contactAttr = Xrm.Page.getAttribute("nav_contact");
        let autoIdAttr = Xrm.Page.getAttribute("nav_autoid");

        if (!contactAttr || !autoIdAttr) {
            alert("try to get nav_contact and nav_autoid attr, but get null");
            return;
        }
        onContactOrAutoChanged();
        contactAttr.addOnChange(onContactOrAutoChanged);
        autoIdAttr.addOnChange(onContactOrAutoChanged);
    }


    return {

        /**
         * Выполняется при загрузке формы.
         */
        onLoad: function () {

            hideFildsOnLoad();

            showCreditIfAutoAndContactNotNull();

            //#region Открыть поля связанные с кредитом, если поле Кредитная программа не пустое.

            let creditIdAttr = Xrm.Page.getAttribute("nav_creditid");

            if (creditIdAttr) {
                onCreditIdChanged();
                creditIdAttr.addOnChange(onCreditIdChanged);
            }
            else {
                alert("try to get nav_creditid attr, but get null");
            }
            //#endregion

            //#region Показывать в поиске Кредитные программы только связанные с Автомобилем.

            let autoIdAttr = Xrm.Page.getAttribute("nav_autoid");

            if (autoIdAttr) {
                autoIdAttr.addOnChange(onAutoChanged);
            }
            else {
                alert("try to get nav_contact and nav_autoid attr, but get null");
            }
            //#endregion

            //#region После редактирования оставить в поле Номер договора только цифры и -.
            let nameControl = Xrm.Page.getAttribute("nav_name");
            nameControl.addOnChange(onNameChanged);
            //#endregion
        }
    }
})();
