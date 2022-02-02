var Navicon = Navicon || {};

Navicon.nav_agreement = (function () {

    /**
     * Если изменилось значение полей Контакт или Автомобиль показать Кредитныую программу.
     */
    let onContactOrAutoChanged = function () {

        let contactValue = Xrm.Page.getAttribute("nav_contact").getValue();
        let autoIdValue = Xrm.Page.getAttribute("nav_autoid").getValue();

        if (contactValue && autoIdValue) {
            changeControlVisible(["nav_summa", "nav_fact", "nav_creditid"], true);
        }
        else {
            changeControlVisible(["nav_summa", "nav_fact", "nav_creditid"], false);
        }
    };

    /**
     * Если изменилось поле Кредитная программа показать поля связанные с кредитом.
     */
    let onCreditIdChanged = function () {

        let creditIdValue = Xrm.Page.getAttribute("nav_creditid").getValue();

        let creditTab = Xrm.Page.ui.tabs.get("tab_2");

        if (!creditTab) {
            console.error("try to get tab_2 but get null");
            return;
        }

        if (creditIdValue) {
            creditTab.setVisible(true);
        }
        else {
            creditTab.setVisible(false);
        }
    };

    /**
     * Фильтрует поле Кредтная программа по связи с полем Автомобиль
     */
    var filterCreditByAuto = function () {

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

        Xrm.WebApi.retrieveMultipleRecords("nav_nav_credit_nav_auto", "?$select=nav_creditid&$filter=nav_autoid eq " + autoId).then(
            function success(result) {
                autoFilter += "<filter type='or'><condition attribute='nav_creditid' operator='eq' value='00000000-0000-0000-0000-000000000000'/>";
                for (let i = 0; i < result.entities.length; i++) {
                    console.log(result.entities[i]);
                    autoFilter += "<condition attribute='nav_creditid' operator='eq' value='" + result.entities[i].nav_creditid + "'/>";
                }
                autoFilter += "</filter>";

                console.log(autoFilter);

                Xrm.Page.getControl("nav_creditid").addPreSearch(addCustomFilterForCredit);
            },
            function (error) {
                console.log(error.message);
            }
        );
    }

    /**
    * Если поле Автомобиль изменено показать в поле Кредитные программы только связанные объекты.
    */
    let onAutoChanged = function () {
        // Xrm.Page.getAttribute("nav_creditid").setValue(null);
        filterCreditByAuto();
        setAgreementPrice();
    }

    /**
     * Проставляет цену договора, если выбрана машина.
     */
    let setAgreementPrice = function(){
        let autoValue = Xrm.Page.getAttribute("nav_autoid").getValue();
        let amountAttr = Xrm.Page.getAttribute("nav_summa");

        if (!autoValue) {
            return;
        }

        if(!amountAttr){
            return;
        }

        autoId = autoValue[0].id;
        autoId = autoId.toLowerCase().substring(1, autoId.length - 1);
        
        Xrm.WebApi.retrieveRecord("nav_auto", autoId, "?$select=nav_used,nav_amount,_nav_modelid_value").then(
            function success(result) {
                if(result.nav_used){
                    amountAttr.setValue(result.nav_amount);
                    return;
                }

                let modelid = result._nav_modelid_value;
                console.log(modelid);

                Xrm.WebApi.retrieveRecord("nav_model", modelid, "?$select=nav_recommendedamount").then(
                    function success(result) {
                        console.log(result);
                        amountAttr.setValue(result.nav_recommendedamount);
                    },
                    function (error) {
                        console.log(error.message);
                    }
                );
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

    /**
     * Блокирует сохранение, если Кредитная программа истекла
     * @param {*} saveEvent 
     */
    let blockSaveIfCreditProgramExpired = function (saveEvent) {
        let creditIdAttr = Xrm.Page.getAttribute("nav_creditid");
        let agreementDateAttr = Xrm.Page.getAttribute("nav_date");

        if (!agreementDateAttr) {
            console.error("try to get nav_date, but get null");
            return;
        }

        if (!creditIdAttr) {
            console.error("try to get nav_creditid, but get null");
            return;
        }

        let creditIdValue = creditIdAttr.getValue();
        let agreementDate = agreementDateAttr.getValue();

        if (!agreementDate) {
            console.error("try to get nav_date, but get null");
            return;
        }

        if (!creditIdValue) {
            console.error("try to get nav_creditid, but get null");
            return;
        }

        let creditId = creditIdValue[0].id;
        creditId = creditId.toLowerCase().substring(1, creditId.length - 1);

        Xrm.WebApi.retrieveRecord("nav_credit", creditId, "?$select=nav_dateend").then(
            function success(result) {
                let dateEnd = Date.parse(result.nav_dateend);
                console.log(dateEnd);
                console.log(agreementDate);

                if (dateEnd - agreementDate < 0) {
                    alert("The selected credit program has already expired");
                    saveEvent.preventDefault();
                }
            },
            function (error) {
                console.log(error.message);
            }
        );
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
        },

        /**
         * Выполняется при сохранении формы.
         */
        onSave: function (context) {
            let saveEvent = context.getEventArgs();

            blockSaveIfCreditProgramExpired(Xrm.Page, saveEvent);
        }
    }
})();
