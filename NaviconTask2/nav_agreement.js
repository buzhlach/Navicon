var Navicon = Navicon || {};

Navicon.nav_agreement = (function () {

    /**
     * Названия control, которые необходимо прятать при загрузке.
     */
    let hiddenControlsNames = ["nav_summa, nav_fact, nav_creditid"];

    /**
     * Если изменилось значение полей Контакт или Автомобиль показать Кредитную программу, сумму и поле оплачен.
     */
    let onContactOrAutoChanged = function () {

        let contactAttr = Xrm.Page.getAttribute("nav_contact");
        let autoAttr = Xrm.Page.getAttribute("nav_autoid");

        if (!contactAttr || !autoAttr) {
            console.error("don't have all parameters for onContactOrAutoChanged");
            return;
        }

        let contactValue = contactAttr.getValue();
        let autoIdValue = autoAttr.getValue();

        if (contactValue && autoIdValue) {
            changeControlVisible(hiddenControlsNames, true);
        }
        else {
            changeControlVisible(hiddenControlsNames, false);
        }
    };

    /**
     * Если изменилось поле Кредитная программа.
     */
    let onCreditIdChanged = function () {
        showCreditTabIfCreditNotNull();
        setCreditPeriodIfCreditNotNull();
    };

    /**
     * Показать вкладку Кредит, если заполнено поле Кредитная программа.
     * @returns 
     */
    let showCreditTabIfCreditNotNull = function () {
        let creditIdAttr = Xrm.Page.getAttribute("nav_creditid");
        let creditTab = Xrm.Page.ui.tabs.get("tab_2");

        if (!creditTab || !creditIdAttr) {
            console.error("don't have all parameters for showCreditTabIfCreditNotNull");
            return;
        }

        let creditIdValue = creditIdAttr.getValue();

        if (creditIdValue) {
            creditTab.setVisible(true);
        }
        else {
            creditTab.setVisible(false);
        }
    }

    /**
     * Установить поле Срок кредита, если заполнено поле Кредитная программа.
     * @returns 
     */
    let setCreditPeriodIfCreditNotNull = function () {
        let creditIdAttr = Xrm.Page.getAttribute("nav_creditid");
        let creditPeriodAttr = Xrm.Page.getAttribute("nav_creditperiod");

        if (!creditIdAttr || !creditPeriodAttr) {
            console.error("don't have all parameters for setCreditPeriodIfCreditNotNull");
            return;
        }

        let creditIdValue = creditIdAttr.getValue();

        if (!creditIdValue) {
            return;
        }

        let creditId = creditIdValue[0].id;
        creditId = creditId.toLowerCase().substring(1, creditId.length - 1);

        let req = new XMLHttpRequest();
        req.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() +
            "/api/data/v9.0/nav_credits?$select=nav_creditperiod&$filter=nav_creditid eq " + creditId, false);

        req.send();
        if (req.status != 200) {
            console.error(req.status + ': ' + req.statusText);
            return;
        }

        let reqObj = JSON.parse(req.response);

        let creditPeriod = typeof (reqObj.value[0].nav_creditperiod) != "undefined" ? reqObj.value[0].nav_creditperiod : null;
        creditPeriodAttr.setValue(creditPeriod);
    }

    /**
     * Фильтрует поле Кредтная программа по связи с полем Автомобиль
     */
    var filterCreditByAuto = function () {

        let autoAttr = Xrm.Page.getAttribute("nav_autoid");
        let creditIdControl = Xrm.Page.getControl("nav_creditid");

        if (!autoAttr || !creditIdControl) {
            console.error("don't have all parameters for filterCreditByAuto");
            return;
        }

        let autoValue = autoAttr.getValue();

        if (!autoValue) {
            return;
        }

        let autoFilter = "";

        var addCustomFilterForCredit = function () {
            creditIdControl.addCustomFilter(autoFilter);
            creditIdControl.removePreSearch(addCustomFilterForCredit);
        }

        autoId = autoValue[0].id;
        autoId = autoId.toLowerCase().substring(1, autoId.length - 1);
        console.log(autoId);

        let req = new XMLHttpRequest();
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

        creditIdControl.addPreSearch(addCustomFilterForCredit);
    }

    /**
    * Если поле Автомобиль изменено показать в поле Кредитные программы только связанные объекты.
    */
    let onAutoChanged = function () {
        filterCreditByAuto();
        setAgreementPrice();
    }

    /**
     * Проставляет цену договора, если выбрана машина.
     */
    let setAgreementPrice = function () {
        let autoAttr = Xrm.Page.getAttribute("nav_autoid");
        let amountAttr = Xrm.Page.getAttribute("nav_summa");

        if (!amountAttr || !autoAttr) {
            console.error("don't have all parameters for setAgreementPrice");
            return;
        }

        let autoValue = autoAttr.getValue();

        if (!autoValue) {
            return;
        }

        autoId = autoValue[0].id;
        autoId = autoId.toLowerCase().substring(1, autoId.length - 1);

        var fetchXml = "?fetchXml=<fetch mapping='logical'><entity name='nav_auto'>" +
            "<attribute name='nav_used'/><attribute name='nav_amount'/>" +
            "<filter type='or'><condition attribute='nav_autoid' operator='eq' value='" + autoId + "'/></filter>" +
            "<link-entity name='nav_model' alias='nm' to='nav_modelid' from='nav_modelid' link-type='inner'>" +
            "<attribute name='nav_recommendedamount'/>" +
            "</link-entity>" +
            "</entity></fetch>";

        Xrm.WebApi.retrieveMultipleRecords("nav_auto", fetchXml).then(
            function success(result) {
                console.log(result);

                let isUsed = result.entities[0].nav_used;

                if (!result || !result.entities || result.entities.length <= 0 || typeof (isUsed) == "undefined") {
                    return;
                }

                if (isUsed) {
                    let amount = typeof (result.entities[0].nav_amount) != "undefined" ? result.entities[0].nav_amount : null;
                    amountAttr.setValue(amount);
                }
                else {
                    let amount = typeof (result.entities[0]["nm.nav_recommendedamount"]) != "undefined" ? result.entities[0]["nm.nav_recommendedamount"] : null;
                    amountAttr.setValue(amount);
                }
            },
            function (error) {
                console.log(error.message);
            }
        );
    }

    /**
     * Если поле Номер договора изменено оставить только цифры и -.
     */
    let onNameChanged = function () {
        let regex = /[^\d\-]/g;
        formatNameByRegex(regex);
    }

    /**
     * Форматировать строку по регексу.
     * @param {*} regex 
     * @returns 
     */
    let formatNameByRegex = function (regex) {
        let nameAttr = Xrm.Page.getAttribute("nav_name");

        if (!nameAttr) {
            console.error("don't have all parameters for formatNameByRegex");
            return;
        }
        let nameValue = nameAttr.getValue();

        nameValue = nameValue.replace(regex, '');

        nameAttr.setValue(nameValue);
    }

    /**
     * Меняет видимость у control именам controlNames.
     * @param {Array} controlNames Имена всех control.
     * @param {boolean} visible Параметр видимости.
     */
    let changeControlVisible = function (controlNames, visible) {
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

        changeControlVisible(hiddenControlsNames, false);

        let disableControl = Xrm.Page.ui.tabs.get("tab_2");
        if (disableControl) {
            disableControl.setVisible(false);
        }
        else {
            alert("try to get tab_2 control, but get null");
        }
    }

    /**
     * Блокирует сохранение, если Кредитная программа истекла
     * @param {*} saveEvent 
     */
    let blockSaveIfCreditProgramExpired = function () {
        let creditIdAttr = Xrm.Page.getAttribute("nav_creditid");
        let agreementDateAttr = Xrm.Page.getAttribute("nav_date");

        if (!agreementDateAttr || !creditIdAttr) {
            alert("don't have all fields for blockSaveIfCreditProgramExpired");
            return;
        }

        let creditIdValue = creditIdAttr.getValue();
        let agreementDate = agreementDateAttr.getValue();

        if (!agreementDate || !creditIdValue) {
            alert("don't have all fields for blockSaveIfCreditProgramExpired");
            return;
        }

        let creditId = creditIdValue[0].id;
        creditId = creditId.toLowerCase().substring(1, creditId.length - 1);

        let req = new XMLHttpRequest();
        req.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() +
            "/api/data/v9.0/nav_credits?$select=nav_dateend&$filter=nav_creditid eq " + creditId, false);

        req.send();
        if (req.status != 200) {
            console.error(req.status + ': ' + req.statusText);
            return;
        }

        let reqObj = JSON.parse(req.response);

        let dateValue = reqObj.value[0].nav_dateend;

        if (!dateValue) {
            return;
        }

        let dateEnd = Date.parse(dateValue);

        if (dateEnd - agreementDate < 0) {
            alert("Выбранная кредитная программа закончила срок своего действия.");
            return true;
        }
        else {
            return false;
        }
    }


    return {

        /**
         * Выполняется при загрузке формы.
         */
        onLoad: function () {

            hideFildsOnLoad();

            let contactAttr = Xrm.Page.getAttribute("nav_contact");
            let autoIdAttr = Xrm.Page.getAttribute("nav_autoid");
            let creditIdAttr = Xrm.Page.getAttribute("nav_creditid");
            let nameAttr = Xrm.Page.getAttribute("nav_name");

            if (contactAttr && autoIdAttr) {

                onContactOrAutoChanged();
                contactAttr.addOnChange(onContactOrAutoChanged);
                autoIdAttr.addOnChange(onContactOrAutoChanged);
            }


            if (creditIdAttr) {
                onCreditIdChanged();
                creditIdAttr.addOnChange(onCreditIdChanged);
            }

            if (autoIdAttr) {

                autoIdAttr.addOnChange(onAutoChanged);
            }

            if (nameAttr) {
                nameAttr.addOnChange(onNameChanged);
            }
        },

        /**
         * Выполняется при сохранении формы.
         */
        onSave: function (context) {
            let saveEvent = context.getEventArgs();

            let prevent = blockSaveIfCreditProgramExpired();
            if (prevent) {
                saveEvent.preventDefault();
            }
        }
    }
})();
